'use client';

export default function TestEnv() {
  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missingVars = Object.entries(envVars)
    .filter(([key, value]) => !value || value === 'your_api_key_here')
    .map(([key]) => key);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Firebase Configuration:</h2>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="p-3 bg-gray-100 rounded">
            <strong>{key}:</strong> {value || '❌ NOT SET'}
          </div>
        ))}
        
        {missingVars.length > 0 && (
          <div className="p-4 bg-red-100 border border-red-300 rounded">
            <h3 className="font-semibold text-red-800">Missing Variables:</h3>
            <ul className="list-disc list-inside text-red-700">
              {missingVars.map(key => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </div>
        )}
        
        {missingVars.length === 0 && (
          <div className="p-4 bg-green-100 border border-green-300 rounded">
            <h3 className="font-semibold text-green-800">✅ All Firebase variables are set!</h3>
          </div>
        )}
      </div>
    </div>
  );
} 