import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Tag,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const studentItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Profile", url: "/profile", icon: UserCircle },
];

const adminItems = [
  { title: "My Courses", url: "/admin/courses", icon: BookOpen },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Coupons", url: "/admin/coupons", icon: Tag },
  { title: "Profile", url: "/profile", icon: UserCircle },
];

export function AppSidebar() {
  const [location, navigate] = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const items = user?.role === "admin" ? adminItems : studentItems;

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
    toast({ title: "Signed out successfully" });
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex flex-col gap-1">
          <img
            src="/logo.png"
            alt="Zalgo Edutech"
            className="h-9 w-auto object-contain object-left"
          />
          <span className="text-xs text-muted-foreground capitalize pl-0.5">{user?.role ?? "user"}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{user?.role === "admin" ? "Admin Panel" : "Navigation"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url || location.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      <Link to={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {user?.userName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.userName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} data-testid="button-signout">
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
