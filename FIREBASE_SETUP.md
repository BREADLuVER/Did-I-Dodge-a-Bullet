# Firebase Setup Guide

## 🔥 Firebase Configuration Required

To enable database functionality, you need to set up Firebase and add the following environment variables to your `.env.local` file:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Set up security rules (see below)

### 2. Get Configuration Values
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app
4. Copy the configuration values

### 3. Environment Variables
Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules
In Firebase Console → Firestore Database → Rules, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for submissions collection
    match /submissions/{document} {
      allow read, write: if true;
    }
    
    // Allow read/write for company_insights collection
    match /company_insights/{document} {
      allow read, write: if true;
    }
  }
}
```

### 5. Database Collections
The app will automatically create these collections:
- `submissions` - Individual interview checkups
- `company_insights` - Aggregated company data

### 6. Test the Setup
1. Start your development server: `npm run dev`
2. Complete an interview checkup
3. Check Firebase Console → Firestore to see data being saved

## 🔒 Privacy & Security Notes
- All submissions are anonymous
- IP addresses are hashed for basic deduplication
- No personal data is stored
- Company insights are aggregate only 