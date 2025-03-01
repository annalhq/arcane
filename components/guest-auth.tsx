"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, LogOut } from "lucide-react";
import {
  generateGuestUsername,
  setGuestSession,
  getGuestSession,
  clearGuestSession,
} from "@/lib/utils";

interface GuestAuthProps {
  redirectTo?: string;
}

export function GuestAuth({ redirectTo = "/" }: GuestAuthProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getGuestSession();
    if (session.isAuthenticated && session.username) {
      setUsername(session.username);
    }
  }, []);

  const handleGuestSignIn = () => {
    setIsLoading(true);
    const guestUsername = generateGuestUsername();
    setGuestSession(guestUsername);
    setUsername(guestUsername);

    if (redirectTo) {
      router.push(redirectTo);
    }

    setIsLoading(false);
  };

  const handleSignOut = () => {
    clearGuestSession();
    setUsername(null);
    router.push("/login");
  };

  if (username) {
    return (
      <Card className="w-full max-w-md mx-auto theme-transition">
        <CardHeader>
          <CardTitle className="text-center">Welcome, Guest!</CardTitle>
          <CardDescription className="text-center">
            You are signed in as a guest user
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="guest-avatar w-16 h-16 text-xl">
            {username.charAt(0)}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-center">{username}</p>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto theme-transition">
      <CardHeader>
        <CardTitle className="text-center">Guest Access</CardTitle>
        <CardDescription className="text-center">
          Continue as a guest to browse the content library
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          onClick={handleGuestSignIn}
          disabled={isLoading}
        >
          <User className="h-4 w-4 mr-2" />
          {isLoading ? "Signing in..." : "Sign in as Guest"}
        </Button>
      </CardContent>
    </Card>
  );
}
