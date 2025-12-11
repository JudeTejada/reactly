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



      
      </div>
    </div>
  );
}