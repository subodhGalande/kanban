"use client";

import axios from "axios";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await axios.post("/api/auth/logout");
    router.push("/login");
  };

  return (
    <button onClick={handleLogout} className="text-sm text-red-600 underline">
      Logout
    </button>
  );
}
