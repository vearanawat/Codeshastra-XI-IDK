"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
