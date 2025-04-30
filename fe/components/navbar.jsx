"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../lib/auth-context";

const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout, isReady } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/explore" },
    { label: "About", href: "/about" },
  ];

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  // Don't render auth-dependent UI until mounted
  if (!isMounted || !isReady) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0">
              <div className="font-bold text-xl text-primary">Surplus2Share</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="font-bold text-xl text-primary">Surplus2Share</div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex md:flex-1 md:justify-center md:items-center">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/80 hover:text-primary">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background">
                <SheetHeader>
                  <SheetTitle className="text-primary">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 py-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-4">
                    {!isAuthenticated && !loading && (
                      <div>
                        <Link href="/login" className="w-full">
                          <Button className="w-full py-2 text-base bg-primary hover:bg-primary/90">
                            Login
                          </Button>
                        </Link>
                      </div>
                    )}
                    {isAuthenticated && (
                      <Button 
                        className="w-full py-2 text-base bg-destructive hover:bg-destructive/90"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-base">
                      {user?.name?.[0] || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border-border">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer text-foreground/80 hover:text-primary">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer text-foreground/80 hover:text-primary">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!isAuthenticated && !loading && (
              <Link href="/login">
                <Button className="px-6 py-2 text-base bg-primary hover:bg-primary/90">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 