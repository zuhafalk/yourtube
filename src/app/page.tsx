"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Home,
  Clapperboard,
  Tv,
  Library,
  History,
  Clock,
  Search,
  Menu,
  Bell,
  UserCircle,
  Upload,
  Play,
  LogOut,
  User,
} from "lucide-react";

type Video = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  category: string | null;
  views: number;
  createdAt: string;
  videoUrl?: string | null;
  uploader?: {
    name: string | null;
  } | null;
};

type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  avatar?: string | null;
};

const categories = [
  "All",
  "Music",
  "Gaming",
  "Programming",
  "AI",
  "Education",
  "News",
  "Live",
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    async function loadVideos() {
      try {
        const response = await fetch("/api/videos");

        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }

        const data = await response.json();

        if (data.success) {
          setVideos(data.videos || []);
        }
      } catch (error) {
        console.error("Failed to load videos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          throw new Error("Failed to fetch current user");
        }

        const data = await response.json();

        if (data.success && data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function handleLogout() {
    if (logoutLoading) {
      return;
    }

    try {
      setLogoutLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(null);
        setShowAccountMenu(false);
        window.location.href = "/";
      } else {
        alert(data.message || "Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout");
    } finally {
      setLogoutLoading(false);
    }
  }

  const filteredVideos = videos.filter((video) => {
    const searchText = searchQuery.trim().toLowerCase();

    const matchesSearch =
      searchText === "" ||
      video.title.toLowerCase().includes(searchText) ||
      (video.description || "").toLowerCase().includes(searchText) ||
      (video.uploader?.name || "").toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      (video.category || "").toLowerCase() ===
        selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const userName = user?.name || "User";

  const userInitial = userName
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ================= NAVBAR ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b flex items-center px-4 gap-4">
        {/* Menu */}
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 min-w-fit"
        >
          <div className="bg-red-600 text-white px-2.5 py-1 rounded-lg font-bold text-lg">
            Y
          </div>

          <h1 className="text-xl font-bold hidden sm:block">
            Your Tube
          </h1>
        </Link>

        {/* Search */}
        <div className="flex flex-1 justify-center">
          <div className="flex w-full max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search"
              className="flex-1 h-10 px-5 border border-gray-300 rounded-l-full outline-none focus:border-blue-500 bg-white"
            />

            <button
              type="button"
              className="w-16 h-10 border border-l-0 border-gray-300 rounded-r-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Upload */}
          <Link
            href="/upload"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            <Upload size={18} />
            Upload
          </Link>

          <Link
            href="/upload"
            className="sm:hidden p-2 rounded-full hover:bg-gray-100"
            aria-label="Upload"
          >
            <Upload size={22} />
          </Link>

          {/* Notifications */}
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell size={22} />
          </button>

          {/* ================= ACCOUNT ================= */}
          {userLoading ? (
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowAccountMenu(!showAccountMenu)
                }
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition"
                aria-label="Account"
              >
                {/* Avatar */}
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={userName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                    {userInitial}
                  </div>
                )}

                {/* Name */}
                <span className="hidden lg:block font-medium max-w-32 truncate">
                  {userName}
                </span>
              </button>

              {/* Account dropdown */}
              {showAccountMenu && (
                <div className="absolute right-0 top-12 w-72 bg-white border rounded-xl shadow-lg overflow-hidden">
                  {/* User information */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={userName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-bold">
                          {userInitial}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {userName}
                        </p>

                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile */}
                  <Link
                    href="/profile"
                    onClick={() =>
                      setShowAccountMenu(false)
                    }
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                  >
                    <User size={19} />
                    <span>My account</span>
                  </Link>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 disabled:opacity-50 text-left"
                  >
                    <LogOut size={19} />

                    <span>
                      {logoutLoading
                        ? "Logging out..."
                        : "Logout"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login when not authenticated */
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100"
            >
              <UserCircle size={26} />

              <span className="hidden sm:block font-medium">
                Login
              </span>
            </Link>
          )}
        </div>
      </header>

      {/* ================= PAGE BODY ================= */}
      <div className="flex pt-16">
        {/* ================= SIDEBAR ================= */}
        <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-60 bg-white border-r p-4">
          <nav className="space-y-2">
            {/* HOME */}
            <Link
              href="/"
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-100 font-medium"
            >
              <Home size={21} />
              Home
            </Link>

            {/* SHORTS */}
            <Link
              href="/shorts"
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <Clapperboard size={21} />
              Shorts
            </Link>

            {/* SUBSCRIPTIONS */}
            <Link
              href="/subscriptions"
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <Tv size={21} />
              Subscriptions
            </Link>

            <hr className="my-4" />

            {/* LIBRARY */}
            <Link
              href="/library"
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <Library size={21} />
              Library
            </Link>

            {/* HISTORY */}
            <Link
              href="/history"
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <History size={21} />
              History
            </Link>

            {/* WATCH LATER */}
            <Link
              href="/watch-later"
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <Clock size={21} />
              Watch later
            </Link>

            <hr className="my-4" />

            {/* UPLOAD */}
            <Link
              href="/upload"
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium"
            >
              <Upload size={21} />
              Upload video
            </Link>
          </nav>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 md:ml-60 p-4 md:p-6">
          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto mb-6 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory(category)
                }
                className={`px-4 py-2 border rounded-lg whitespace-nowrap transition ${
                  selectedCategory === category
                    ? "bg-black text-white border-black"
                    : "bg-white hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Heading + Upload */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                Recommended videos
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Discover videos from Your Tube
              </p>
            </div>

            <Link
              href="/upload"
              className="hidden sm:flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-red-700 transition"
            >
              <Upload size={18} />
              Upload Video
            </Link>
          </div>

          {/* ================= LOADING ================= */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-video rounded-xl bg-gray-300" />

                  <div className="flex gap-3 mt-3">
                    <div className="w-9 h-9 rounded-full bg-gray-300 shrink-0" />

                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            /* ================= VIDEO GRID ================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/watch?id=${video.id}`}
                  className="cursor-pointer group block"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-200">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white">
                        <Play
                          size={40}
                          fill="currentColor"
                        />

                        <p className="mt-2 text-sm">
                          {video.category || "Video"}
                        </p>
                      </div>
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition bg-black/70 text-white rounded-full p-3">
                        <Play
                          size={24}
                          fill="currentColor"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Video details */}
                  <div className="flex gap-3 mt-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 shrink-0 rounded-full bg-gray-300 flex items-center justify-center font-bold">
                      {(video.uploader?.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-5 line-clamp-2">
                        {video.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {video.uploader?.name ||
                          "Unknown channel"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {video.views || 0} views
                      </p>

                      {video.category && (
                        <p className="text-xs text-gray-400 mt-1">
                          {video.category}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* ================= NO RESULTS ================= */
            <div className="text-center py-20">
              <Search
                size={48}
                className="mx-auto text-gray-400 mb-4"
              />

              <h3 className="text-xl font-semibold">
                No videos found
              </h3>

              <p className="text-gray-500 mt-2">
                Try searching for something else or choose
                another category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-5 px-5 py-2.5 rounded-full bg-black text-white hover:bg-gray-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}