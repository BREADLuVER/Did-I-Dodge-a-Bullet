# 🔒 Security Notice - Firebase Service Account Key Exposure

## ⚠️ What Happened

On **December 2024**, we discovered that a Firebase service account private key was accidentally committed to the public GitHub repository. This key was exposed in:

- `scripts/firebase-service-account.json` (committed to git)
- Build artifacts in `.next/cache/` (contained the key)

## 🚨 Immediate Actions Taken

1. **Key Disabled**: Google Cloud Platform automatically disabled the compromised service account key
2. **File Removed**: Deleted `scripts/firebase-service-account.json` from the repository
3. **Git Ignore Updated**: Added comprehensive `.gitignore` rules to prevent future credential commits
4. **Scripts Updated**: Modified all Firebase scripts to use environment variables instead of files

## 🔧 What You Need to Do

### 1. Regenerate Your Firebase Service Account Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** > **Service Accounts**
3. Find your service account: `firebase-adminsdk-fbsvc@did-i-dodge-a-bullet.iam.gserviceaccount.com`
4. Click on the service account
5. Go to **Keys** tab
6. Click **Add Key** > **Create new key**
7. Choose **JSON** format
8. Download the new key file

### 2. Set Up Environment Variables

**Option A: Environment Variable (Recommended)**
```bash
# Windows PowerShell
$env:FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"did-i-dodge-a-bullet",...}'

# Windows Command Prompt
set FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"did-i-dodge-a-bullet",...}

# Linux/Mac
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"did-i-dodge-a-bullet",...}'
```

**Option B: Local File (Development Only)**
- Place the new service account JSON file in `scripts/` directory
- **NEVER commit this file to git**
- The file is now properly ignored by `.gitignore`

### 3. Update Your Deployment Environment

If you're deploying to Vercel, Netlify, or another platform:
1. Add `FIREBASE_SERVICE_ACCOUNT` as an environment variable
2. Set the value to the entire JSON content of your new service account key

## 🛡️ Security Improvements Made

### Updated `.gitignore`
```gitignore
# Firebase
scripts/firebase-service-account.json
*.json
!package.json
!package-lock.json
!tsconfig.json
!next.config.js
!tailwind.config.js
!postcss.config.js

# Build outputs
.next/
out/
dist/
```

### Updated Scripts
- All Firebase scripts now use environment variables by default
- Fallback to local files for development
- Better error messages for missing credentials

## 📋 Checklist

- [ ] Regenerate Firebase service account key
- [ ] Set up environment variables
- [ ] Test Firebase scripts with new credentials
- [ ] Update deployment environment variables
- [ ] Verify no credentials are in git history

## 🔍 Verify No Credentials in Repository

Run these commands to ensure no credentials remain:

```bash
# Check for any JSON files that might contain credentials
find . -name "*.json" -not -path "./node_modules/*" -not -path "./.next/*"

# Check git history for the old key (optional cleanup)
git log --all --full-history -- "**/firebase-service-account.json"
```

## 📞 Support

If you need help:
1. Check the updated `scripts/README.md` for detailed setup instructions
2. Verify your environment variables are set correctly
3. Test with the sample companies first

## 🎯 Prevention

To prevent future credential exposure:
1. Always use environment variables for production credentials
2. Never commit `.json` files containing secrets
3. Use `.gitignore` to exclude credential files
4. Consider using secret management services for production

---

**Remember**: The old service account key is now disabled and should not be used. Always use the new key with proper environment variable setup. 