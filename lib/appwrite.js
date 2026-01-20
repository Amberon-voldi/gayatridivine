import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

// Initialize the Appwrite client
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '69613f0a0032e98f9a5f');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export client for direct usage if needed
export { client, ID, Query };

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
