import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, BookOpen, IndianRupee } from "lucide-react";

interface AdminUser {
  id: string;
  userName: string;
  email: string;
  role: string;
  photoUrl?: string;
  createdAt: string;
  ordersCount: number;
  totalPaid: number;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<{ users: AdminUser[] }>({
    queryKey: ["/api/admin/users"],
  });

  const users = data?.users ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u =>
      u.userName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalRevenue = users.reduce((s, u) => s + u.totalPaid, 0);
  const paidUsers = users.filter(u => u.ordersCount > 0).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and monitor all registered users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: users.filter(u => u.role === "user").length, icon: Users, color: "text-primary" },
          { label: "Paid Users", value: paidUsers, icon: BookOpen, color: "text-green-500" },
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-orange-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      {/* Table */}
      <Card>
        <div className="rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Joined</TableHead>
                <TableHead className="font-semibold text-center">Courses</TableHead>
                <TableHead className="font-semibold text-right">Total Paid</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    {search ? "No users match your search" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.filter(u => u.role === "user").map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoUrl || undefined} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                            {user.userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{user.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium">{user.ordersCount}</span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      ₹{user.totalPaid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.ordersCount > 0 ? (
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">Paid</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
