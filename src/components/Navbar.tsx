
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl gradient-text">AI Humanizer</span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary relative ${
                isActive("/") 
                  ? "text-primary after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full" 
                  : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className={`text-sm font-medium transition-colors hover:text-primary relative ${
                isActive("/pricing") 
                  ? "text-primary after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full" 
                  : "text-muted-foreground"
              }`}
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary relative ${
                isActive("/contact") 
                  ? "text-primary after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full" 
                  : "text-muted-foreground"
              }`}
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" className="rounded-full">Dashboard</Button>
              </Link>
              <Button onClick={() => signOut()} className="rounded-full shadow-button">Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="rounded-full">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="rounded-full shadow-button">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
          <span className="sr-only">Toggle Menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`
          fixed inset-x-0 top-16 bg-background/95 backdrop-blur-md border-b shadow-md z-40
          transition-all duration-300 ease-in-out transform
          ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
          md:hidden
        `}
      >
        <div className="space-y-1 p-6">
          <Link
            to="/"
            className={`block text-sm font-medium p-3 rounded-lg transition-colors ${
              isActive("/") ? "bg-primary/10 text-primary" : "hover:bg-muted"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/pricing"
            className={`block text-sm font-medium p-3 rounded-lg transition-colors ${
              isActive("/pricing") ? "bg-primary/10 text-primary" : "hover:bg-muted"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            to="/contact"
            className={`block text-sm font-medium p-3 rounded-lg transition-colors ${
              isActive("/contact") ? "bg-primary/10 text-primary" : "hover:bg-muted"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`block text-sm font-medium p-3 rounded-lg transition-colors ${
                  isActive("/dashboard") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-sm font-medium p-3 rounded-lg hover:bg-muted transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-sm font-medium p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="block text-sm font-medium p-3 rounded-lg bg-primary/10 text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
