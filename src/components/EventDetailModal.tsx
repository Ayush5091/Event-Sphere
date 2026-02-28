"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookEventModal } from "@/components/BookEventModal";

interface EventDetailModalProps {
    event: {
        id: string;
        title: string;
        description: string;
        date: string;
        location: string;
        capacity: number;
        imageUrl: string | null;
        category: string | null;
        organizer: string;
        status: string;
        registrationEndDate: string | null;
        registrationCount?: number;
    };
    children: React.ReactNode;
}

const categoryStyles: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    Technical: { icon: "laptop_mac", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    Cultural: { icon: "music_note", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    Sports: { icon: "sports_soccer", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Workshop: { icon: "build", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

function getCategoryStyle(category: string | null) {
    return categoryStyles[category || ""] || { icon: "event", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" };
}

export function EventDetailModal({ event, children }: EventDetailModalProps) {
    const [open, setOpen] = useState(false);
    const style = getCategoryStyle(event.category);

    const eventDate = new Date(event.date);
    const spotsLeft = event.capacity - (event.registrationCount || 0);
    const regClosed = event.registrationEndDate ? new Date(event.registrationEndDate) < new Date() : false;
    const isFull = spotsLeft <= 0;
    const isPast = event.status === "COMPLETED";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="cursor-pointer">
                    {children}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-2xl border-white/[0.08] shadow-2xl shadow-black/40 ring-1 ring-white/[0.06] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Banner Image */}
                <div className={`relative h-52 ${style.bg} flex items-center justify-center overflow-hidden`}>
                    {event.imageUrl ? (
                        <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className={`object-cover ${isPast ? "grayscale" : ""}`}
                        />
                    ) : (
                        <span className={`material-symbols-outlined text-[80px] ${style.color} opacity-30`}>{style.icon}</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${style.bg} ${style.color} ${style.border} border font-bold text-xs uppercase tracking-wider`}>
                                {event.category || "Event"}
                            </Badge>
                            <Badge className={`${isPast ? "bg-white/5 text-muted-foreground border-white/10" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"} border font-bold text-xs`}>
                                {event.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <DialogHeader className="mb-5">
                        <DialogTitle className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                            {event.title}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                            <div className={`p-2 ${style.bg} rounded-lg`}>
                                <span className={`material-symbols-outlined text-[20px] ${style.color}`}>calendar_today</span>
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Date</p>
                                <p className="text-sm text-white font-semibold">
                                    {eventDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                            <div className={`p-2 ${style.bg} rounded-lg`}>
                                <span className={`material-symbols-outlined text-[20px] ${style.color}`}>schedule</span>
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Time</p>
                                <p className="text-sm text-white font-semibold">
                                    {eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                            <div className={`p-2 ${style.bg} rounded-lg`}>
                                <span className={`material-symbols-outlined text-[20px] ${style.color}`}>location_on</span>
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Location</p>
                                <p className="text-sm text-white font-semibold">{event.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                            <div className={`p-2 ${style.bg} rounded-lg`}>
                                <span className={`material-symbols-outlined text-[20px] ${style.color}`}>person</span>
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Organizer</p>
                                <p className="text-sm text-white font-semibold">{event.organizer}</p>
                            </div>
                        </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mb-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground font-medium">Registration</span>
                            <span className="text-sm font-bold text-white">{event.registrationCount}/{event.capacity}</span>
                        </div>
                        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    isFull ? "bg-red-500" : spotsLeft <= 10 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(((event.registrationCount || 0) / event.capacity) * 100, 100)}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            {isFull ? (
                                <span className="text-xs text-red-400 font-semibold">Event is full</span>
                            ) : (
                                <span className="text-xs text-muted-foreground">{spotsLeft} spots remaining</span>
                            )}
                            {event.registrationEndDate && (
                                <span className="text-xs text-muted-foreground">
                                    {regClosed ? (
                                        <span className="text-red-400 font-semibold">Registration closed</span>
                                    ) : (
                                        <>Deadline: {new Date(event.registrationEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {new Date(event.registrationEndDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-muted-foreground">description</span>
                            About this event
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
                    </div>

                    {/* Action */}
                    {!isPast && (
                        <div className="flex justify-end">
                            {regClosed ? (
                                <Badge className="bg-red-500/15 text-red-400 border border-red-500/20 font-bold text-sm px-4 py-2">
                                    Registration Closed
                                </Badge>
                            ) : isFull ? (
                                <Badge className="bg-red-500/15 text-red-400 border border-red-500/20 font-bold text-sm px-4 py-2">
                                    Event Full
                                </Badge>
                            ) : (
                                <BookEventModal eventId={event.id} eventTitle={event.title}>
                                    <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold text-sm border border-white/10 hover:-translate-y-0.5 transition-all duration-300 px-6">
                                        Book Now
                                    </Button>
                                </BookEventModal>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
