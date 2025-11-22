"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/constants";
import { CheckCircle2, ShieldAlert, User, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();

  // For demo purposes, assume free plan. In production, fetch from backend
  const currentPlan = "free" as const;
  const planDetails = PLAN_LIMITS[currentPlan];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
             </div>
             <div className="space-y-1">
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal information from Clerk</CardDescription>
             </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</p>
                <p className="text-sm font-medium">{user?.fullName || "Not set"}</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</p>
                <p className="text-xs font-mono text-muted-foreground break-all">{user?.id}</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</p>
                <p className="text-sm font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                 <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                    <CreditCard className="h-5 w-5" />
                 </div>
                 <div className="space-y-1">
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Your subscription details and limits</CardDescription>
                 </div>
            </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border/40 pb-6 mb-6">
               <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold capitalize">{currentPlan} Plan</h3>
                         <Badge variant="secondary" className="rounded-full px-3">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">You are currently on the {currentPlan} tier.</p>
               </div>
               {currentPlan === "free" && (
                <Button className="shrink-0">Upgrade to Pro</Button>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">Plan Features:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 text-sm p-3 rounded-md bg-green-500/5 text-foreground/80">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <span>
                    {typeof planDetails.projects === "number" && planDetails.projects < 0
                      ? "Unlimited projects"
                      : `${planDetails.projects} project${planDetails.projects > 1 ? "s" : ""}`}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm p-3 rounded-md bg-green-500/5 text-foreground/80">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <span>
                    {typeof planDetails.feedback === "number" && planDetails.feedback < 0
                      ? "Unlimited feedback"
                      : `${planDetails.feedback.toLocaleString()} feedback items/month`}
                  </span>
                </div>
                {planDetails.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm p-3 rounded-md bg-green-500/5 text-foreground/80">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                 <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <ShieldAlert className="h-5 w-5" />
                 </div>
                 <div className="space-y-1">
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription className="text-destructive/70">Irreversible actions for your account</CardDescription>
                 </div>
            </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-destructive/20 bg-background/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" disabled className="shrink-0">
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-destructive/60 mt-4 text-center sm:text-left">
              * Contact support to request account deletion
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}