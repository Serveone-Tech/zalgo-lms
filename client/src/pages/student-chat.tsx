import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Bot, Loader2, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  isFromAdmin: boolean;
  timestamp: string;
  isRead: boolean;
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function StudentChatPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ["/api/chat/messages"],
    refetchInterval: 5000,
  });

  const messages = data?.messages ?? [];

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat/messages", { content });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      qc.invalidateQueries({ queryKey: ["/api/chat/unread"] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || sendMutation.isPending) return;
    sendMutation.mutate(text);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Chat with Mentor</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm text-muted-foreground">Mentor online — replies within a few hours</p>
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div className="mx-6 mt-4 p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Ask any doubt about your course content, concepts, or assignments. Your mentor will reply as soon as possible. Press <kbd className="px-1 py-0.5 rounded bg-muted text-xs font-mono">Enter</kbd> to send.
            </p>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
            ref={scrollRef}
            style={{ minHeight: 0 }}
          >
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "" : "flex-row-reverse")}>
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <Skeleton className="h-14 w-64 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start a conversation by typing your doubt below.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = !msg.isFromAdmin;
                return (
                  <div key={msg.id} className={cn("flex gap-3 max-w-3xl", isOwn ? "ml-auto flex-row-reverse" : "mr-auto")}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold",
                      isOwn ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
                    )}>
                      {isOwn ? (
                        <span>{user?.userName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                      ) : (
                        <Bot className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
                      <p className="text-xs text-muted-foreground px-1">
                        {isOwn ? "You" : "Mentor"}
                      </p>
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm max-w-sm lg:max-w-lg",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      )}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-border">
            <div className="flex gap-3 items-end max-w-3xl">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your doubt or question here..."
                className="resize-none text-sm flex-1 min-h-[48px] max-h-32"
                rows={1}
                data-testid="input-student-chat-message"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || sendMutation.isPending}
                className="h-12 w-12 flex-shrink-0"
                data-testid="button-student-chat-send"
              >
                {sendMutation.isPending
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <Send className="w-5 h-5" />
                }
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Shift+Enter for new line • Enter to send
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
