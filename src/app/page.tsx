// // "use client";

// // import { Button } from "@/components/ui/button";
// // // Assuming these shadcn/ui components are styled appropriately for a premium dark theme
// // import {
// //     Users,
// //     CalendarCheck,
// //     BrainCircuit,
// //     Video,
// //     MessageSquare,
// //     Edit3,
// //     Code2,
// //     ArrowRight,
// //     CheckCircle,
// //     Sparkles,
// //     ShieldCheck,
// //     Layers,
// //     GitFork,
// //     DatabaseZap,
// //     Settings2,
// //     ToyBrick,
// //     BellDot,
// //     MousePointer,
// //     MoveRight,
// //     Award, // For premium feel
// //     Briefcase // For business/tech
// // } from "lucide-react";
// // import Link from "next/link";
// // import Image from "next/image"; // For UI mockups
// // import { FiGithub } from "react-icons/fi";
// // import { GrTechnology } from "react-icons/gr"; // User requested logo icon

// // // Helper component for animated text (subtle reveal)
// // type AnimatedTextProps = {
// //     text: string;
// //     className?: string;
// //     stagger?: number;
// //     individualClassName?: string;
// // };

// // const AnimatedText = ({
// //     text,
// //     className,
// //     stagger = 0.03,
// //     individualClassName = "",
// // }: AnimatedTextProps) => {
// //     return (
// //         <span className={className} aria-label={text}>
// //             {text.split("").map((char, index) => (
// //                 <span
// //                     key={index}
// //                     className={`inline-block animate-char-reveal ${individualClassName}`}
// //                     style={{ animationDelay: `${index * stagger}s` }}
// //                 >
// //                     {char === " " ? "\u00A0" : char}
// //                 </span>
// //             ))}
// //         </span>
// //     );
// // };


// // export default function Home() {
// //     // New color palette
// //     // These would ideally be in your tailwind.config.js or a global CSS file
// //     // For this example, we'll define them in CSS variables via styled-jsx
// //     const theme = {
// //         bgMain: "#16181A", // Deep, dark charcoal
// //         bgSurface: "#1F2123", // Slightly lighter for cards, panels
// //         bgSurfaceLighter: "#292C2E", // For subtle hover or active states on surfaces
// //         textPrimary: "#F0F2F5", // Crisp off-white
// //         textSecondary: "#A8B2C0", // Muted, sophisticated gray
// //         accentPrimary: "#C9A461", // Muted Gold/Amber
// //         accentPrimaryHover: "#B8914B", // Darker gold for hover
// //         borderColor: "#303438", // Subtle borders
// //         borderColorSubtle: "#2A2D30",
// //         shadowColor: "rgba(0, 0, 0, 0.3)", // For dark theme shadows
// //         accentPrimaryRgb: "201, 164, 97", // For RGBA usage if needed
// //     };

// //     return (
// //         <>
// //             <style jsx global>{`
// //                 :root {
// //                     --bg-main: ${theme.bgMain};
// //                     --bg-surface: ${theme.bgSurface};
// //                     --bg-surface-lighter: ${theme.bgSurfaceLighter};
// //                     --text-primary: ${theme.textPrimary};
// //                     --text-secondary: ${theme.textSecondary};
// //                     --accent-primary: ${theme.accentPrimary};
// //                     --accent-primary-hover: ${theme.accentPrimaryHover};
// //                     --border-color: ${theme.borderColor};
// //                     --border-color-subtle: ${theme.borderColorSubtle};
// //                     --shadow-color: ${theme.shadowColor};
// //                     --accent-primary-rgb: ${theme.accentPrimaryRgb};
// //                 }

// //                 body {
// //                     background-color: var(--bg-main);
// //                     color: var(--text-primary);
// //                 }

// //                 @keyframes char-reveal {
// //                     0% { opacity: 0; transform: translateY(15px) scale(0.95) skewX(-5deg); }
// //                     70% { opacity: 0.8; transform: translateY(-2px) scale(1.02) skewX(1deg); }
// //                     100% { opacity: 1; transform: translateY(0) scale(1) skewX(0deg); }
// //                 }
// //                 .animate-char-reveal {
// //                     opacity: 0;
// //                     animation: char-reveal 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
// //                 }

// //                 @keyframes elegant-fade-in-up {
// //                     from { opacity: 0; transform: translateY(25px); }
// //                     to { opacity: 1; transform: translateY(0); }
// //                 }
// //                 .animate-elegant-fade-in-up {
// //                     opacity: 0; /* Start hidden */
// //                     animation: elegant-fade-in-up 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
// //                 }
                
// //                 .subtle-hover-lift {
// //                     transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
// //                 }
// //                 .subtle-hover-lift:hover {
// //                     transform: translateY(-6px);
// //                     box-shadow: 0 12px 24px var(--shadow-color), 0 4px 8px rgba(0,0,0,0.2);
// //                 }

// //                 .premium-button {
// //                     background-color: var(--accent-primary);
// //                     color: var(--bg-main); /* High contrast text on accent */
// //                     font-weight: 600;
// //                     border-radius: 0.375rem; /* 6px */
// //                     padding: 0.75rem 1.5rem;
// //                     transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
// //                     box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.2), 0 2px 6px rgba(var(--accent-primary-rgb), 0.15);
// //                 }
// //                 .premium-button:hover {
// //                     background-color: var(--accent-primary-hover);
// //                     transform: translateY(-2px);
// //                     box-shadow: 0 6px 16px rgba(var(--accent-primary-rgb), 0.25), 0 3px 8px rgba(var(--accent-primary-rgb), 0.2);
// //                 }

// //                 .premium-button-outline {
// //                     background-color: transparent;
// //                     color: var(--accent-primary);
// //                     font-weight: 600;
// //                     border: 2px solid var(--accent-primary);
// //                     border-radius: 0.375rem; /* 6px */
// //                     padding: calc(0.75rem - 2px) calc(1.5rem - 2px); /* Adjust padding for border */
// //                     transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, transform 0.2s ease-in-out;
// //                 }
// //                 .premium-button-outline:hover {
// //                     background-color: var(--accent-primary);
// //                     color: var(--bg-main);
// //                     transform: translateY(-2px);
// //                 }
                
// //                 .section-title-underline::after {
// //                     content: '';
// //                     display: block;
// //                     width: 60px;
// //                     height: 3px;
// //                     background-color: var(--accent-primary);
// //                     margin: 12px auto 0;
// //                     border-radius: 2px;
// //                 }
// //                 .mockup-container-premium {
// //                     background-color: var(--bg-surface);
// //                     border: 1px solid var(--border-color-subtle);
// //                     border-radius: 0.75rem; /* 12px */
// //                     box-shadow: 0 15px 30px rgba(0,0,0,0.3), 0 8px 15px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.03);
// //                     overflow: hidden;
// //                 }
// //                 .tech-logo-item {
// //                     background-color: var(--bg-surface);
// //                     border: 1px solid var(--border-color-subtle);
// //                     padding: 1.5rem;
// //                     border-radius: 0.5rem;
// //                     transition: all 0.3s ease;
// //                 }
// //                 .tech-logo-item:hover {
// //                     border-color: var(--accent-primary);
// //                     transform: translateY(-4px);
// //                     box-shadow: 0 8px 16px rgba(var(--accent-primary-rgb), 0.1);
// //                 }

// //             `}</style>

// //             <div className="flex flex-col min-h-dvh overflow-x-hidden" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
// //                 {/* Header */}
// //                 <header className="px-4 lg:px-8 h-20 flex items-center sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-main)', borderBottom: `1px solid var(--border-color-subtle)`}}>
// //                     <Link href="/" className="flex items-center justify-center group" prefetch={false}>
// //                         <GrTechnology className="h-7 w-7 mr-2.5" style={{ color: 'var(--accent-primary)' }} />
// //                         <span className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Mock Orbit</span>
// //                     </Link>
// //                     <nav className="ml-auto flex gap-5 sm:gap-7 items-center">
// //                         {['Features', 'Technology', 'Pricing'].map(item => (
// //                              <Link key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium transition-colors duration-200" style={{ color: 'var(--text-secondary)' }} hover-style={{ color: 'var(--accent-primary)' }} // Tailwind hover:text-[var(--accent-primary)]
// //                                 onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
// //                                 onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
// //                                 prefetch={false}>
// //                                 {item}
// //                             </Link>
// //                         ))}
// //                         <Link href="/auth/login" className="text-sm font-medium transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}
// //                              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
// //                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
// //                              prefetch={false}>
// //                             Login
// //                         </Link>
// //                         <Link href="/auth/register" prefetch={false}>
// //                             <button className="premium-button text-sm px-5 py-2.5">Get Started</button>
// //                         </Link>
// //                     </nav>
// //                 </header>

// //                 <main className="flex-1">
// //                     {/* Hero Section */}
// //                     <section className="w-full py-24 md:py-32 lg:py-40 relative">
// //                         <div className="absolute inset-0 -z-10" style={{backgroundColor: 'var(--bg-main)'}}>
// //                             {/* Optional: Subtle geometric pattern SVG background here if desired, instead of pure solid */}
// //                         </div>
// //                         <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
// //                             <div className="inline-block rounded-md border px-3 py-1 text-xs font-medium mb-6 animate-elegant-fade-in-up" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', animationDelay: '0.1s' }}>
// //                                 <Award className="inline w-3.5 h-3.5 mr-1.5 -mt-px" />
// //                                 Elevate Your Interview Readiness
// //                             </div>
// //                             <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-7" style={{color: 'var(--text-primary)'}}>
// //                                 <AnimatedText text="The Art of" className="block mb-2" individualClassName="text-[var(--text-primary)]" stagger={0.025} />
// //                                 <AnimatedText text="Peer Interviewing, Perfected." className="block" individualClassName="text-[var(--accent-primary)]" stagger={0.03} />
// //                             </h1>
// //                             <p className="max-w-2xl mx-auto text-lg md:text-xl mb-10 animate-elegant-fade-in-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.6s' }}>
// //                                 Mock Orbit provides an end-to-end platform to simulate real-world interviews, collaborate with peers, and gain actionable insights.
// //                             </p>
// //                             <div className="flex flex-col sm:flex-row gap-4 justify-center animate-elegant-fade-in-up" style={{animationDelay: '0.9s'}}>
// //                                 <Link href="/auth/register" prefetch={false}>
// //                                     <button className="premium-button w-full sm:w-auto text-base px-8 py-3.5">
// //                                         Start Your Journey Free <ArrowRight className="ml-2 w-5 h-5 inline-block" />
// //                                     </button>
// //                                 </Link>
// //                                 <Link href="#features" prefetch={false}>
// //                                     <button className="premium-button-outline w-full sm:w-auto text-base px-8 py-3.5">
// //                                         Discover Features
// //                                     </button>
// //                                 </Link>
// //                             </div>
// //                         </div>
// //                     </section>

// //                     {/* "Why Mock Orbit?" or Core Differentiators Section */}
// //                     <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--bg-surface)' }}>
// //                         <div className="container mx-auto px-4 md:px-6">
// //                             <div className="text-center mb-16">
// //                                 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline" style={{ color: 'var(--text-primary)' }}>
// //                                     The Mock Orbit Advantage
// //                                 </h2>
// //                                 <p className="mt-10 text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
// //                                     We're not just another practice tool. We've engineered a comprehensive ecosystem for serious interview preparation.
// //                                 </p>
// //                             </div>
// //                             <div className="grid md:grid-cols-3 gap-8">
// //                                 {[
// //                                     { icon: MousePointer, title: "Realistic Simulation", description: "Engage in interviews that mirror actual company processes, from scheduling to live interaction." },
// //                                     { icon: Users, title: "Peer Collaboration", description: "Connect, schedule, and conduct interviews with a diverse community of motivated peers." },
// //                                     { icon: BrainCircuit, title: "Intelligent Feedback Loop", description: "Benefit from structured peer feedback and upcoming AI-driven performance analysis." }
// //                                 ].map((item, index) => (
// //                                     <div key={item.title} className="p-8 rounded-lg subtle-hover-lift animate-elegant-fade-in-up" style={{ backgroundColor: 'var(--bg-main)', border: `1px solid var(--border-color-subtle)`, animationDelay: `${0.2 + index * 0.15}s` }}>
// //                                         <div className="w-12 h-12 rounded-md flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-main)'}}>
// //                                             <item.icon className="w-6 h-6" />
// //                                         </div>
// //                                         <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
// //                                         <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         </div>
// //                     </section>

// //                     {/* Features Showcase Section */}
// //                     <section id="features" className="py-20 md:py-28" style={{ backgroundColor: 'var(--bg-main)'}}>
// //                         <div className="container mx-auto px-4 md:px-6">
// //                             <div className="text-center mb-16">
// //                                 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline" style={{ color: 'var(--text-primary)' }}>
// //                                     Precision-Engineered Features
// //                                 </h2>
// //                                 <p className="mt-10 text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
// //                                     Every tool you need, meticulously designed for an effective and engaging interview practice experience.
// //                                 </p>
// //                             </div>

// //                             {/* Feature: Dual Dashboards & Real-time Room (Combined Visual) */}
// //                             <div className="mb-20 grid lg:grid-cols-2 gap-12 items-center">
// //                                 <div className="animate-elegant-fade-in-up" style={{ animationDelay: '0.2s' }}>
// //                                     <Award className="w-10 h-10 mb-4" style={{color: 'var(--accent-primary)'}}/>
// //                                     <h3 className="text-2xl md:text-3xl font-semibold mb-4" style={{color: 'var(--text-primary)'}}>The Command Center: Your Interview Hub</h3>
// //                                     <p className="text-base mb-3" style={{color: 'var(--text-secondary)'}}>Seamlessly switch between interviewer and interviewee roles with dedicated dashboards. Then, dive into our feature-rich real-time interview room.</p>
// //                                     <ul className="space-y-2 text-sm">
// //                                         {[
// //                                             {icon: Layers, text: "Dual Dashboards: Tailored views for focused preparation and execution."},
// //                                             {icon: Video, text: "HD Video & Audio: Crystal-clear communication powered by WebRTC."},
// //                                             {icon: Edit3, text: "Collaborative Whiteboard: Visualize ideas in real-time."},
// //                                             {icon: Code2, text: "Integrated Code Editor: Collaborative coding, just like the real thing."},
// //                                             {icon: MessageSquare, text: "Instant Chat: For quick notes and resource sharing."}
// //                                         ].map(item => (
// //                                             <li key={item.text} className="flex items-start">
// //                                                 <item.icon className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0" style={{color: 'var(--accent-primary)'}} />
// //                                                 <span style={{color: 'var(--text-secondary)'}}>{item.text}</span>
// //                                             </li>
// //                                         ))}
// //                                     </ul>
// //                                 </div>
// //                                 <div className="mockup-container-premium animate-elegant-fade-in-up p-4 md:p-6" style={{ animationDelay: '0.4s' }}>
// //                                     {/* Placeholder for a clean, high-quality UI mockup image/animation */}
// //                                     <Image src="https://i.ibb.co/Psd6TQmp/mock-orbit.png" width={1200} height={675} alt="Mock Orbit Interface Mockup" className="rounded-md object-cover w-full h-auto" />
// //                                     {/* Example of how you might show sub-features on the image if it's a static one:
// //                                     <div className="absolute top-[10%] left-[5%] p-2 bg-[var(--bg-surface-lighter)] text-xs rounded shadow-lg">Interviewer Dashboard Snippet</div>
// //                                     <div className="absolute bottom-[10%] right-[5%] p-2 bg-[var(--bg-surface-lighter)] text-xs rounded shadow-lg">Code Editor Focus</div>
// //                                     */}
// //                                 </div>
// //                             </div>
                            
// //                             {/* Other Key Feature Cards */}
// //                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
// //                                 {[
// //                                     { icon: CalendarCheck, title: "Effortless Scheduling", description: "Intuitive calendar integration with real-time notifications and availability matching." },
// //                                     { icon: ShieldCheck, title: "Enterprise-Grade Security", description: "Robust JWT authentication and secure data protocols ensure your information is protected." },
// //                                     { icon: Settings2, title: "Developer-Friendly API", description: "Comprehensive RESTful APIs built with Golang for performance and scalability." },
                                    
// //                                 ].map((feature, index) => (
// //                                     <div key={feature.title} className="p-6 rounded-lg subtle-hover-lift animate-elegant-fade-in-up" style={{ backgroundColor: 'var(--bg-surface)', border: `1px solid var(--border-color)`, animationDelay: `${0.3 + index * 0.15}s` }}>
// //                                         <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-main)'}}>
// //                                             <feature.icon className="w-5 h-5" />
// //                                         </div>
// //                                         <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--text-primary)'}}>{feature.title}</h3>
// //                                         <p className="text-xs" style={{color: 'var(--text-secondary)'}}>{feature.description}</p>
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         </div>
// //                     </section>

// //                     {/* Tech Stack Section */}
// //                     <section id="technology" className="py-20 md:py-28" style={{ backgroundColor: 'var(--bg-surface)' }}>
// //                         <div className="container mx-auto px-4 md:px-6">
// //                             <div className="text-center mb-16">
// //                                 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline" style={{ color: 'var(--text-primary)' }}>
// //                                     Built on a Foundation of Excellence
// //                                 </h2>
// //                                 <p className="mt-10 text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
// //                                     Leveraging industry-leading technologies for performance, scalability, and a seamless user experience.
// //                                 </p>
// //                             </div>
// //                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-center">
// //                                 {[
// //                                     { icon: ToyBrick, name: "Next.js & TypeScript" },
// //                                     { icon: GitFork, name: "Golang (Gin)" },
// //                                     { icon: DatabaseZap, name: "MongoDB" },
// //                                     { icon: Briefcase, name: "WebRTC (Pion)" }, // Using Briefcase as generic 'tech component'
// //                                     { iconName: "WS", name: "WebSockets" },
// //                                     { icon: ShieldCheck, name: "JWT Auth" },
// //                                     { iconName: "CSS", name: "Tailwind CSS" },
// //                                     { iconName: "API", name: "RESTful APIs" },
// //                                 ].map((tech, index) => (
// //                                     <div key={tech.name} className="tech-logo-item animate-elegant-fade-in-up" style={{ animationDelay: `${0.1 + index * 0.07}s` }}>
// //                                         {tech.icon ? (
// //                                             <tech.icon className="w-10 h-10 mb-3 mx-auto" style={{color: 'var(--accent-primary)'}}/>
// //                                         ) : (
// //                                              <div className="w-10 h-10 mb-3 mx-auto flex items-center justify-center rounded-full text-lg font-bold" style={{backgroundColor: 'var(--bg-main)', color: 'var(--accent-primary)', border: `1px solid var(--accent-primary)`}}>
// //                                                 {tech.iconName}
// //                                              </div>
// //                                         )}
// //                                         <h4 className="text-md font-medium" style={{color: 'var(--text-primary)'}}>{tech.name}</h4>
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         </div>
// //                     </section>
                    
// //                     {/* Call to Action Section */}
// //                     <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--bg-main)'}}>
// //                         <div className="container mx-auto px-4 md:px-6 text-center">
// //                             <Sparkles className="w-12 h-12 mx-auto mb-5" style={{color: 'var(--accent-primary)'}}/>
// //                             <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 animate-elegant-fade-in-up" style={{ animationDelay: '0.1s', color: 'var(--text-primary)'}}>
// //                                 Ready to Redefine Your Interview Skills?
// //                             </h2>
// //                             <p className="max-w-xl mx-auto text-lg md:text-xl mb-10 animate-elegant-fade-in-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.3s' }}>
// //                                 Join a growing community of ambitious individuals. Sign up for Mock Orbit—it's free to get started.
// //                             </p>
// //                             <div className="animate-elegant-fade-in-up" style={{animationDelay: '0.5s'}}>
// //                                 <Link href="/auth/register" prefetch={false}>
// //                                     <button className="premium-button text-lg px-10 py-4">
// //                                         Create Your Free Account Now
// //                                         <MoveRight className="ml-2.5 w-5 h-5 inline-block" />
// //                                     </button>
// //                                 </Link>
// //                             </div>
// //                         </div>
// //                     </section>
// //                 </main>

// //                 <footer className="py-10 w-full shrink-0 px-4 md:px-6 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderTop: `1px solid var(--border-color)`}}>
// //                     <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
// //                         <div className="flex items-center gap-2">
// //                             <GrTechnology className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
// //                             <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>&copy; {new Date().getFullYear()} Mock Orbit. All Rights Reserved.</p>
// //                         </div>
// //                         <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
// //                             Designed & Developed by <Link href="https://kickaditya.vercel.app" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline" style={{color: 'var(--accent-primary)'}}>Aditya Anand</Link>
// //                         </p>
// //                         <nav className="flex gap-5">
// //                             <Link href="https://github.com/adityaxanand/MockOrbit" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{color: 'var(--text-secondary)'}}
// //                                 onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
// //                                 onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
// //                                 prefetch={false}>
// //                                 <FiGithub className="w-5 h-5" />
// //                                 <span className="sr-only">GitHub</span>
// //                             </Link>
// //                             {/* Add Terms, Privacy links here with similar styling */}
// //                         </nav>
// //                     </div>
// //                 </footer>
// //             </div>
// //         </>
// //     );
// // }


// "use client";

// import { useState, useEffect } from "react";
// import {
//     Users, CalendarCheck, BrainCircuit, Video, MessageSquare, Edit3, Code2, ArrowRight,
//     CheckCircle, Sparkles, ShieldCheck, Layers, GitFork, DatabaseZap, Settings2, ToyBrick,
//     BellDot, MousePointer, MoveRight, Award, Briefcase, Sun, Moon
// } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import { FiGithub } from "react-icons/fi";
// import { GrTechnology } from "react-icons/gr";

// // Helper component for animated text
// type AnimatedTextProps = {
//     text: string;
//     className?: string;
//     stagger?: number;
//     individualClassName?: string;
// };

// const AnimatedText = ({ text, className, stagger = 0.03, individualClassName = "" }: AnimatedTextProps) => (
//     <span className={className} aria-label={text}>
//         {text.split("").map((char, index) => (
//             <span
//                 key={index}
//                 className={`inline-block animate-char-reveal ${individualClassName}`}
//                 style={{ animationDelay: `${index * stagger}s` }}
//             >
//                 {char === " " ? "\u00A0" : char}
//             </span>
//         ))}
//     </span>
// );

// // Sexy theme toggle component
// type ThemeToggleProps = {
//     theme: ThemeKey;
//     setTheme: (theme: ThemeKey) => void;
// };

// const ThemeToggle = ({ theme, setTheme }: ThemeToggleProps) => (
//     <button
//         onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//         className="w-12 h-6 rounded-full p-1 flex items-center justify-between relative bg-[var(--bg-surface-lighter)] transition-colors duration-500"
//         aria-label="Toggle theme"
//     >
//         <div 
//             className="absolute left-1 top-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] transition-transform duration-300 ease-in-out"
//             style={{ transform: theme === 'dark' ? 'translateX(0)' : 'translateX(100%)' }}
//         />
//         <Sun className="w-4 h-4 z-10 text-yellow-400" />
//         <Moon className="w-4 h-4 z-10 text-slate-300" />
//     </button>
// );


// type ThemeKey = 'dark' | 'light';

// export default function Home() {
//     const [theme, setTheme] = useState<ThemeKey>('dark'); // Default to dark

//     // Theme definitions
//     const themes: Record<ThemeKey, {
//         bgMain: string;
//         bgSurface: string;
//         bgSurfaceLighter: string;
//         textPrimary: string;
//         textSecondary: string;
//         accentPrimary: string;
//         accentPrimaryHover: string;
//         borderColor: string;
//         borderColorSubtle: string;
//         shadowColor: string;
//         accentPrimaryRgb: string;
//         aurora: string;
//     }> = {
//         dark: {
//             bgMain: "#16181A",
//             bgSurface: "#1F2123",
//             bgSurfaceLighter: "#292C2E",
//             textPrimary: "#F0F2F5",
//             textSecondary: "#A8B2C0",
//             accentPrimary: "#C9A461",
//             accentPrimaryHover: "#B8914B",
//             borderColor: "#303438",
//             borderColorSubtle: "#2A2D30",
//             shadowColor: "rgba(0, 0, 0, 0.3)",
//             accentPrimaryRgb: "201, 164, 97",
//             aurora: "radial-gradient(ellipse 80% 80% at 50% -20%,rgba(120,119,198,0.3),rgba(255,255,255,0))",
//         },
//         light: {
//             bgMain: "#F7F8FA", // Off-white
//             bgSurface: "#FFFFFF", // Pure white for cards
//             bgSurfaceLighter: "#E8EBEF", // Light grey for hover
//             textPrimary: "#1a202c", // Dark text
//             textSecondary: "#4a5568", // Muted text
//             accentPrimary: "#B58A3F", // A slightly darker gold for light bg
//             accentPrimaryHover: "#A17930",
//             borderColor: "#D3D6DA", // Light border
//             borderColorSubtle: "#E2E8F0",
//             shadowColor: "rgba(0, 0, 0, 0.1)",
//             accentPrimaryRgb: "181, 138, 63",
//             aurora: "radial-gradient(ellipse 80% 80% at 50% -20%,rgba(192, 132, 252, 0.2),rgba(255,255,255,0))",
//         }
//     };

//     const currentTheme = themes[theme] || themes.dark;
    
//     useEffect(() => {
//         // Set initial theme based on system preference or saved preference
//         const savedTheme = localStorage.getItem("theme");
//         const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//         if (savedTheme === 'dark' || savedTheme === 'light') {
//             setTheme(savedTheme);
//         } else {
//             setTheme(prefersDark ? 'dark' : 'light');
//         }
//     }, []);

//     useEffect(() => {
//         // Apply theme changes to the document
//         document.body.className = theme;
//         localStorage.setItem("theme", theme);
//     }, [theme]);

//     return (
//         <>
//             <style jsx global>{`
//                 :root {
//                     --bg-main: ${currentTheme.bgMain};
//                     --bg-surface: ${currentTheme.bgSurface};
//                     --bg-surface-lighter: ${currentTheme.bgSurfaceLighter};
//                     --text-primary: ${currentTheme.textPrimary};
//                     --text-secondary: ${currentTheme.textSecondary};
//                     --accent-primary: ${currentTheme.accentPrimary};
//                     --accent-primary-hover: ${currentTheme.accentPrimaryHover};
//                     --border-color: ${currentTheme.borderColor};
//                     --border-color-subtle: ${currentTheme.borderColorSubtle};
//                     --shadow-color: ${currentTheme.shadowColor};
//                     --accent-primary-rgb: ${currentTheme.accentPrimaryRgb};
//                     --aurora-gradient: ${currentTheme.aurora};
//                 }

//                 body {
//                     background-color: var(--bg-main);
//                     color: var(--text-primary);
//                     transition: background-color 0.5s ease, color 0.5s ease;
//                 }

//                 /* Animations */
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
//                     opacity: 0;
//                     animation: elegant-fade-in-up 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
//                 }
                
//                 @keyframes aurora-bg {
//                     from { background-position: 50% 50%, 50% 50% }
//                     to { background-position: 350% 50%, 350% 50% }
//                 }
//                 .aurora-background {
//                   position: absolute;
//                   top: 0; left: 0; right: 0;
//                   height: 100%;
//                   background-image: var(--aurora-gradient);
//                   background-size: 200% 200%;
//                   animation: aurora-bg 60s linear infinite;
//                   z-index: 0;
//                 }
                
//                 /* Component Styles */
//                 .subtle-hover-lift {
//                     transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//                 }
//                 .subtle-hover-lift:hover {
//                     transform: translateY(-8px);
//                     box-shadow: 0 14px 28px var(--shadow-color), 0 5px 10px rgba(0,0,0,0.18);
//                 }

//                 .premium-button {
//                     background-color: var(--accent-primary);
//                     color: var(--bg-main);
//                     font-weight: 600;
//                     border-radius: 0.375rem;
//                     padding: 0.75rem 1.5rem;
//                     transition: all 0.2s ease-in-out;
//                     box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.2), 0 2px 6px rgba(var(--accent-primary-rgb), 0.15);
//                 }
//                 .premium-button:hover {
//                     background-color: var(--accent-primary-hover);
//                     transform: translateY(-3px);
//                     box-shadow: 0 7px 18px rgba(var(--accent-primary-rgb), 0.25), 0 4px 10px rgba(var(--accent-primary-rgb), 0.2);
//                 }

//                 .premium-button-outline {
//                     background-color: transparent;
//                     color: var(--accent-primary);
//                     font-weight: 600;
//                     border: 2px solid var(--accent-primary);
//                     border-radius: 0.375rem;
//                     padding: calc(0.75rem - 2px) calc(1.5rem - 2px);
//                     transition: all 0.2s ease-in-out;
//                 }
//                 .premium-button-outline:hover {
//                     background-color: var(--accent-primary);
//                     color: var(--bg-main);
//                     transform: translateY(-3px);
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
//                     border-radius: 0.75rem;
//                     box-shadow: 0 15px 30px rgba(0,0,0,0.3), 0 8px 15px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.03);
//                     overflow: hidden;
//                     transition: background-color 0.5s ease, border-color 0.5s ease;
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
                
//                 .nav-link {
//                     color: var(--text-secondary);
//                     transition: color 0.2s ease-in-out;
//                 }
//                 .nav-link:hover {
//                     color: var(--accent-primary);
//                 }

//             `}</style>

//             <div className="flex flex-col min-h-dvh overflow-x-hidden">
//                 {/* === HEADER: UPDATED FOR A SLEEKER LOOK === */}
//                 <header className="px-4 lg:px-6 h-16 flex items-center sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(var(--bg-main-rgb), 0.8)', borderBottom: `1px solid var(--border-color-subtle)`}}>
//                     <Link href="/" className="flex items-center justify-center group" prefetch={false}>
//                         <GrTechnology className="h-6 w-6 mr-2 text-[var(--accent-primary)]" />
//                         <span className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Mock Orbit</span>
//                     </Link>
//                     <nav className="ml-auto flex gap-5 sm:gap-7 items-center">
//                         {['Features', 'Technology', 'Pricing'].map(item => (
//                              <Link key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium nav-link" prefetch={false}>
//                                  {item}
//                              </Link>
//                         ))}
//                         <Link href="/auth/login" className="text-sm font-medium nav-link" prefetch={false}>
//                             Login
//                         </Link>
//                         <Link href="/auth/register" prefetch={false}>
//                             <button className="premium-button text-sm px-4 py-2">Get Started</button>
//                         </Link>
//                         <ThemeToggle theme={theme} setTheme={setTheme} />
//                     </nav>
//                 </header>

//                 <main className="flex-1">
//                     <section className="w-full py-24 md:py-32 lg:py-40 relative">
//                         <div className="aurora-background"></div>
//                         <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
                            
//                             <div className="mb-8 animate-elegant-fade-in-up" style={{ animationDelay: '0s' }}>
//                                 {theme === 'dark' ? (
//                                     <a href="https://www.producthunt.com/products/mock-orbit-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-mock-orbit-2" target="_blank">
//                                         <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=990601&theme=dark" alt="Mock Orbit | Product Hunt" style={{width: "250px", height: "54px", margin: "0 auto"}}/>
//                                     </a>
//                                 ) : (
//                                     <a href="https://www.producthunt.com/products/mock-orbit-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-mock-orbit-2" target="_blank">
//                                         <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=990601&theme=light" alt="Mock Orbit | Product Hunt" style={{width: "250px", height: "54px", margin: "0 auto"}}/>
//                                     </a>
//                                 )}
//                             </div>
//                             <div className="inline-block rounded-md border px-3 py-1 text-xs font-medium mb-6 animate-elegant-fade-in-up" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', animationDelay: '0.1s' }}>
//                                 <Award className="inline w-3.5 h-3.5 mr-1.5 -mt-px" />
//                                 Elevate Your Interview Readiness
//                              </div>
                            
//                             <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-7 text-[var(--text-primary)]">
//                                 <AnimatedText text="The Art of" className="block mb-2" individualClassName="text-[var(--text-primary)]" stagger={0.025} />
//                                 <AnimatedText text="Peer Interviewing, Perfected." className="block" individualClassName="text-[var(--accent-primary)]" stagger={0.03} />
//                             </h1>
//                             <p className="max-w-2xl mx-auto text-lg md:text-xl mb-10 animate-elegant-fade-in-up text-[var(--text-secondary)]" style={{ animationDelay: '0.6s' }}>
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

//                     <section className="py-20 md:py-28 bg-[var(--bg-surface)]">
//                         <div className="container mx-auto px-4 md:px-6">
//                             <div className="text-center mb-16">
//                                 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline text-[var(--text-primary)]">
//                                     The Mock Orbit Advantage
//                                 </h2>
//                                 <p className="mt-10 text-lg max-w-3xl mx-auto text-[var(--text-secondary)]">
//                                     We're not just another practice tool. We've engineered a comprehensive ecosystem for serious interview preparation.
//                                 </p>
//                             </div>
//                             <div className="grid md:grid-cols-3 gap-8">
//                                 {[
//                                     { icon: MousePointer, title: "Realistic Simulation", description: "Engage in interviews that mirror actual company processes, from scheduling to live interaction." },
//                                     { icon: Users, title: "Peer Collaboration", description: "Connect, schedule, and conduct interviews with a diverse community of motivated peers." },
//                                     { icon: BrainCircuit, title: "Intelligent Feedback Loop", description: "Benefit from structured peer feedback and upcoming AI-driven performance analysis." }
//                                 ].map((item, index) => (
//                                     <div key={item.title} className="p-8 rounded-lg subtle-hover-lift animate-elegant-fade-in-up bg-[var(--bg-main)]" style={{ border: `1px solid var(--border-color-subtle)`, animationDelay: `${0.2 + index * 0.15}s` }}>
//                                         <div className="w-12 h-12 rounded-md flex items-center justify-center mb-5 bg-[var(--accent-primary)] text-[var(--bg-main)]">
//                                             <item.icon className="w-6 h-6" />
//                                         </div>
//                                         <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">{item.title}</h3>
//                                         <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </section>
                    
//                     {/* Features Showcase Section */}
//                     <section id="features" className="py-20 md:py-28 bg-[var(--bg-main)]">
//                         <div className="container mx-auto px-4 md:px-6">
//                             <div className="text-center mb-16">
//                                 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline text-[var(--text-primary)]">
//                                     Precision-Engineered Features
//                                 </h2>
//                                 <p className="mt-10 text-lg max-w-3xl mx-auto text-[var(--text-secondary)]">
//                                     Every tool you need, meticulously designed for an effective and engaging interview practice experience.
//                                 </p>
//                             </div>

//                             <div className="mb-20 grid lg:grid-cols-2 gap-12 items-center">
//                                 <div className="animate-elegant-fade-in-up" style={{ animationDelay: '0.2s' }}>
//                                     <Award className="w-10 h-10 mb-4 text-[var(--accent-primary)]"/>
//                                     <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-[var(--text-primary)]">The Command Center: Your Interview Hub</h3>
//                                     <p className="text-base mb-3 text-[var(--text-secondary)]">Seamlessly switch between interviewer and interviewee roles with dedicated dashboards. Then, dive into our feature-rich real-time interview room.</p>
//                                     <ul className="space-y-2 text-sm">
//                                         {[
//                                             {icon: Layers, text: "Dual Dashboards: Tailored views for focused preparation and execution."},
//                                             {icon: Video, text: "HD Video & Audio: Crystal-clear communication powered by WebRTC."},
//                                             {icon: Edit3, text: "Collaborative Whiteboard: Visualize ideas in real-time."},
//                                             {icon: Code2, text: "Integrated Code Editor: Collaborative coding, just like the real thing."},
//                                             {icon: MessageSquare, text: "Instant Chat: For quick notes and resource sharing."}
//                                         ].map(item => (
//                                             <li key={item.text} className="flex items-start">
//                                                 <item.icon className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-[var(--accent-primary)]" />
//                                                 <span className="text-[var(--text-secondary)]">{item.text}</span>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                                 <div className="mockup-container-premium animate-elegant-fade-in-up p-4 md:p-6" style={{ animationDelay: '0.4s' }}>
//                                     <Image src="https://i.ibb.co/Psd6TQmp/mock-orbit.png" width={1200} height={675} alt="Mock Orbit Interface Mockup" className="rounded-md object-cover w-full h-auto" />
//                                 </div>
//                             </div>
                            
//                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//                                 {[
//                                     { icon: CalendarCheck, title: "Effortless Scheduling", description: "Intuitive calendar integration with real-time notifications and availability matching." },
//                                     { icon: ShieldCheck, title: "Enterprise-Grade Security", description: "Robust JWT authentication and secure data protocols ensure your information is protected." },
//                                     { icon: Settings2, title: "Developer-Friendly API", description: "Comprehensive RESTful APIs built with Golang for performance and scalability." },
//                                 ].map((feature, index) => (
//                                     <div key={feature.title} className="p-6 rounded-lg subtle-hover-lift animate-elegant-fade-in-up bg-[var(--bg-surface)]" style={{ border: `1px solid var(--border-color)`, animationDelay: `${0.3 + index * 0.15}s` }}>
//                                         <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4 bg-[var(--accent-primary)] text-[var(--bg-main)]">
//                                             <feature.icon className="w-5 h-5" />
//                                         </div>
//                                         <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">{feature.title}</h3>
//                                         <p className="text-sm text-[var(--text-secondary)]">{feature.description}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </section>
                    
//                     {/* ... (rest of the sections remain largely the same, but will inherit new theme styles) ... */}

//                      {/* Tech Stack Section */}
//                      <section id="technology" className="py-20 md:py-28 bg-[var(--bg-surface)]">
//                         <div className="container mx-auto px-4 md:px-6">
//                             <div className="text-center mb-16">
//                                 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight section-title-underline text-[var(--text-primary)]">
//                                     Built on a Foundation of Excellence
//                                 </h2>
//                                 <p className="mt-10 text-lg max-w-3xl mx-auto text-[var(--text-secondary)]">
//                                     Leveraging industry-leading technologies for performance, scalability, and a seamless user experience.
//                                 </p>
//                             </div>
//                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-center">
//                                 {[
//                                     { icon: ToyBrick, name: "Next.js & TypeScript" },
//                                     { icon: GitFork, name: "Golang (Gin)" },
//                                     { icon: DatabaseZap, name: "MongoDB" },
//                                     { icon: Briefcase, name: "WebRTC (Pion)" },
//                                     { iconName: "WS", name: "WebSockets" },
//                                     { icon: ShieldCheck, name: "JWT Auth" },
//                                     { iconName: "CSS", name: "Tailwind CSS" },
//                                     { iconName: "API", name: "RESTful APIs" },
//                                 ].map((tech, index) => (
//                                     <div key={tech.name} className="tech-logo-item animate-elegant-fade-in-up" style={{ animationDelay: `${0.1 + index * 0.07}s` }}>
//                                         {tech.icon ? (
//                                             <tech.icon className="w-10 h-10 mb-3 mx-auto text-[var(--accent-primary)]"/>
//                                         ) : (
//                                             <div className="w-10 h-10 mb-3 mx-auto flex items-center justify-center rounded-full text-lg font-bold" style={{backgroundColor: 'var(--bg-main)', color: 'var(--accent-primary)', border: `1px solid var(--accent-primary)`}}>
//                                                 {tech.iconName}
//                                             </div>
//                                         )}
//                                         <h4 className="text-md font-medium text-[var(--text-primary)]">{tech.name}</h4>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </section>
                    
//                     {/* Call to Action Section */}
//                     <section className="py-24 md:py-32 bg-[var(--bg-main)]">
//                         <div className="container mx-auto px-4 md:px-6 text-center">
//                             <Sparkles className="w-12 h-12 mx-auto mb-5 text-[var(--accent-primary)]"/>
//                             <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-elegant-fade-in-up" style={{ animationDelay: '0.1s', color: 'var(--text-primary)'}}>
//                                 Ready to Redefine Your Interview Skills?
//                             </h2>
//                             <p className="max-w-xl mx-auto text-lg md:text-xl mb-10 animate-elegant-fade-in-up text-[var(--text-secondary)]" style={{ animationDelay: '0.3s' }}>
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

//                 <footer className="py-10 w-full shrink-0 px-4 md:px-6 text-center bg-[var(--bg-surface)]" style={{ borderTop: `1px solid var(--border-color)`}}>
//                     <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
//                         <div className="flex items-center gap-2">
//                             <GrTechnology className="h-5 w-5 text-[var(--accent-primary)]" />
//                             <p className="text-sm text-[var(--text-secondary)]">&copy; {new Date().getFullYear()} Mock Orbit. All Rights Reserved.</p>
//                         </div>
//                         <p className="text-sm text-[var(--text-secondary)]">
//                             Designed & Developed by <Link href="https://kickaditya.vercel.app" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline text-[var(--accent-primary)]">Aditya Anand</Link>
//                         </p>
//                         <nav className="flex gap-5">
//                             <Link href="https://github.com/adityaxanand/MockOrbit" target="_blank" rel="noopener noreferrer" className="nav-link" prefetch={false}>
//                                 <FiGithub className="w-5 h-5" />
//                                 <span className="sr-only">GitHub</span>
//                             </Link>
//                         </nav>
//                     </div>
//                 </footer>
//             </div>
//         </>
//     );
// }






//MAKEOVER

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// // NOTE: For local Next.js development, uncomment the line below and remove the const Link definition.
// // import Link from "next/link";
// import {
//   motion,
//   useScroll,
//   useTransform,
//   useMotionValue,
//   useMotionTemplate,
//   AnimatePresence,
// } from "framer-motion";
// import {
//   Video,
//   Code2,
//   Sparkles,
//   ArrowRight,
//   Globe,
//   Zap,
//   Terminal,
//   Play,
//   Github,
//   Twitter,
//   Linkedin,
//   Command,
//   Calendar,
//   Layers,
//   Database,
//   GitBranch,
//   Server,
//   Lock,
//   Settings,
//   Menu,
//   X,
//   Wifi,
//   Mic,
//   Check,
//   Cpu // Ensure CPU is imported
// } from "lucide-react";
// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// // --- UTILITIES ---
// function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// // --- COMPATIBILITY LINK COMPONENT ---
// // This allows the code to run in the preview environment.
// // For production, delete this component and use the real next/link import.
// const Link = ({ href, children, ...props }: any) => {
//   return <a href={href} {...props}>{children}</a>;
// };

// // --- VISUAL EFFECTS COMPONENTS ---

// // 1. Starfield Background (Deep Space)
// const Starfield = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     let width = window.innerWidth;
//     let height = window.innerHeight;
//     canvas.width = width;
//     canvas.height = height;

//     const stars: { x: number; y: number; z: number; size: number }[] = [];
//     const numStars = 250; // Increased density
//     const speed = 0.3; // Slower, more majestic speed

//     for (let i = 0; i < numStars; i++) {
//       stars.push({
//         x: Math.random() * width - width / 2,
//         y: Math.random() * height - height / 2,
//         z: Math.random() * width,
//         size: Math.random() * 2,
//       });
//     }

//     const animate = () => {
//       ctx.fillStyle = "#02040a"; // Darker, deep space background
//       ctx.fillRect(0, 0, width, height);

//       stars.forEach((star) => {
//         star.z -= speed;
//         if (star.z <= 0) {
//           star.z = width;
//           star.x = Math.random() * width - width / 2;
//           star.y = Math.random() * height - height / 2;
//         }

//         const x = (star.x / star.z) * width + width / 2;
//         const y = (star.y / star.z) * height + height / 2;
//         const s = (1 - star.z / width) * star.size;

//         const opacity = 1 - star.z / width;
//         ctx.fillStyle = `rgba(200, 210, 255, ${opacity})`;
//         ctx.beginPath();
//         ctx.arc(x, y, s > 0 ? s : 0, 0, Math.PI * 2);
//         ctx.fill();
//       });

//       requestAnimationFrame(animate);
//     };

//     const animId = requestAnimationFrame(animate);

//     const handleResize = () => {
//       width = window.innerWidth;
//       height = window.innerHeight;
//       canvas.width = width;
//       canvas.height = height;
//     };

//     window.addEventListener("resize", handleResize);
//     return () => {
//       window.removeEventListener("resize", handleResize);
//       cancelAnimationFrame(animId);
//     };
//   }, []);

//   return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60 pointer-events-none" />;
// };

// // 2. Glowing Button (Preserved Style)
// const Button = ({
//   children,
//   className,
//   variant = "primary",
//   ...props
// }: any) => {
//   return (
//     <motion.button
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//       className={cn(
//         "relative px-8 py-4 rounded-lg font-bold text-sm tracking-wide transition-all overflow-hidden group",
//         variant === "primary"
//           ? "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
//           : "bg-white/5 text-white border border-white/10 hover:bg-white/10 backdrop-blur-md",
//         className
//       )}
//       {...props}
//     >
//       <span className="relative z-10 flex items-center gap-2 justify-center">{children}</span>
//     </motion.button>
//   );
// };

// // 3. Spotlight Card (Google Native Style - Upgraded)
// const SpotlightCard = ({
//   children,
//   className = "",
//   spotlightColor = "rgba(139, 92, 246, 0.15)",
// }: {
//   children: React.ReactNode;
//   className?: string;
//   spotlightColor?: string;
// }) => {
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);

//   function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
//     const { left, top } = currentTarget.getBoundingClientRect();
//     mouseX.set(clientX - left);
//     mouseY.set(clientY - top);
//   }

//   return (
//     <div
//       className={cn(
//         "group relative border border-white/10 bg-[#0F0F0F] overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-300 hover:shadow-violet-900/10",
//         className
//       )}
//       onMouseMove={handleMouseMove}
//     >
//       <motion.div
//         className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
//         style={{
//           background: useMotionTemplate`
//             radial-gradient(
//               600px circle at ${mouseX}px ${mouseY}px,
//               ${spotlightColor},
//               transparent 80%
//             )
//           `,
//         }}
//       />
//       <div className="relative h-full">{children}</div>
//     </div>
//   );
// };

// // 4. Section Heading
// const SectionHeading = ({ children, title, align = "center", badge }: { children: React.ReactNode, title: string, align?: "center" | "left", badge?: string }) => (
//   <div className={cn("mb-16", align === "center" ? "text-center" : "text-left")}>
//     {badge && (
//       <motion.div 
//         initial={{ opacity: 0, y: 10 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true }}
//         className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-medium text-violet-200 backdrop-blur-xl mb-6", align === "center" ? "mx-auto" : "")}
//       >
//         <Sparkles className="w-3 h-3 text-violet-300" />
//         {badge}
//       </motion.div>
//     )}
//     <motion.h2 
//       initial={{ opacity: 0, y: 20 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
//     >
//       {title}
//     </motion.h2>
//     <motion.p 
//       initial={{ opacity: 0, y: 20 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ delay: 0.1 }}
//       className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
//     >
//       {children}
//     </motion.p>
//   </div>
// );

// // 5. Badge Component
// const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
//   <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-medium text-violet-200 backdrop-blur-xl", className)}>
//     {children}
//   </div>
// );

// // --- ANIMATION SIMULATIONS ---

// const CodeSimulation = () => {
//   const [showToast, setShowToast] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setShowToast(true);
//       setTimeout(() => setShowToast(false), 2000);
//     }, 4500);
//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <div className="font-mono text-xs md:text-sm leading-loose relative h-full">
//       <div className="flex items-center gap-2 mb-4 opacity-50 border-b border-white/10 pb-2">
//         <Terminal className="w-3 h-3 text-blue-400" />
//         <span>algorithm.go</span>
//       </div>
      
//       {/* Code Content */}
//       <div className="space-y-1">
//         <div><span className="text-pink-400">func</span> <span className="text-blue-400">optimizeOrbit</span>(user <span className="text-yellow-400">*Candidate</span>) {"{"}</div>
//         <div className="pl-4">start := <span className="text-green-400">time.Now()</span></div>
//         <div className="pl-4"><span className="text-pink-400">if</span> !user.Ready {"{"}</div>
//         <div className="pl-8"><span className="text-blue-400">go</span> user.Practice(MockOrbit)</div>
//         <div className="pl-4">{"}"}</div>
//         <div className="pl-4 flex items-center gap-2">
//             <span className="text-pink-400">return</span> <span className="text-blue-400">"Hired"</span>
//             <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-4 bg-violet-400" />
//         </div>
//         <div>{"}"}</div>
//       </div>

//       {/* Floating Success Toast */}
//       <AnimatePresence>
//         {showToast && (
//           <motion.div
//             initial={{ opacity: 0, y: 10, scale: 0.9 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -10, scale: 0.9 }}
//             className="absolute bottom-4 right-0 bg-[#1a1a1a] border border-green-500/30 text-green-400 px-3 py-2 rounded-lg shadow-2xl flex items-center gap-2 text-xs"
//           >
//             <Check className="w-3 h-3" />
//             <span>Tests Passed (4/4)</span>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

// const AudioWaveform = () => (
//   <div className="flex items-end gap-[3px] h-8">
//     {[...Array(12)].map((_, i) => (
//       <motion.div 
//         key={i}
//         animate={{ height: ["20%", "80%", "20%"] }}
//         transition={{ 
//           duration: 0.5 + Math.random() * 0.5, 
//           repeat: Infinity, 
//           ease: "easeInOut",
//           delay: Math.random() * 0.2
//         }}
//         className="w-1 bg-gradient-to-t from-violet-600 to-indigo-400 rounded-full"
//       />
//     ))}
//   </div>
// )

// // --- SECTIONS ---

// const Navbar = () => {
//   const [scrolled, setScrolled] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 20);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <nav
//       className={cn(
//         "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
//         scrolled
//           ? "bg-[#050505]/80 backdrop-blur-xl border-white/10 py-3"
//           : "bg-transparent border-transparent py-5"
//       )}
//     >
//       <div className="container mx-auto px-6 flex items-center justify-between">
//         <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white">
//           <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
//             <Command className="w-4 h-4 text-white" />
//           </div>
//           MockOrbit
//         </Link>

//         {/* Desktop Nav */}
//         <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
//           {["Features", "Technology", "Workflow", "Pricing"].map((item) => (
//             <Link
//               key={item}
//               href={`#${item.toLowerCase()}`}
//               className="hover:text-white transition-colors"
//             >
//               {item}
//             </Link>
//           ))}
//         </div>

//         <div className="hidden md:flex items-center gap-4">
//           <Link
//             href="/auth/login"
//             className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
//           >
//             Log in
//           </Link>
//           <Link href="/auth/register">
//             <button className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
//               Get Started
//             </button>
//           </Link>
//         </div>

//         {/* Mobile Toggle */}
//         <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//           {mobileMenuOpen ? <X /> : <Menu />}
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="md:hidden bg-[#050505] border-b border-white/10"
//           >
//              <div className="flex flex-col p-6 gap-4 text-gray-400">
//                 {["Features", "Technology", "Workflow", "Pricing"].map((item) => (
//                   <Link key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-white">
//                     {item}
//                   </Link>
//                 ))}
//                 <div className="h-px bg-white/10 my-2" />
//                 <Link href="/auth/login" className="block py-2 text-white">Login</Link>
//                 <Link href="/auth/register" className="block py-2 text-violet-400 font-bold">Sign Up Free</Link>
//              </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </nav>
//   );
// };

// const Hero = () => {
//   const { scrollY } = useScroll();
//   const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  
//   return (
//     <section className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center overflow-hidden">
//       {/* Optimized CSS Background Animation */}
//       <Starfield />
//       <div className="absolute inset-0 z-0">
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
//         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
//       </div>

//       <div className="container mx-auto px-6 relative z-10">
//         <div className="grid lg:grid-cols-2 gap-16 items-center">
//           {/* Left Content (Exact from your provided code + Links) */}
//           <motion.div
//             style={{ y: y1 }}
//             className="max-w-3xl text-center lg:text-left mx-auto lg:mx-0"
//           >
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, ease: "easeOut" }}
//             >
//               <Badge className="mb-8 mx-auto lg:mx-0">
//                 <Sparkles className="w-3 h-3 text-amber-300" />
//                 <span className="text-amber-100">V2.0 is Live: Introducing AI Analytics</span>
//               </Badge>
              
//               <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-[1.1] mb-8">
//                 The Art of <br />
//                 <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
//                   Peer Interviewing.
//                 </span>
//               </h1>
              
//               <p className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
//                 Mock Orbit is the end-to-end platform to simulate real-world interviews. 
//                 Connect with peers, write code in real-time, and get actionable AI feedback.
//               </p>

//               <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
//                 <Link href="/auth/register">
//                   <Button className="w-full sm:w-auto h-14 px-10 text-base">
//                     Start Your Journey <ArrowRight className="w-4 h-4" />
//                   </Button>
//                 </Link>
//                 <Link href="https://github.com/adityaxanand/MockOrbit" target="_blank">
//                   <Button variant="secondary" className="w-full sm:w-auto h-14 px-10 text-base">
//                     <Github className="w-4 h-4" /> Star on GitHub
//                   </Button>
//                 </Link>
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* Right Visual: Upgraded Advanced Simulation Hub */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
//             animate={{ opacity: 1, scale: 1, rotateX: 0 }}
//             transition={{ delay: 0.4, duration: 1 }}
//             className="relative hidden lg:block perspective-1000"
//           >
//              {/* Main IDE Window Frame */}
//              <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A]/90 shadow-2xl overflow-hidden backdrop-blur-xl transform transition-transform hover:scale-[1.01] duration-500 ring-1 ring-white/5">
//                 {/* Window Header */}
//                 <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0F0F0F]">
//                    <div className="flex gap-2">
//                       <div className="w-3 h-3 rounded-full bg-red-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-green-500/80" />
//                    </div>
//                    <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-black/50 border border-white/5">
//                       <Lock className="w-3 h-3 text-gray-500" />
//                       <span className="text-xs font-mono text-gray-400">mock-orbit.live/session</span>
//                    </div>
//                    <div className="flex gap-3 items-center">
//                       <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
//                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                           <span className="text-[10px] text-emerald-400 font-medium">Live</span>
//                       </div>
//                       <Wifi className="w-4 h-4 text-gray-500" />
//                    </div>
//                 </div>

//                 {/* Main Content Area */}
//                 <div className="grid grid-cols-12 h-[450px]">
                   
//                    {/* Editor Pane */}
//                    <div className="col-span-8 border-r border-white/10 p-6 relative bg-gradient-to-br from-[#0A0A0A] to-[#050505]">
//                       <div className="absolute top-4 right-4 z-10">
//                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-lg shadow-green-900/20">
//                             <Play className="w-3 h-3 fill-current" /> Run Code
//                          </div>
//                       </div>
//                       <CodeSimulation />
//                    </div>

//                    {/* Sidebar: Video & Chat */}
//                    <div className="col-span-4 flex flex-col bg-[#050505] relative">
//                       {/* Peer Video (Active Speaker) */}
//                       <div className="p-4 border-b border-white/10 flex-1 flex flex-col gap-3">
//                          <div className="relative aspect-video bg-[#151515] rounded-xl overflow-hidden border border-white/10 group shadow-lg">
//                             <div className="absolute inset-0 flex items-center justify-center">
//                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl font-bold text-gray-500">AS</div>
//                             </div>
//                             <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5">
//                                <Mic className="w-3 h-3 text-white" />
//                                <span className="text-xs font-medium text-white">Alice Smith</span>
//                             </div>
//                             <div className="absolute top-3 right-3">
//                                 <AudioWaveform />
//                             </div>
//                          </div>
                         
//                          {/* Your Video (Mini) */}
//                          <div className="relative aspect-video bg-[#151515] rounded-xl overflow-hidden border border-violet-500/30">
//                             <div className="absolute inset-0 flex items-center justify-center">
//                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center text-lg font-bold text-violet-300">YOU</div>
//                             </div>
//                             <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 rounded-md backdrop-blur-sm">
//                                <span className="text-[10px] font-medium text-white">You</span>
//                             </div>
//                          </div>
//                       </div>

//                       {/* Chat / Output Area */}
//                       <div className="h-1/3 border-t border-white/10 bg-[#080808] p-3 font-mono text-[10px] overflow-hidden">
//                          <div className="text-gray-500 mb-2 flex justify-between">
//                             <span>TERMINAL</span>
//                             <span className="text-gray-600">bash</span>
//                          </div>
//                          <div className="space-y-1">
//                             <div className="text-gray-400">$ go run main.go</div>
//                             <div className="text-blue-400">Compiling...</div>
//                             <div className="text-green-400">Build successful (0.42s)</div>
//                             <div className="text-gray-300">Server started on port 8080</div>
//                          </div>
//                       </div>
//                    </div>
//                 </div>
//              </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// };

// // --- COLORFUL SOCIAL PROOF ---
// const SocialProof = () => (
//   <section className="py-12 border-y border-white/5 bg-black/40 backdrop-blur-sm">
//     <div className="container mx-auto px-6">
//       <p className="text-center text-sm font-medium text-gray-500 mb-8 uppercase tracking-[0.2em]">Trusted by engineers from</p>
//       <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
//          {[
//            { name: "Google", color: "hover:text-[#4285F4]" },
//            { name: "Microsoft", color: "hover:text-[#00A4EF]" },
//            { name: "Netflix", color: "hover:text-[#E50914]" },
//            { name: "Amazon", color: "hover:text-[#FF9900]" },
//            { name: "Meta", color: "hover:text-[#0668E1]" },
//            { name: "Uber", color: "hover:text-[#ffffff] hover:bg-black hover:px-2 hover:rounded" }
//          ].map((brand) => (
//             <span 
//               key={brand.name} 
//               className={cn("text-2xl md:text-3xl font-bold text-gray-600 transition-all duration-300 cursor-default", brand.color)}
//             >
//               {brand.name}
//             </span>
//          ))}
//       </div>
//     </div>
//   </section>
// )

// const FeatureGrid = () => {
//   return (
//     <section id="features" className="py-32 bg-[#02040a] relative overflow-hidden">
//       {/* Background Gradients */}
//       <div className="absolute top-0 left-0 w-full h-[500px] bg-violet-900/10 blur-[120px] pointer-events-none" />

//       <div className="container mx-auto px-6 relative z-10">
//         <SectionHeading title="The Mission Control Center" badge="Features" align="center">
//           We've engineered a comprehensive ecosystem for serious interview preparation.
//           Switch between Interviewer and Candidate roles instantly.
//         </SectionHeading>

//         <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[400px]">
          
//           {/* Feature 1: Video (Audio Viz) */}
//           <SpotlightCard className="md:col-span-6 lg:col-span-8 group bg-[#0A0A0A]">
//              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
//              <div className="relative z-10 p-10 h-full flex flex-col">
//                <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-8 shadow-inner">
//                  <Video className="w-7 h-7 text-white" />
//                </div>
//                <h3 className="text-3xl font-bold text-white mb-4">HD Low-Latency Video</h3>
//                <p className="text-gray-400 text-lg max-w-md mb-auto leading-relaxed">
//                  Powered by Pion WebRTC. Experience sub-30ms latency peer-to-peer connection.
//                </p>
               
//                {/* Advanced Visual */}
//                <div className="mt-8 w-full bg-[#111] border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-2xl">
//                   <div className="flex items-center gap-4">
//                      <div className="relative">
//                         <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-gray-600" />
//                         <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111]" />
//                      </div>
//                      <div>
//                         <div className="text-sm font-bold text-white">Peer Audio</div>
//                         <div className="text-xs text-emerald-400">Connected • 48kHz</div>
//                      </div>
//                   </div>
//                   {/* Frequency Bars */}
//                   <div className="flex gap-1 items-end h-10">
//                     {[...Array(15)].map((_, i) => (
//                         <motion.div 
//                             key={i}
//                             animate={{ height: ["10%", "90%", "30%"] }}
//                             transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
//                             className="w-1.5 bg-violet-500 rounded-full"
//                         />
//                     ))}
//                   </div>
//                </div>
//              </div>
//           </SpotlightCard>

//           {/* Feature 2: Smart Scheduling (Calendar Animation) */}
//           <SpotlightCard className="md:col-span-6 lg:col-span-4 bg-[#0A0A0A]">
//              <div className="p-10 h-full flex flex-col">
//                <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-8">
//                  <Calendar className="w-7 h-7 text-white" />
//                </div>
//                <h3 className="text-2xl font-bold text-white mb-4">Smart Scheduling</h3>
//                <p className="text-gray-400 text-sm mb-8">
//                  Global timezone matching. Find peers available when you are.
//                </p>
               
//                <div className="relative flex-1 bg-[#111] rounded-2xl border border-white/10 p-5 overflow-hidden flex flex-col gap-3">
//                   <div className="flex justify-between text-gray-500 text-xs font-bold uppercase">
//                       <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
//                   </div>
//                   <div className="grid grid-cols-4 gap-2 flex-1">
//                       {[...Array(12)].map((_, i) => (
//                           <motion.div 
//                             key={i}
//                             whileHover={{ scale: 1.1, backgroundColor: "rgba(139, 92, 246, 0.5)" }}
//                             className={cn(
//                                 "rounded-lg border border-white/5 flex items-center justify-center text-xs text-gray-400 cursor-pointer transition-colors",
//                                 i === 5 ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/50" : "bg-[#1a1a1a]"
//                             )}
//                           >
//                               {9 + i}
//                           </motion.div>
//                       ))}
//                   </div>
//                </div>
//              </div>
//           </SpotlightCard>

//           {/* Feature 3: Code Editor */}
//           <SpotlightCard className="md:col-span-6 lg:col-span-4 bg-[#0A0A0A]">
//              <div className="p-10 h-full flex flex-col">
//                <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-8">
//                  <Code2 className="w-7 h-7 text-white" />
//                </div>
//                <h3 className="text-2xl font-bold text-white mb-4">Multi-Language IDE</h3>
//                <p className="text-gray-400 text-sm mb-6">
//                  Support for Python, Go, Java, C++, and JS. Real-time syntax highlighting.
//                </p>
               
//                <div className="mt-auto flex flex-wrap gap-2">
//                   {["Python", "Go", "Java", "C++", "TS", "Rust"].map(lang => (
//                      <span key={lang} className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-xs text-gray-300 font-mono hover:border-violet-500/50 transition-colors cursor-default">
//                         {lang}
//                      </span>
//                   ))}
//                </div>
//              </div>
//           </SpotlightCard>

//           {/* Feature 4: AI Feedback Loop (Radial Chart) */}
//           <SpotlightCard className="md:col-span-6 lg:col-span-8 bg-[#0A0A0A]">
//              <div className="flex flex-col md:flex-row h-full">
//                 <div className="p-10 flex flex-col justify-center md:w-1/2">
//                    <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-8">
//                      <Zap className="w-7 h-7 text-white" />
//                    </div>
//                    <h3 className="text-3xl font-bold text-white mb-4">AI Feedback Loop</h3>
//                    <p className="text-gray-400 leading-relaxed">
//                      Receive structured peer feedback and AI-driven performance analysis immediately after the session.
//                    </p>
//                 </div>
//                 <div className="md:w-1/2 bg-[#080808] p-8 border-l border-white/5 flex flex-col justify-center gap-8 relative overflow-hidden">
//                    {/* Decorative Radial Gradients */}
//                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[80px]" />

//                    {/* Custom Progress Bars */}
//                    {[
//                        { label: "Algorithms", val: "94%", color: "bg-violet-500" },
//                        { label: "System Design", val: "88%", color: "bg-indigo-500" },
//                        { label: "Communication", val: "92%", color: "bg-emerald-500" }
//                    ].map((metric, i) => (
//                        <div key={i}>
//                            <div className="flex justify-between text-sm font-medium text-gray-300 mb-2">
//                                <span>{metric.label}</span>
//                                <span className="text-white">{metric.val}</span>
//                            </div>
//                            <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
//                                <motion.div 
//                                    initial={{ width: 0 }}
//                                    whileInView={{ width: metric.val }}
//                                    transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
//                                    className={cn("h-full rounded-full shadow-[0_0_10px_currentColor]", metric.color)} 
//                                />
//                            </div>
//                        </div>
//                    ))}
//                 </div>
//              </div>
//           </SpotlightCard>
//         </div>
//       </div>
//     </section>
//   );
// };

// const TechnologySection = () => {
//   return (
//     <section id="technology" className="py-32 bg-[#020202] border-y border-white/5 relative overflow-hidden">
//        {/* Decorative BG */}
//        <div className="absolute inset-0 z-0">
//           <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full" />
//           <div className="absolute left-0 bottom-0 w-[800px] h-[800px] bg-violet-600/5 blur-[150px] rounded-full" />
//        </div>

//        <div className="container mx-auto px-6 relative z-10">
//           <SectionHeading title="Built for Velocity" align="left" badge="Technology">
//              We chose a battle-tested tech stack that handles high-concurrency real-time communication without breaking a sweat.
//           </SectionHeading>

//           {/* Animated Tech Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//              {[
//                { icon: GitBranch, label: "Golang Backend", sub: "Gin Framework" },
//                { icon: Server, label: "WebRTC (Pion)", sub: "P2P Streaming" },
//                { icon: Database, label: "MongoDB", sub: "Document Store" },
//                { icon: Lock, label: "JWT Security", sub: "Stateless Auth" },
//                { icon: Globe, label: "Next.js 14", sub: "App Router" },
//                { icon: Terminal, label: "WebSockets", sub: "Real-time Sync" },
//                { icon: Cpu, label: "Docker", sub: "Containerized" },
//                { icon: Settings, label: "RESTful API", sub: "Open Standard" },
//              ].map((tech, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ delay: i * 0.05 }}
//                   whileHover={{ y: -5, borderColor: "rgba(139, 92, 246, 0.3)" }}
//                   className="group relative p-6 rounded-2xl border border-white/5 bg-[#080808] overflow-hidden cursor-default"
//                 >
//                    {/* Hover Gradient */}
//                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   
//                    <div className="relative z-10 flex items-start gap-4">
//                        <div className="p-3 rounded-xl bg-[#151515] border border-white/5 text-gray-400 group-hover:text-violet-400 group-hover:border-violet-500/20 transition-colors">
//                           <tech.icon className="w-6 h-6" />
//                        </div>
//                        <div>
//                           <h3 className="font-bold text-white text-lg">{tech.label}</h3>
//                           <p className="text-sm text-gray-500 mt-1">{tech.sub}</p>
//                        </div>
//                    </div>
//                 </motion.div>
//              ))}
//           </div>
//        </div>
//     </section>
//   );
// }

// const WorkflowTimeline = () => {
//    // Steps Data
//    const steps = [
//       { num: "01", title: "Create Profile", desc: "Set up your developer profile, preferred languages, and availability." },
//       { num: "02", title: "Schedule Peer", desc: "Match with a peer based on skill level and time zone automatically." },
//       { num: "03", title: "The Interview", desc: "60-minute session. 30 mins you interview them, 30 mins they interview you." },
//       { num: "04", title: "Actionable Feedback", desc: "Receive detailed ratings on code correctness and soft skills." }
//    ];

//    return (
//       <section id="workflow" className="py-32 bg-[#02040a] relative">
//          <div className="container mx-auto px-6">
//             <SectionHeading title="The Flight Path" badge="Workflow" />
            
//             <div className="relative mt-20">
//                {/* Connecting Trajectory Beam */}
//                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-white/5">
//                   <motion.div 
//                      initial={{ x: "-100%" }}
//                      whileInView={{ x: "100%" }}
//                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//                      className="w-1/3 h-full bg-gradient-to-r from-transparent via-violet-500 to-transparent blur-[1px]"
//                   />
//                </div>
               
//                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//                   {steps.map((step, idx) => (
//                      <div key={idx} className="relative group">
//                         {/* Orbit Node */}
//                         <div className="w-24 h-24 mx-auto mb-8 relative flex items-center justify-center">
//                             <div className="absolute inset-0 bg-[#0A0A0A] rounded-full border border-white/10 z-10" />
//                             <div className="absolute inset-2 bg-[#151515] rounded-full z-20 flex items-center justify-center text-2xl font-bold text-white group-hover:text-violet-400 transition-colors">
//                                 {step.num}
//                             </div>
//                             {/* Pulse Ring */}
//                             <div className="absolute inset-0 border border-violet-500/30 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500" />
//                         </div>
                        
//                         <div className="text-center">
//                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">{step.title}</h3>
//                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
//                         </div>
//                      </div>
//                   ))}
//                </div>
//             </div>
//          </div>
//       </section>
//    )
// }

// const CTA = () => {
//   return (
//     <section className="py-40 relative overflow-hidden bg-black flex items-center justify-center">
//       <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0A0A0A] to-black z-0" />
      
//       {/* Grid Pattern */}
//       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
      
//       <div className="container mx-auto px-6 relative z-10 text-center">
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           whileInView={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.8 }}
//           className="max-w-5xl mx-auto bg-[#080808] border border-white/10 rounded-[3rem] p-16 md:p-24 shadow-2xl relative overflow-hidden group"
//         >
//           {/* Subtle moving sheen */}
//           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
//           <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white leading-tight">
//             Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Launch?</span>
//           </h2>
//           <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
//             Join a growing community of ambitious individuals. The best way to predict the future is to create it.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
//             <Link href="/auth/register">
//               <Button className="w-full sm:w-auto px-12 py-5 text-lg">
//                 Create Your Free Account <ArrowRight className="w-5 h-5 ml-2" />
//               </Button>
//             </Link>
//             <Link href="#features">
//               <Button variant="secondary" className="w-full sm:w-auto px-12 py-5 text-lg">
//                  Explore Features
//               </Button>
//             </Link>
//           </div>
//           <p className="mt-10 text-sm text-gray-500 font-medium">No credit card required • Open Source Core</p>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// const Footer = () => (
//   <footer className="bg-[#020202] border-t border-white/5 pt-24 pb-12 relative z-10">
//     <div className="container mx-auto px-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
//         <div>
//           <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-white mb-8">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
//               <Command className="w-5 h-5 text-white" />
//             </div>
//             MockOrbit
//           </Link>
//           <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
//             The premier platform for technical interview preparation. Built by engineers, for engineers.
//           </p>
//           <div className="flex gap-4">
//             <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all hover:scale-110"><Twitter className="w-5 h-5"/></Link>
//             <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all hover:scale-110"><Github className="w-5 h-5"/></Link>
//             <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all hover:scale-110"><Linkedin className="w-5 h-5"/></Link>
//           </div>
//         </div>
        
//         <div>
//           <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
//           <ul className="space-y-4 text-sm text-gray-400">
//             <li><Link href="#features" className="hover:text-violet-400 transition-colors">Features</Link></li>
//             <li><Link href="#pricing" className="hover:text-violet-400 transition-colors">Pricing</Link></li>
//             <li><Link href="#" className="hover:text-violet-400 transition-colors">Live Demo</Link></li>
//             <li><Link href="#" className="hover:text-violet-400 transition-colors">Changelog</Link></li>
//           </ul>
//         </div>
        
//         <div>
//           <h4 className="text-white font-bold mb-6 text-lg">Resources</h4>
//           <ul className="space-y-4 text-sm text-gray-400">
//             <li><Link href="#" className="hover:text-violet-400 transition-colors">Documentation</Link></li>
//             <li><Link href="#" className="hover:text-violet-400 transition-colors">API Reference</Link></li>
//             <li><Link href="#" className="hover:text-violet-400 transition-colors">System Design Guide</Link></li>
//             <li><Link href="#" className="hover:text-violet-400 transition-colors">Community Hub</Link></li>
//           </ul>
//         </div>

//         <div>
//           <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
//           <ul className="space-y-4 text-sm text-gray-400">
//             <li><Link href="#" className="hover:text-violet-400 transition-colors">About Us</Link></li>
//             <li><Link href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</Link></li>
//             <li><Link href="#" className="hover:text-violet-400 transition-colors">Terms of Service</Link></li>
//             <li><Link href="#" className="hover:text-violet-400 transition-colors">Contact Support</Link></li>
//           </ul>
//         </div>
//       </div>
      
//       <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-sm text-gray-500">
//         <p>© {new Date().getFullYear()} Mock Orbit Inc. All rights reserved.</p>
//         <div className="flex items-center gap-2 mt-4 md:mt-0 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
//            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//            <span>System Status: Operational</span>
//         </div>
//       </div>
//     </div>
//   </footer>
// );

// // --- MAIN LAYOUT ---

// export default function LandingPage() {
//   const [mounted, setMounted] = useState(false);
  
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   return (
//     <div className="bg-[#02040a] min-h-screen text-white selection:bg-violet-500/30 font-sans overflow-x-hidden">
//       <Navbar />
//       <Hero />
//       <SocialProof />
//       <FeatureGrid />
//       <TechnologySection />
//       <WorkflowTimeline />
//       <CTA />
//       <Footer />
//     </div>
//   );
// }







//NEW REVAMP

"use client";

import React, { useState, useEffect, useRef } from "react";
// NOTE: For local Next.js development, uncomment the line below and remove the const Link definition.
// import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";
import {
  Video,
  Code2,
  Sparkles,
  ArrowRight,
  Globe,
  Zap,
  Terminal,
  Play,
  Github,
  Twitter,
  Linkedin,
  Command,
  Calendar,
  Layers,
  Database,
  GitBranch,
  Server,
  Lock,
  Settings,
  Menu,
  X,
  Wifi,
  Mic,
  Check,
  Cpu,
  MoreHorizontal,
  FileCode,
  Box,
  Activity
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITIES ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPATIBILITY LINK COMPONENT ---
const Link = ({ href, children, ...props }: any) => {
  return <a href={href} {...props}>{children}</a>;
};

// --- VISUAL EFFECTS COMPONENTS ---

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { x: number; y: number; z: number; size: number }[] = [];
    const numStars = 300; 
    const speed = 0.2;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        size: Math.random() * 2,
      });
    }

    const animate = () => {
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        star.z -= speed;
        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
        }

        const x = (star.x / star.z) * width + width / 2;
        const y = (star.y / star.z) * height + height / 2;
        const s = (1 - star.z / width) * star.size;

        const opacity = 1 - star.z / width;
        ctx.fillStyle = `rgba(180, 200, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, s > 0 ? s : 0, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-50 pointer-events-none" />;
};

const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: any) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative px-8 py-4 rounded-xl font-bold text-sm tracking-wide transition-all overflow-hidden group",
        variant === "primary"
          ? "bg-white text-black shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
          : "bg-white/5 text-white border border-white/10 hover:bg-white/10 backdrop-blur-md shadow-lg shadow-black/50",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 justify-center">{children}</span>
      {variant === "primary" && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      )}
    </motion.button>
  );
};

const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(124, 58, 237, 0.15)",
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative border border-white/10 bg-[#0A0A0A] overflow-hidden rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:shadow-violet-900/20",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

const SectionHeading = ({ children, title, align = "center", badge }: { children: React.ReactNode, title: string, align?: "center" | "left", badge?: string }) => (
  <div className={cn("mb-20 relative z-10", align === "center" ? "text-center" : "text-left")}>
    {badge && (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-medium text-violet-200 backdrop-blur-xl mb-6", align === "center" ? "mx-auto" : "")}
      >
        <Sparkles className="w-3 h-3 text-violet-300" />
        {badge}
      </motion.div>
    )}
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight"
    >
      {title}
    </motion.h2>
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
    >
      {children}
    </motion.p>
  </div>
);

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-white backdrop-blur-md shadow-lg", className)}>
    {children}
  </div>
);

// --- ADVANCED SIMULATIONS ---

const AdvancedCodeWindow = () => {
  const [activeTab, setActiveTab] = useState("main.go");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>(["> Ready to compile..."]);

  const runCode = () => {
    setIsRunning(true);
    setOutput(["> Compiling...", "> checking dependencies..."]);
    setTimeout(() => {
        setOutput(prev => [...prev, "> Running tests..."]);
    }, 800);
    setTimeout(() => {
        setOutput(prev => [...prev, "> TestSuite: PASS (4/4)", "> Execution time: 142ms"]);
        setIsRunning(false);
    }, 2000);
  };

  return (
    <motion.div 
        initial={{ y: 40, opacity: 0, rotateX: 10 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className="w-full max-w-5xl mx-auto rounded-xl border border-white/10 bg-[#080808]/90 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/5 perspective-1000 group hover:shadow-violet-500/10 transition-shadow duration-500"
    >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0A0A0A]">
            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50 group-hover:bg-red-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50 group-hover:bg-yellow-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50 group-hover:bg-green-500 transition-colors" />
                </div>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="flex gap-1">
                    {["main.go", "utils.go", "test_suite.go"].map(tab => (
                        <div 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors flex items-center gap-2",
                                activeTab === tab ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            <FileCode className="w-3 h-3" />
                            {tab}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Connected</span>
                </div>
                <button 
                    onClick={runCode}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    {isRunning ? <Cpu className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    {isRunning ? "Running..." : "Run Code"}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 h-[400px] md:h-[500px]">
            {/* Editor Area */}
            <div className="md:col-span-2 border-r border-white/10 p-6 font-mono text-sm overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-white/5 bg-white/2 flex flex-col items-end pr-3 pt-6 text-gray-700 select-none">
                    {[...Array(20)].map((_, i) => <div key={i} className="leading-relaxed">{i + 1}</div>)}
                </div>
                <div className="pl-10 space-y-1">
                    <div><span className="text-pink-400">package</span> main</div>
                    <div className="h-4" />
                    <div><span className="text-pink-400">import</span> (</div>
                    <div className="pl-4"><span className="text-green-400">"fmt"</span></div>
                    <div className="pl-4"><span className="text-green-400">"time"</span></div>
                    <div>)</div>
                    <div className="h-4" />
                    <div><span className="text-gray-500">// optimizeOrbit calculates the optimal trajectory</span></div>
                    <div><span className="text-pink-400">func</span> <span className="text-blue-400">optimizeOrbit</span>(user <span className="text-yellow-400">*Candidate</span>) <span className="text-yellow-400">Result</span> {"{"}</div>
                    <div className="pl-4">start := <span className="text-green-400">time.Now()</span></div>
                    <div className="pl-4"><span className="text-blue-400">defer</span> <span className="text-pink-400">func</span>() {"{"}</div>
                    <div className="pl-8">fmt.Printf(<span className="text-green-400">"Execution time: %v\n"</span>, time.Since(start))</div>
                    <div className="pl-4">{"}()"}</div>
                    <div className="h-4" />
                    <div className="pl-4"><span className="text-pink-400">if</span> user.IsPrepared {"{"}</div>
                    <div className="pl-8"><span className="text-pink-400">return</span> <span className="text-blue-400">OfferExtended</span></div>
                    <div className="pl-4">{"}"}</div>
                    <div className="pl-4 flex items-center gap-1">
                        <span className="text-pink-400">return</span> 
                        <span className="text-blue-400">MockOrbit.Practice()</span>
                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-violet-500" />
                    </div>
                    <div>{"}"}</div>
                </div>
            </div>

            {/* Sidebar (Output & Chat) */}
            <div className="md:col-span-1 bg-[#050505] flex flex-col">
                {/* Terminal Output */}
                <div className="h-1/2 border-b border-white/10 p-4 font-mono text-xs flex flex-col">
                    <div className="flex items-center justify-between mb-2 text-gray-500 text-[10px] uppercase tracking-wider font-bold">
                        <span>Terminal</span>
                        <span>bash</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1">
                        {output.map((line, i) => (
                            <div key={i} className={cn(
                                "break-all",
                                line.includes("PASS") ? "text-green-400" : 
                                line.includes("Running") ? "text-yellow-400" : "text-gray-400"
                            )}>
                                {line}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Chat */}
                <div className="h-1/2 p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3 text-gray-500 text-[10px] uppercase tracking-wider font-bold">
                        <span>Team Chat</span>
                        <div className="flex -space-x-1">
                            <div className="w-4 h-4 rounded-full bg-blue-500" />
                            <div className="w-4 h-4 rounded-full bg-purple-500" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                        <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">JD</div>
                            <div className="bg-white/5 p-2 rounded-lg rounded-tl-none text-xs text-gray-300">
                                Can we optimize the time complexity here?
                            </div>
                        </div>
                        <div className="flex gap-2 flex-row-reverse">
                            <div className="w-6 h-6 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">YO</div>
                            <div className="bg-violet-500/20 p-2 rounded-lg rounded-tr-none text-xs text-violet-200">
                                Yes, using a hash map should bring it to O(n).
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 relative">
                        <input 
                            type="text" 
                            placeholder="Type a message..." 
                            className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                        />
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
  );
}

const AudioVisualizer = () => (
  <div className="flex items-center justify-center gap-1 h-12 w-full">
    {[...Array(20)].map((_, i) => (
      <motion.div 
        key={i}
        animate={{ 
            height: ["20%", `${Math.random() * 80 + 20}%`, "20%"],
            backgroundColor: ["#4c1d95", "#8b5cf6", "#4c1d95"]
        }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: i * 0.05 
        }}
        className="w-1.5 rounded-full"
      />
    ))}
  </div>
)

// --- MAIN SECTIONS ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-[#050505]/80 backdrop-blur-xl border-white/10 py-3 shadow-lg shadow-violet-900/5"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
            <Command className="w-5 h-5 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">
            MockOrbit
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          {["Features", "Technology", "Workflow", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-white transition-colors relative hover:after:w-full after:w-0 after:h-px after:bg-violet-500 after:absolute after:-bottom-1 after:left-0 after:transition-all"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link href="/auth/register">
            <button className="px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)]">
              Get Started
            </button>
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#050505] border-b border-white/10"
          >
             <div className="flex flex-col p-6 gap-4 text-gray-400">
                {["Features", "Technology", "Workflow", "Pricing"].map((item) => (
                  <Link key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-white">
                    {item}
                  </Link>
                ))}
                <div className="h-px bg-white/10 my-2" />
                <Link href="/auth/login" className="block py-2 text-white">Login</Link>
                <Link href="/auth/register" className="block py-2 text-violet-400 font-bold">Sign Up Free</Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center overflow-hidden">
      <Starfield />
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Centered Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <Badge>
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span className="text-amber-100 ml-2">V2.0 is Live: Introducing AI Analytics</span>
            </Badge>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-[1.1] mb-8 drop-shadow-2xl">
            The Art of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
              Peer Interviewing.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Mock Orbit is the end-to-end platform to simulate real-world interviews. 
            Connect with peers, write code in real-time, and get actionable AI feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button className="w-full sm:w-auto h-14 px-10 text-base">
                Start Your Journey <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="https://github.com/adityaxanand/MockOrbit" target="_blank">
              <Button variant="secondary" className="w-full sm:w-auto h-14 px-10 text-base">
                <Github className="w-4 h-4" /> Star on GitHub
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Downside Code Simulation */}
        <div className="mt-24 w-full">
            <AdvancedCodeWindow />
        </div>
      </div>
    </section>
  );
};

const SocialProof = () => (
  <section className="py-12 border-y border-white/5 bg-black/40 backdrop-blur-sm">
    <div className="container mx-auto px-6">
      <p className="text-center text-sm font-medium text-gray-500 mb-8 uppercase tracking-[0.2em]">Trusted by engineers from</p>
      <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
         {[
           { name: "Google", color: "hover:text-[#4285F4]" },
           { name: "Microsoft", color: "hover:text-[#00A4EF]" },
           { name: "Netflix", color: "hover:text-[#E50914]" },
           { name: "Amazon", color: "hover:text-[#FF9900]" },
           { name: "Meta", color: "hover:text-[#0668E1]" },
           { name: "Uber", color: "hover:text-[#ffffff] hover:bg-black hover:px-2 hover:rounded" }
         ].map((brand) => (
            <span 
              key={brand.name} 
              className={cn("text-2xl md:text-3xl font-bold text-gray-600 transition-all duration-300 cursor-default hover:scale-110 transform", brand.color)}
            >
              {brand.name}
            </span>
         ))}
      </div>
    </div>
  </section>
)

const FeatureGrid = () => {
  return (
    <section id="features" className="py-32 bg-[#02040a] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-violet-900/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <SectionHeading title="The Mission Control Center" badge="Features" align="center">
          We've engineered a comprehensive ecosystem for serious interview preparation.
          Switch between Interviewer and Candidate roles instantly.
        </SectionHeading>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[400px]">
          
          {/* Feature 1: Video (Audio Viz) */}
          <SpotlightCard className="md:col-span-6 lg:col-span-8 group bg-[#0A0A0A]">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
             <div className="relative z-10 p-10 h-full flex flex-col justify-between">
               <div>
                   <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-8 shadow-inner">
                     <Video className="w-7 h-7 text-white" />
                   </div>
                   <h3 className="text-3xl font-bold text-white mb-4">HD Low-Latency Video</h3>
                   <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                     Powered by Pion WebRTC. Experience sub-30ms latency peer-to-peer connection.
                   </p>
               </div>
               
               {/* Advanced Visual */}
               <div className="w-full bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-2xl gap-6">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <Mic className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111]" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-white">Active Channel</div>
                        <div className="text-xs text-emerald-400">48kHz Stereo • 24ms Ping</div>
                     </div>
                  </div>
                  <div className="flex-1 w-full md:w-auto">
                      <AudioVisualizer />
                  </div>
               </div>
             </div>
          </SpotlightCard>

          {/* Feature 2: Smart Scheduling */}
          <SpotlightCard className="md:col-span-6 lg:col-span-4 bg-[#0A0A0A]">
             <div className="p-10 h-full flex flex-col">
               <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-8">
                 <Calendar className="w-7 h-7 text-white" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-4">Smart Scheduling</h3>
               <p className="text-gray-400 text-sm mb-8">
                 Global timezone matching. Find peers available when you are.
               </p>
               
               <div className="relative flex-1 bg-[#111] rounded-2xl border border-white/10 p-5 overflow-hidden flex flex-col gap-2">
                  <div className="flex justify-between text-gray-500 text-[10px] font-bold uppercase mb-2">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 flex-1">
                      {[...Array(16)].map((_, i) => (
                          <motion.div 
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            className={cn(
                                "rounded-lg border border-white/5 flex items-center justify-center text-xs text-gray-400 cursor-pointer transition-all duration-300 aspect-square",
                                i === 7 ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/50 scale-110" : "bg-[#1a1a1a] hover:bg-white/10"
                            )}
                          >
                              {i + 10}
                          </motion.div>
                      ))}
                  </div>
               </div>
             </div>
          </SpotlightCard>

          {/* Feature 3: Code Editor */}
          <SpotlightCard className="md:col-span-6 lg:col-span-4 bg-[#0A0A0A]">
             <div className="p-10 h-full flex flex-col">
               <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-8">
                 <Code2 className="w-7 h-7 text-white" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-4">Polyglot IDE</h3>
               <p className="text-gray-400 text-sm mb-6">
                 Support for Python, Go, Java, C++, and JS. Real-time syntax highlighting.
               </p>
               
               <div className="mt-auto flex flex-wrap gap-2">
                  {["Python", "Go", "Java", "C++", "TS", "Rust"].map(lang => (
                     <span key={lang} className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-xs text-gray-300 font-mono hover:border-violet-500/50 hover:text-white transition-colors cursor-default">
                        {lang}
                     </span>
                  ))}
               </div>
             </div>
          </SpotlightCard>

          {/* Feature 4: AI Feedback Loop */}
          <SpotlightCard className="md:col-span-6 lg:col-span-8 bg-[#0A0A0A]">
             <div className="flex flex-col md:flex-row h-full">
                <div className="p-10 flex flex-col justify-center md:w-1/2">
                   <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-8">
                     <Zap className="w-7 h-7 text-white" />
                   </div>
                   <h3 className="text-3xl font-bold text-white mb-4">AI Feedback Loop</h3>
                   <p className="text-gray-400 leading-relaxed">
                     Receive structured peer feedback and AI-driven performance analysis immediately after the session.
                   </p>
                </div>
                <div className="md:w-1/2 bg-[#080808] p-8 border-l border-white/5 flex flex-col justify-center gap-8 relative overflow-hidden">
                   {/* Decorative Radial Gradients */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[80px]" />

                   {/* Custom Progress Bars */}
                   {[
                       { label: "Algorithms", val: "94%", color: "bg-violet-500" },
                       { label: "System Design", val: "88%", color: "bg-indigo-500" },
                       { label: "Communication", val: "92%", color: "bg-emerald-500" }
                   ].map((metric, i) => (
                       <div key={i} className="group">
                           <div className="flex justify-between text-sm font-medium text-gray-400 group-hover:text-white transition-colors mb-2">
                               <span>{metric.label}</span>
                               <span className="text-white font-bold">{metric.val}</span>
                           </div>
                           <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden border border-white/5">
                               <motion.div 
                                   initial={{ width: 0 }}
                                   whileInView={{ width: metric.val }}
                                   transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                                   className={cn("h-full rounded-full shadow-[0_0_15px_currentColor]", metric.color)} 
                               />
                           </div>
                       </div>
                   ))}
                </div>
             </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
};

const TechnologySection = () => {
  return (
    <section id="technology" className="py-32 bg-[#020202] border-y border-white/5 relative overflow-hidden">
       {/* Decorative BG */}
       <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full" />
          <div className="absolute left-0 bottom-0 w-[800px] h-[800px] bg-violet-600/5 blur-[150px] rounded-full" />
       </div>

       <div className="container mx-auto px-6 relative z-10">
          <SectionHeading title="Built for Velocity" align="left" badge="Technology">
             We chose a battle-tested tech stack that handles high-concurrency real-time communication without breaking a sweat.
          </SectionHeading>

          {/* Animated Tech Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { icon: GitBranch, label: "Golang Backend", sub: "Gin Framework" },
               { icon: Server, label: "WebRTC (Pion)", sub: "P2P Streaming" },
               { icon: Database, label: "MongoDB", sub: "Document Store" },
               { icon: Lock, label: "JWT Security", sub: "Stateless Auth" },
               { icon: Globe, label: "Next.js 14", sub: "App Router" },
               { icon: Terminal, label: "WebSockets", sub: "Real-time Sync" },
               { icon: Cpu, label: "Docker", sub: "Containerized" },
               { icon: Settings, label: "RESTful API", sub: "Open Standard" },
             ].map((tech, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5, borderColor: "rgba(139, 92, 246, 0.3)" }}
                  className="group relative p-6 rounded-2xl border border-white/5 bg-[#080808] overflow-hidden cursor-default transition-all duration-300"
                >
                   {/* Hover Gradient */}
                   <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   
                   <div className="relative z-10 flex items-start gap-4">
                       <div className="p-3 rounded-xl bg-[#151515] border border-white/5 text-gray-400 group-hover:text-violet-400 group-hover:border-violet-500/20 transition-colors shadow-lg">
                          <tech.icon className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-white text-lg group-hover:text-violet-200 transition-colors">{tech.label}</h3>
                          <p className="text-sm text-gray-500 mt-1">{tech.sub}</p>
                       </div>
                   </div>
                </motion.div>
             ))}
          </div>
       </div>
    </section>
  );
}

const WorkflowTimeline = () => {
   // Steps Data
   const steps = [
      { num: "01", title: "Create Profile", desc: "Set up your developer profile, preferred languages, and availability." },
      { num: "02", title: "Schedule Peer", desc: "Match with a peer based on skill level and time zone automatically." },
      { num: "03", title: "The Interview", desc: "60-minute session. 30 mins you interview them, 30 mins they interview you." },
      { num: "04", title: "Feedback Loop", desc: "Receive detailed ratings on code correctness and soft skills." }
   ];

   return (
      <section id="workflow" className="py-32 bg-[#02040a] relative">
         <div className="container mx-auto px-6">
            <SectionHeading title="The Flight Path" badge="Workflow" children={undefined} />
            
            <div className="relative mt-24">
               {/* Connecting Trajectory Beam */}
               <div className="hidden md:block absolute top-[3rem] left-0 w-full h-0.5 bg-white/5">
                  <motion.div 
                     initial={{ x: "-100%" }}
                     whileInView={{ x: "100%" }}
                     transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                     className="w-1/3 h-full bg-gradient-to-r from-transparent via-violet-500 to-transparent blur-[1px]"
                  />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                  {steps.map((step, idx) => (
                     <div key={idx} className="relative group">
                        {/* Orbit Node */}
                        <div className="w-24 h-24 mx-auto mb-8 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-[#0A0A0A] rounded-full border border-white/10 z-10 group-hover:border-violet-500/50 transition-colors duration-500" />
                            <div className="absolute inset-2 bg-[#111] rounded-full z-20 flex items-center justify-center text-2xl font-bold text-white group-hover:text-violet-400 transition-colors shadow-inner">
                                {step.num}
                            </div>
                            {/* Pulse Ring */}
                            <div className="absolute inset-0 border border-violet-500/30 rounded-full scale-125 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                        </div>
                        
                        <div className="text-center px-2">
                           <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">{step.title}</h3>
                           <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}

const CTA = () => {
  return (
    <section className="py-40 relative overflow-hidden bg-black flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0A0A0A] to-black z-0" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto bg-[#080808] border border-white/10 rounded-[3rem] p-16 md:p-24 shadow-2xl relative overflow-hidden group"
        >
          {/* Subtle moving sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white leading-tight">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Launch?</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join a growing community of ambitious individuals. The best way to predict the future is to create it.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <Link href="/auth/register">
              <Button className="w-full sm:w-auto px-12 py-5 text-lg">
                Create Your Free Account <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="secondary" className="w-full sm:w-auto px-12 py-5 text-lg">
                 Explore Features
              </Button>
            </Link>
          </div>
          <p className="mt-10 text-sm text-gray-500 font-medium">No credit card required • Open Source Core</p>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-[#020202] border-t border-white/5 pt-24 pb-12 relative z-10">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-white mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
              <Command className="w-5 h-5 text-white" />
            </div>
            MockOrbit
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
            The premier platform for technical interview preparation. Built by engineers, for engineers.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all hover:scale-110"><Twitter className="w-5 h-5"/></Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all hover:scale-110"><Github className="w-5 h-5"/></Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all hover:scale-110"><Linkedin className="w-5 h-5"/></Link>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="#features" className="hover:text-violet-400 transition-colors">Features</Link></li>
            <li><Link href="#pricing" className="hover:text-violet-400 transition-colors">Pricing</Link></li>
            <li><Link href="#" className="hover:text-violet-400 transition-colors">Live Demo</Link></li>
            <li><Link href="#" className="hover:text-violet-400 transition-colors">Changelog</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Resources</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="#" className="hover:text-violet-400 transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover:text-violet-400 transition-colors">API Reference</Link></li>
            <li><Link href="#" className="hover:text-violet-400 transition-colors">System Design Guide</Link></li>
            <li><Link href="#" className="hover:text-violet-400 transition-colors">Community Hub</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="#" className="hover:text-violet-400 transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-violet-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-violet-400 transition-colors">Contact Support</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Mock Orbit Inc. All rights reserved.</p>
        <div className="flex items-center gap-2 mt-4 md:mt-0 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span>System Status: Operational</span>
        </div>
      </div>
    </div>
  </footer>
);

// --- MAIN LAYOUT ---

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-[#02040a] min-h-screen text-white selection:bg-violet-500/30 font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <SocialProof />
      <FeatureGrid />
      <TechnologySection />
      <WorkflowTimeline />
      <CTA />
      <Footer />
    </div>
  );
}