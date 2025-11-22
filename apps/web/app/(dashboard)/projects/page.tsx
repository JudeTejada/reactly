"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  useProjects,
  useCreateProject,
  useToggleProjectActive,
  useDeleteProject,
} from "@/hooks/use-projects";
import { Plus, FolderKanban, Settings, Trash2, Copy, Check, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: projects, isLoading } = useProjects();
  const createMutation = useCreateProject();
  const toggleMutation = useToggleProjectActive();
  const deleteMutation = useDeleteProject();
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    await createMutation.mutateAsync({
      name: projectName,
      allowedDomains: [],
    });
    setProjectName("");
    setIsCreateOpen(false);
  };

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const copyToClipboard = async (text: string, label: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your feedback collection projects</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a project to start collecting feedback. You&apos;ll get an API key and embeddable widget.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Awesome App"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-none shadow-sm bg-card animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-32" />
                <div className="h-4 bg-muted rounded w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !projects?.length ? (
        <Card className="border-dashed shadow-none bg-muted/30">
          <CardContent className="pt-12 pb-12">
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create your first project to start collecting and analyzing feedback."
              action={{
                label: "Create Project",
                onClick: () => setIsCreateOpen(true),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="group hover:shadow-md transition-shadow duration-200 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      {project.name}
                    </CardTitle>
                    <CardDescription>
                       Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                   <Badge variant={project.isActive ? "default" : "secondary"} className="rounded-sm">
                        {project.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      <span>Project ID</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/50 border px-3 py-2">
                        <code className="text-xs font-mono">{project.id}</code>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mr-2 hover:bg-muted"
                            onClick={() => copyToClipboard(project.id, "Project ID", `id-${project.id}`)}
                        >
                            {copiedId === `id-${project.id}` ? (
                                <Check className="h-3 w-3 text-green-600" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      <span>API Key</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/50 border px-3 py-2">
                        <code className="text-xs font-mono truncate max-w-[200px]">{project.apiKey}</code>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mr-2 hover:bg-muted"
                            onClick={() => copyToClipboard(project.apiKey, "API Key", `key-${project.id}`)}
                        >
                            {copiedId === `key-${project.id}` ? (
                                <Check className="h-3 w-3 text-green-600" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-9">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleToggle(project.id)}>
                                {project.isActive ? "Deactivate Project" : "Activate Project"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(project.id, project.name)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}