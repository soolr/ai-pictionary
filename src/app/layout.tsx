import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 你画我猜",
  description: "一个有趣的AI绘画识别游戏",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
