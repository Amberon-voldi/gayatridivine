"use client";

import { useEffect, useState } from "react";
import { account, client, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/appwrite";

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);
  const [hint, setHint] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log URL for debugging
        console.log('Callback URL:', window.location.href);
        console.log('URL params:', window.location.search);

        const params = new URLSearchParams(window.location.search);
        const userId = params.get('userId');
        const secret = params.get('secret');
        
        setStatus('Verifying authentication...');

        // Preferred: token-based flow (no cookie reliance)
        if (userId && secret) {
          setStatus('Finalizing login...');
          const session = await account.createSession({ userId, secret });

          // Persist and use header-based auth for subsequent calls
          try {
            localStorage.setItem('appwrite_session_id', session.$id);
          } catch {
            // ignore
          }
          client.setSession(session.$id);

          const verified = await account.get();
          console.log('Session verified via token flow:', verified);

          const redirectPath = sessionStorage.getItem('oauth_redirect') || '/';
          sessionStorage.removeItem('oauth_redirect');
          setStatus('Login successful! Redirecting...');
          await new Promise(resolve => setTimeout(resolve, 200));
          window.location.href = redirectPath;
          return;
        }
        
        // Try to get session with retries
        let session = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!session && attempts < maxAttempts) {
          attempts++;
          console.log(`Checking session (attempt ${attempts}/${maxAttempts})...`);
          
          try {
            // Wait before checking (Appwrite needs time to set cookies)
            await new Promise(resolve => setTimeout(resolve, 1000));
            session = await account.get();
            console.log('Session verified:', session);
          } catch (err) {
            console.log(`Attempt ${attempts} failed:`, err.message);
            if (attempts === maxAttempts) {
              throw new Error('Failed to verify session after multiple attempts');
            }
          }
        }
        
        if (!session) {
          throw new Error('No session found');
        }
        
        // Get redirect path from sessionStorage
        const redirectPath = sessionStorage.getItem('oauth_redirect') || '/';
        sessionStorage.removeItem('oauth_redirect');
        
        console.log('Session verified! Redirecting to:', redirectPath);
        setStatus('Login successful! Redirecting...');
        
        // Small delay to show success message
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use window.location to force full page reload
        window.location.href = redirectPath;
      } catch (error) {
        console.error('Callback error:', error);
        setError(error.message);
        setStatus('Authentication failed');

        const msg = String(error?.message || "");
        const looksLikeNoSession =
          msg.includes("missing scopes") ||
          msg.includes("No session") ||
          msg.includes("verify session") ||
          msg.includes("Unauthorized") ||
          msg.includes("401");

        if (looksLikeNoSession) {
          setHint(
            `Appwrite didn't see a session after the Google redirect. This is almost always caused by cookies not being stored/sent to ${APPWRITE_ENDPOINT}.

Checklist:
0) Appwrite endpoint: use the exact region endpoint from Appwrite Console (e.g. https://fra.cloud.appwrite.io/v1). Avoid the generic https://cloud.appwrite.io/v1 in production.
1) Appwrite Console → Project → Platforms: add https://gayatridivine.in (and https://www.gayatridivine.in if used)
2) Browser privacy: allow cookies for cloud.appwrite.io (third‑party cookies) OR use an Appwrite Custom Domain under gayatridivine.in and set NEXT_PUBLIC_APPWRITE_ENDPOINT accordingly
3) Try again in a normal (non‑incognito) window and disable strict tracking protection for this site

Debug:
- origin: ${window.location.origin}
- endpoint: ${APPWRITE_ENDPOINT}
- project: ${APPWRITE_PROJECT_ID}`
          );
        } else {
          setHint(null);
        }
        
        // Redirect to login after showing error
        setTimeout(() => {
          window.location.href = '/login?error=oauth_failed';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-4xl mb-4">✕</div>
            <p className="text-red-600 font-semibold mb-2">{status}</p>
            <p className="text-gray-500 text-sm">{error}</p>
            {hint && (
              <pre className="mt-4 text-left text-xs whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-xl mx-auto overflow-auto">
                {hint}
              </pre>
            )}
            <p className="text-gray-400 text-sm mt-4">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
