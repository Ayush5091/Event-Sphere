"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function CreateEventModal({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file (JPG, PNG, GIF, WebP)");
            return;
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5MB");
            return;
        }

        setError("");
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    function removeImage() {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const form = new FormData(e.currentTarget);

        let imageUrl = "";

        // Upload image to S3 if one was selected
        if (imageFile) {
            try {
                setUploading(true);
                const uploadForm = new FormData();
                uploadForm.append("file", imageFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadForm,
                });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload image");
                imageUrl = uploadData.url;
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to upload image");
                setLoading(false);
                setUploading(false);
                return;
            } finally {
                setUploading(false);
            }
        }

        const body = {
            title: form.get("title") as string,
            description: form.get("description") as string,
            date: form.get("date") as string,
            location: form.get("location") as string,
            capacity: form.get("capacity") as string,
            category: form.get("category") as string,
            organizer: form.get("organizer") as string,
            registrationEndDate: form.get("registrationEndDate") as string || "",
            imageUrl,
        };

        try {
            const res = await fetch("/api/admin/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            setOpen(false);
            setImageFile(null);
            setImagePreview(null);
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create event");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-2xl border-white/10 text-white max-w-lg shadow-2xl shadow-black/40">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/25">
                            <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        </div>
                        Create New Event
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold text-slate-300">Event Title</Label>
                        <Input id="title" name="title" required placeholder="e.g. Tech Hackathon 2026" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-indigo-500" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-slate-300">Description</Label>
                        <Textarea id="description" name="description" required placeholder="Describe the event..." rows={3} className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-indigo-500 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-sm font-semibold text-slate-300">Date & Time</Label>
                            <Input id="date" name="date" type="datetime-local" required className="bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity" className="text-sm font-semibold text-slate-300">Capacity</Label>
                            <Input id="capacity" name="capacity" type="number" min={1} required placeholder="100" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-indigo-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="registrationEndDate" className="text-sm font-semibold text-slate-300">Registration Deadline <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Input id="registrationEndDate" name="registrationEndDate" type="datetime-local" className="bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500" />
                        <p className="text-[11px] text-muted-foreground/70">After this date, students won&apos;t be able to register for the event.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-semibold text-slate-300">Location</Label>
                        <Input id="location" name="location" required placeholder="e.g. Main Auditorium" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-300">Category</Label>
                            <Select name="category" defaultValue="Technical">
                                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-indigo-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-white/10">
                                    <SelectItem value="Technical">Technical</SelectItem>
                                    <SelectItem value="Cultural">Cultural</SelectItem>
                                    <SelectItem value="Sports">Sports</SelectItem>
                                    <SelectItem value="Workshop">Workshop</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organizer" className="text-sm font-semibold text-slate-300">Organizer</Label>
                            <Input id="organizer" name="organizer" required placeholder="e.g. CS Dept" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-indigo-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-300">Banner Image (Optional)</Label>
                        {imagePreview ? (
                            <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                                <Image
                                    src={imagePreview}
                                    alt="Banner preview"
                                    width={480}
                                    height={160}
                                    className="w-full h-36 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 rounded-lg text-white transition-colors border border-white/10"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                                    <p className="text-xs text-white/80 truncate max-w-[200px]">{imageFile?.name}</p>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-28 border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors bg-white/[0.02] hover:bg-indigo-500/5 cursor-pointer group"
                            >
                                <span className="material-symbols-outlined text-[28px] text-muted-foreground group-hover:text-indigo-400 transition-colors">cloud_upload</span>
                                <span className="text-xs text-muted-foreground group-hover:text-indigo-400 transition-colors font-medium">Click to upload banner image</span>
                                <span className="text-[10px] text-muted-foreground/60">JPG, PNG, GIF, WebP — Max 5MB</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    {error && (
                        <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || uploading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 border border-white/10">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {uploading ? "Uploading image..." : "Creating..."}
                                </span>
                            ) : "Create Event"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
