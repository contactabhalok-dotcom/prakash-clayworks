/**
 * Script to check existing admins in Firestore
 * Run: node scripts/check-admins.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDPopwtCLXxsg-pXqmxH2whlUFKsbZ3Vr4",
  authDomain: "prakash-clayworks.firebaseapp.com",
  projectId: "prakash-clayworks",
  storageBucket: "prakash-clayworks.firebasestorage.app",
  messagingSenderId: "901359301788",
  appId: "1:901359301788:web:c45f18026810b476326959"
};

async function checkAdmins() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Checking admins collection in Firestore...\n');

    const adminsRef = collection(db, 'admins');
    const snapshot = await getDocs(adminsRef);

    if (snapshot.empty) {
      console.log('❌ No admins found in Firestore!');
      console.log('\nYou need to create an admin. Steps:');
      console.log('1. Go to Firebase Console > Authentication > Users');
      console.log('2. Note down the UID of your user');
      console.log('3. Edit scripts/create-admin.js and add your UID');
      console.log('4. Run: node scripts/create-admin.js');
    } else {
      console.log(`✅ Found ${snapshot.size} admin(s):\n`);
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('----------------------------');
        console.log('UID:', doc.id);
        console.log('Email:', data.email);
        console.log('Name:', data.displayName);
        console.log('Role:', data.role);
        console.log('Active:', data.isActive ? 'Yes' : 'No');
        console.log('----------------------------\n');
      });

      console.log('Login at: http://localhost:3002/login');
      console.log('Use the email shown above with your password.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }

  process.exit(0);
}

checkAdmins();
