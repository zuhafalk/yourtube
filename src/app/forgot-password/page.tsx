"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (loading || !email.trim()) return;

    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      setSuccess(Boolean(response.ok && data.success));
      setMessage(data.message || "Something went wrong. Try again.");
    } catch (error) {
      console.error("Forgot password error:", error);
      setSuccess(false);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/login"
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <h1 className="text-2xl font-bold">Forgot your password?</h1>

        <p className="mt-2 text-sm text-gray-500">
          Enter your account email and we&apos;ll send you a link to set a new
          password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="email" className="mb-2 block text-sm font-semibold">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

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
      </div>
    </div>
  );
}