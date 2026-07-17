import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      title: "GramSchool Flow",
      welcome: "Welcome Back",
      select_lang: "Choose Language",
      username: "Email or Teacher ID",
      password: "Password",
      login_btn: "Log In",
      enter_details: "Please enter your credentials to access the offline planner."
    }
  },
  hi: {
    translation: {
      title: "ग्रामस्कूल फ्लो",
      welcome: "स्वागत है",
      select_lang: "भाषा चुनें",
      username: "ईमेल या शिक्षक आईडी",
      password: "पासवर्ड",
      login_btn: "लॉग इन करें",
      enter_details: "ऑफ़लाइन योजनाकार तक पहुँचने के लिए कृपया अपनी साख दर्ज करें।"
    }
  },
  te: {
    translation: {
      title: "గ్రామస్కూల్ ఫ్లో",
      welcome: "స్వాగతం",
      select_lang: "భాషను ఎంచుకోండి",
      username: "ఇమెయిల్ లేదా టీచర్ ఐడి",
      password: "పాస్వర్డ్",
      login_btn: "లాగిన్ అవ్వండి",
      enter_details: "ఆఫ్‌లైన్ ప్లానర్‌ను యాక్సెస్ చేయడానికి దయచేసి మీ వివరాలను నమోదు చేయండి."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: sessionStorage.getItem('preferred_lang') || 'en', // AC 2 Session persistence
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes from XSS
    }
  });

export default i18n;
