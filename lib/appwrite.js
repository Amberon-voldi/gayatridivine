import { Client, Account, Databases, Storage, ID, Query, OAuthProvider } from 'appwrite';

// Initialize the Appwrite client
const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '69613f0a0032e98f9a5f';

export const APPWRITE_ENDPOINT = endpoint;
export const APPWRITE_PROJECT_ID = projectId;

if (typeof window !== 'undefined') {
  console.log('Appwrite Config:', { endpoint, projectId });

  const isGenericCloudEndpoint = endpoint === 'https://cloud.appwrite.io/v1';
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (isGenericCloudEndpoint && !isLocalhost) {
    console.warn(
      "Appwrite: You're using the generic Cloud endpoint 'https://cloud.appwrite.io/v1'. For OAuth/session cookies to work reliably, use the exact region endpoint shown in your Appwrite Console (e.g. 'https://fra.cloud.appwrite.io/v1') or configure an Appwrite Custom Domain under your own site."
    );
  }
}

client
  .setEndpoint(endpoint)
  .setProject(projectId);

// If browser storage has a saved session id, use header-based auth.
// This avoids relying on third-party cookies for cloud.appwrite.io.
if (typeof window !== 'undefined') {
  try {
    const savedSessionId = localStorage.getItem('appwrite_session_id');
    if (savedSessionId) {
      client.setSession(savedSessionId);
    }
  } catch {
    // ignore storage access issues (private mode / blocked storage)
  }
}

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export client for direct usage if needed
export { client, ID, Query, OAuthProvider };

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '69613f810013659e61ac';
export const COLLECTIONS = {
  PRODUCTS: process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID || 'product',
  CATEGORIES: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || 'categories',
  CART: process.env.NEXT_PUBLIC_APPWRITE_CART_COLLECTION_ID || 'cart',
  ORDERS: process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID || 'orders',
  ADDRESSES: process.env.NEXT_PUBLIC_APPWRITE_ADDRESSES_COLLECTION_ID || 'addresses',
};

// Storage bucket IDs
export const BUCKETS = {
  MAIN: process.env.NEXT_PUBLIC_APPWRITE_MAIN_BUCKET_ID || '696a9437002596925885',
};

// Helper function to check if Appwrite is configured
export const isAppwriteConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT &&
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  );
};
