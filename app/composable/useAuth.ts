"use client";

import { useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    updateProfile,
    type User,
    type UserCredential,
} from "firebase/auth";
import { auth } from "../../firebase";

const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [authReady, setAuthReady] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Track the current Firebase authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                setAuthReady(true);
            },
            (err) => {
                setError(err.message);
                setAuthReady(true);
            }
        );

        return unsubscribe;
    }, []);

    // Register a new user
    const register = async (
        email: string,
        password: string,
        displayName?: string
    ): Promise<UserCredential | null> => {
        setIsPending(true);
        setError(null);

        try {
            const credential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            if (credential.user && displayName?.trim()) {
                await updateProfile(credential.user, {
                    displayName: displayName.trim(),
                });
            }
            return credential;
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Registration failed";
            setError(message);
            return null;
        } finally {
            setIsPending(false);
        }
    };

    // Sign in an existing user
    const login = async (
        email: string,
        password: string
    ): Promise<UserCredential | null> => {
        setIsPending(true);
        setError(null);

        try {
            return await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Login failed";
            setError(message);
            return null;
        } finally {
            setIsPending(false);
        }
    };

    // Sign in with Google
    const loginWithGoogle = async (): Promise<UserCredential | null> => {
        setIsPending(true);
        setError(null);

        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            return await signInWithPopup(auth, provider);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Google sign in failed";
            setError(message);
            return null;
        } finally {
            setIsPending(false);
        }
    };

    // Send password reset email
    const resetPassword = async (email: string): Promise<boolean> => {
        setIsPending(true);
        setError(null);

        try {
            await sendPasswordResetEmail(auth, email);
            return true;
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Password reset failed";
            setError(message);
            return false;
        } finally {
            setIsPending(false);
        }
    };

    // Sign out the current user
    const logout = async (): Promise<boolean> => {
        setIsPending(true);
        setError(null);

        try {
            await firebaseSignOut(auth);
            return true;
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Logout failed";
            setError(message);
            return false;
        } finally {
            setIsPending(false);
        }
    };

    return {
        user,
        isPending,
        authReady,
        error,
        register,
        login,
        loginWithGoogle,
        resetPassword,
        logout,
    };
};

export default useAuth;