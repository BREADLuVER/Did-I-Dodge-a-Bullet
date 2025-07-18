#!/usr/bin/env node

// Script to check if Firebase environment variables are properly set
console.log('🔍 Checking Firebase environment variables...\n');

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let allSet = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value && value !== 'your_api_key_here' && value !== '' ? '✅' : '❌';
  const displayValue = value ? `${value.substring(0, 10)}...` : 'NOT SET';
  
  console.log(`${status} ${varName}: ${displayValue}`);
  
  if (!value || value === 'your_api_key_here' || value === '') {
    allSet = false;
  }
});

console.log('\n' + (allSet ? '🎉 All environment variables are set!' : '⚠️  Some environment variables are missing or invalid.'));

if (!allSet) {
  console.log('\n📋 To fix this:');
  console.log('1. Go to your Vercel dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings → Environment Variables');
  console.log('4. Add the missing variables with your Firebase configuration');
  console.log('5. Redeploy your project');
  console.log('\n🔗 Get your Firebase config from: https://console.firebase.google.com/ → Project Settings → Your apps');
} 