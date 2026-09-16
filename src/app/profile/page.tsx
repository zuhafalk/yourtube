"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserCircle, LogOut, ArrowLeft } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string;
  avatar?: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (data.success && data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border text-center">
          <h1 className="text-xl font-bold">
            You are not logged in
          </h1>

          <Link
            href="/login"
            className="inline-block mt-5 bg-red-600 text-white px-5 py-2.5 rounded-lg"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const name = user.name || "User";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-8"
        >
          <ArrowLeft size={18} />
          Back to Your Tube
        </Link>

        <div className="text-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={name}
              className="w-24 h-24 rounded-full object-cover mx-auto"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-red-600 text-white flex items-center justify-center text-3xl font-bold mx-auto">
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="text-2xl font-bold mt-5">
            {name}
          </h1>

          <p className="text-gray-500 mt-2">
            {user.email}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
            <UserCircle size={22} />

            <div>
              <p className="text-sm text-gray-500">
                Account name
              </p>

              <p className="font-medium">
                {name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}