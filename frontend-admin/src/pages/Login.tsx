import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import apiFetch from "../utils/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      // On appelle login() qui va faire un /me pour récupérer le user
      await login();
      navigate("/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to login";
      setError(message);
    }
  };
  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-md mx-auto py-12 text-text-main">
      <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter text-center">
        Login.exe
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-bg-panel border-2 border-border-subtle p-8 flex flex-col gap-6 shadow-2xl"
      >
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 text-xs uppercase tracking-widest text-center font-bold">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-primary">
            Credential_Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main font-mono"
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-primary">
            Credential_Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary w-full text-text-main font-mono"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-tighter bg-bg-main text-primary px-2 py-1 border border-border-subtle hover:border-secondary transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="bg-primary text-bg-main p-4 uppercase font-black tracking-widest hover:bg-text-main transition-colors shadow-xl"
        >
          Authorize_Access
        </button>
      </form>
    </div>
  );
};
export default Login;
