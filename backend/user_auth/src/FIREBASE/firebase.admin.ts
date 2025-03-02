import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let serviceAccountPath;
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // If it's an absolute path, use it directly
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH.startsWith('/')) {
    serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  } else {
    // If it's a relative path, resolve it relative to the project root
    serviceAccountPath = join(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  }
} else {
  // Default fallback
  serviceAccountPath = join(process.cwd(), 'src/serviceAccountKey.json');
}

console.log('Firebase service account path:', serviceAccountPath);
const fileContent = readFileSync(serviceAccountPath, 'utf8');
console.log('Service account content:', fileContent);
const serviceAccount = JSON.parse(fileContent);

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  if(!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error('Failed to load service account from ${serviceAccountPath}:', error);
  process.exit(1);
}

export default admin;