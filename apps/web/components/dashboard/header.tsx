"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { data: projects } = useProjects();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex flex-1 items-center gap-4">
        {projects && projects.length > 0 ? (
          <Select defaultValue={projects[0]?.id}>
            <SelectTrigger className="w-[200px] border-none bg-transparent shadow-none focus:ring-0 hover:bg-accent/50 h-9 px-2 font-medium">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm text-muted-foreground font-medium px-2">No projects</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden sm:flex gap-2 h-9" onClick={() => router.push('/projects')}>
           <Plus className="h-3.5 w-3.5" />
           <span>New Project</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 border-l pl-4 ml-2">
            <UserButton afterSignOutUrl="/" appearance={{
                elements: {
                    avatarBox: "h-8 w-8"
                }
            }}/>
        </div>
      </div>
    </header>
  );
}