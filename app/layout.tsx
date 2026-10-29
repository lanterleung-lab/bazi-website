import type { Metadata } from "next";
import "./globals.css";

// 💡 1. 移除 next/font/google 的引入與設定
// import { Geist, Geist_Mono } from "next/font/google";
// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: 'Observer 澄空堂 | 映照靈魂與命運的第三視角', 
  description: '匯聚心理諮商、塔羅占卜與東方命理。如同一面明鏡，為您鑒照迷局，看清前方的風景。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW" 
      // 💡 2. 拔掉 geistSans.variable 和 geistMono.variable
      className={`h-full antialiased font-sans`} 
    >
      <body className="min-h-full flex flex-col bg-[#050508] text-stone-200">
        
        <div className="flex-grow">
          {children}
        </div>

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