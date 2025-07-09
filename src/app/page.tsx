// "use client";

// import { Button } from "@/components/ui/button";
// // Assuming these shadcn/ui components are styled appropriately for a premium dark theme
// import {
//     Users,
//     CalendarCheck,
//     BrainCircuit,
//     Video,
//     MessageSquare,
//     Edit3,
//     Code2,
//     ArrowRight,
//     CheckCircle,
//     Sparkles,
//     ShieldCheck,
//     Layers,
//     GitFork,
//     DatabaseZap,
//     Settings2,
//     ToyBrick,
//     BellDot,
//     MousePointer,
//     MoveRight,
//     Award, // For premium feel
//     Briefcase // For business/tech
// } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image"; // For UI mockups
// import { FiGithub } from "react-icons/fi";
// import { GrTechnology } from "react-icons/gr"; // User requested logo icon

// // Helper component for animated text (subtle reveal)
// type AnimatedTextProps = {
//     text: string;
//     className?: string;
//     stagger?: number;
//     individualClassName?: string;
// };

// const AnimatedText = ({
//     text,
//     className,
//     stagger = 0.03,
//     individualClassName = "",
// }: AnimatedTextProps) => {
//     return (
//         <span className={className} aria-label={text}>
//             {text.split("").map((char, index) => (
//                 <span
//                     key={index}
//                     className={`inline-block animate-char-reveal ${individualClassName}`}
//                     style={{ animationDelay: `${index * stagger}s` }}
//                 >
//                     {char === " " ? "\u00A0" : char}
//                 </span>
//             ))}
//         </span>
//     );
// };


// export default function Home() {
//     // New color palette
//     // These would ideally be in your tailwind.config.js or a global CSS file
//     // For this example, we'll define them in CSS variables via styled-jsx
//     const theme = {
//         bgMain: "#16181A", // Deep, dark charcoal
//         bgSurface: "#1F2123", // Slightly lighter for cards, panels
//         bgSurfaceLighter: "#292C2E", // For subtle hover or active states on surfaces
//         textPrimary: "#F0F2F5", // Crisp off-white
//         textSecondary: "#A8B2C0", // Muted, sophisticated gray
//         accentPrimary: "#C9A461", // Muted Gold/Amber
//         accentPrimaryHover: "#B8914B", // Darker gold for hover
//         borderColor: "#303438", // Subtle borders
//         borderColorSubtle: "#2A2D30",
//         shadowColor: "rgba(0, 0, 0, 0.3)", // For dark theme shadows
//         accentPrimaryRgb: "201, 164, 97", // For RGBA usage if needed
//     };

//     return (
//         <>
//             <style jsx global>{`
//                 :root {
//                     --bg-main: ${theme.bgMain};
//                     --bg-surface: ${theme.bgSurface};
//                     --bg-surface-lighter: ${theme.bgSurfaceLighter};
//                     --text-primary: ${theme.textPrimary};
//                     --text-secondary: ${theme.textSecondary};
//                     --accent-primary: ${theme.accentPrimary};
//                     --accent-primary-hover: ${theme.accentPrimaryHover};
//                     --border-color: ${theme.borderColor};
//                     --border-color-subtle: ${theme.borderColorSubtle};
//                     --shadow-color: ${theme.shadowColor};
//                     --accent-primary-rgb: ${theme.accentPrimaryRgb};
//                 }

//                 body {
//                     background-color: var(--bg-main);
//                     color: var(--text-primary);
//                 }

//                 @keyframes char-reveal {
//                     0% { opacity: 0; transform: translateY(15px) scale(0.95) skewX(-5deg); }
//                     70% { opacity: 0.8; transform: translateY(-2px) scale(1.02) skewX(1deg); }
//                     100% { opacity: 1; transform: translateY(0) scale(1) skewX(0deg); }
//                 }
//                 .animate-char-reveal {
//                     opacity: 0;
//                     animation: char-reveal 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
//                 }

//                 @keyframes elegant-fade-in-up {
//                     from { opacity: 0; transform: translateY(25px); }
//                     to { opacity: 1; transform: translateY(0); }
//                 }
//                 .animate-elegant-fade-in-up {
//                     opacity: 0; /* Start hidden */
//                     animation: elegant-fade-in-up 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
//                 }
                
//                 .subtle-hover-lift {
//                     transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//                 }
//                 .subtle-hover-lift:hover {
//                     transform: translateY(-6px);
//                     box-shadow: 0 12px 24px var(--shadow-color), 0 4px 8px rgba(0,0,0,0.2);
//                 }

//                 .premium-button {
//                     background-color: var(--accent-primary);
//                     color: var(--bg-main); /* High contrast text on accent */
//                     font-weight: 600;
//                     border-radius: 0.375rem; /* 6px */
//                     padding: 0.75rem 1.5rem;
//                     transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
//                     box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.2), 0 2px 6px rgba(var(--accent-primary-rgb), 0.15);
//                 }
//                 .premium-button:hover {
//                     background-color: var(--accent-primary-hover);
//                     transform: translateY(-2px);
//                     box-shadow: 0 6px 16px rgba(var(--accent-primary-rgb), 0.25), 0 3px 8px rgba(var(--accent-primary-rgb), 0.2);
//                 }

//                 .premium-button-outline {
//                     background-color: transparent;
//                     color: var(--accent-primary);
//                     font-weight: 600;
//                     border: 2px solid var(--accent-primary);
//                     border-radius: 0.375rem; /* 6px */
//                     padding: calc(0.75rem - 2px) calc(1.5rem - 2px); /* Adjust padding for border */
//                     transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, transform 0.2s ease-in-out;
//                 }
//                 .premium-button-outline:hover {
//                     background-color: var(--accent-primary);
//                     color: var(--bg-main);
//                     transform: translateY(-2px);
//                 }
                
//                 .section-title-underline::after {
//                     content: '';
//                     display: block;
//                     width: 60px;
//                     height: 3px;
//                     background-color: var(--accent-primary);
//                     margin: 12px auto 0;
//                     border-radius: 2px;
//                 }
//                 .mockup-container-premium {
//                     background-color: var(--bg-surface);
//                     border: 1px solid var(--border-color-subtle);
//                     border-radius: 0.75rem; /* 12px */
//                     box-shadow: 0 15px 30px rgba(0,0,0,0.3), 0 8px 15px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.03);
//                     overflow: hidden;
//                 }
//                 .tech-logo-item {
//                     background-color: var(--bg-surface);
//                     border: 1px solid var(--border-color-subtle);
//                     padding: 1.5rem;
//                     border-radius: 0.5rem;
//                     transition: all 0.3s ease;
//                 }
//                 .tech-logo-item:hover {
//                     border-color: var(--accent-primary);
//                     transform: translateY(-4px);
//                     box-shadow: 0 8px 16px rgba(var(--accent-primary-rgb), 0.1);
//                 }

//             `}</style>

//             <div className="flex flex-col min-h-dvh overflow-x-hidden" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
//                 {/* Header */}
//                 <header className="px-4 lg:px-8 h-20 flex items-center sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-main)', borderBottom: `1px solid var(--border-color-subtle)`}}>
//                     <Link href="/" className="flex items-center justify-center group" prefetch={false}>
//                         <GrTechnology className="h-7 w-7 mr-2.5" style={{ color: 'var(--accent-primary)' }} />
//                         <span className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Mock Orbit</span>
//                     </Link>
//                     <nav className="ml-auto flex gap-5 sm:gap-7 items-center">
//                         {['Features', 'Technology', 'Pricing'].map(item => (
//                              <Link key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium transition-colors duration-200" style={{ color: 'var(--text-secondary)' }} hover-style={{ color: 'var(--accent-primary)' }} // Tailwind hover:text-[var(--accent-primary)]
//                                 onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
//                                 onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
//                                 prefetch={false}>
//                                 {item}
//                             </Link>
//                         ))}
//                         <Link href="/auth/login" className="text-sm font-medium transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}
//                              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
//                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
//                              prefetch={false}>
//                             Login
//                         </Link>
//                         <Link href="/auth/register" prefetch={false}>
//                             <button className="premium-button text-sm px-5 py-2.5">Get Started</button>
//                         </Link>
//                     </nav>
//                 </header>

//                 <main className="flex-1">
//                     {/* Hero Section */}
//                     <section className="w-full py-24 md:py-32 lg:py-40 relative">
//                         <div className="absolute inset-0 -z-10" style={{backgroundColor: 'var(--bg-main)'}}>
//                             {/* Optional: Subtle geometric pattern SVG background here if desired, instead of pure solid */}
//                         </div>
//                         <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
//                             <div className="inline-block rounded-md border px-3 py-1 text-xs font-medium mb-6 animate-elegant-fade-in-up" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', animationDelay: '0.1s' }}>
//                                 <Award className="inline w-3.5 h-3.5 mr-1.5 -mt-px" />
//                                 Elevate Your Interview Readiness
//                             </div>
//                             <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-7" style={{color: 'var(--text-primary)'}}>
//                                 <AnimatedText text="The Art of" className="block mb-2" individualClassName="text-[var(--text-primary)]" stagger={0.025} />
//                                 <AnimatedText text="Peer Interviewing, Perfected." className="block" individualClassName="text-[var(--accent-primary)]" stagger={0.03} />
//                             </h1>
//                             <p className="max-w-2xl mx-auto text-lg md:text-xl mb-10 animate-elegant-fade-in-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.6s' }}>
//                                 Mock Orbit provides an end-to-end platform to simulate real-world interviews, collaborate with peers, and gain actionable insights.
//                             </p>
//                             <div className="flex flex-col sm:flex-row gap-4 justify-center animate-elegant-fade-in-up" style={{animationDelay: '0.9s'}}>
//                                 <Link href="/auth/register" prefetch={false}>
//                                     <button className="premium-button w-full sm:w-auto text-base px-8 py-3.5">
//                                         Start Your Journey Free <ArrowRight className="ml-2 w-5 h-5 inline-block" />
//                                     </button>
//                                 </Link>
//                                 <Link href="#features" prefetch={false}>
//                                     <button className="premium-button-outline w-full sm:w-auto text-base px-8 py-3.5">
//                                         Discover Features
//                                     </button>
//                                 </Link>
//                             </div>
//                         </div>
//                     </section>

//                     {/* "Why Mock Orbit?" or Core Differentiators Section */}
//                     <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--bg-surface)' }}>
//                         <div className="container mx-auto px-4 md:px-6">
//                             <div className="text-center mb-16">
//                                 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline" style={{ color: 'var(--text-primary)' }}>
//                                     The Mock Orbit Advantage
//                                 </h2>
//                                 <p className="mt-10 text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
//                                     We're not just another practice tool. We've engineered a comprehensive ecosystem for serious interview preparation.
//                                 </p>
//                             </div>
//                             <div className="grid md:grid-cols-3 gap-8">
//                                 {[
//                                     { icon: MousePointer, title: "Realistic Simulation", description: "Engage in interviews that mirror actual company processes, from scheduling to live interaction." },
//                                     { icon: Users, title: "Peer Collaboration", description: "Connect, schedule, and conduct interviews with a diverse community of motivated peers." },
//                                     { icon: BrainCircuit, title: "Intelligent Feedback Loop", description: "Benefit from structured peer feedback and upcoming AI-driven performance analysis." }
//                                 ].map((item, index) => (
//                                     <div key={item.title} className="p-8 rounded-lg subtle-hover-lift animate-elegant-fade-in-up" style={{ backgroundColor: 'var(--bg-main)', border: `1px solid var(--border-color-subtle)`, animationDelay: `${0.2 + index * 0.15}s` }}>
//                                         <div className="w-12 h-12 rounded-md flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-main)'}}>
//                                             <item.icon className="w-6 h-6" />
//                                         </div>
//                                         <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
//                                         <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </section>

//                     {/* Features Showcase Section */}
//                     <section id="features" className="py-20 md:py-28" style={{ backgroundColor: 'var(--bg-main)'}}>
//                         <div className="container mx-auto px-4 md:px-6">
//                             <div className="text-center mb-16">
//                                 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline" style={{ color: 'var(--text-primary)' }}>
//                                     Precision-Engineered Features
//                                 </h2>
//                                 <p className="mt-10 text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
//                                     Every tool you need, meticulously designed for an effective and engaging interview practice experience.
//                                 </p>
//                             </div>

//                             {/* Feature: Dual Dashboards & Real-time Room (Combined Visual) */}
//                             <div className="mb-20 grid lg:grid-cols-2 gap-12 items-center">
//                                 <div className="animate-elegant-fade-in-up" style={{ animationDelay: '0.2s' }}>
//                                     <Award className="w-10 h-10 mb-4" style={{color: 'var(--accent-primary)'}}/>
//                                     <h3 className="text-2xl md:text-3xl font-semibold mb-4" style={{color: 'var(--text-primary)'}}>The Command Center: Your Interview Hub</h3>
//                                     <p className="text-base mb-3" style={{color: 'var(--text-secondary)'}}>Seamlessly switch between interviewer and interviewee roles with dedicated dashboards. Then, dive into our feature-rich real-time interview room.</p>
//                                     <ul className="space-y-2 text-sm">
//                                         {[
//                                             {icon: Layers, text: "Dual Dashboards: Tailored views for focused preparation and execution."},
//                                             {icon: Video, text: "HD Video & Audio: Crystal-clear communication powered by WebRTC."},
//                                             {icon: Edit3, text: "Collaborative Whiteboard: Visualize ideas in real-time."},
//                                             {icon: Code2, text: "Integrated Code Editor: Collaborative coding, just like the real thing."},
//                                             {icon: MessageSquare, text: "Instant Chat: For quick notes and resource sharing."}
//                                         ].map(item => (
//                                             <li key={item.text} className="flex items-start">
//                                                 <item.icon className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0" style={{color: 'var(--accent-primary)'}} />
//                                                 <span style={{color: 'var(--text-secondary)'}}>{item.text}</span>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                                 <div className="mockup-container-premium animate-elegant-fade-in-up p-4 md:p-6" style={{ animationDelay: '0.4s' }}>
//                                     {/* Placeholder for a clean, high-quality UI mockup image/animation */}
//                                     <Image src="https://i.ibb.co/Psd6TQmp/mock-orbit.png" width={1200} height={675} alt="Mock Orbit Interface Mockup" className="rounded-md object-cover w-full h-auto" />
//                                     {/* Example of how you might show sub-features on the image if it's a static one:
//                                     <div className="absolute top-[10%] left-[5%] p-2 bg-[var(--bg-surface-lighter)] text-xs rounded shadow-lg">Interviewer Dashboard Snippet</div>
//                                     <div className="absolute bottom-[10%] right-[5%] p-2 bg-[var(--bg-surface-lighter)] text-xs rounded shadow-lg">Code Editor Focus</div>
//                                     */}
//                                 </div>
//                             </div>
                            
//                             {/* Other Key Feature Cards */}
//                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//                                 {[
//                                     { icon: CalendarCheck, title: "Effortless Scheduling", description: "Intuitive calendar integration with real-time notifications and availability matching." },
//                                     { icon: ShieldCheck, title: "Enterprise-Grade Security", description: "Robust JWT authentication and secure data protocols ensure your information is protected." },
//                                     { icon: Settings2, title: "Developer-Friendly API", description: "Comprehensive RESTful APIs built with Golang for performance and scalability." },
                                    
//                                 ].map((feature, index) => (
//                                     <div key={feature.title} className="p-6 rounded-lg subtle-hover-lift animate-elegant-fade-in-up" style={{ backgroundColor: 'var(--bg-surface)', border: `1px solid var(--border-color)`, animationDelay: `${0.3 + index * 0.15}s` }}>
//                                         <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-main)'}}>
//                                             <feature.icon className="w-5 h-5" />
//                                         </div>
//                                         <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--text-primary)'}}>{feature.title}</h3>
//                                         <p className="text-xs" style={{color: 'var(--text-secondary)'}}>{feature.description}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </section>

//                     {/* Tech Stack Section */}
//                     <section id="technology" className="py-20 md:py-28" style={{ backgroundColor: 'var(--bg-surface)' }}>
//                         <div className="container mx-auto px-4 md:px-6">
//                             <div className="text-center mb-16">
//                                 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline" style={{ color: 'var(--text-primary)' }}>
//                                     Built on a Foundation of Excellence
//                                 </h2>
//                                 <p className="mt-10 text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
//                                     Leveraging industry-leading technologies for performance, scalability, and a seamless user experience.
//                                 </p>
//                             </div>
//                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-center">
//                                 {[
//                                     { icon: ToyBrick, name: "Next.js & TypeScript" },
//                                     { icon: GitFork, name: "Golang (Gin)" },
//                                     { icon: DatabaseZap, name: "MongoDB" },
//                                     { icon: Briefcase, name: "WebRTC (Pion)" }, // Using Briefcase as generic 'tech component'
//                                     { iconName: "WS", name: "WebSockets" },
//                                     { icon: ShieldCheck, name: "JWT Auth" },
//                                     { iconName: "CSS", name: "Tailwind CSS" },
//                                     { iconName: "API", name: "RESTful APIs" },
//                                 ].map((tech, index) => (
//                                     <div key={tech.name} className="tech-logo-item animate-elegant-fade-in-up" style={{ animationDelay: `${0.1 + index * 0.07}s` }}>
//                                         {tech.icon ? (
//                                             <tech.icon className="w-10 h-10 mb-3 mx-auto" style={{color: 'var(--accent-primary)'}}/>
//                                         ) : (
//                                              <div className="w-10 h-10 mb-3 mx-auto flex items-center justify-center rounded-full text-lg font-bold" style={{backgroundColor: 'var(--bg-main)', color: 'var(--accent-primary)', border: `1px solid var(--accent-primary)`}}>
//                                                 {tech.iconName}
//                                              </div>
//                                         )}
//                                         <h4 className="text-md font-medium" style={{color: 'var(--text-primary)'}}>{tech.name}</h4>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </section>
                    
//                     {/* Call to Action Section */}
//                     <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--bg-main)'}}>
//                         <div className="container mx-auto px-4 md:px-6 text-center">
//                             <Sparkles className="w-12 h-12 mx-auto mb-5" style={{color: 'var(--accent-primary)'}}/>
//                             <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 animate-elegant-fade-in-up" style={{ animationDelay: '0.1s', color: 'var(--text-primary)'}}>
//                                 Ready to Redefine Your Interview Skills?
//                             </h2>
//                             <p className="max-w-xl mx-auto text-lg md:text-xl mb-10 animate-elegant-fade-in-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.3s' }}>
//                                 Join a growing community of ambitious individuals. Sign up for Mock Orbit—it's free to get started.
//                             </p>
//                             <div className="animate-elegant-fade-in-up" style={{animationDelay: '0.5s'}}>
//                                 <Link href="/auth/register" prefetch={false}>
//                                     <button className="premium-button text-lg px-10 py-4">
//                                         Create Your Free Account Now
//                                         <MoveRight className="ml-2.5 w-5 h-5 inline-block" />
//                                     </button>
//                                 </Link>
//                             </div>
//                         </div>
//                     </section>
//                 </main>

//                 <footer className="py-10 w-full shrink-0 px-4 md:px-6 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderTop: `1px solid var(--border-color)`}}>
//                     <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
//                         <div className="flex items-center gap-2">
//                             <GrTechnology className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
//                             <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>&copy; {new Date().getFullYear()} Mock Orbit. All Rights Reserved.</p>
//                         </div>
//                         <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
//                             Designed & Developed by <Link href="https://kickaditya.vercel.app" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline" style={{color: 'var(--accent-primary)'}}>Aditya Anand</Link>
//                         </p>
//                         <nav className="flex gap-5">
//                             <Link href="https://github.com/adityaxanand/MockOrbit" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{color: 'var(--text-secondary)'}}
//                                 onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
//                                 onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
//                                 prefetch={false}>
//                                 <FiGithub className="w-5 h-5" />
//                                 <span className="sr-only">GitHub</span>
//                             </Link>
//                             {/* Add Terms, Privacy links here with similar styling */}
//                         </nav>
//                     </div>
//                 </footer>
//             </div>
//         </>
//     );
// }


"use client";

import { useState, useEffect } from "react";
import {
    Users, CalendarCheck, BrainCircuit, Video, MessageSquare, Edit3, Code2, ArrowRight,
    CheckCircle, Sparkles, ShieldCheck, Layers, GitFork, DatabaseZap, Settings2, ToyBrick,
    BellDot, MousePointer, MoveRight, Award, Briefcase, Sun, Moon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FiGithub } from "react-icons/fi";
import { GrTechnology } from "react-icons/gr";

// Helper component for animated text
type AnimatedTextProps = {
    text: string;
    className?: string;
    stagger?: number;
    individualClassName?: string;
};

const AnimatedText = ({ text, className, stagger = 0.03, individualClassName = "" }: AnimatedTextProps) => (
    <span className={className} aria-label={text}>
        {text.split("").map((char, index) => (
            <span
                key={index}
                className={`inline-block animate-char-reveal ${individualClassName}`}
                style={{ animationDelay: `${index * stagger}s` }}
            >
                {char === " " ? "\u00A0" : char}
            </span>
        ))}
    </span>
);

// Sexy theme toggle component
type ThemeToggleProps = {
    theme: ThemeKey;
    setTheme: (theme: ThemeKey) => void;
};

const ThemeToggle = ({ theme, setTheme }: ThemeToggleProps) => (
    <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="w-12 h-6 rounded-full p-1 flex items-center justify-between relative bg-[var(--bg-surface-lighter)] transition-colors duration-500"
        aria-label="Toggle theme"
    >
        <div 
            className="absolute left-1 top-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] transition-transform duration-300 ease-in-out"
            style={{ transform: theme === 'dark' ? 'translateX(0)' : 'translateX(100%)' }}
        />
        <Sun className="w-4 h-4 z-10 text-yellow-400" />
        <Moon className="w-4 h-4 z-10 text-slate-300" />
    </button>
);


type ThemeKey = 'dark' | 'light';

export default function Home() {
    const [theme, setTheme] = useState<ThemeKey>('dark'); // Default to dark

    // Theme definitions
    const themes: Record<ThemeKey, {
        bgMain: string;
        bgSurface: string;
        bgSurfaceLighter: string;
        textPrimary: string;
        textSecondary: string;
        accentPrimary: string;
        accentPrimaryHover: string;
        borderColor: string;
        borderColorSubtle: string;
        shadowColor: string;
        accentPrimaryRgb: string;
        aurora: string;
    }> = {
        dark: {
            bgMain: "#16181A",
            bgSurface: "#1F2123",
            bgSurfaceLighter: "#292C2E",
            textPrimary: "#F0F2F5",
            textSecondary: "#A8B2C0",
            accentPrimary: "#C9A461",
            accentPrimaryHover: "#B8914B",
            borderColor: "#303438",
            borderColorSubtle: "#2A2D30",
            shadowColor: "rgba(0, 0, 0, 0.3)",
            accentPrimaryRgb: "201, 164, 97",
            aurora: "radial-gradient(ellipse 80% 80% at 50% -20%,rgba(120,119,198,0.3),rgba(255,255,255,0))",
        },
        light: {
            bgMain: "#F7F8FA", // Off-white
            bgSurface: "#FFFFFF", // Pure white for cards
            bgSurfaceLighter: "#E8EBEF", // Light grey for hover
            textPrimary: "#1a202c", // Dark text
            textSecondary: "#4a5568", // Muted text
            accentPrimary: "#B58A3F", // A slightly darker gold for light bg
            accentPrimaryHover: "#A17930",
            borderColor: "#D3D6DA", // Light border
            borderColorSubtle: "#E2E8F0",
            shadowColor: "rgba(0, 0, 0, 0.1)",
            accentPrimaryRgb: "181, 138, 63",
            aurora: "radial-gradient(ellipse 80% 80% at 50% -20%,rgba(192, 132, 252, 0.2),rgba(255,255,255,0))",
        }
    };

    const currentTheme = themes[theme] || themes.dark;
    
    useEffect(() => {
        // Set initial theme based on system preference or saved preference
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (savedTheme === 'dark' || savedTheme === 'light') {
            setTheme(savedTheme);
        } else {
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    useEffect(() => {
        // Apply theme changes to the document
        document.body.className = theme;
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg-main: ${currentTheme.bgMain};
                    --bg-surface: ${currentTheme.bgSurface};
                    --bg-surface-lighter: ${currentTheme.bgSurfaceLighter};
                    --text-primary: ${currentTheme.textPrimary};
                    --text-secondary: ${currentTheme.textSecondary};
                    --accent-primary: ${currentTheme.accentPrimary};
                    --accent-primary-hover: ${currentTheme.accentPrimaryHover};
                    --border-color: ${currentTheme.borderColor};
                    --border-color-subtle: ${currentTheme.borderColorSubtle};
                    --shadow-color: ${currentTheme.shadowColor};
                    --accent-primary-rgb: ${currentTheme.accentPrimaryRgb};
                    --aurora-gradient: ${currentTheme.aurora};
                }

                body {
                    background-color: var(--bg-main);
                    color: var(--text-primary);
                    transition: background-color 0.5s ease, color 0.5s ease;
                }

                /* Animations */
                @keyframes char-reveal {
                    0% { opacity: 0; transform: translateY(15px) scale(0.95) skewX(-5deg); }
                    70% { opacity: 0.8; transform: translateY(-2px) scale(1.02) skewX(1deg); }
                    100% { opacity: 1; transform: translateY(0) scale(1) skewX(0deg); }
                }
                .animate-char-reveal {
                    opacity: 0;
                    animation: char-reveal 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }

                @keyframes elegant-fade-in-up {
                    from { opacity: 0; transform: translateY(25px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-elegant-fade-in-up {
                    opacity: 0;
                    animation: elegant-fade-in-up 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
                
                @keyframes aurora-bg {
                    from { background-position: 50% 50%, 50% 50% }
                    to { background-position: 350% 50%, 350% 50% }
                }
                .aurora-background {
                  position: absolute;
                  top: 0; left: 0; right: 0;
                  height: 100%;
                  background-image: var(--aurora-gradient);
                  background-size: 200% 200%;
                  animation: aurora-bg 60s linear infinite;
                  z-index: 0;
                }
                
                /* Component Styles */
                .subtle-hover-lift {
                    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                .subtle-hover-lift:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 14px 28px var(--shadow-color), 0 5px 10px rgba(0,0,0,0.18);
                }

                .premium-button {
                    background-color: var(--accent-primary);
                    color: var(--bg-main);
                    font-weight: 600;
                    border-radius: 0.375rem;
                    padding: 0.75rem 1.5rem;
                    transition: all 0.2s ease-in-out;
                    box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.2), 0 2px 6px rgba(var(--accent-primary-rgb), 0.15);
                }
                .premium-button:hover {
                    background-color: var(--accent-primary-hover);
                    transform: translateY(-3px);
                    box-shadow: 0 7px 18px rgba(var(--accent-primary-rgb), 0.25), 0 4px 10px rgba(var(--accent-primary-rgb), 0.2);
                }

                .premium-button-outline {
                    background-color: transparent;
                    color: var(--accent-primary);
                    font-weight: 600;
                    border: 2px solid var(--accent-primary);
                    border-radius: 0.375rem;
                    padding: calc(0.75rem - 2px) calc(1.5rem - 2px);
                    transition: all 0.2s ease-in-out;
                }
                .premium-button-outline:hover {
                    background-color: var(--accent-primary);
                    color: var(--bg-main);
                    transform: translateY(-3px);
                }
                
                .section-title-underline::after {
                    content: '';
                    display: block;
                    width: 60px;
                    height: 3px;
                    background-color: var(--accent-primary);
                    margin: 12px auto 0;
                    border-radius: 2px;
                }

                .mockup-container-premium {
                    background-color: var(--bg-surface);
                    border: 1px solid var(--border-color-subtle);
                    border-radius: 0.75rem;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.3), 0 8px 15px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.03);
                    overflow: hidden;
                    transition: background-color 0.5s ease, border-color 0.5s ease;
                }

                .tech-logo-item {
                    background-color: var(--bg-surface);
                    border: 1px solid var(--border-color-subtle);
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    transition: all 0.3s ease;
                }
                .tech-logo-item:hover {
                    border-color: var(--accent-primary);
                    transform: translateY(-4px);
                    box-shadow: 0 8px 16px rgba(var(--accent-primary-rgb), 0.1);
                }
                
                .nav-link {
                    color: var(--text-secondary);
                    transition: color 0.2s ease-in-out;
                }
                .nav-link:hover {
                    color: var(--accent-primary);
                }

            `}</style>

            <div className="flex flex-col min-h-dvh overflow-x-hidden">
                {/* === HEADER: UPDATED FOR A SLEEKER LOOK === */}
                <header className="px-4 lg:px-6 h-16 flex items-center sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(var(--bg-main-rgb), 0.8)', borderBottom: `1px solid var(--border-color-subtle)`}}>
                    <Link href="/" className="flex items-center justify-center group" prefetch={false}>
                        <GrTechnology className="h-6 w-6 mr-2 text-[var(--accent-primary)]" />
                        <span className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Mock Orbit</span>
                    </Link>
                    <nav className="ml-auto flex gap-5 sm:gap-7 items-center">
                        {['Features', 'Technology', 'Pricing'].map(item => (
                             <Link key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium nav-link" prefetch={false}>
                                 {item}
                             </Link>
                        ))}
                        <Link href="/auth/login" className="text-sm font-medium nav-link" prefetch={false}>
                            Login
                        </Link>
                        <Link href="/auth/register" prefetch={false}>
                            <button className="premium-button text-sm px-4 py-2">Get Started</button>
                        </Link>
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                    </nav>
                </header>

                <main className="flex-1">
                    <section className="w-full py-24 md:py-32 lg:py-40 relative">
                        <div className="aurora-background"></div>
                        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
                            
                            <div className="mb-8 animate-elegant-fade-in-up" style={{ animationDelay: '0s' }}>
                                {theme === 'dark' ? (
                                    <a href="https://www.producthunt.com/products/mock-orbit-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-mock-orbit-2" target="_blank">
                                        <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=990601&theme=dark" alt="Mock Orbit | Product Hunt" style={{width: "250px", height: "54px", margin: "0 auto"}}/>
                                    </a>
                                ) : (
                                    <a href="https://www.producthunt.com/products/mock-orbit-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-mock-orbit-2" target="_blank">
                                        <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=990601&theme=light" alt="Mock Orbit | Product Hunt" style={{width: "250px", height: "54px", margin: "0 auto"}}/>
                                    </a>
                                )}
                            </div>
                            <div className="inline-block rounded-md border px-3 py-1 text-xs font-medium mb-6 animate-elegant-fade-in-up" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', animationDelay: '0.1s' }}>
                                <Award className="inline w-3.5 h-3.5 mr-1.5 -mt-px" />
                                Elevate Your Interview Readiness
                             </div>
                            
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-7 text-[var(--text-primary)]">
                                <AnimatedText text="The Art of" className="block mb-2" individualClassName="text-[var(--text-primary)]" stagger={0.025} />
                                <AnimatedText text="Peer Interviewing, Perfected." className="block" individualClassName="text-[var(--accent-primary)]" stagger={0.03} />
                            </h1>
                            <p className="max-w-2xl mx-auto text-lg md:text-xl mb-10 animate-elegant-fade-in-up text-[var(--text-secondary)]" style={{ animationDelay: '0.6s' }}>
                                Mock Orbit provides an end-to-end platform to simulate real-world interviews, collaborate with peers, and gain actionable insights.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-elegant-fade-in-up" style={{animationDelay: '0.9s'}}>
                                <Link href="/auth/register" prefetch={false}>
                                    <button className="premium-button w-full sm:w-auto text-base px-8 py-3.5">
                                        Start Your Journey Free <ArrowRight className="ml-2 w-5 h-5 inline-block" />
                                    </button>
                                </Link>
                                <Link href="#features" prefetch={false}>
                                    <button className="premium-button-outline w-full sm:w-auto text-base px-8 py-3.5">
                                        Discover Features
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="py-20 md:py-28 bg-[var(--bg-surface)]">
                        <div className="container mx-auto px-4 md:px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline text-[var(--text-primary)]">
                                    The Mock Orbit Advantage
                                </h2>
                                <p className="mt-10 text-lg max-w-3xl mx-auto text-[var(--text-secondary)]">
                                    We're not just another practice tool. We've engineered a comprehensive ecosystem for serious interview preparation.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    { icon: MousePointer, title: "Realistic Simulation", description: "Engage in interviews that mirror actual company processes, from scheduling to live interaction." },
                                    { icon: Users, title: "Peer Collaboration", description: "Connect, schedule, and conduct interviews with a diverse community of motivated peers." },
                                    { icon: BrainCircuit, title: "Intelligent Feedback Loop", description: "Benefit from structured peer feedback and upcoming AI-driven performance analysis." }
                                ].map((item, index) => (
                                    <div key={item.title} className="p-8 rounded-lg subtle-hover-lift animate-elegant-fade-in-up bg-[var(--bg-main)]" style={{ border: `1px solid var(--border-color-subtle)`, animationDelay: `${0.2 + index * 0.15}s` }}>
                                        <div className="w-12 h-12 rounded-md flex items-center justify-center mb-5 bg-[var(--accent-primary)] text-[var(--bg-main)]">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">{item.title}</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* Features Showcase Section */}
                    <section id="features" className="py-20 md:py-28 bg-[var(--bg-main)]">
                        <div className="container mx-auto px-4 md:px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline text-[var(--text-primary)]">
                                    Precision-Engineered Features
                                </h2>
                                <p className="mt-10 text-lg max-w-3xl mx-auto text-[var(--text-secondary)]">
                                    Every tool you need, meticulously designed for an effective and engaging interview practice experience.
                                </p>
                            </div>

                            <div className="mb-20 grid lg:grid-cols-2 gap-12 items-center">
                                <div className="animate-elegant-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                    <Award className="w-10 h-10 mb-4 text-[var(--accent-primary)]"/>
                                    <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-[var(--text-primary)]">The Command Center: Your Interview Hub</h3>
                                    <p className="text-base mb-3 text-[var(--text-secondary)]">Seamlessly switch between interviewer and interviewee roles with dedicated dashboards. Then, dive into our feature-rich real-time interview room.</p>
                                    <ul className="space-y-2 text-sm">
                                        {[
                                            {icon: Layers, text: "Dual Dashboards: Tailored views for focused preparation and execution."},
                                            {icon: Video, text: "HD Video & Audio: Crystal-clear communication powered by WebRTC."},
                                            {icon: Edit3, text: "Collaborative Whiteboard: Visualize ideas in real-time."},
                                            {icon: Code2, text: "Integrated Code Editor: Collaborative coding, just like the real thing."},
                                            {icon: MessageSquare, text: "Instant Chat: For quick notes and resource sharing."}
                                        ].map(item => (
                                            <li key={item.text} className="flex items-start">
                                                <item.icon className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-[var(--accent-primary)]" />
                                                <span className="text-[var(--text-secondary)]">{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mockup-container-premium animate-elegant-fade-in-up p-4 md:p-6" style={{ animationDelay: '0.4s' }}>
                                    <Image src="https://i.ibb.co/Psd6TQmp/mock-orbit.png" width={1200} height={675} alt="Mock Orbit Interface Mockup" className="rounded-md object-cover w-full h-auto" />
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[
                                    { icon: CalendarCheck, title: "Effortless Scheduling", description: "Intuitive calendar integration with real-time notifications and availability matching." },
                                    { icon: ShieldCheck, title: "Enterprise-Grade Security", description: "Robust JWT authentication and secure data protocols ensure your information is protected." },
                                    { icon: Settings2, title: "Developer-Friendly API", description: "Comprehensive RESTful APIs built with Golang for performance and scalability." },
                                ].map((feature, index) => (
                                    <div key={feature.title} className="p-6 rounded-lg subtle-hover-lift animate-elegant-fade-in-up bg-[var(--bg-surface)]" style={{ border: `1px solid var(--border-color)`, animationDelay: `${0.3 + index * 0.15}s` }}>
                                        <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4 bg-[var(--accent-primary)] text-[var(--bg-main)]">
                                            <feature.icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">{feature.title}</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* ... (rest of the sections remain largely the same, but will inherit new theme styles) ... */}

                     {/* Tech Stack Section */}
                     <section id="technology" className="py-20 md:py-28 bg-[var(--bg-surface)]">
                        <div className="container mx-auto px-4 md:px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline text-[var(--text-primary)]">
                                    Built on a Foundation of Excellence
                                </h2>
                                <p className="mt-10 text-lg max-w-3xl mx-auto text-[var(--text-secondary)]">
                                    Leveraging industry-leading technologies for performance, scalability, and a seamless user experience.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-center">
                                {[
                                    { icon: ToyBrick, name: "Next.js & TypeScript" },
                                    { icon: GitFork, name: "Golang (Gin)" },
                                    { icon: DatabaseZap, name: "MongoDB" },
                                    { icon: Briefcase, name: "WebRTC (Pion)" },
                                    { iconName: "WS", name: "WebSockets" },
                                    { icon: ShieldCheck, name: "JWT Auth" },
                                    { iconName: "CSS", name: "Tailwind CSS" },
                                    { iconName: "API", name: "RESTful APIs" },
                                ].map((tech, index) => (
                                    <div key={tech.name} className="tech-logo-item animate-elegant-fade-in-up" style={{ animationDelay: `${0.1 + index * 0.07}s` }}>
                                        {tech.icon ? (
                                            <tech.icon className="w-10 h-10 mb-3 mx-auto text-[var(--accent-primary)]"/>
                                        ) : (
                                            <div className="w-10 h-10 mb-3 mx-auto flex items-center justify-center rounded-full text-lg font-bold" style={{backgroundColor: 'var(--bg-main)', color: 'var(--accent-primary)', border: `1px solid var(--accent-primary)`}}>
                                                {tech.iconName}
                                            </div>
                                        )}
                                        <h4 className="text-md font-medium text-[var(--text-primary)]">{tech.name}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* Call to Action Section */}
                    <section className="py-24 md:py-32 bg-[var(--bg-main)]">
                        <div className="container mx-auto px-4 md:px-6 text-center">
                            <Sparkles className="w-12 h-12 mx-auto mb-5 text-[var(--accent-primary)]"/>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-elegant-fade-in-up" style={{ animationDelay: '0.1s', color: 'var(--text-primary)'}}>
                                Ready to Redefine Your Interview Skills?
                            </h2>
                            <p className="max-w-xl mx-auto text-lg md:text-xl mb-10 animate-elegant-fade-in-up text-[var(--text-secondary)]" style={{ animationDelay: '0.3s' }}>
                                Join a growing community of ambitious individuals. Sign up for Mock Orbit—it's free to get started.
                            </p>
                            <div className="animate-elegant-fade-in-up" style={{animationDelay: '0.5s'}}>
                                <Link href="/auth/register" prefetch={false}>
                                    <button className="premium-button text-lg px-10 py-4">
                                        Create Your Free Account Now
                                        <MoveRight className="ml-2.5 w-5 h-5 inline-block" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="py-10 w-full shrink-0 px-4 md:px-6 text-center bg-[var(--bg-surface)]" style={{ borderTop: `1px solid var(--border-color)`}}>
                    <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <GrTechnology className="h-5 w-5 text-[var(--accent-primary)]" />
                            <p className="text-sm text-[var(--text-secondary)]">&copy; {new Date().getFullYear()} Mock Orbit. All Rights Reserved.</p>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Designed & Developed by <Link href="https://kickaditya.vercel.app" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline text-[var(--accent-primary)]">Aditya Anand</Link>
                        </p>
                        <nav className="flex gap-5">
                            <Link href="https://github.com/adityaxanand/MockOrbit" target="_blank" rel="noopener noreferrer" className="nav-link" prefetch={false}>
                                <FiGithub className="w-5 h-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                        </nav>
                    </div>
                </footer>
            </div>
        </>
    );
}