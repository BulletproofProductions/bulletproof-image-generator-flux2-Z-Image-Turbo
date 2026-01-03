"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Wand2, Image as ImageIcon, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ModeToggle } from "./ui/mode-toggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

interface SiteHeaderProps {
  isGenerating?: boolean;
}

const navigationItems = [
  { href: "/", label: "Generate", icon: Wand2 },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/avatars", label: "Avatars", icon: Users },
];

export function SiteHeader({ isGenerating = false }: SiteHeaderProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md"
      >
        Skip to main content
      </a>
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50" role="banner">
        <nav
          className="container mx-auto px-4 py-4 flex justify-between items-center"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <h1 className="text-2xl font-bold">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              aria-label="Bulletproof Productions - Go to homepage"
            >
              <div
                className="shrink-0 relative w-24 h-24"
                aria-hidden="true"
              >
                {/* Idle state image - shown when not generating */}
                <Image
                  src="/BP-AI-Progress.png"
                  alt=""
                  width={96}
                  height={96}
                  className={cn(
                    "h-24 w-auto object-contain transition-opacity duration-500",
                    isGenerating ? "opacity-0" : "opacity-100"
                  )}
                  priority
                />
                {/* Crossfade animation images - shown during generation */}
                <Image
                  src="/BP-AI-1.jpg"
                  alt=""
                  width={96}
                  height={96}
                  className={cn(
                    "h-24 w-auto object-contain crossfade-image",
                    isGenerating && "animate-crossfade-1"
                  )}
                  priority
                />
                <Image
                  src="/BP-AI-2.jpg"
                  alt=""
                  width={96}
                  height={96}
                  className={cn(
                    "h-24 w-auto object-contain crossfade-image",
                    isGenerating && "animate-crossfade-2"
                  )}
                  priority
                />
                <Image
                  src="/BP-AI-3.jpg"
                  alt=""
                  width={96}
                  height={96}
                  className={cn(
                    "h-24 w-auto object-contain crossfade-image",
                    isGenerating && "animate-crossfade-3"
                  )}
                  priority
                />
                <Image
                  src="/BP-AI-4.jpg"
                  alt=""
                  width={96}
                  height={96}
                  className={cn(
                    "h-24 w-auto object-contain crossfade-image",
                    isGenerating && "animate-crossfade-4"
                  )}
                  priority
                />
              </div>
              <div
                className={cn(
                  "flex items-center justify-center w-16 h-16 rounded-lg shrink-0",
                  isGenerating && "animate-logo-spin"
                )}
                aria-hidden="true"
              >
                <Image
                  src="/logo.png"
                  alt=""
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                  priority
                />
              </div>
              <div className="shrink-0" style={{ paddingRight: "20px" }} aria-hidden="true">
                <Image
                  src="/abstract-studio.webp"
                  alt=""
                  width={96}
                  height={96}
                  className="w-24 h-24 object-contain"
                  priority
                />
              </div>
              <span 
                className={cn(
                  "bg-linear-to-r from-[#a1907d] to-[#8b7a68] bg-clip-text text-transparent hidden sm:inline heading-animatable stagger-animation",
                  isGenerating && "animate-pulse-color-shift"
                )}
              >
                {("Bulletproof Productions").split("").map((char, index) => (
                  <span key={index}>{char}</span>
                ))}
              </span>
            </Link>
          </h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1" role="navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2" role="group" aria-label="User actions">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Image
                      src="/logo.png"
                      alt=""
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                    />
                    Bulletproof Productions
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            <ModeToggle />
          </div>
        </nav>
      </header>
    </>
  );
}
