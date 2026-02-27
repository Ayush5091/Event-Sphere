"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteEventButton({ eventId }: { eventId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this event? All registrations will also be removed.")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            router.refresh();
        } catch {
            alert("Failed to delete event");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button size="sm" variant="ghost" onClick={handleDelete} disabled={loading}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2">
            <span className="material-symbols-outlined text-[16px]">{loading ? "hourglass_empty" : "delete"}</span>
        </Button>
    );
}

export function MarkCompletedButton({ eventId, currentStatus }: { eventId: string; currentStatus: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleToggle() {
        const newStatus = currentStatus === "UPCOMING" ? "COMPLETED" : "UPCOMING";
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            router.refresh();
        } catch {
            alert("Failed to update status");
        } finally {
            setLoading(false);
        }
    }

    if (currentStatus !== "UPCOMING") {
        return (
            <Button size="sm" variant="ghost" onClick={handleToggle} disabled={loading}
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 px-2">
                <span className="material-symbols-outlined text-[16px]">undo</span>
            </Button>
        );
    }

    return (
        <Button size="sm" variant="ghost" onClick={handleToggle} disabled={loading}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-8 px-2">
            <span className="material-symbols-outlined text-[16px]">{loading ? "hourglass_empty" : "check_circle"}</span>
        </Button>
    );
}

export function CancelRegistrationButton({ registrationId }: { registrationId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleCancel() {
        if (!confirm("Cancel this registration?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/register/${registrationId}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            router.refresh();
        } catch {
            alert("Failed to cancel registration");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button size="sm" variant="ghost" onClick={handleCancel} disabled={loading}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-7 px-2 font-bold">
            {loading ? (
                <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : "Cancel"}
        </Button>
    );
}
