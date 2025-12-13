import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import AuthProvider from '@/providers/AuthProvider';

// Primary Font (UI, Body text)
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
});

// Secondary Font (Headings, Hero text - adds the futuristic feel)
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  variable: '--font-heading',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#02040a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: '%s | Mock Orbit',
    default: 'Mock Orbit | Next-Gen Peer Interviewing',
  },
  description: 'The tactical command center for engineering interviews. Master system design and algorithms with real-time peer feedback and AI analytics.',
  keywords: ['interview', 'mock interview', 'system design', 'leetcode', 'peer programming', 'AI feedback'],
  authors: [{ name: 'Mock Orbit Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mockorbit.com',
    siteName: 'Mock Orbit',
    title: 'Mock Orbit | Master Your Tech Interview',
    description: 'Real-time collaborative code execution, video conferencing, and AI-driven feedback for software engineers.',
    images: [
      {
        url: '/og-image.png', // Ensure you have an OG image in public folder
        width: 1200,
        height: 630,
        alt: 'Mock Orbit Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mock Orbit',
    description: 'The comprehensive peer interviewing platform for elite engineers.',
    creator: '@mockorbit',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body 
        className={`
          ${inter.variable} 
          ${spaceGrotesk.variable} 
          font-sans 
          antialiased 
          bg-[#02040a] 
          text-white 
          selection:bg-violet-500/30 
          selection:text-violet-200
          min-h-screen
          flex
          flex-col
        `}
      >
        <ReactQueryProvider>
          <AuthProvider>
            {/* The layout structure is kept clean. 
               Complex visual backgrounds (Starfields) are handled 
               in AppLayout or specific Page components to avoid 
               re-rendering heavy canvas elements unnecessarily on navigation.
            */}
            {children}
            <Toaster />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}




// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';
// import { Toaster } from "@/components/ui/toaster";
// import ReactQueryProvider from '@/providers/ReactQueryProvider';
// import AuthProvider from '@/providers/AuthProvider'; // Assuming AuthProvider exists

// const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// export const metadata: Metadata = {
//   title: 'Mock Orbit',
//   description: 'Comprehensive Peer Interviewing Platform',
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${inter.variable} font-sans antialiased`}>
//         <ReactQueryProvider>
//           <AuthProvider> {/* Wrap with AuthProvider */}
//             {children}
//             <Toaster />
//           </AuthProvider>
//         </ReactQueryProvider>
//       </body>
//     </html>
//   );
// }
