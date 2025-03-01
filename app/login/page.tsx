"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { GuestAuth } from "@/components/guest-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGuestSession } from "@/lib/utils";

export default function LoginPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check NextAuth session
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          router.push("/");
          return;
        }

        // Check guest session
        const guestSession = getGuestSession();
        if (guestSession.isAuthenticated) {
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background theme-transition">
        <div className="w-full max-w-md text-center">
          <p className="text-muted-foreground">checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background theme-transition">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Admin Login</TabsTrigger>
            <TabsTrigger value="guest">Guest Access</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="guest">
            <GuestAuth redirectTo="/" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
