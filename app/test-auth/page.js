"use client";

import { useState, useEffect } from "react";
import { account, OAuthProvider } from "@/lib/appwrite";

export default function TestAuth() {
  const [logs, setLogs] = useState([]);
  const [session, setSession] = useState(null);

  const addLog = (message, data = null) => {
    console.log(message, data);
    setLogs(prev => [...prev, { 
      time: new Date().toISOString(), 
      message, 
      data: data ? JSON.stringify(data, null, 2) : null 
    }]);
  };

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      addLog("Checking session...");
      const currentSession = await account.get();
      addLog("Session found!", currentSession);
      setSession(currentSession);
    } catch (error) {
      addLog("No session found", { error: error.message, code: error.code });
      setSession(null);
    }
  };

  const handleLogin = async () => {
    try {
      addLog("Starting OAuth login...");
      const origin = window.location.origin;
      addLog("Origin:", origin);
      addLog("Success URL:", `${origin}/auth/callback`);
      addLog("Failure URL:", `${origin}/test-auth?error=failed`);
      
      // This will redirect - using SDK v21 object params
      account.createOAuth2Session({
        provider: OAuthProvider.Google,
        success: `${origin}/auth/callback`,
        failure: `${origin}/test-auth?error=failed`
      });
    } catch (error) {
      addLog("OAuth error", { error: error.message, code: error.code, type: error.type });
    }
  };

  const handleLogout = async () => {
    try {
      addLog("Logging out...");
      await account.deleteSession({ sessionId: 'current' });
      addLog("Logged out successfully");
      setSession(null);
    } catch (error) {
      addLog("Logout error", { error: error.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Appwrite Authentication Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Session Status:</h2>
        {session ? (
          <div>
            <p className="text-green-600 font-semibold">✓ Logged In</p>
            <p className="text-sm mt-2">Email: {session.email}</p>
            <p className="text-sm">Name: {session.name}</p>
            <p className="text-sm">User ID: {session.$id}</p>
          </div>
        ) : (
          <p className="text-red-600 font-semibold">✗ Not Logged In</p>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login with Google
        </button>
        <button
          onClick={checkSession}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Check Session
        </button>
        {session && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-2">Debug Logs:</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-96 overflow-auto">
          {logs.map((log, i) => (
            <div key={i} className="mb-2">
              <span className="text-gray-500">[{log.time}]</span> {log.message}
              {log.data && <pre className="ml-4 text-yellow-400">{log.data}</pre>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-100 rounded">
        <h3 className="font-semibold mb-2">⚠️ CRITICAL Appwrite Configuration:</h3>
        <p className="text-sm mb-2 text-red-600 font-bold">Session cookies won't work without proper platform setup!</p>
        
        <div className="bg-white p-3 rounded mt-3">
          <h4 className="font-semibold text-sm mb-2">Step 1: Add Web Platform</h4>
          <ol className="list-decimal ml-6 text-sm space-y-1">
            <li>Go to <a href="https://cloud.appwrite.io/console/project-69613f0a0032e98f9a5f/overview/platforms" className="text-blue-600 underline" target="_blank">Appwrite Console → Settings → Platforms</a></li>
            <li>Click "Add Platform" → "Web App"</li>
            <li>Name: <code className="bg-gray-200 px-1">Gayatri Divine Dev</code></li>
            <li>Hostname: <code className="bg-gray-200 px-1">localhost</code> (just localhost, no port!)</li>
          </ol>
        </div>

        <div className="bg-white p-3 rounded mt-3">
          <h4 className="font-semibold text-sm mb-2">Step 2: Enable Google OAuth</h4>
          <ol className="list-decimal ml-6 text-sm space-y-1">
            <li>Go to <a href="https://cloud.appwrite.io/console/project-69613f0a0032e98f9a5f/auth/methods" className="text-blue-600 underline" target="_blank">Auth → Settings</a></li>
            <li>Scroll to OAuth2 Providers → Google</li>
            <li>Toggle to Enable</li>
            <li>Add Google Client ID & Secret</li>
          </ol>
        </div>

        <div className="bg-white p-3 rounded mt-3">
          <h4 className="font-semibold text-sm mb-2">Step 3: Google Cloud Console</h4>
          <p className="text-sm mb-2">In Google Cloud Console, add this Authorized redirect URI:</p>
          <code className="bg-gray-200 px-2 py-1 block text-xs break-all">
            https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/69613f0a0032e98f9a5f
          </code>
        </div>
      </div>
    </div>
  );
}
