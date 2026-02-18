import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
// Use for Google Authentication
export const handleGoogleAuth = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider)
        return {
            user: result.user,
            error: null
        };
    } catch (error: any) {
        console.error("Google Auth Error", error);
        return {
            user: null,
            error: error.message
        };
    }
};
// Use for SignOut Auth
export const handleSignOut = async () => {
    try {
        await signOut(auth)
        return true
    } catch (error: any) {
        console.error("LogOut Error", error);
        return false
    }
};