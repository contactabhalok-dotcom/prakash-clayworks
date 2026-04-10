const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProducts() {
  try {
    console.log('\n=== Checking Products Categories ===\n');

    const q = query(collection(db, 'products'), limit(10));
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('ID:', doc.id);
      console.log('Title:', data.title?.en || 'No title');
      console.log('Category:', data.category || '❌ NO CATEGORY');
      console.log('---\n');
    });

    console.log('\n=== Checking Categories Collection ===\n');
    const catSnapshot = await getDocs(collection(db, 'categories'));
    console.log('Available categories:');
    catSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('-', data.slug, ':', data.name?.en);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkProducts().then(() => process.exit(0));
