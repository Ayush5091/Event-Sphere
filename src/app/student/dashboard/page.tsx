import Link from "next/link";
import { FadeIn, PageTransition } from "@/components/ui/motion";
import { BookEventModal } from "@/components/BookEventModal";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabaseAdmin } from "@/lib/supabase";

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return {
        month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
        day: d.getDate().toString(),
        time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
        full: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
}

const categoryStyles: Record<string, { bg: string; color: string; icon: string; border: string }> = {
    Technical: { bg: "bg-indigo-500/15", color: "text-indigo-400", icon: "terminal", border: "border-indigo-500/20" },
    Cultural: { bg: "bg-purple-500/15", color: "text-purple-400", icon: "palette", border: "border-purple-500/20" },
    Sports: { bg: "bg-emerald-500/15", color: "text-emerald-400", icon: "sports_soccer", border: "border-emerald-500/20" },
    Workshop: { bg: "bg-amber-500/15", color: "text-amber-400", icon: "build", border: "border-amber-500/20" },
};

function getCat(category: string | null) {
    return categoryStyles[category || ""] || { bg: "bg-cyan-500/15", color: "text-cyan-400", icon: "event", border: "border-cyan-500/20" };
}

export default async function StudentDashboard() {
    // Fetch all registrations (acting as the student's joined events)
    const { data: registrations } = await supabaseAdmin
        .from("Registration")
        .select(`*, Event (*)`)
        .order("createdAt", { ascending: false });

    const myBookings = registrations || [];

    // Fetch upcoming events for the explore section
    const { data: events } = await supabaseAdmin
        .from("Event")
        .select("*")
        .eq("status", "UPCOMING")
        .order("date", { ascending: true })
        .limit(6);

    const upcomingEvents = events || [];

    // Get registration counts for explore events
    const eventCounts: Record<string, number> = {};
    for (const event of upcomingEvents) {
        const { count } = await supabaseAdmin
            .from("Registration")
            .select("id", { count: "exact", head: true })
            .eq("eventId", event.id);
        eventCounts[event.id] = count || 0;
    }

    // Stats
    const totalJoined = myBookings.length;
    const upcomingJoined = myBookings.filter((b) => b.Event?.status === "UPCOMING").length;
    const completedJoined = myBookings.filter((b) => b.Event?.status === "COMPLETED").length;

    return (
        <div className="bg-background text-foreground antialiased overflow-hidden h-screen flex font-sans">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[80px]" />
            </div>

            {/* Student Sidebar */}
            <aside className="group/sidebar w-[72px] hover:w-[280px] bg-card/50 backdrop-blur-2xl h-full flex flex-col justify-between border-r border-white/[0.06] shrink-0 shadow-[4px_0_30px_-5px_rgba(0,0,0,0.5)] relative z-20 transition-all duration-300 ease-in-out overflow-hidden">
                <div className="p-4 group-hover/sidebar:p-8 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-10 h-11">
                        <div className="w-11 h-11 min-w-[2.75rem] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40 text-white ring-1 ring-white/20">
                            <span className="material-symbols-outlined font-bold text-[24px]">rocket_launch</span>
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">EventSphere</span>
                    </div>
                    <nav className="space-y-2">
                        <Link href="/student/dashboard" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/10 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">dashboard</span>
                            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Dashboard</span>
                        </Link>
                        <Link href="/explore" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">explore</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Explore Events</span>
                        </Link>
                        <Link href="/bookings" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">confirmation_number</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">My Bookings</span>
                        </Link>
                    </nav>
                </div>
                <div className="p-3 group-hover/sidebar:p-6 transition-all duration-300">
                    <div className="flex items-center gap-3 p-2 group-hover/sidebar:p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-white/10">
                        <Avatar className="h-10 w-10 min-w-[2.5rem] ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/20">
                            <AvatarFallback className="bg-emerald-900/50 text-emerald-300 font-bold">S</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">
                            <p className="text-sm font-bold text-white truncate">Student</p>
                            <p className="text-xs text-muted-foreground truncate">student@college.edu</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative p-8 z-10">
                <PageTransition>
                    {/* Header */}
                    <FadeIn direction="down">
                        <header className="mb-8">
                            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome Back! 👋</h1>
                            <p className="text-muted-foreground font-medium text-sm">Here&apos;s your event activity at a glance.</p>
                        </header>
                    </FadeIn>

                    {/* Stats Bento */}
                    <FadeIn direction="up" delay={0.1}>
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/15 rounded-xl border border-indigo-500/25 text-indigo-400">
                                        <span className="material-symbols-outlined text-[24px]">event_available</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Events Joined</p>
                                        <h3 className="text-2xl font-extrabold text-white">{totalJoined}</h3>
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
                                        <h3 className="text-2xl font-extrabold text-white">{upcomingJoined}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/15 rounded-xl border border-purple-500/25 text-purple-400">
                                        <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Completed</p>
                                        <h3 className="text-2xl font-extrabold text-white">{completedJoined}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </FadeIn>

                    {/* My Events — Bento Grid */}
                    <FadeIn direction="up" delay={0.2}>
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/25">
                                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                </div>
                                <h2 className="text-xl font-bold text-white">My Events</h2>
                                <Badge className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-bold text-xs">{totalJoined}</Badge>
                            </div>

                            {myBookings.length === 0 ? (
                                <Card className="bg-card/50 backdrop-blur-xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04]">
                                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-[48px] text-muted-foreground/50 mb-4">event_busy</span>
                                        <p className="text-muted-foreground font-semibold text-lg mb-1">No events yet</p>
                                        <p className="text-muted-foreground/70 text-sm mb-4">Explore and register for events to see them here.</p>
                                        <Link href="/explore">
                                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 font-bold text-sm border border-white/10">
                                                <span className="material-symbols-outlined text-[18px] mr-2">explore</span>
                                                Explore Events
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-3 auto-rows-auto gap-4">
                                    {/* First event is a large feature card */}
                                    {myBookings.slice(0, 1).map((booking) => {
                                        const event = booking.Event;
                                        if (!event) return null;
                                        const cat = getCat(event.category);
                                        const date = formatDate(event.date);
                                        return (
                                            <Card key={booking.id} className="col-span-2 row-span-2 bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-2xl overflow-hidden group hover:-translate-y-1 hover:shadow-[0_30px_60px_-10px_rgba(99,102,241,0.15)] transition-all duration-500 ring-1 ring-white/[0.04]">
                                                <div className={`h-44 ${cat.bg} flex items-center justify-center relative overflow-hidden`}>
                                                    <span className={`material-symbols-outlined text-[80px] ${cat.color} opacity-30 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-110`}>{cat.icon}</span>
                                                    <div className="absolute top-3 left-3">
                                                        <Badge className={`${cat.bg} ${cat.color} border ${cat.border} font-bold text-xs uppercase tracking-wider`}>{event.category || "Event"}</Badge>
                                                    </div>
                                                    <div className="absolute top-3 right-3">
                                                        <Badge className={`${event.status === "UPCOMING" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-slate-500/20 text-slate-400 border-slate-500/20"} border font-bold text-xs`}>{event.status}</Badge>
                                                    </div>
                                                </div>
                                                <CardContent className="p-6">
                                                    <h3 className="font-bold text-white text-xl mb-2 group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[16px] text-indigo-400">calendar_today</span>
                                                            {date.full}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[16px] text-indigo-400">schedule</span>
                                                            {date.time}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[16px] text-indigo-400">location_on</span>
                                                            {event.location}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}

                                    {/* Remaining events as smaller bento cards */}
                                    {myBookings.slice(1, 5).map((booking) => {
                                        const event = booking.Event;
                                        if (!event) return null;
                                        const cat = getCat(event.category);
                                        const date = formatDate(event.date);
                                        return (
                                            <Card key={booking.id} className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl overflow-hidden group hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.12)] transition-all duration-500 ring-1 ring-white/[0.04]">
                                                <CardContent className="p-5">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className={`${cat.bg} p-2.5 rounded-xl ${cat.color} border ${cat.border} shrink-0`}>
                                                            <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors">{event.title}</h4>
                                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[12px]">location_on</span> {event.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`flex flex-col items-center justify-center w-10 h-10 ${cat.bg} rounded-lg ${cat.border} border ${cat.color} shrink-0`}>
                                                                <span className="text-[8px] font-extrabold">{date.month}</span>
                                                                <span className="text-sm font-black">{date.day}</span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{date.time}</span>
                                                        </div>
                                                        <Badge className={`${event.status === "UPCOMING" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-slate-500/20 text-slate-400 border-slate-500/20"} border font-bold text-[10px]`}>
                                                            <div className={`w-1 h-1 rounded-full mr-1 ${event.status === "UPCOMING" ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                                                            {event.status}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </FadeIn>

                    {/* Explore Section — 3 per row */}
                    <FadeIn direction="up" delay={0.3}>
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/25">
                                        <span className="material-symbols-outlined text-[20px]">explore</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Explore Events</h2>
                                </div>
                                <Link href="/explore">
                                    <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5 text-sm font-semibold">
                                        View All
                                        <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                                    </Button>
                                </Link>
                            </div>

                            {upcomingEvents.length === 0 ? (
                                <Card className="bg-card/50 backdrop-blur-xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04]">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <span className="material-symbols-outlined text-[40px] text-muted-foreground/50 mb-3">event_busy</span>
                                        <p className="text-muted-foreground font-semibold mb-1">No upcoming events</p>
                                        <p className="text-muted-foreground/70 text-sm">Check back later for new events!</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-3 gap-5">
                                    {upcomingEvents.map((event) => {
                                        const cat = getCat(event.category);
                                        const date = formatDate(event.date);
                                        const regCount = eventCounts[event.id] || 0;
                                        const spotsLeft = event.capacity - regCount;
                                        return (
                                            <Card key={event.id} className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-10px_rgba(99,102,241,0.12)] transition-all duration-500 ring-1 ring-white/[0.04]">
                                                <div className={`h-28 ${cat.bg} flex items-center justify-center relative overflow-hidden`}>
                                                    <span className={`material-symbols-outlined text-[48px] ${cat.color} opacity-30 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-110`}>{cat.icon}</span>
                                                    <div className="absolute top-2 left-2">
                                                        <Badge className={`${cat.bg} ${cat.color} border ${cat.border} font-bold text-[10px] uppercase tracking-wider`}>{event.category || "Event"}</Badge>
                                                    </div>
                                                </div>
                                                <CardContent className="p-4">
                                                    <div className="flex gap-3 mb-3">
                                                        <div className={`flex flex-col items-center justify-center w-12 h-12 ${cat.bg} rounded-xl ${cat.border} border ${cat.color} shrink-0`}>
                                                            <span className="text-[9px] font-extrabold">{date.month}</span>
                                                            <span className="text-lg font-black">{date.day}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2 group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                                                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[12px]">location_on</span> {event.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-[11px] text-muted-foreground">
                                                            <span className="font-bold text-white">{regCount}</span>/{event.capacity}
                                                            {spotsLeft <= 10 && spotsLeft > 0 && (
                                                                <span className="text-amber-400 ml-1.5 font-semibold">• {spotsLeft} left</span>
                                                            )}
                                                        </div>
                                                        <BookEventModal eventId={event.id} eventTitle={event.title}>
                                                            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg shadow-md shadow-indigo-500/20 font-bold text-[11px] border border-white/10 h-7 px-3 hover:-translate-y-0.5 transition-all duration-300">
                                                                Book Now
                                                            </Button>
                                                        </BookEventModal>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </FadeIn>
                </PageTransition>
            </main>
        </div>
    );
}
