import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Bot, User, Loader2, Clock } from "lucide-react";
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

interface StudentThread {
  studentId: string;
  studentName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function AdminChatPage() {
  const qc = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const { data: studentsData, isLoading: studentsLoading } = useQuery<{ students: StudentThread[] }>({
    queryKey: ["/api/chat/students"],
    refetchInterval: 8000,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ["/api/chat/messages"],
    refetchInterval: 5000,
  });

  const students = studentsData?.students ?? [];
  const allMessages = messagesData?.messages ?? [];
  const threadMessages = selectedStudent
    ? allMessages.filter(m => m.studentId === selectedStudent)
    : [];

  const selectedStudentInfo = students.find(s => s.studentId === selectedStudent);

  const replyMutation = useMutation({
    mutationFn: async ({ content, studentId }: { content: string; studentId: string }) => {
      const res = await apiRequest("POST", "/api/chat/messages", { content, studentId });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      qc.invalidateQueries({ queryKey: ["/api/chat/students"] });
      setReply("");
    },
  });

  const handleSend = () => {
    const text = reply.trim();
    if (!text || !selectedStudent || replyMutation.isPending) return;
    replyMutation.mutate({ content: text, studentId: selectedStudent });
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
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Student Chats</h1>
                <p className="text-sm text-muted-foreground">Respond to student doubts and questions</p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 97px)" }}>
            {/* Student list */}
            <div className="w-72 border-r border-border flex flex-col flex-shrink-0">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Conversations ({students.length})
                </p>
              </div>
              <ScrollArea className="flex-1">
                {studentsLoading ? (
                  <div className="p-3 space-y-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                  </div>
                ) : students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 p-4">
                    <MessageCircle className="w-8 h-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground text-center">No student messages yet</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {students.map(s => (
                      <button
                        key={s.studentId}
                        onClick={() => setSelectedStudent(s.studentId)}
                        className={cn(
                          "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                          selectedStudent === s.studentId ? "bg-primary/10" : "hover:bg-muted/60"
                        )}
                        data-testid={`chat-student-${s.studentId}`}
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                          {getInitials(s.studentName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-medium text-foreground truncate">{s.studentName}</p>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatTime(s.lastTime)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{s.lastMessage}</p>
                          {s.unread > 0 && (
                            <Badge className="mt-1 h-4 px-1.5 text-[10px] bg-primary text-primary-foreground">{s.unread} new</Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat thread */}
            <div className="flex-1 flex flex-col">
              {!selectedStudent ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Select a conversation</p>
                    <p className="text-sm text-muted-foreground mt-1">Choose a student from the left to view and reply to their doubts.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Thread header */}
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                      {selectedStudentInfo ? getInitials(selectedStudentInfo.studentName) : "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{selectedStudentInfo?.studentName ?? "Student"}</p>
                      <p className="text-xs text-muted-foreground">{threadMessages.length} messages</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-5">
                    {messagesLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
                      </div>
                    ) : threadMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-muted-foreground">No messages in this conversation yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {threadMessages.map(msg => {
                          const isAdmin = msg.isFromAdmin;
                          return (
                            <div key={msg.id} className={cn("flex gap-2.5", isAdmin ? "flex-row-reverse" : "flex-row")}>
                              <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold",
                                isAdmin ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
                              )}>
                                {isAdmin ? <Bot className="w-3.5 h-3.5 text-primary" /> : getInitials(msg.studentName)}
                              </div>
                              <div className={cn("max-w-[70%] flex flex-col gap-1", isAdmin ? "items-end" : "items-start")}>
                                <div className={cn(
                                  "rounded-2xl px-4 py-2.5 text-sm",
                                  isAdmin
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "bg-muted text-foreground rounded-tl-sm"
                                )}>
                                  {msg.content}
                                </div>
                                <span className="text-[10px] text-muted-foreground px-1 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {formatTime(msg.timestamp)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Reply box */}
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2 items-end">
                      <Textarea
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Reply to ${selectedStudentInfo?.studentName ?? "student"}...`}
                        className="resize-none text-sm flex-1 min-h-[42px] max-h-28"
                        rows={1}
                        data-testid="input-admin-reply"
                      />
                      <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!reply.trim() || replyMutation.isPending}
                        className="h-10 w-10 flex-shrink-0"
                        data-testid="button-admin-send"
                      >
                        {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
