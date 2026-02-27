import Link from "next/link";
import { FadeIn, PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { BookEventModal } from "@/components/BookEventModal";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabaseAdmin } from "@/lib/supabase";

// Category → icon & color mapping
const categoryStyles: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    Technical: { icon: "laptop_mac", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    Cultural: { icon: "music_note", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    Sports: { icon: "sports_soccer", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Workshop: { icon: "build", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

function getCategoryStyle(category: string | null) {
    return categoryStyles[category || ""] || { icon: "event", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" };
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return {
        month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
        day: d.getDate(),
        time: d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
}

interface Event {
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
    registrationCount?: number;
}

export default async function ExplorePage() {
    // Fetch events from Supabase
    const { data: events, error } = await supabaseAdmin
        .from("Event")
        .select("*")
        .order("date", { ascending: true });

    // For each event, get registration count
    const eventsWithCounts: Event[] = [];
    if (events) {
        for (const event of events) {
            const { count } = await supabaseAdmin
                .from("Registration")
                .select("id", { count: "exact", head: true })
                .eq("eventId", event.id);
            eventsWithCounts.push({ ...event, registrationCount: count || 0 });
        }
    }

    const upcomingEvents = eventsWithCounts.filter((e) => e.status === "UPCOMING");
    const pastEvents = eventsWithCounts.filter((e) => e.status === "COMPLETED");

    return (
        <div className="bg-background text-foreground antialiased overflow-hidden h-screen flex font-sans">

            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar — collapsed → expands on hover */}
            <aside className="group/sidebar w-[72px] hover:w-[280px] bg-card/50 backdrop-blur-2xl h-full flex flex-col justify-between border-r border-white/[0.06] shrink-0 shadow-[4px_0_30px_-5px_rgba(0,0,0,0.5)] relative z-20 transition-all duration-300 ease-in-out overflow-hidden">
                <div className="p-4 group-hover/sidebar:p-8 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-10 h-11">
                        <div className="w-11 h-11 min-w-[2.75rem] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40 text-white ring-1 ring-white/20">
                            <span className="material-symbols-outlined font-bold text-[24px]">rocket_launch</span>
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">EventSphere</span>
                    </div>
                    <nav className="space-y-2">
                        <Link href="/student/dashboard" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">dashboard</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Dashboard</span>
                        </Link>
                        <Link href="/explore" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/10 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">explore</span>
                            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Explore Events</span>
                        </Link>
                        <Link href="/bookings" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">confirmation_number</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">My Bookings</span>
                        </Link>
                    </nav>
                </div>
                <div className="p-3 group-hover/sidebar:p-6 transition-all duration-300">
                    <div className="flex items-center gap-3 p-2 group-hover/sidebar:p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-white/10">
                        <Avatar className="h-10 w-10 min-w-[2.5rem] ring-2 ring-purple-500/30 shadow-md shadow-purple-500/20">
                            <AvatarFallback className="bg-purple-900/50 text-purple-300 font-bold">S</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">
                            <p className="text-sm font-bold text-white truncate">Student</p>
                            <p className="text-xs text-muted-foreground truncate">student@sahyadri.edu.in</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative p-8 z-10">
                <PageTransition>
                    <FadeIn direction="down">
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Discover Events</h1>
                                <p className="text-muted-foreground font-medium text-sm">Explore the best workshops, hackathons, and cultural fests.</p>
                            </div>
                            <div className="relative group w-full md:w-80">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors text-[20px]">search</span>
                                <Input
                                    className="pl-10 pr-4 py-2 bg-card/50 backdrop-blur-md border-white/10 rounded-xl focus-visible:ring-indigo-500 focus-visible:ring-offset-0 focus-visible:border-indigo-500 text-white placeholder:text-muted-foreground transition-all"
                                    placeholder="Search events, topics..."
                                    type="text"
                                />
                            </div>
                        </header>
                    </FadeIn>

                    {/* Upcoming Events */}
                    <FadeIn direction="up" delay={0.15}>
                        <section className="mb-12">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/20">
                                    <span className="material-symbols-outlined text-[18px]">upcoming</span>
                                </div>
                                Upcoming Events
                                {upcomingEvents.length > 0 && (
                                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 ml-2">{upcomingEvents.length}</Badge>
                                )}
                            </h2>

                            {upcomingEvents.length === 0 ? (
                                <Card className="bg-card/50 backdrop-blur-xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04]">
                                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-[48px] text-muted-foreground/50 mb-4">event_busy</span>
                                        <p className="text-muted-foreground font-semibold text-lg mb-1">No upcoming events</p>
                                        <p className="text-muted-foreground/70 text-sm">Check back later for new events!</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {upcomingEvents.map((event) => {
                                        const style = getCategoryStyle(event.category);
                                        const date = formatDate(event.date);
                                        const spotsLeft = event.capacity - (event.registrationCount || 0);
                                        return (
                                            <Card key={event.id} className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-2xl shadow-black/20 overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-10px_rgba(99,102,241,0.15)] transition-all duration-500 ring-1 ring-white/[0.04]">
                                                {/* Image/Icon Area */}
                                                <div className={`h-40 ${style.bg} flex items-center justify-center relative overflow-hidden`}>
                                                    <span className={`material-symbols-outlined text-[64px] ${style.color} opacity-40 group-hover:opacity-70 transition-opacity duration-500 group-hover:scale-110`}>{style.icon}</span>
                                                    <div className="absolute top-3 left-3">
                                                        <Badge className={`${style.bg} ${style.color} ${style.border} border font-bold text-xs uppercase tracking-wider`}>{event.category || "Event"}</Badge>
                                                    </div>
                                                    <div className="absolute top-3 right-3">
                                                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-xs">{event.status}</Badge>
                                                    </div>
                                                </div>
                                                <CardContent className="p-5">
                                                    <div className="flex gap-4 mb-4">
                                                        <div className={`flex flex-col items-center justify-center w-14 h-14 ${style.bg} rounded-xl ${style.border} border ${style.color} shrink-0`}>
                                                            <span className="text-[10px] font-extrabold">{date.month}</span>
                                                            <span className="text-xl font-black">{date.day}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-white text-lg leading-tight mb-1 line-clamp-2 group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                                                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[14px]">location_on</span> {event.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-5">{event.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs text-muted-foreground">
                                                            <span className="font-bold text-white">{event.registrationCount}</span>/{event.capacity} registered
                                                            {spotsLeft <= 10 && spotsLeft > 0 && (
                                                                <span className="text-amber-400 ml-2 font-semibold">• {spotsLeft} spots left!</span>
                                                            )}
                                                            {spotsLeft <= 0 && (
                                                                <span className="text-red-400 ml-2 font-semibold">• Full</span>
                                                            )}
                                                        </div>
                                                        <BookEventModal eventId={event.id} eventTitle={event.title}>
                                                            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 font-bold text-xs border border-white/10 hover:-translate-y-0.5 transition-all duration-300">
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
                        </section>
                    </FadeIn>

                    {/* Past Events */}
                    {pastEvents.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="p-1.5 bg-muted rounded-lg text-muted-foreground border border-white/[0.06]">
                                    <span className="material-symbols-outlined text-[18px]">history</span>
                                </div>
                                Past Events
                                <Badge variant="secondary" className="bg-white/5 text-muted-foreground border-white/10 ml-2">{pastEvents.length}</Badge>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {pastEvents.map((event) => {
                                    const style = getCategoryStyle(event.category);
                                    const date = formatDate(event.date);
                                    return (
                                        <Card key={event.id} className="bg-card/30 backdrop-blur-xl border-white/[0.04] shadow-xl overflow-hidden opacity-70 hover:opacity-100 transition-all duration-500 ring-1 ring-white/[0.02]">
                                            <div className={`h-32 ${style.bg} flex items-center justify-center relative overflow-hidden opacity-50`}>
                                                <span className={`material-symbols-outlined text-[48px] ${style.color} opacity-30`}>{style.icon}</span>
                                                <div className="absolute top-3 left-3">
                                                    <Badge className="bg-white/5 text-muted-foreground border border-white/10 font-bold text-xs">{event.category || "Event"}</Badge>
                                                </div>
                                                <div className="absolute top-3 right-3">
                                                    <Badge className="bg-white/5 text-muted-foreground border border-white/10 font-bold text-xs">COMPLETED</Badge>
                                                </div>
                                            </div>
                                            <CardContent className="p-5">
                                                <div className="flex gap-4 mb-3">
                                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-muted rounded-xl border border-white/[0.06] text-muted-foreground shrink-0">
                                                        <span className="text-[9px] font-extrabold">{date.month}</span>
                                                        <span className="text-lg font-black">{date.day}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-white text-base leading-tight mb-1 line-clamp-2">{event.title}</h3>
                                                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[14px]">location_on</span> {event.location}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{event.registrationCount} attended</p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </PageTransition>
            </main>
        </div>
    );
}
