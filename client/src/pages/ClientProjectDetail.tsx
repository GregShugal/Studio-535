import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link, useRoute } from "wouter";
import { Loader2, ArrowLeft, MessageSquare, FileText, Image as ImageIcon, CheckCircle, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function ClientProjectDetail() {
  const { user, loading: authLoading } = useAuth();
  const [, params] = useRoute("/client/project/:id");
  const projectId = params?.id ? parseInt(params.id) : 0;

  const { data: project, isLoading } = trpc.projects.getById.useQuery(
    { id: projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: intake } = trpc.intake.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: quotes } = trpc.quotes.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: designs } = trpc.designs.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: statusUpdates } = trpc.statusUpdates.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );
  const { data: fulfillment } = trpc.fulfillment.getByProjectId.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0 }
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B6F47]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view this project</CardDescription>
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

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>This project doesn't exist or you don't have access to it</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/client-portal">
                <a>Back to My Projects</a>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has access to this project
  if (user.role !== "admin" && project.clientEmail !== user.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to view this project</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/client-portal">
                <a>Back to My Projects</a>
              </Link>
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
          <Link href="/client-portal">
            <a>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Projects
              </Button>
            </a>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2">{project.projectTitle}</h1>
              <p className="text-muted-foreground">
                Started {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className="text-sm px-4 py-2">
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
          <ProjectProgress status={project.status} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="designs">Designs</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {intake && (
                    <>
                      <div>
                        <Label>Description</Label>
                        <p className="mt-1 text-sm">{intake.rawMessage}</p>
                      </div>
                      {intake.material && (
                        <div>
                          <Label>Material</Label>
                          <p className="mt-1 text-sm">{intake.material}</p>
                        </div>
                      )}
                      {intake.dimensions && (
                        <div>
                          <Label>Dimensions</Label>
                          <p className="mt-1 text-sm">{intake.dimensions}</p>
                        </div>
                      )}
                      {intake.quantity && (
                        <div>
                          <Label>Quantity</Label>
                          <p className="mt-1 text-sm">{intake.quantity}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quote Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quotes && quotes.length > 0 ? (
                    <div className="space-y-4">
                      {quotes.map((quote: any) => (
                        <div key={quote.id} className="border-l-4 border-[#8B6F47] pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-lg">
                              ${quote.amount.toFixed(2)}
                            </span>
                            <Badge variant={quote.status === "approved" ? "default" : "secondary"}>
                              {quote.status}
                            </Badge>
                          </div>
                          {quote.notes && (
                            <p className="text-sm text-muted-foreground">{quote.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Created {new Date(quote.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Quote pending</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Designs Tab */}
          <TabsContent value="designs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Design Mockups
                </CardTitle>
                <CardDescription>Review and approve design concepts</CardDescription>
              </CardHeader>
              <CardContent>
                {designs && designs.length > 0 ? (
                  <div className="space-y-6">
                    {designs.map((design: any) => (
                      <div key={design.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{design.designTheme}</h4>
                            <p className="text-sm text-muted-foreground">
                              Revision {design.revisionNumber}
                            </p>
                          </div>
                          <Badge variant={design.status === "approved" ? "default" : "secondary"}>
                            {design.status}
                          </Badge>
                        </div>
                        {design.mockupUrl && (
                          <div className="mb-3">
                            <img
                              src={design.mockupUrl}
                              alt={design.designTheme}
                              className="w-full rounded-lg"
                            />
                          </div>
                        )}
                        {design.notes && (
                          <p className="text-sm text-muted-foreground">{design.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No designs yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Project Updates
                </CardTitle>
                <CardDescription>Communication and status updates from our team</CardDescription>
              </CardHeader>
              <CardContent>
                {statusUpdates && statusUpdates.length > 0 ? (
                  <div className="space-y-4">
                    {statusUpdates.map((update: any) => (
                      <div key={update.id} className="border-l-4 border-[#8B6F47] pl-4 py-2">
                        <p className="text-sm mb-2">{update.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(update.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No updates yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Project Messages
                </CardTitle>
                <CardDescription>Communicate directly with our team</CardDescription>
              </CardHeader>
              <CardContent>
                <MessageThread projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Shipping & Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                {fulfillment ? (
                  <div className="space-y-4">
                    {fulfillment.trackingNumber && (
                      <div>
                        <Label>Tracking Number</Label>
                        <p className="mt-1 text-sm font-mono">{fulfillment.trackingNumber}</p>
                      </div>
                    )}
                    {fulfillment.shippedDate && (
                      <div>
                        <Label>Shipped Date</Label>
                        <p className="mt-1 text-sm">
                          {new Date(fulfillment.shippedDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {fulfillment.deliveredDate && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">
                          Delivered on {new Date(fulfillment.deliveredDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Shipping information not available yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Message Thread Component
 */
function MessageThread({ projectId }: { projectId: number }) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const utils = trpc.useUtils();

  const { data: messages = [], isLoading } = trpc.messages.list.useQuery(
    { projectId },
    { enabled: !!user && projectId > 0, refetchInterval: 5000 }
  );

  const sendMessage = trpc.messages.create.useMutation({
    onSuccess: () => {
      setNewMessage("");
      utils.messages.list.invalidate({ projectId });
      toast.success("Message sent");
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage.mutate({ projectId, message: newMessage });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B6F47]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Message History */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderRole === "admin" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.senderRole === "admin"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-[#8B6F47] text-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold">{msg.senderName}</span>
                  <span className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Message Input */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1"
          rows={3}
        />
        <Button
          onClick={handleSend}
          disabled={!newMessage.trim() || sendMessage.isPending}
          className="bg-[#8B6F47] hover:bg-[#6B5437]"
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Send"
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * Project Progress Component
 */
function ProjectProgress({ status }: { status: string }) {
  const steps = [
    { id: "intake", label: "Intake" },
    { id: "design", label: "Design" },
    { id: "approval", label: "Approval" },
    { id: "production", label: "Production" },
    { id: "fulfillment", label: "Fulfillment" },
    { id: "completed", label: "Completed" },
  ];

  const currentIndex = steps.findIndex((s) => s.id === status);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                index <= currentIndex
                  ? "bg-[#8B6F47] border-[#8B6F47] text-white"
                  : "bg-white border-gray-300 text-gray-400"
              }`}
            >
              {index < currentIndex ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            <span className="text-xs mt-2 text-center">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 -z-10" />
      <div
        className="absolute top-5 left-0 h-0.5 bg-[#8B6F47] -z-10 transition-all duration-500"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
      />
    </div>
  );
}
