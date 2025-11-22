"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useProject,
  useUpdateProject,
  useRegenerateApiKey,
} from "@/hooks/use-projects";
import { Copy, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.id as string;

  const { data: project, isLoading } = useProject(projectId);
  const updateMutation = useUpdateProject(projectId);
  const regenerateMutation = useRegenerateApiKey();

  const [name, setName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [domains, setDomains] = useState("");

  // Initialize form when project loads
  useState(() => {
    if (project) {
      setName(project.name);
      setWebhookUrl(project.webhookUrl || "");
      setDomains(project.allowedDomains.join(", "));
    }
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      name,
      webhookUrl: webhookUrl || undefined,
      allowedDomains: domains
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
    });
  };

  const handleRegenerateKey = async () => {
    if (
      confirm("Are you sure? The old API key will stop working immediately.")
    ) {
      await regenerateMutation.mutateAsync(projectId);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const embedCode = project
    ? `<script src="https://unpkg.com/@reactly/widget@latest/dist/widget.umd.js"></script>
<script>
  window.ReactlyWidget.init({
    projectId: "${project.id}",
    apiKey: "${project.apiKey}",
    apiUrl: "${process.env.NEXT_PUBLIC_API_URL}",
    position: "bottom-right"
  });
</script>`
    : "";

  const npmInstall = `npm install @reactly/widget`;
  const npmUsage = project
    ? `import { initFeedbackWidget } from '@reactly/widget';

initFeedbackWidget({
  projectId: '${project.id}',
  apiKey: '${project.apiKey}',
  apiUrl: '${process.env.NEXT_PUBLIC_API_URL}',
  position: 'bottom-right',
  theme: {
    primaryColor: '#8b5cf6',
  }
});`
    : "";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {project.name}
            <Badge variant={project.isActive ? "default" : "secondary"}>
              {project.isActive ? "Active" : "Inactive"}
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Configure your project settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
          <TabsTrigger value="api">API Key</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Update your project configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook">
                    Discord Webhook URL (Optional)
                  </Label>
                  <Input
                    id="webhook"
                    type="url"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get notified on Discord when negative feedback is received
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domains">Allowed Domains (Optional)</Label>
                  <Input
                    id="domains"
                    placeholder="example.com, app.example.com"
                    value={domains}
                    onChange={(e) => setDomains(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of domains where the widget can be
                    embedded. Leave empty to allow all domains.
                  </p>
                </div>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Script Tag (Quick Start)</CardTitle>
              <CardDescription>
                Copy and paste this code before the closing &lt;/body&gt; tag
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{embedCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(embedCode, "Embed code")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Ready to use!</p>
                  <p className="text-green-700 mt-1">
                    Paste this code into your HTML and the widget will
                    automatically appear.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NPM Package (Advanced)</CardTitle>
              <CardDescription>
                Install the widget as an NPM package for React/Next.js apps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Install
                </Label>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{npmInstall}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      copyToClipboard(npmInstall, "Install command")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Usage</Label>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{npmUsage}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(npmUsage, "Usage code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Key</CardTitle>
              <CardDescription>
                Use this key to authenticate API requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={project.apiKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(project.apiKey, "API key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Keep your API key secure!</strong> Don't commit it to
                  version control or expose it in client-side code.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleRegenerateKey}
                disabled={regenerateMutation.isPending}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate API Key
              </Button>
              <p className="text-xs text-muted-foreground">
                Regenerating will invalidate the old key immediately. Update
                your widget configuration after regenerating.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
