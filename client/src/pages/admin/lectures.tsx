import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, ChevronDown, ChevronRight, Video, Trash2, Pencil,
  Loader2, Layers, Play, Upload, Link, CheckCircle2, CloudUpload,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Lecture { id: string; title: string; videoUrl?: string; duration: number; order: number; }
interface Module { id: string; title: string; order: number; lectures: Lecture[]; }
interface Course { id: string; title: string; category: string; }

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

async function uploadToCloudinary(file: File, onProgress: (p: number) => void): Promise<{ url: string; duration: number }> {
  const sigRes = await apiRequest("GET", "/api/upload/signature");
  if (!sigRes.ok) {
    const err = await sigRes.json();
    throw new Error(err.message ?? "Failed to get upload signature");
  }
  const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("api_key", apiKey);
  formData.append("resource_type", "video");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({ url: data.secure_url, duration: Math.round(data.duration ?? 0) });
      } else {
        reject(new Error("Upload failed. Please try again."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });
}

export default function AdminLecturesPage({ courseId }: { courseId: string }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);

  const [lectureDialog, setLectureDialog] = useState<{ open: boolean; moduleId: string; lecture?: Lecture }>({ open: false, moduleId: "" });
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureUrl, setLectureUrl] = useState("");
  const [lectureDuration, setLectureDuration] = useState("0");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{ type: "module" | "lecture"; id: string; name: string } | null>(null);

  const { data: courseData } = useQuery<{ course: Course }>({ queryKey: [`/api/courses/${courseId}`] });
  const { data, isLoading } = useQuery<{ modules: Module[] }>({ queryKey: [`/api/courses/${courseId}/modules`] });

  const modules = data?.modules ?? [];
  const course = courseData?.course;
  const totalLectures = modules.reduce((s, m) => s + m.lectures.length, 0);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({ title: "Invalid file", description: "Please select a video file.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setUploadDone(false);
    try {
      const { url, duration } = await uploadToCloudinary(file, setUploadProgress);
      setLectureUrl(url);
      setLectureDuration(String(duration));
      setUploadDone(true);
      toast({ title: "Video uploaded!", description: "Video uploaded to Cloudinary successfully." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const addModuleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/modules`, { title: newModuleTitle.trim() });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [`/api/courses/${courseId}/modules`] });
      setExpandedModules(prev => new Set([...prev, data.module.id]));
      setNewModuleTitle(""); setAddingModule(false);
      toast({ title: "Module added" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const saveLectureMutation = useMutation({
    mutationFn: async () => {
      const payload = { title: lectureTitle.trim(), videoUrl: lectureUrl.trim() || undefined, duration: parseInt(lectureDuration) || 0 };
      if (lectureDialog.lecture) {
        const res = await apiRequest("PATCH", `/api/lectures/${lectureDialog.lecture.id}`, payload);
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
      } else {
        const res = await apiRequest("POST", `/api/modules/${lectureDialog.moduleId}/lectures`, payload);
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/courses/${courseId}/modules`] });
      setLectureDialog({ open: false, moduleId: "" });
      setLectureTitle(""); setLectureUrl(""); setLectureDuration("0");
      setUploadDone(false); setUploadProgress(0);
      toast({ title: lectureDialog.lecture ? "Lecture updated" : "Lecture added" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      const url = deleteTarget.type === "module" ? `/api/modules/${deleteTarget.id}` : `/api/lectures/${deleteTarget.id}`;
      const res = await apiRequest("DELETE", url, {});
      if (!res.ok) throw new Error((await res.json()).message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/courses/${courseId}/modules`] });
      toast({ title: "Deleted successfully" }); setDeleteTarget(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openEditLecture = (moduleId: string, lecture: Lecture) => {
    setLectureTitle(lecture.title); setLectureUrl(lecture.videoUrl ?? "");
    setLectureDuration(String(lecture.duration)); setUploadDone(false);
    setLectureDialog({ open: true, moduleId, lecture });
  };

  const openAddLecture = (moduleId: string) => {
    setLectureTitle(""); setLectureUrl(""); setLectureDuration("0"); setUploadDone(false);
    setLectureDialog({ open: true, moduleId });
  };

  const closeLectureDialog = () => {
    setLectureDialog({ open: false, moduleId: "" });
    setUploadDone(false); setUploadProgress(0); setIsUploading(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/courses")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{course?.title ?? "Course Content"}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{modules.length} modules</span>
            <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" />{totalLectures} lectures</span>
          </div>
        </div>
      </div>

      {/* Add Module */}
      <Card>
        <CardContent className="p-4">
          {!addingModule ? (
            <Button variant="outline" className="w-full gap-2 h-11 border-dashed" onClick={() => setAddingModule(true)} data-testid="button-add-module">
              <Plus className="w-4 h-4" /> Add New Module
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input placeholder="Module title, e.g., Getting Started" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && newModuleTitle.trim() && addModuleMutation.mutate()} autoFocus className="flex-1" data-testid="input-module-title" />
              <Button onClick={() => addModuleMutation.mutate()} disabled={!newModuleTitle.trim() || addModuleMutation.isPending} data-testid="button-save-module">
                {addModuleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
              </Button>
              <Button variant="ghost" onClick={() => { setAddingModule(false); setNewModuleTitle(""); }}>Cancel</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modules */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : modules.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="font-medium">No modules yet</p><p className="text-sm text-muted-foreground mt-1">Add a module above to organize your lectures</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            return (
              <Card key={module.id} data-testid={`module-${module.id}`}>
                <Collapsible open={isExpanded} onOpenChange={() => {
                  setExpandedModules(prev => { const next = new Set(prev); next.has(module.id) ? next.delete(module.id) : next.add(module.id); return next; });
                }}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center gap-3 p-4 text-left">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{module.title}</p>
                        <p className="text-xs text-muted-foreground">{module.lectures.length} lecture{module.lectures.length !== 1 ? "s" : ""}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={e => { e.stopPropagation(); setDeleteTarget({ type: "module", id: module.id, name: module.title }); }} data-testid={`button-delete-module-${module.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      <Separator className="mb-3" />
                      <div className="space-y-2">
                        {module.lectures.map((lecture) => (
                          <div key={lecture.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors" data-testid={`lecture-${lecture.id}`}>
                            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Play className="w-3 h-3 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{lecture.title}</p>
                              <div className="flex items-center gap-2">
                                {lecture.duration > 0 && <p className="text-xs text-muted-foreground">{formatDuration(lecture.duration)}</p>}
                                {lecture.videoUrl && (
                                  <Badge variant="outline" className="text-xs h-4 px-1.5">
                                    {lecture.videoUrl.includes("cloudinary") ? "Cloudinary" : lecture.videoUrl.includes("youtube") ? "YouTube" : "Video"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditLecture(module.id, lecture)} data-testid={`button-edit-lecture-${lecture.id}`}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: "lecture", id: lecture.id, name: lecture.title })} data-testid={`button-delete-lecture-${lecture.id}`}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3 gap-2 border-dashed" onClick={() => openAddLecture(module.id)} data-testid={`button-add-lecture-${module.id}`}>
                        <Plus className="w-3.5 h-3.5" /> Add Lecture
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Lecture Dialog */}
      <Dialog open={lectureDialog.open} onOpenChange={open => !open && closeLectureDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{lectureDialog.lecture ? "Edit Lecture" : "Add Lecture"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Lecture Title *</Label>
              <Input placeholder="e.g., Introduction to React" value={lectureTitle} onChange={e => setLectureTitle(e.target.value)} data-testid="input-lecture-title" />
            </div>

            {/* Video Source Tabs */}
            <div className="space-y-2">
              <Label>Video Source</Label>
              <Tabs defaultValue="upload">
                <TabsList className="w-full">
                  <TabsTrigger value="upload" className="flex-1 gap-2"><CloudUpload className="w-3.5 h-3.5" />Upload to Cloudinary</TabsTrigger>
                  <TabsTrigger value="url" className="flex-1 gap-2"><Link className="w-3.5 h-3.5" />Paste URL</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-3 space-y-3">
                  {uploadDone ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">Video uploaded!</p>
                        <p className="text-xs text-muted-foreground truncate">{lectureUrl}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setLectureUrl(""); setUploadDone(false); }}>Change</Button>
                    </div>
                  ) : isUploading ? (
                    <div className="space-y-2 p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Uploading to Cloudinary... {uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileSelect(file); }}
                      data-testid="upload-dropzone"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Click or drag & drop video</p>
                      <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI, MKV supported</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} data-testid="input-video-file" />
                </TabsContent>

                <TabsContent value="url" className="mt-3 space-y-2">
                  <Input placeholder="https://youtube.com/embed/... or Cloudinary URL" value={lectureUrl} onChange={e => setLectureUrl(e.target.value)} data-testid="input-lecture-url" />
                  <p className="text-xs text-muted-foreground">Paste a YouTube embed URL or any direct video URL</p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Duration (seconds)</Label>
              <Input type="number" min="0" value={lectureDuration} onChange={e => setLectureDuration(e.target.value)} data-testid="input-lecture-duration" />
              <p className="text-xs text-muted-foreground">Auto-filled when you upload a video</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeLectureDialog}>Cancel</Button>
            <Button onClick={() => saveLectureMutation.mutate()} disabled={!lectureTitle.trim() || saveLectureMutation.isPending || isUploading} data-testid="button-save-lecture">
              {saveLectureMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type === "module" ? "Module" : "Lecture"}?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteTarget?.name}" will be permanently deleted.{deleteTarget?.type === "module" && " All lectures inside will also be deleted."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
