import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Toaster } from "./ui/sonner";

export const Layout = () => {
  return (
    <div className="min-h-screen flex theme-bg text-zinc-100 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </main>
      </div>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
};
