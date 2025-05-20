
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold">AI Humanizer</h3>
            <p className="text-sm text-muted-foreground">
              Make your AI-generated content sound natural and human-written.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Navigation</h4>
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Home
                </Link>
                <Link
                  to="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Link>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
              </nav>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Account</h4>
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Sign Up
                </Link>
                <Link
                  to="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Link>
              </nav>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Contact Us</h4>
            <p className="text-sm text-muted-foreground">
              Have questions? Reach out to our support team.
            </p>
            <Link
              to="/contact"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Go to Contact Page
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} AI Humanizer. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link
              to="/terms"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
