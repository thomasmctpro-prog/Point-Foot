import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { isFirebaseConfigured } from "../lib/firebase";

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email ou mot de passe incorrect.";
    case "auth/email-already-in-use":
      return "Un compte existe déjà avec cet email.";
    case "auth/weak-password":
      return "Le mot de passe doit contenir au moins 6 caractères.";
    case "auth/invalid-email":
      return "Adresse email invalide.";
    case "auth/popup-closed-by-user":
      return "Connexion Google annulée.";
    default:
      return (err as Error)?.message || "Une erreur est survenue.";
  }
}

export default function Login() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isFirebaseConfigured) {
    return (
      <div className="max-w-md mx-auto flex flex-col gap-4">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Connexion</h1>
        <div className="rounded-xl bg-error-container text-on-error-container p-4 font-body text-sm">
          Firebase n'est pas encore configuré côté frontend (variables VITE_FIREBASE_* manquantes dans{" "}
          <code>frontend/.env</code>). La connexion sera disponible dès que le projet Firebase sera relié à
          l'application.
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      navigate("/ligue");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/ligue");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">
        {mode === "signin" ? "Connexion" : "Créer un compte"}
      </h1>

      {error && (
        <div className="rounded-xl bg-error-container text-on-error-container p-3 font-body text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Pseudo"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 font-body text-sm outline-none focus:border-primary"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 font-body text-sm outline-none focus:border-primary"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 font-body text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary text-on-primary font-label text-sm font-semibold py-3 disabled:opacity-60"
        >
          {mode === "signin" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-on-surface-variant text-xs font-label">
        <div className="flex-1 h-px bg-surface-container-highest" />
        ou
        <div className="flex-1 h-px bg-surface-container-highest" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="rounded-full border border-surface-container-highest font-label text-sm font-semibold py-3 disabled:opacity-60"
      >
        Continuer avec Google
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="font-label text-xs text-on-surface-variant underline underline-offset-2"
      >
        {mode === "signin" ? "Pas encore de compte ? Inscris-toi" : "Déjà un compte ? Connecte-toi"}
      </button>
    </div>
  );
}
