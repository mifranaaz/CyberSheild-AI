import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { Shield, Lock, Mail, User, X, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export async function ensureUserProfileInFirestore(
  uid: string,
  email: string | null,
  displayName: string | null
) {
  const userRef = doc(db, "users", uid);
  try {
    const existingDoc = await getDoc(userRef);
    if (!existingDoc.exists()) {
      const batch = writeBatch(db);
      const safeName = (displayName || email?.split("@")[0] || "Cyber Defender").slice(0, 100);
      const safeEmail = (email || "user@cybershield.local").slice(0, 254);

      batch.set(userRef, {
        uid,
        displayName: safeName,
        securityScore: 88,
        scansCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const privateInfoRef = doc(db, "users", uid, "private", "info");
      batch.set(privateInfoRef, {
        uid,
        email: safeEmail,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [providerHelpNeeded, setProviderHelpNeeded] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setProviderHelpNeeded(false);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter a valid email address and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const finalName = displayName.trim() || email.split("@")[0];
        if (finalName) {
          await updateProfile(cred.user, { displayName: finalName.slice(0, 100) });
        }
        await ensureUserProfileInFirestore(cred.user.uid, cred.user.email, finalName);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await ensureUserProfileInFirestore(
          cred.user.uid,
          cred.user.email,
          cred.user.displayName
        );
      }
      onClose();
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/operation-not-allowed") {
        setProviderHelpNeeded(true);
        setErrorMsg(
          "Email/Password sign-in is not yet enabled in your Firebase project console. You can enable it in 1 click or sign in immediately with Google below."
        );
      } else if (code === "auth/email-already-in-use") {
        setErrorMsg("This email is already registered. Switch to Sign In instead.");
      } else if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setErrorMsg("Invalid email or password. Please check your credentials and try again.");
      } else {
        setErrorMsg(err?.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await ensureUserProfileInFirestore(
        cred.user.uid,
        cred.user.email,
        cred.user.displayName
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Google sign-in was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-xl border border-slate-200 p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {mode === "login" ? "Sign In to CyberShield AI" : "Create Account"}
            </h2>
            <p className="text-xs text-slate-500">
              Sync threat scan history &amp; personal security telemetry across sessions
            </p>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`py-2 px-4 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
            }}
            className={`py-2 px-4 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === "signup"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            {providerHelpNeeded && (
              <div className="pl-6 pt-1 text-slate-700 space-y-1 border-t border-rose-200">
                <p className="font-semibold text-blue-700">How to enable Email/Password in Firebase Console:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-600">
                  <li>Open Firebase Console &rarr; Authentication &rarr; Sign-in method</li>
                  <li>Click <strong>Email/Password</strong>, toggle <strong>Enable</strong>, and click Save.</li>
                </ol>
                <a
                  href="https://console.firebase.google.com/project/calcium-airline-sf38q/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium mt-1"
                >
                  Open Firebase Auth Providers <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={100}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Alex Verma"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap"
          >
            {loading
              ? "Authenticating..."
              : mode === "login"
              ? "Sign In with Email"
              : "Create Account & Sync Scans"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400">Or continue with SSO</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>Sign In with Google Workspace</span>
        </button>
      </div>
    </div>
  );
};
