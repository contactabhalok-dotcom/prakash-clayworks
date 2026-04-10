import { NextResponse } from 'next/server';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { getFirestoreDb } from '@prakash/firebase';

// This is a one-time setup endpoint to create the first admin
// DELETE THIS FILE AFTER CREATING YOUR ADMIN

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  const email = searchParams.get('email');

  if (!uid || !email) {
    return NextResponse.json({
      error: 'Missing uid or email parameter',
      usage: '/api/setup-admin?uid=YOUR_FIREBASE_UID&email=YOUR_EMAIL'
    }, { status: 400 });
  }

  try {
    const db = getFirestoreDb();
    const adminRef = doc(db, 'admins', uid);

    // Check if admin already exists
    const existingAdmin = await getDoc(adminRef);
    if (existingAdmin.exists()) {
      return NextResponse.json({
        message: 'Admin already exists!',
        admin: existingAdmin.data()
      });
    }

    // Create admin
    const now = new Date();
    const adminData = {
      email,
      displayName: 'Super Admin',
      role: 'super_admin',
      isActive: true,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    await setDoc(adminRef, adminData);

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully!',
      admin: {
        uid,
        ...adminData,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      nextSteps: [
        '1. Go to http://localhost:3002/login',
        '2. Login with your email and password',
        '3. DELETE this file: apps/admin/src/app/api/setup-admin/route.ts'
      ]
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({
      error: 'Failed to create admin',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
