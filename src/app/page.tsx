
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Users, CalendarCheck, BrainCircuit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-primary text-primary-foreground shadow-md sticky top-0 z-20">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Rocket className="h-6 w-6 mr-2" />
          <span className="text-lg font-semibold">Mock Orbit</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/auth/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Login
          </Link>
          <Link href="/auth/register" prefetch={false}>
            <Button variant="secondary" size="sm">Sign Up</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]"> {/* Adjusted image column size */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Ace Your Next Peer Interview with Mock Orbit
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Practice makes perfect. Simulate real-world interview scenarios, get AI-powered feedback, and schedule sessions with peers easily.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth/register" prefetch={false}>
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">Get Started Free</Button>
                  </Link>
                  <Link href="#features" prefetch={false}> {/* Ensured link points to #features */}
                    <Button variant="outline" size="lg">Learn More</Button>
                  </Link>
                </div>
              </div>
              <Image
                src="https://picsum.photos/550/310" /* Adjusted size */
                width="550"
                height="310"
                alt="Two people collaborating during an online interview simulation"
                data-ai-hint="collaboration interview team meeting online"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last shadow-lg"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32"> {/* Ensure ID matches link */}
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-primary">Everything You Need to Prepare</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Mock Orbit provides a comprehensive suite of tools to help you excel in peer interviews.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Users className="w-8 h-8 text-accent" />
                  <CardTitle>Real-Time Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Engage in live video/audio sessions with a collaborative whiteboard and chat.</CardDescription>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <CalendarCheck className="w-8 h-8 text-accent" />
                  <CardTitle>Easy Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Seamlessly propose and accept interview slots with peers based on availability.</CardDescription>
                </CardContent>
              </Card>
               <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <BrainCircuit className="w-8 h-8 text-accent" />
                  <CardTitle>AI Question Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Get relevant interview questions generated based on topic and difficulty.</CardDescription>
                </CardContent>
              </Card>
              {/* Add more feature cards as needed */}
            </div>
          </div>
        </section>
         {/* Optional: Add Call to Action section */}
         <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    Ready to boost your interview skills?
                </h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Sign up today and start practicing with peers and AI. It's free to get started!
                </p>
                </div>
                <div className="mx-auto w-full max-w-sm space-y-2">
                 <Link href="/auth/register" prefetch={false}>
                    <Button size="lg" variant="secondary" className="w-full">Sign Up Now</Button>
                  </Link>
                </div>
            </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Mock Orbit. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
