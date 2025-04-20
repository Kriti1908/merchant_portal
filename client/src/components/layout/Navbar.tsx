import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import "./navbar-style.css";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    ...(user
      ? [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Generate API", href: "/generate-api" },
        ]
      : []),
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <a className="navbar-link">{item.label}</a>
        </Link>
      ))}
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link href="/">
            <a className="navbar-logo">Aksion</a>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <NavLinks />
          {user ? (
            <Button
              variant="outline"
              className="navbar-button"
              onClick={() => logoutMutation.mutate()}
            >
              Logout
            </Button>
          ) : (
            <Link href="/auth">
              <Button className="navbar-button">Login / Sign Up</Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="navbar-mobile">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="navbar-menu-icon" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="navbar-mobile-links">
                <NavLinks />
                {user ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      logoutMutation.mutate();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                ) : (
                  <Link href="/auth">
                    <Button onClick={() => setMobileMenuOpen(false)}>
                      Login / Sign Up
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}