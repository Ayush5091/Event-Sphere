export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import lanyardLogo from "@/components/ui/lanyard.png";
import { FadeIn, PageTransition } from "@/components/ui/motion";
import { CreateEventModal } from "@/components/CreateEventModal";
import { DeleteEventButton, MarkCompletedButton } from "@/components/ActionButtons";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabaseAdmin } from "@/lib/supabase";

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

const statusColors: Record<string, { badge: string; dot: string }> = {
    UPCOMING: { badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    COMPLETED: { badge: "bg-slate-500/20 text-slate-400 border-slate-500/20", dot: "bg-slate-400" },
    CANCELLED: { badge: "bg-red-500/20 text-red-400 border-red-500/20", dot: "bg-red-400" },
};

const categoryColors: Record<string, string> = {
    Technical: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
    Cultural: "bg-purple-500/20 text-purple-400 border-purple-500/20",
    Sports: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
};

export default async function ManageEventsPage() {
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";
    const userEmail = user?.email || "";

    const { data: events } = await supabaseAdmin
        .from("Event")
        .select("*")
        .order("date", { ascending: false });

    const allEvents = events || [];

    // Get registration counts for each event
    const eventCounts: Record<string, number> = {};
    for (const event of allEvents) {
        const { count } = await supabaseAdmin
            .from("Registration")
            .select("id", { count: "exact", head: true })
            .eq("eventId", event.id);
        eventCounts[event.id] = count || 0;
    }

    const upcomingCount = allEvents.filter((e) => e.status === "UPCOMING").length;
    const completedCount = allEvents.filter((e) => e.status === "COMPLETED").length;

    return (
        <div className="bg-background text-foreground antialiased overflow-hidden h-screen flex font-sans">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar */}
            <aside className="group/sidebar w-[72px] hover:w-[280px] bg-card/50 backdrop-blur-2xl h-full flex flex-col justify-between border-r border-white/[0.06] shrink-0 shadow-[4px_0_30px_-5px_rgba(0,0,0,0.5)] relative z-20 transition-all duration-300 ease-in-out overflow-hidden">
                <div className="p-4 group-hover/sidebar:p-8 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-10 h-14">
                        <div className="w-14 h-14 min-w-[3.5rem] flex items-center justify-center rounded-xl overflow-hidden ring-1 ring-white/10 shadow-lg shadow-blue-500/5">
                            <Image src={lanyardLogo} alt="EventSphere Logo" width={48} height={48} className="object-contain" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">EventSphere</span>
                    </div>
                    <nav className="space-y-2">
                        <Link href="/dashboard" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">dashboard</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Dashboard</span>
                        </Link>
                        <Link href="/admin/events" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/10 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">calendar_month</span>
                            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Manage Events</span>
                        </Link>
                        <Link href="/admin/registrations" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">group</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Registrations</span>
                        </Link>
                    </nav>
                </div>
                <div className="p-3 group-hover/sidebar:p-6 transition-all duration-300">
                    <SignOutButton userName={userName} userEmail={userEmail} variant="admin" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative p-8 z-10">
                <PageTransition>
                    <FadeIn direction="down">
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Manage Events</h1>
                                <p className="text-muted-foreground font-medium text-sm">Create, edit, and manage all campus events.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative group w-64">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors text-[20px]">search</span>
                                    <Input className="pl-10 pr-4 py-2 bg-card/50 backdrop-blur-md border-white/10 rounded-xl focus-visible:ring-indigo-500 focus-visible:ring-offset-0 text-white placeholder:text-muted-foreground" placeholder="Search events..." />
                                </div>
                                <CreateEventModal>
                                    <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30 font-bold px-6 border border-white/10 h-11 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                                        <span className="material-symbols-outlined text-[20px] mr-2">add_circle</span>
                                        Create Event
                                    </Button>
                                </CreateEventModal>
                            </div>
                        </header>
                    </FadeIn>

                    {/* Stats Row */}
                    <FadeIn direction="up" delay={0.1}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/15 rounded-xl border border-indigo-500/25 text-indigo-400">
                                        <span className="material-symbols-outlined text-[24px]">event</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Total Events</p>
                                        <h3 className="text-2xl font-extrabold text-white">{allEvents.length}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/25 text-emerald-400">
                                        <span className="material-symbols-outlined text-[24px]">upcoming</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Upcoming</p>
                                        <h3 className="text-2xl font-extrabold text-white">{upcomingCount}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-slate-500/15 rounded-xl border border-slate-500/25 text-slate-400">
                                        <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Completed</p>
                                        <h3 className="text-2xl font-extrabold text-white">{completedCount}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </FadeIn>

                    {/* Events Table */}
                    <FadeIn direction="up" delay={0.2}>
                        <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-2xl shadow-black/20 overflow-hidden ring-1 ring-white/[0.04]">
                            <CardHeader className="bg-white/[0.03] border-b border-white/[0.06] px-6 py-5">
                                <CardTitle className="text-lg text-white flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/25 shadow-md shadow-blue-500/10">
                                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                    </div>
                                    All Events
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {allEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-[48px] text-muted-foreground/50 mb-4">event_busy</span>
                                        <p className="text-muted-foreground font-semibold text-lg mb-1">No events yet</p>
                                        <p className="text-muted-foreground/70 text-sm">Create your first event to get started.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/[0.06] hover:bg-transparent">
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Event</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Category</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Date</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Reg. Deadline</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Location</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Registrations</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Status</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allEvents.map((event) => {
                                                const sCols = statusColors[event.status] || statusColors.UPCOMING;
                                                const cCols = categoryColors[event.category || ""] || "bg-cyan-500/20 text-cyan-400 border-cyan-500/20";
                                                const regCount = eventCounts[event.id] || 0;
                                                return (
                                                    <TableRow key={event.id} className="border-white/[0.06] hover:bg-indigo-500/[0.04] transition-all duration-300 cursor-pointer">
                                                        <TableCell className="py-4">
                                                            <div>
                                                                <p className="font-bold text-white">{event.title}</p>
                                                                <p className="text-xs text-muted-foreground mt-0.5">{event.organizer}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge variant="outline" className={`${cCols} font-bold text-xs border`}>{event.category || "General"}</Badge>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <div>
                                                                <p className="text-white font-medium text-sm">{formatDate(event.date)}</p>
                                                                <p className="text-xs text-muted-foreground">{formatTime(event.date)}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            {event.registrationEndDate ? (
                                                                <div>
                                                                    <p className="text-white font-medium text-sm">{formatDate(event.registrationEndDate)}</p>
                                                                    <p className={`text-xs ${new Date(event.registrationEndDate) < new Date() ? 'text-red-400' : 'text-muted-foreground'}`}>
                                                                        {new Date(event.registrationEndDate) < new Date() ? 'Closed' : formatTime(event.registrationEndDate)}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground/50 text-xs">No deadline</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-slate-300 text-sm">{event.location}</TableCell>
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-white font-bold">{regCount}</span>
                                                                <span className="text-muted-foreground text-xs">/ {event.capacity}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge variant="outline" className={`${sCols.badge} font-bold text-xs border flex items-center gap-1.5 w-fit`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${sCols.dot}`} />
                                                                {event.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <MarkCompletedButton eventId={event.id} currentStatus={event.status} />
                                                                <DeleteEventButton eventId={event.id} />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </FadeIn>
                </PageTransition>
            </main>
        </div>
    );
}
