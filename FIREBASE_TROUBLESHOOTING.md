# Firebase Environment Variables Troubleshooting Guide

## 🚨 Current Issue
You're getting "Missing Firebase configuration keys" errors in your Vercel deployment.

## 🔍 Quick Diagnosis

Run this command locally to check your environment variables:
```bash
npm run check-env
```

## 📋 Step-by-Step Fix

### 1. Get Your Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon (⚙️) → **Project Settings**
4. Scroll down to **"Your apps"** section
5. If you don't see a web app, click **"Add app"** → **Web app**
6. Copy the configuration values

### 2. Set Environment Variables in Vercel

#### Option A: Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables one by one:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. **IMPORTANT**: Make sure to select all environments:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

6. Click **Save**

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add each environment variable
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

# Redeploy
vercel --prod
```

### 3. Redeploy Your Project
After adding environment variables, you MUST redeploy:

1. Go to your Vercel project dashboard
2. Click **"Deployments"**
3. Click **"Redeploy"** on your latest deployment
4. Or push a new commit to trigger a new deployment

## 🔧 Common Issues & Solutions

### Issue: "Environment variables not found after adding them"
**Solution**: 
- Environment variables are only available after redeployment
- Make sure you selected all environments (Production, Preview, Development)
- Check that you didn't include quotes around the values

### Issue: "Still getting errors after redeployment"
**Solution**:
1. Clear your browser cache
2. Check the browser console for the detailed error message
3. Verify the environment variables are set correctly in Vercel dashboard

### Issue: "Works locally but not on Vercel"
**Solution**:
- Local `.env.local` file doesn't affect Vercel deployment
- Environment variables must be set in Vercel dashboard
- Check that you're not using placeholder values like "your_api_key_here"

## 🧪 Testing Your Setup

### 1. Check Environment Variables
```bash
npm run check-env
```

### 2. Test Locally with Production Build
```bash
npm run build
npm run start
```

### 3. Check Browser Console
Open your deployed site and check the browser console for:
- ✅ "Firebase initialized successfully"
- ❌ "Missing Firebase configuration keys"

## 🆘 Offline Mode Fallback

If Firebase is still not working, the app will run in "offline mode":
- Data will be saved to localStorage instead of Firebase
- You'll see "📱 Running in offline mode" in the console
- The app will still function, but data won't be synced

## 📞 Still Having Issues?

1. **Check Vercel Logs**: Go to your deployment → Functions → Check for errors
2. **Verify Firebase Project**: Make sure your Firebase project is active and Firestore is enabled
3. **Check Firestore Rules**: Ensure your Firestore rules allow read/write access
4. **Contact Support**: If all else fails, the app will work in offline mode

## 🔒 Security Notes

- ✅ `NEXT_PUBLIC_` variables are safe to expose (they're meant for client-side)
- ✅ Firebase API keys are designed to be public
- ❌ Never commit `.env.local` files to git
- ❌ Don't use service account keys in client-side code

---

**Need help?** Check the browser console for detailed error messages and run `npm run check-env` to verify your setup. 