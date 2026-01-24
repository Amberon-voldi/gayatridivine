# Appwrite Google OAuth Setup Guide

## Step 1: Configure Google OAuth in Appwrite Console

1. Go to your Appwrite Console: https://cloud.appwrite.io
2. Select your project (ID: 69613f0a0032e98f9a5f)
3. Navigate to **Auth** → **Settings** (left sidebar)
4. Scroll down to **OAuth2 Providers**
5. Find **Google** and click to enable it
6. You'll need to provide:
   - **App ID**: Your Google OAuth Client ID
   - **App Secret**: Your Google OAuth Client Secret

## Step 2: Get Google OAuth Credentials

If you don't have Google OAuth credentials:

1. Go to: https://console.cloud.google.com
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if not done
6. Application type: **Web application**
7. Add Authorized redirect URIs:
   ```
   https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/69613f0a0032e98f9a5f
   ```
8. Copy the **Client ID** and **Client Secret**

## Step 3: Configure Platform in Appwrite

1. In Appwrite Console, go to **Settings** → **Platforms**
2. Click **Add Platform** → **Web App**
3. Add platform details:
   - **Name**: Gayatri Divine Local
   - **Hostname**: localhost
   - **Port**: 3000 (optional)
4. Click **Add Platform** again for production:
   - **Name**: Gayatri Divine Production  
   - **Hostname**: gayatridivine.in

## Step 4: Verify Configuration

Visit http://localhost:3000/test-auth and click "Login with Google"

Check the console logs for any errors.

## Common Issues

### "Redirect URI mismatch"
- Make sure the redirect URI in Google Console exactly matches:
  `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/YOUR_PROJECT_ID`

### "Origin not allowed"
- Add localhost to Platforms in Appwrite Console

### "OAuth provider not enabled"
- Enable Google provider in Appwrite Auth settings

### Session not persisting
- Check browser cookies are enabled
- Verify CORS settings in Appwrite
- Check that your domain is added in Platforms

## Testing

1. Open http://localhost:3000/test-auth
2. Click "Login with Google"
3. Authenticate with Google
4. Should redirect back to /auth/callback
5. Then redirect to test-auth page
6. Session should show as "Logged In"

## Debug Checklist

- [ ] Google OAuth credentials created in Google Console
- [ ] Redirect URI added in Google Console
- [ ] Google provider enabled in Appwrite
- [ ] Client ID and Secret added to Appwrite Google OAuth
- [ ] localhost platform added in Appwrite
- [ ] Environment variables set in .env.local
- [ ] Dev server restarted after .env changes
