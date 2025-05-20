
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl gradient-text">AI Humanizer</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/pricing") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/contact") ? "text-primary" : "text-muted-foreground"
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
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button onClick={() => signOut()}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isMenuOpen ? "hidden" : "block"}
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isMenuOpen ? "block" : "hidden"}
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Toggle Menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={isMenuOpen ? "block md:hidden" : "hidden"}>
        <div className="space-y-1 p-4 bg-background border-b">
          <Link
            to="/"
            className="block text-sm font-medium p-2 hover:bg-muted rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/pricing"
            className="block text-sm font-medium p-2 hover:bg-muted rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            to="/contact"
            className="block text-sm font-medium p-2 hover:bg-muted rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="block text-sm font-medium p-2 hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-sm font-medium p-2 hover:bg-muted rounded-md"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-sm font-medium p-2 hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="block text-sm font-medium p-2 hover:bg-muted rounded-md"
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
