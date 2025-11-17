import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Loader2, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function ClientPortal() {
  const { user, loading: authLoading } = useAuth();

  const { data: projects, isLoading } = trpc.projects.getMyProjects.useQuery(undefined, {
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B6F47]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Client Portal</CardTitle>
            <CardDescription>Sign in to view your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-[#8B6F47] hover:bg-[#6B5437]">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-serif font-bold text-[#8B6F47]">Studio 535</a>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Link href="/">
              <a>
                <Button variant="outline" size="sm">
                  Back to Home
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">My Projects</h1>
          <p className="text-muted-foreground">
            Track the progress of your custom projects with Studio 535
          </p>
        </div>

        {/* Projects Grid */}
        {!projects || projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any projects with us yet. Ready to start?
              </p>
              <Button asChild className="bg-[#8B6F47] hover:bg-[#6B5437]">
                <Link href="/request-quote">
                  <a>Request a Quote</a>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: any) => (
              <Link key={project.id} href={`/client/project/${project.id}`}>
                <a>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{project.projectTitle}</CardTitle>
                          <CardDescription className="text-xs">
                            Started {new Date(project.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          Last updated {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="pt-2">
                          <ProgressBar status={project.status} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }
  > = {
    intake: { label: "Intake", variant: "secondary", icon: Clock },
    design: { label: "Design", variant: "default", icon: Clock },
    approval: { label: "Approval", variant: "outline", icon: Clock },
    production: { label: "Production", variant: "default", icon: Package },
    fulfillment: { label: "Fulfillment", variant: "default", icon: Package },
    completed: { label: "Completed", variant: "default", icon: CheckCircle },
    cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.intake;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

/**
 * Progress Bar Component
 */
function ProgressBar({ status }: { status: string }) {
  const steps = ["intake", "design", "approval", "production", "fulfillment", "completed"];
  const currentIndex = steps.indexOf(status);
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-[#8B6F47] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
