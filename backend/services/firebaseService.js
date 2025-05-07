// Firebase service wrapper
const admin = require('firebase-admin');
const firebase = require('firebase/app');
require('firebase/auth');

// Initialize Firebase admin (server-side)
// Make sure to set your environment variables or service account
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

// Initialize Firebase client (for client-side auth)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = admin.firestore();

// Firebase auth operations
const firebaseService = {
  // Create a user in Firebase Authentication
  async createUser(email, password, userData) {
    try {
      // Create the user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: userData.name,
      });
      
      // Create user document in Firestore
      await firestore.collection('users').doc(userRecord.uid).set({
        name: userData.name,
        email: userData.email,
        profileImageUrl: '',
        bio: '',
        phone: userData.phone || '',
        location: '',
        occupation: '',
        stats: {
          posts: 0,
          followers: 0,
          following: 0,
        },
        country: userData.country || '',
        subscribedAt: null,
        subscribedCountries: [],
        windAlertSubscribed: false,
        areaOfOperation: userData.areaOfOperation || '',
        role: userData.role || 'citizen',
        isVerified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return userRecord;
    } catch (error) {
      console.error('Error creating user in Firebase:', error);
      throw error;
    }
  },
  
  // Verify Firebase ID token
  async verifyIdToken(idToken) {
    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      throw error;
    }
  },
  
  // Get user data from Firestore
  async getUserData(uid) {
    try {
      const doc = await firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        const data = doc.data();
        data.id = uid;
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data from Firestore:', error);
      throw error;
    }
  },
  
  // Update user data in Firestore
  async updateUserData(uid, data) {
    try {
      await firestore.collection('users').doc(uid).update(data);
      return await this.getUserData(uid);
    } catch (error) {
      console.error('Error updating user in Firestore:', error);
      throw error;
    }
  },
  
  // Send password reset email
  async sendPasswordResetEmail(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
};

module.exports = firebaseService;