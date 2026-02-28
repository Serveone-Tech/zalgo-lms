import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, UserCircle, Mail, Shield, BookOpen, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface UserProfile {
  id: string;
  userName: string;
  email: string;
  role: string;
  photoUrl?: string;
  description?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ user: UserProfile }>({
    queryKey: ["/api/users/me"],
  });

  const profile = data?.user;
  const [userName, setUserName] = useState(profile?.userName ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");

  const initials = (profile?.userName ?? "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/users/me", { userName, description });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message);
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/users/me"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Separator />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account information</p>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.photoUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-lg text-foreground">{profile.userName}</h2>
                  <Badge variant={profile.role === "admin" ? "default" : "secondary"} className="text-xs capitalize">
                    {profile.role === "admin" ? (
                      <><Shield className="w-3 h-3 mr-1" />Admin</>
                    ) : profile.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {profile.email}
                </p>
                {profile.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  value={userName || profile.userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Your full name"
                  data-testid="input-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="opacity-60"
                  data-testid="input-email"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Bio</Label>
                <Textarea
                  id="description"
                  value={description !== undefined ? description : (profile.description ?? "")}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  data-testid="input-description"
                />
              </div>

              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="gap-2"
                data-testid="button-save"
              >
                {updateMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4" />Save Changes</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
