"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/constants";
import { CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();

  // For demo purposes, assume free plan. In production, fetch from backend
  const currentPlan = "free" as const;
  const planDetails = PLAN_LIMITS[currentPlan];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your personal information from Clerk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base">{user?.fullName || "Not set"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                User ID
              </p>
              <p className="text-base font-mono text-xs">{user?.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Joined
              </p>
              <p className="text-base">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your subscription details and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="default" className="text-lg py-1 px-4">
              {currentPlan.toUpperCase()}
            </Badge>
            {currentPlan === "free" && (
              <Button variant="outline">Upgrade to Pro</Button>
            )}
          </div>
          <div className="space-y-2 pt-4">
            <p className="text-sm font-medium">Plan Limits:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>
                  {typeof planDetails.projects === "number" &&
                  planDetails.projects < 0
                    ? "Unlimited projects"
                    : `${planDetails.projects} project${planDetails.projects > 1 ? "s" : ""}`}
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>
                  {typeof planDetails.feedback === "number" &&
                  planDetails.feedback < 0
                    ? "Unlimited feedback"
                    : `${planDetails.feedback.toLocaleString()} feedback items/month`}
                </span>
              </li>
              {planDetails.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Contact support to request account deletion
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
