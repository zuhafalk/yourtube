"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.href = "/";
        return;
      }

      setMessage(data.message || "Login failed");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <div className="text-center mb-8">
          <div className="inline-flex bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xl">
            Y
          </div>

          <h1 className="text-2xl font-bold mt-4">
            Welcome back
          </h1>

          <p className="text-gray-500 mt-2">
            Login to your Your Tube account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 border rounded-lg outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-12 px-4 border rounded-lg outline-none focus:border-blue-500"
          />

          {message && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn size={19} />

            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-red-600 font-semibold hover:underline"
          >
            Create account
          </Link>
        </p>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Your Tube
          </Link>
        </div>
      </div>
    </div>
  );
}