"use client";

import AppHeader from "@/layout/AppHeader";
import React from "react";

export default function AdminLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader user={user} />
      <div className="flex-1 p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6">
        {children}
      </div>
    </div>
  );
}
