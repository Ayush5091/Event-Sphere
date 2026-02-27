"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const form = new FormData(e.currentTarget);
        const body = {
            title: form.get("title") as string,
            description: form.get("description") as string,
            date: form.get("date") as string,
            location: form.get("location") as string,
            capacity: form.get("capacity") as string,
            category: form.get("category") as string,
            organizer: form.get("organizer") as string,
            imageUrl: form.get("imageUrl") as string,
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
                        <Label htmlFor="imageUrl" className="text-sm font-semibold text-slate-300">Banner Image URL (Optional)</Label>
                        <Input id="imageUrl" name="imageUrl" placeholder="https://images.unsplash.com/photo..." className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-indigo-500" />
                    </div>
                    {error && (
                        <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 border border-white/10">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </span>
                            ) : "Create Event"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
