import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      setLocation("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2" data-testid="text-branding-title">
            ARKA SERVICES
          </h1>
          <p className="text-muted-foreground text-lg" data-testid="text-branding-domain">
            arka.pk
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle data-testid="text-login-title">Login</CardTitle>
            <CardDescription data-testid="text-login-description">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMutation.isError && (
                <Alert variant="destructive" data-testid="alert-login-error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription data-testid="text-error-message">
                    {loginMutation.error instanceof Error
                      ? loginMutation.error.message
                      : "Invalid username or password"}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" data-testid="label-username">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={loginMutation.isPending}
                  data-testid="input-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" data-testid="label-password">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loginMutation.isPending}
                  data-testid="input-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6" data-testid="text-footer">
          Project Management System
        </p>
      </div>
    </div>
  );
}
