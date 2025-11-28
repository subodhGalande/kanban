"use client";

import LogoutButton from "./logoutButton";

export default function UserMenu({
  name,
  avatarColor,
}: {
  name: string;
  avatarColor: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center font-sans gap-3">
      <div
        className=" w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm sm:text-base text-white font-semibold select-none"
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </div>
    </div>
  );
}
