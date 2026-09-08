const admin = require('firebase-admin');

let firebaseAdminInitialized = false;

const initFirebaseAdmin = () => {
    if (firebaseAdminInitialized || admin.apps.length > 0) {
        return admin;
    }

    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
            if (typeof serviceAccount === 'string') {
                try {
                    serviceAccount = JSON.parse(serviceAccount);
                } catch (jsonErr) {
                    // Try to fix unescaped newlines in JSON string if needed
                    const normalized = serviceAccount.replace(/\\n/g, '\n');
                    serviceAccount = JSON.parse(normalized);
                }
            }

            if (serviceAccount && serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.cert(serviceAccount),
            });
            firebaseAdminInitialized = true;
            console.log('Firebase Admin initialized successfully with FIREBASE_SERVICE_ACCOUNT');
            return admin;
        }

        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
            firebaseAdminInitialized = true;
            console.log('Firebase Admin initialized successfully with separate env vars');
            return admin;
        }

        // Fallback to default credentials if in Google Cloud environment
        admin.initializeApp();
        firebaseAdminInitialized = true;
        console.log('Firebase Admin initialized with default credentials');
        return admin;
    } catch (error) {
        console.error('Firebase Admin initialization error:', error.message);
        return admin;
    }
};

const getFirebaseAuth = () => {
    initFirebaseAdmin();
    return admin.auth();
};

module.exports = {
    admin,
    initFirebaseAdmin,
    getFirebaseAuth,
};
