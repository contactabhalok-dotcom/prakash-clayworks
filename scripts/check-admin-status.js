const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, getDocs } = require('firebase/firestore');
const { getAuth, getRedirectResult } = require('firebase/auth');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', 'apps', 'admin', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env.local file not found in apps/admin/');
    console.log('Please create the file with your Firebase configuration.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
}

loadEnv();

// Verify required env vars
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function checkAdmins() {
  console.log('🔍 Checking Firebase configuration...\n');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✓ Firebase app initialized');
    console.log(`  Project: ${firebaseConfig.projectId}`);
    console.log('');

    // Check admins collection
    console.log('📋 Checking admins collection...');
    const adminsRef = collection(db, 'admins');
    const snapshot = await getDocs(adminsRef);
    
    if (snapshot.empty) {
      console.log('❌ No admin documents found!');
      console.log('\n📝 You need to create an admin document first.');
      console.log('\nOptions:');
      console.log('  1. Visit: /api/setup-admin?uid=YOUR_UID&email=your@email.com');
      console.log('  2. Manually create via Firebase Console');
      console.log('  3. Run: node scripts/create-admin.js\n');
      return;
    }

    console.log(`✓ Found ${snapshot.size} admin(s)\n`);
    
    let activeAdmins = 0;
    let inactiveAdmins = 0;
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const status = data.isActive ? '✅ Active' : '❌ Inactive';
      console.log(`  UID: ${docSnap.id}`);
      console.log(`  Email: ${data.email || 'N/A'}`);
      console.log(`  Name: ${data.displayName || 'N/A'}`);
      console.log(`  Role: ${data.role || 'N/A'}`);
      console.log(`  Status: ${status}`);
      console.log('');
      
      if (data.isActive) {
        activeAdmins++;
      } else {
        inactiveAdmins++;
      }
    }

    console.log('📊 Summary:');
    console.log(`  Total Admins: ${snapshot.size}`);
    console.log(`  Active: ${activeAdmins}`);
    console.log(`  Inactive: ${inactiveAdmins}`);
    console.log('');

    if (activeAdmins === 0) {
      console.log('⚠️  WARNING: No active admins found!');
      console.log('   The dashboard will not load until you activate an admin account.\n');
    } else {
      console.log('✅ At least one active admin found.\n');
    }

  } catch (error) {
    console.error('❌ Error checking Firebase:', error.message);
    console.log('\nPossible issues:');
    console.log('  1. Invalid Firebase configuration in .env.local');
    console.log('  2. Firebase project not found or not accessible');
    console.log('  3. Network connectivity issues\n');
  }
}

checkAdmins();
