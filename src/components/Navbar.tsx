import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSelector from "./ThemeSelector";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/technologies", label: "Technologies" },
  { to: "/ai-tools", label: "AI Tools" },
  { to: "/map", label: "Global Map" },
  { to: "/recommendations", label: "Skills" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const allLinks = user
    ? [...navLinks, { to: "/my-dashboard", label: "My Hub" }]
    : navLinks;
  const links = isAdmin
    ? [...allLinks, { to: "/admin", label: "Admin" }]
    : allLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:border-primary/60 transition-colors">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              Tech<span className="text-primary">Atlas</span>
            </span>
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <div className="mx-2 w-[1px] h-6 bg-border/50" />
            <ThemeSelector />
            {user ? (
              <Button size="sm" variant="ghost" onClick={handleSignOut} className="ml-2 text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4 mr-1" /> Sign Out
              </Button>
            ) : (
              <Link to="/login">
                <Button size="sm" className="ml-2 bg-primary text-primary-foreground hover:bg-primary/80">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeSelector />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/50"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Button size="sm" variant="ghost" onClick={() => { handleSignOut(); setIsOpen(false); }} className="w-full mt-2 text-muted-foreground">
                  <LogOut className="w-4 h-4 mr-1" /> Sign Out
                </Button>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full mt-2 bg-primary text-primary-foreground">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
