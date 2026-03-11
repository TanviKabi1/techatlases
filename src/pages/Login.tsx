import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Mail, Lock, User, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

type LoginMode = "select" | "admin" | "user";

const Login = () => {
  const [mode, setMode] = useState<LoginMode>("select");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created", description: "Please check your email to verify your account." });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      } else {
        navigate(mode === "admin" ? "/admin" : "/dashboard");
      }
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />
      <div className="pt-20 flex items-center justify-center min-h-screen px-4">
        <AnimatePresence mode="wait">
          {mode === "select" ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg"
            >
              <Card className="glass border-primary/10">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">Welcome to TechAtlas</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Choose how you'd like to sign in
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Admin / Collaborator */}
                  <button
                    onClick={() => { resetForm(); setMode("admin"); }}
                    className="group relative flex flex-col items-center gap-3 p-6 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 text-left"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground text-lg">Collaborator</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Admin access · CSV import · Data management
                      </p>
                    </div>
                  </button>

                  {/* User */}
                  <button
                    onClick={() => { resetForm(); setMode("user"); }}
                    className="group relative flex flex-col items-center gap-3 p-6 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/10 hover:border-accent/40 transition-all duration-300 text-left"
                  >
                    <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7 text-accent-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground text-lg">User</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Explore dashboard · Save trends · Learning roadmap
                      </p>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <Card className="glass border-primary/10">
                <CardHeader className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode("select")}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors mb-2 inline-flex items-center gap-1 mx-auto"
                  >
                    ← Back to options
                  </button>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mx-auto mb-4 ${
                    mode === "admin"
                      ? "bg-primary/10 border-primary/20"
                      : "bg-accent/10 border-accent/20"
                  }`}>
                    {mode === "admin" ? (
                      <Shield className="w-6 h-6 text-primary" />
                    ) : (
                      <Users className="w-6 h-6 text-accent-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-2xl text-foreground">
                    {isSignUp
                      ? "Create Account"
                      : mode === "admin"
                        ? "Collaborator Sign In"
                        : "User Sign In"}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {isSignUp
                      ? "Sign up to access TechAtlas"
                      : mode === "admin"
                        ? "Sign in with your admin credentials"
                        : "Sign in to explore TechAtlas"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="Enter your name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="bg-muted/50 border-border pl-10"
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-muted/50 border-border pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-muted/50 border-border pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className={`w-full h-11 ${
                        mode === "admin"
                          ? "bg-primary text-primary-foreground hover:bg-primary/80"
                          : "bg-accent text-accent-foreground hover:bg-accent/80"
                      }`}
                    >
                      {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
                    </Button>
                    {mode === "user" && (
                      <p className="text-center text-sm text-muted-foreground">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                          type="button"
                          onClick={() => setIsSignUp(!isSignUp)}
                          className="text-primary hover:underline font-medium"
                        >
                          {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
