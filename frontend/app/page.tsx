"use client";

import { Login } from "../components/Login";

export default function Page() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-sm">
        <Login />
      </div>
    </main>
  );
}
