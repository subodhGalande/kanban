"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await axios.post("/api/auth/logout");
    router.replace("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className=" w-10 h-10 rounded-full hover:scale-105 hover:bg-text/5 duration-150 cursor-grab "
    >
      <LogOut size={18} className="text-text w-10 h-5" />
    </button>
  );
}
