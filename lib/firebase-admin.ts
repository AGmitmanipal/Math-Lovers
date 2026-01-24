import admin from "firebase-admin";


try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!admin.apps.length) {
        if (privateKey && clientEmail && projectId) {
            // Check for placeholders
            if (privateKey.includes("Your Key Here") || clientEmail.includes("your-project")) {
                console.warn("----------------------------------------------------------------");
                console.warn("WARNING: Firebase Admin credentials in .env.local appear to be placeholders.");
                console.warn("Please update FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL with real values.");
                console.warn("Go to Firebase Console -> Project Settings -> Service Accounts -> Generate new private key.");
                console.warn("----------------------------------------------------------------");
                // Don't init with bad creds, or it will crash later
            } else {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
            }
        } else {
            console.warn("Missing Firebase Admin credentials. Auth features will fail.");
        }
    }
} catch (error) {
    console.error("Firebase Admin Init Error:", error);
}

// Export auth instance, or a Safe Placeholder if init failed
// This prevents the whole API from crashing during module load
export const adminAuth = (admin.apps.length ? admin.auth() : {
    generateEmailVerificationLink: async () => { throw new Error("Firebase Admin not initialized"); },
    verifyIdToken: async () => { throw new Error("Firebase Admin not initialized"); },
}) as unknown as admin.auth.Auth;
