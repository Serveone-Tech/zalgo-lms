import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Star, BookOpen, GraduationCap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalCompleted: number;
  coursesCompleted: number;
  points: number;
}

const rankColors = [
  "from-yellow-400 to-yellow-500",
  "from-gray-300 to-gray-400",
  "from-orange-400 to-orange-500",
];

const rankBg = [
  "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900",
  "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700",
  "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900",
];

const trophyColors = ["text-yellow-500", "text-gray-400", "text-orange-500"];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-orange-500" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ["/api/leaderboard"],
  });

  const leaderboard = data?.leaderboard ?? [];
  const myRank = leaderboard.findIndex(e => e.userId === user?.id) + 1;
  const myEntry = leaderboard.find(e => e.userId === user?.id);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-background">
          {/* Hero */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border px-6 py-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="w-7 h-7 text-yellow-500" />
                <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
              </div>
              <p className="text-muted-foreground text-sm">Top learners on Zalgo Edutech — ranked by points earned through completing lectures and courses.</p>
              {myEntry && (
                <div className="mt-5 inline-flex items-center gap-3 bg-background border border-border rounded-full px-5 py-2.5 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{getInitials(myEntry.userName)}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Your rank:</span>
                  <Badge className="bg-primary text-primary-foreground">#{myRank}</Badge>
                  <span className="text-sm text-muted-foreground">{myEntry.points} pts</span>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No learners yet. Start completing courses to appear here!</p>
              </div>
            ) : (
              <>
                {/* Top 3 podium */}
                {top3.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    {[1, 0, 2].map(i => {
                      const entry = top3[i];
                      if (!entry) return <div key={i} />;
                      const rank = i + 1;
                      const isMe = entry.userId === user?.id;
                      return (
                        <div
                          key={entry.userId}
                          className={cn(
                            "relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                            i === 0 ? "mt-4" : "",
                            rankBg[i],
                            isMe ? "ring-2 ring-primary ring-offset-1" : ""
                          )}
                          data-testid={`leaderboard-top-${rank}`}
                        >
                          {isMe && (
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">You</Badge>
                          )}
                          <div className={cn(
                            "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mb-2 text-white font-bold text-sm shadow-md",
                            rankColors[i]
                          )}>
                            {getInitials(entry.userName)}
                          </div>
                          <p className="font-semibold text-sm text-foreground text-center truncate w-full text-center">{entry.userName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className={cn("w-3.5 h-3.5", trophyColors[i])} />
                            <span className="text-sm font-bold text-foreground">{entry.points}</span>
                            <span className="text-xs text-muted-foreground">pts</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5"><BookOpen className="w-3 h-3" />{entry.totalCompleted}</span>
                            <span className="flex items-center gap-0.5"><GraduationCap className="w-3 h-3" />{entry.coursesCompleted}</span>
                          </div>
                          <div className="absolute -top-2 -right-2">
                            <RankBadge rank={rank} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Rest of leaderboard */}
                {rest.length > 0 && (
                  <div className="space-y-2">
                    {rest.map((entry, i) => {
                      const rank = i + 4;
                      const isMe = entry.userId === user?.id;
                      return (
                        <div
                          key={entry.userId}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card transition-all hover:shadow-sm",
                            isMe ? "border-primary/40 bg-primary/5" : ""
                          )}
                          data-testid={`leaderboard-row-${rank}`}
                        >
                          <div className="w-8 text-center flex-shrink-0">
                            <RankBadge rank={rank} />
                          </div>
                          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-foreground">{getInitials(entry.userName)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-foreground truncate">{entry.userName}</p>
                              {isMe && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/50 text-primary">You</Badge>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-0.5"><BookOpen className="w-3 h-3" />{entry.totalCompleted} lectures</span>
                              <span className="flex items-center gap-0.5"><GraduationCap className="w-3 h-3" />{entry.coursesCompleted} courses</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-sm text-foreground">{entry.points}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Points info */}
                <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border">
                  <p className="text-xs font-semibold text-foreground mb-2">How points are calculated</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-primary" /><span>10 pts per lecture completed</span></div>
                    <div className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-primary" /><span>100 pts per course completed</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
