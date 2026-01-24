"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log URL for debugging
        console.log('Callback URL:', window.location.href);
        console.log('URL params:', window.location.search);
        
        setStatus('Verifying authentication...');
        
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
