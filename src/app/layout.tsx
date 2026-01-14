import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MenuProvider } from "@/contexts/menu-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/siderbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrMenu Editor - 可视化菜单编辑器",
  description: "Minecraft TrMenu 插件可视化编辑器",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MenuProvider>
          <SidebarProvider>
            <AppSidebar />
            {children}
          </SidebarProvider>
        </MenuProvider>
      </body>
    </html>
  );
}
