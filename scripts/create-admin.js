/**
 * Script to create the first admin user
 *
 * Run this script with Node.js:
 * node scripts/create-admin.js
 *
 * Prerequisites:
 * 1. First create a user in Firebase Authentication Console
 * 2. Copy the UID of that user
 * 3. Run this script with that UID
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, Timestamp } = require('firebase/firestore');

// Firebase config (same as your app)
const firebaseConfig = {
  apiKey: "AIzaSyDPopwtCLXxsg-pXqmxH2whlUFKsbZ3Vr4",
  authDomain: "prakash-clayworks.firebaseapp.com",
  projectId: "prakash-clayworks",
  storageBucket: "prakash-clayworks.firebasestorage.app",
  messagingSenderId: "901359301788",
  appId: "1:901359301788:web:c45f18026810b476326959"
};

// Admin details
const ADMIN_UID = 'TpVF2d9ynXhOD8Q3Q5TVMYgm5fz2';
const ADMIN_EMAIL = 'admin@prakashclayworks.com';
const ADMIN_NAME = 'Super Admin';
const ADMIN_ROLE = 'super_admin'; // Options: 'super_admin', 'admin', 'moderator'

async function createAdmin() {
  if (ADMIN_UID === 'PASTE_YOUR_FIREBASE_AUTH_UID_HERE') {
    console.error('❌ Please update ADMIN_UID with the actual Firebase Auth UID');
    console.log('\nSteps:');
    console.log('1. Go to Firebase Console > Authentication > Users');
    console.log('2. Create a new user with email/password');
    console.log('3. Copy the UID (User UID column)');
    console.log('4. Paste it in this script as ADMIN_UID');
    console.log('5. Run this script again');
    return;
  }

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const now = new Date();

    // Create admin document
    await setDoc(doc(db, 'admins', ADMIN_UID), {
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: ADMIN_ROLE,
      isActive: true,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });

    console.log('✅ Admin created successfully!');
    console.log('');
    console.log('Admin Details:');
    console.log('  UID:', ADMIN_UID);
    console.log('  Email:', ADMIN_EMAIL);
    console.log('  Name:', ADMIN_NAME);
    console.log('  Role:', ADMIN_ROLE);
    console.log('');
    console.log('You can now login at: http://localhost:3002/login');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }

  process.exit(0);
}

createAdmin();
