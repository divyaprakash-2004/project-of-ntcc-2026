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
      enter_details: "Please enter your credentials to access the offline planner.",
      sync_offline_title: "Offline Mode",
      sync_offline_body: "Your changes are saved locally. Please move to an area with network coverage to sync progress and get the latest schedules.",
      sync_syncing_title: "Syncing Data",
      sync_syncing_body: "Synchronizing local classroom progress logs with the server...",
      sync_success_title: "Sync Completed",
      sync_success_body: "All local milestones successfully synced and backed up.",
      fb_title: "Lesson Feedback",
      fb_rating_label: "Student Engagement Level",
      fb_notes_label: "Observations & Challenges",
      fb_notes_placeholder: "Describe how the lesson went, student understanding, or local difficulties...",
      fb_submit_btn: "Submit Feedback",
      fb_submitted: "Feedback saved!",
      fb_view_submitted: "Submitted Observations",
      select_lesson_label: "Active Lesson",
      select_lesson_placeholder: "Choose a lesson plan..."
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
      enter_details: "ऑफ़लाइन योजनाकार तक पहुँचने के लिए कृपया अपनी साख दर्ज करें।",
      sync_offline_title: "ऑफलाइन मोड",
      sync_offline_body: "आपके बदलाव स्थानीय रूप से सहेजे गए हैं। प्रगति को सिंक करने और नवीनतम शेड्यूल प्राप्त करने के लिए कृपया नेटवर्क क्षेत्र में जाएं।",
      sync_syncing_title: "डेटा सिंक हो रहा है",
      sync_syncing_body: "सर्वर के साथ स्थानीय प्रगति लॉग को सिंक किया जा रहा है...",
      sync_success_title: "सिंक पूरा हुआ",
      sync_success_body: "सभी स्थानीय मील के पत्थर सफलतापूर्वक सिंक और बैकअप किए गए हैं।",
      fb_title: "पाठ प्रतिक्रिया",
      fb_rating_label: "छात्र जुड़ाव स्तर",
      fb_notes_label: "अवलोकन और चुनौतियाँ",
      fb_notes_placeholder: "वर्णन करें कि पाठ कैसा रहा, छात्रों की समझ, या स्थानीय कठिनाइयाँ...",
      fb_submit_btn: "प्रतिक्रिया जमा करें",
      fb_submitted: "प्रतिक्रिया सहेजी गई!",
      fb_view_submitted: "प्रस्तुत अवलोकन",
      select_lesson_label: "सक्रिय पाठ",
      select_lesson_placeholder: "एक पाठ योजना चुनें..."
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
      enter_details: "ఆఫ్‌లైన్ ప్లానర్‌ను యాక్సెస్ చేయడానికి దయచేసి మీ వివరాలను నమోదు చేయండి.",
      sync_offline_title: "ఆఫ్‌లైన్ మోడ్",
      sync_offline_body: "మీ మార్పులు స్థానికంగా సేవ్ చేయబడ్డాయి. పురోగతిని సింక్ చేయడానికి మరియు తాజా షెడ్యూల్‌లను పొందడానికి దయచేసి నెట్‌వర్క్ ఉన్న ప్రాంతానికి వెళ్లండి.",
      sync_syncing_title: "డేటా సింక్ అవుతోంది",
      sync_syncing_body: "సర్వర్‌తో స్థానిక పురోగతి లాగ్‌లను సింక్ చేస్తోంది...",
      sync_success_title: "సింక్ పూర్తయింది",
      sync_success_body: "అన్ని స్థానిక మైలురాళ్ళు విజయవంతంగా సింక్ చేయబడ్డాయి మరియు బ్యాకప్ చేయబడ్డాయి.",
      fb_title: "పాఠం అభిప్రాయం",
      fb_rating_label: "విద్యార్థి నిశ్చితార్థం స్థాయి",
      fb_notes_label: "పరిశీలనలు & సవాళ్లు",
      fb_notes_placeholder: "పాఠం ఎలా సాగింది, విద్యార్థుల అవగాహన లేదా స్థానిక ఇబ్బందులను వివరించండి...",
      fb_submit_btn: "అభిప్రాయాన్ని సమర్పించండి",
      fb_submitted: "అభిప్రాయం సేవ్ చేయబడింది!",
      fb_view_submitted: "సమర్పించిన పరిశీలనలు",
      select_lesson_label: "క్రియాశీల పాఠం",
      select_lesson_placeholder: "ఒక పాఠ్య ప్రణాళికను ఎంచుకోండి..."
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
