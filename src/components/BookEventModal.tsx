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

interface BookEventModalProps {
    eventId: string;
    eventTitle: string;
    children: React.ReactNode;
}

export function BookEventModal({ eventId, eventTitle, children }: BookEventModalProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const form = new FormData(e.currentTarget);
        const body = {
            eventId,
        };

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            setSuccess(true);
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
                router.refresh();
            }, 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(""); setSuccess(false); } }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-2xl border-white/10 text-white max-w-md shadow-2xl shadow-black/40">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/25">
                            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                        </div>
                        Register for Event
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                            <span className="material-symbols-outlined text-emerald-400 text-[32px]">check_circle</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Registration Confirmed!</h3>
                        <p className="text-muted-foreground text-sm">You&apos;re registered for <span className="text-indigo-400 font-semibold">{eventTitle}</span></p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-4">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Event</p>
                            <p className="text-white font-bold">{eventTitle}</p>
                        </div>
                        <p className="text-sm text-slate-300">Your registration will be automatically linked to your authenticated profile.</p>
                        {error && (
                            <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                        )}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white hover:bg-white/5">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/30 border border-white/10">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Registering...
                                    </span>
                                ) : "Register Now"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
