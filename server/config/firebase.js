const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let firebaseApp;

const initFirebaseAdmin = () => {
    if (firebaseApp) {
        return firebaseApp;
    }

    if (getApps().length > 0) {
        firebaseApp = getApps()[0];
        return firebaseApp;
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (typeof serviceAccount === 'string') {
            try {
                serviceAccount = JSON.parse(serviceAccount);
            } catch (jsonErr) {
                const normalized = serviceAccount.replace(/\\n/g, '\n');
                serviceAccount = JSON.parse(normalized);
            }
        }

        if (serviceAccount && serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        firebaseApp = initializeApp({ credential: cert(serviceAccount) });
        console.log('Firebase Admin initialized successfully with FIREBASE_SERVICE_ACCOUNT');
        return firebaseApp;
    }

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        firebaseApp = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });
        console.log('Firebase Admin initialized successfully with separate env vars');
        return firebaseApp;
    }

    // Use application default credentials when deployed inside Google Cloud.
    firebaseApp = initializeApp();
    console.log('Firebase Admin initialized with default credentials');
    return firebaseApp;
};

const getFirebaseAuth = () => {
    return getAuth(initFirebaseAdmin());
};

module.exports = {
    initFirebaseAdmin,
    getFirebaseAuth,
};
