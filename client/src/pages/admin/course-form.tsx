import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, BookOpen, Save, Image } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Web Development", "Mobile Development", "Data Science", "Machine Learning",
  "DevOps", "Design", "Business", "Marketing", "Photography", "Music", "Other",
];

interface Course {
  id: string;
  title: string;
  shortDescription?: string;
  category: string;
  price: number;
  thumbnail?: string;
  isPublished: boolean;
}

export default function AdminCourseFormPage({ courseId }: { courseId?: string }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isEditing = !!courseId;

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("0");
  const [thumbnail, setThumbnail] = useState("");

  const { data, isLoading } = useQuery<{ course: Course }>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: isEditing,
  });

  useEffect(() => {
    if (data?.course) {
      const c = data.course;
      setTitle(c.title);
      setShortDescription(c.shortDescription ?? "");
      setCategory(c.category);
      setPrice(String(c.price));
      setThumbnail(c.thumbnail ?? "");
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        shortDescription: shortDescription.trim() || undefined,
        category,
        price: parseFloat(price) || 0,
        thumbnail: thumbnail.trim() || undefined,
      };

      if (isEditing) {
        const res = await apiRequest("PATCH", `/api/courses/${courseId}`, payload);
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/courses", payload);
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/courses/admin"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: isEditing ? "Course updated!" : "Course created!", description: "Changes saved successfully." });
      navigate("/admin/courses");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const isValid = title.trim() && category && price;

  if (isEditing && isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/courses")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit Course" : "New Course"}</h1>
          <p className="text-sm text-muted-foreground">{isEditing ? "Update course details" : "Fill in the details for your new course"}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-5">
            {/* Thumbnail Preview */}
            {thumbnail && (
              <div className="w-full h-40 rounded-lg overflow-hidden bg-muted">
                <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Complete React & Node.js Bootcamp"
                value={title}
                onChange={e => setTitle(e.target.value)}
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                placeholder="A brief overview of what students will learn..."
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                rows={3}
                data-testid="input-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="1999"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  data-testid="input-price"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <div className="flex gap-2">
                <Input
                  id="thumbnail"
                  placeholder="https://example.com/image.jpg"
                  value={thumbnail}
                  onChange={e => setThumbnail(e.target.value)}
                  className="flex-1"
                  data-testid="input-thumbnail"
                />
              </div>
              <p className="text-xs text-muted-foreground">Paste an image URL for the course thumbnail</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!isValid || saveMutation.isPending}
                className="gap-2"
                data-testid="button-save"
              >
                {saveMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4" />{isEditing ? "Update Course" : "Create Course"}</>
                )}
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/courses")} data-testid="button-cancel">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
