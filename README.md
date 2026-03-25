# 📚 TEST 11 — TNPSC Exam Preparation Platform

## 🗂️ Folder Structure
```
test11/
├── index.html          ← Main app entry point
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (offline support)
├── css/
│   └── app.css         ← All styles
├── js/
│   └── app.js          ← Complete app logic
├── icons/              ← PWA icons (generate from logo)
│   ├── icon-72.png
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

---

## ✅ Features

| Feature | Status |
|---------|--------|
| PDF Upload (PDF, TXT, DOCX) | ✅ |
| Auto-detect Q&A in PDF | ✅ |
| Direct parse (TNPSC papers) | ✅ No API needed |
| AI generation (Groq, free) | ✅ |
| MCQ / True-False / Fill Blank / One Word | ✅ |
| Tamil + English questions | ✅ |
| Timed test with palette | ✅ |
| Auto-submit on timeout | ✅ |
| Detailed results + explanations | ✅ |
| Topic-wise analysis | ✅ |
| Q-type analysis | ✅ |
| Practice wrong answers | ✅ |
| Test history | ✅ |
| Daily challenge | ✅ |
| Admin: Upload + Manage PDFs | ✅ |
| Admin: User management | ✅ |
| Admin: Approve/Suspend/Ban users | ✅ |
| Admin: View all results | ✅ |
| Firebase Authentication | ✅ |
| Firebase Firestore | ✅ |
| Local storage fallback | ✅ |
| PWA (Add to Home Screen) | ✅ |
| Dark / Light mode | ✅ |
| Mobile-first design | ✅ |
| Android APK (WebView/Capacitor) | ✅ |

---

## 🚀 Quick Start (No setup needed)

1. Open `index.html` in any browser
2. Click **Demo Student** or **Demo Admin** to explore
3. Admin → Settings → paste Groq API key (free)
4. Admin → Upload PDF → create test → publish

---

## 🔥 Firebase Setup (For production)

1. Go to **console.firebase.google.com**
2. Create new project
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in test mode
5. Go to Project Settings → Your apps → Web → Copy config
6. Paste into `index.html` firebaseConfig object:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

### Firestore Security Rules (paste in Firebase console):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /tests/{id} {
      allow read: if request.auth != null && resource.data.published == true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /results/{id} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Make first admin:
After registering, go to Firestore → users collection → find your user doc → change `role` field to `"admin"`.

---

## 🆓 Groq API Key (Free AI)

1. Go to **console.groq.com**
2. Sign up (free, no credit card)
3. Go to **API Keys** → Create Key
4. Copy key (starts with `gsk_...`)
5. In app: Admin → Settings → paste key → Save

**Free limits:** 14,400 requests/day · Very fast

---

## 🌐 GitHub Pages Deployment

1. Create repo on github.com
2. Upload all files
3. Go to repo **Settings** → **Pages**
4. Source: Deploy from branch → main → / (root)
5. Save → Visit `https://username.github.io/repo-name`

---

## 📱 Android APK Conversion

### Method 1: Capacitor (Recommended)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "TEST 11" "com.test11.app" --web-dir=.
npx cap add android
npx cap sync android
npx cap open android
# In Android Studio: Build → Generate Signed APK
```

### Method 2: WebView (Simplest)
```java
// In Android Studio MainActivity.java:
WebView webView = new WebView(this);
WebSettings s = webView.getSettings();
s.setJavaScriptEnabled(true);
s.setDomStorageEnabled(true);
setContentView(webView);
// Option A: Local file (offline)
webView.loadUrl("file:///android_asset/index.html");
// Option B: Hosted URL
webView.loadUrl("https://your-deployed-app.com");
```

### Method 3: PWA (Easiest for users)
- Deploy to GitHub Pages
- Open in Chrome on Android
- Tap menu → "Add to Home Screen"
- Works like a native app!

---

## 📄 PDF Format for Best Results

For direct parsing (no API needed), your PDF should have:
```
1. Question text here?
   (A) Option A
   (B) Option B
   (C) Option C
   (D) Option D
Answer: B
```

Any standard TNPSC/UPSC/SSC question paper format works!

---

## 🔮 Scaling & AI Upgrade Path

| Feature | Now | Upgrade |
|---------|-----|---------|
| Question Gen | Groq (free) | Claude API (better quality) |
| Auth | Firebase Email | Add Google OAuth |
| Storage | Firestore | Add file uploads for PDFs |
| Analytics | Basic | Full dashboard with charts |
| Questions | Manual parse | Fine-tuned model for TNPSC |

### To upgrade to Claude AI:
```javascript
// In app.js, replace Groq fetch with:
const res = await fetch("https://api.anthropic.com/v1/messages", {
  method:"POST",
  headers:{"Content-Type":"application/json","x-api-key":YOUR_KEY,"anthropic-version":"2023-06-01"},
  body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:4000, messages:[{role:"user",content:prompt}] })
});
const data = await res.json();
const raw = data.content[0].text;
```
