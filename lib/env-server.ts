export function validateServerEnv() {
    if (typeof window !== 'undefined') return; // Server only

    const serverVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID' // Required for server-side auth check too
    ];

    const missing = serverVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `CRITICAL: Missing required SERVER environment variables: ${missing.join(", ")}`
        );
    }
}
