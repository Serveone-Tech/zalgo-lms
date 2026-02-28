import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
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
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatWidget() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ["/api/chat/messages"],
    refetchInterval: open ? 4000 : false,
    enabled: !!user && user.role !== "admin",
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/chat/unread"],
    refetchInterval: 10000,
    enabled: !!user && user.role !== "admin",
  });

  const messages = data?.messages ?? [];
  const unread = unreadData?.count ?? 0;

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
    if (open) {
      qc.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      qc.invalidateQueries({ queryKey: ["/api/chat/unread"] });
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, open]);

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

  if (!user || user.role === "admin") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-80 sm:w-96 bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: 460 }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Ask Your Mentor</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                <p className="text-xs text-primary-foreground/80">Mentor available</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
              onClick={() => setOpen(false)}
              data-testid="button-chat-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Start a conversation</p>
                  <p className="text-xs text-muted-foreground mt-1">Ask your mentor any doubt about the course content.</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = !msg.isFromAdmin;
                return (
                  <div key={msg.id} className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
                    {!isOwn && (
                      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div className={cn("max-w-[75%] flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
                      <div className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-sm",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="resize-none text-sm min-h-[38px] max-h-24 flex-1"
                rows={1}
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || sendMutation.isPending}
                className="flex-shrink-0 h-9 w-9"
                data-testid="button-chat-send"
              >
                {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Press Enter to send • Shift+Enter for new line</p>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <Button
        size="icon"
        className="w-14 h-14 rounded-full shadow-lg text-primary-foreground relative"
        onClick={() => setOpen(v => !v)}
        data-testid="button-chat-toggle"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full">
            {unread > 9 ? "9+" : unread}
          </Badge>
        )}
      </Button>
    </div>
  );
}
