import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Observer 澄空堂 | 映照靈魂與命運的第三視角', // 你的完美命名
  description: '匯聚心理諮商、塔羅占卜與東方命理。如同一面明鏡，為您鑒照迷局，看清前方的風景。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW" // 💡 順手幫你把 en 改成 zh-TW，對中文網頁的 Google 搜尋 SEO 比較好！
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* 💡 1. 幫 body 加上跟首頁一樣的深色背景 bg-[#050508]，這樣切換頁面時才不會閃白光 */}
      <body className="min-h-full flex flex-col bg-[#050508] text-stone-200">
        
        {/* 💡 2. 把原本的 {children} 包一層 div 並加上 flex-grow，這會把版權宣告「擠」到螢幕最底下 */}
        <div className="flex-grow">
          {children}
        </div>

        {/* 💡 3. 這就是幫你加上去的「頁尾版權宣告」區塊 */}
        <footer className="w-full border-t border-stone-800/50 bg-[#050508] py-8 mt-auto z-20 relative">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-col items-center md:items-start">
              <span className="text-xl font-serif text-stone-300 tracking-wider mb-1">
                Observer 澄空堂
              </span>
              <span className="text-xs text-stone-600 font-light">
                命理與心理導航平台
              </span>
            </div>
            
            <div className="text-stone-500 text-xs text-center md:text-right font-mono">
              © {new Date().getFullYear()} Observer. All rights reserved.
            </div>

          </div>
        </footer>

      </body>
    </html>
  );
}