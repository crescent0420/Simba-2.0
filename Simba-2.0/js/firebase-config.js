// ════════════════════════════════════════════════════════════
//  SIMBA 2.0 — FIREBASE CONFIGURATION
//  Project: simba-app-v2
//
//  TO FINISH SETUP:
//  1. Firebase console → Authentication → Sign-in method
//     → Enable "Email/Password"
//     → Enable "Google" (set support email)
//  2. That's it — save and reload the page.
// ════════════════════════════════════════════════════════════

const firebaseConfig = {
  apiKey:            "AIzaSyAvgWD6tSGIr31ocjbPcwezaMuYsR7_PMc",
  authDomain:        "simba-app-v2.firebaseapp.com",
  projectId:         "simba-app-v2",
  storageBucket:     "simba-app-v2.firebasestorage.app",
  messagingSenderId: "218705172915",
  appId:             "1:218705172915:web:d4ec5d53c09bf24005d3c6",
  measurementId:     "G-KHEY2NK2NV"
};

// Auto-initialize (compat SDK — matches the CDN scripts in auth.html / shop.html)
window._fbReady = false;
if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window._fbReady = true;
    console.info('[Simba] Firebase ready ✓');
  } catch (e) {
    console.warn('[Simba] Firebase init failed:', e.message);
  }
}
