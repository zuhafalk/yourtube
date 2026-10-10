"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (loading) return;

    if (password.length < 6) {
      setSuccess(false);
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setSuccess(false);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      setSuccess(Boolean(response.ok && data.success));
      setMessage(data.message || "Something went wrong. Try again.");

      if (response.ok && data.success) {
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setSuccess(false);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">Set a new password</h1>

        {!token ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            This reset link is missing its token. Please request a new one.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold"
            >
              New password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            <label
              htmlFor="confirm-password"
              className="mb-2 mt-5 block text-sm font-semibold"
            >
              Confirm new password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Type it again"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Reset password"
              )}
            </button>
          </form>
        )}

        {message && (
          <div
            className={`mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${
              success
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {success ? (
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
            )}

            <p className="font-medium">{message}</p>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-red-600 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}