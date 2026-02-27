"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProfileEditModal({ open, onOpenChange }: ProfileEditModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        department: "",
        phone: "",
    });

    useEffect(() => {
        if (!open) return;
        let isMounted = true;

        async function fetchProfile() {
            setFetching(true);
            try {
                const res = await fetch("/api/user/profile");
                const { data, success } = await res.json();
                if (success && isMounted && data) {
                    setFormData({
                        full_name: data.full_name || "",
                        department: data.department || "",
                        phone: data.phone || "",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                if (isMounted) setFetching(false);
            }
        }
        fetchProfile();

        return () => { isMounted = false; };
    }, [open]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            setSuccess(true);
            setTimeout(() => {
                onOpenChange(false);
                setSuccess(false);
                router.refresh(); // Refresh page to reflect new name in UI if needed
            }, 1000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setError(""); setSuccess(false); } }}>
            <DialogContent className="bg-card/95 backdrop-blur-2xl border-white/10 text-white max-w-sm shadow-2xl shadow-black/40">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/25">
                            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                        </div>
                        Edit Profile
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3 border border-emerald-500/30">
                            <span className="material-symbols-outlined text-emerald-400 text-[28px]">check_circle</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Profile Updated!</h3>
                    </div>
                ) : fetching ? (
                    <div className="flex justify-center py-10">
                        <span className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="full_name" className="text-sm font-semibold text-slate-300">Full Name</Label>
                            <Input id="full_name" name="full_name" required
                                value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="e.g. John Doe"
                                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-indigo-500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department" className="text-sm font-semibold text-slate-300">Department</Label>
                            <Input id="department" name="department"
                                value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                placeholder="e.g. Computer Science"
                                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-indigo-500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-semibold text-slate-300">Phone</Label>
                            <Input id="phone" name="phone" type="tel"
                                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="e.g. +91 9876543210"
                                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-indigo-500" />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                        )}
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/30 border border-white/10">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </span>
                                ) : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
