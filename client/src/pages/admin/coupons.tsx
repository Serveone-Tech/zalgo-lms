import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Trash2, Tag, Loader2, Copy, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountPercent: number;
  isActive: boolean;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  createdAt: string;
}

const defaultForm = {
  code: "",
  title: "",
  description: "",
  discountPercent: "10",
  isActive: true,
  expiresAt: "",
  usageLimit: "",
};

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<{ open: boolean; coupon?: Coupon }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ coupons: Coupon[] }>({
    queryKey: ["/api/coupons"],
  });

  const coupons = data?.coupons ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return coupons.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q)
    );
  }, [coupons, search]);

  const openAdd = () => {
    setForm(defaultForm);
    setDialog({ open: true });
  };

  const openEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description ?? "",
      discountPercent: String(coupon.discountPercent),
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
    });
    setDialog({ open: true, coupon });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        discountPercent: parseFloat(form.discountPercent),
        isActive: form.isActive,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
      };
      if (dialog.coupon) {
        const res = await apiRequest("PATCH", `/api/coupons/${dialog.coupon.id}`, payload);
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/coupons", payload);
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/coupons"] });
      setDialog({ open: false });
      toast({ title: dialog.coupon ? "Coupon updated" : "Coupon created" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      const res = await apiRequest("DELETE", `/api/coupons/${deleteTarget.id}`, {});
      if (!res.ok) throw new Error((await res.json()).message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/coupons"] });
      toast({ title: "Coupon deleted" });
      setDeleteTarget(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isFormValid = form.code.trim() && form.title.trim() && parseFloat(form.discountPercent) > 0;

  const activeCoupons = coupons.filter(c => c.isActive).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage discount coupons for your courses</p>
        </div>
        <Button onClick={openAdd} className="gap-2 self-start sm:self-auto" data-testid="button-add-coupon">
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Coupons", value: coupons.length },
          { label: "Active", value: activeCoupons },
          { label: "Total Used", value: coupons.reduce((s, c) => s + c.usedCount, 0) },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary">
                <Tag className="w-4 h-4" />
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
          placeholder="Search coupons..."
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
                <TableHead className="font-semibold">Code</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold text-center">Discount</TableHead>
                <TableHead className="font-semibold text-center">Usage</TableHead>
                <TableHead className="font-semibold">Expires</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Tag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">{search ? "No coupons match your search" : "No coupons created yet"}</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  const isExhausted = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

                  return (
                    <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm bg-muted px-2 py-0.5 rounded">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            data-testid={`button-copy-${coupon.id}`}
                          >
                            {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{coupon.title}</p>
                          {coupon.description && <p className="text-xs text-muted-foreground">{coupon.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-semibold">{coupon.discountPercent}% off</Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-center">
                        {!coupon.isActive || isExpired || isExhausted ? (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => openEdit(coupon)}
                            data-testid={`button-edit-${coupon.id}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => setDeleteTarget(coupon)}
                            data-testid={`button-delete-${coupon.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open} onOpenChange={open => !open && setDialog({ open: false })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog.coupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  placeholder="SAVE20"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="font-mono uppercase"
                  data-testid="input-code"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount % *</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="10"
                  value={form.discountPercent}
                  onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                  data-testid="input-discount"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Welcome Offer"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                data-testid="input-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="20% off on all courses"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                data-testid="input-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  data-testid="input-expiry"
                />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={form.usageLimit}
                  onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                  data-testid="input-usage-limit"
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <Label className="cursor-pointer">Active</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={val => setForm(f => ({ ...f, isActive: val }))}
                data-testid="switch-active"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!isFormValid || saveMutation.isPending}
              data-testid="button-save-coupon"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (dialog.coupon ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              Coupon "{deleteTarget?.code}" will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
