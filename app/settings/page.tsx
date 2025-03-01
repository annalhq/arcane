"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSession, signOut } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGuestSession, clearGuestSession } from "@/lib/utils";

export default function SettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const guestSession = getGuestSession();
  const isAuthenticated = !!session || guestSession.isAuthenticated;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    if (session) {
      await signOut({ redirect: true, callbackUrl: "/login" });
    } else if (guestSession.isAuthenticated) {
      clearGuestSession();
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background theme-transition">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "ml-0 lg:ml-16"
        }`}
      >
        <header className="border-b sticky top-0 bg-background z-10 theme-transition">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-medium">Settings</h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <Tabs defaultValue="account" className="space-y-4">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4">
              <Card className="theme-transition">
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Manage your account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Name</p>
                        <p className="text-sm text-muted-foreground">
                          {session.user?.name || "Not provided"}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="mt-4"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </Button>
                    </div>
                  ) : guestSession.isAuthenticated ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Guest Username</p>
                        <p className="text-sm text-muted-foreground">
                          {guestSession.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="guest-avatar w-10 h-10 text-sm">
                          {guestSession.username?.charAt(0)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          You are signed in as a guest user
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="mt-4"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        You are not signed in.
                      </p>
                      <Button
                        onClick={() => router.push("/login")}
                        className="mt-4"
                      >
                        Sign in
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card className="theme-transition">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize the appearance of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Theme</p>
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <span className="text-sm text-muted-foreground">
                        Toggle between light and dark mode
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              <Card className="theme-transition">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                  <CardDescription>
                    made with ❤️ by annalhq
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Content Library</p>
                    <p className="text-sm text-muted-foreground">
                      Version 1.0.0
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">
                      A minimalist personal content management system for
                      organizing and sharing resources.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
