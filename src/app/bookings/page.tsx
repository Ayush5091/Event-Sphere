import Link from "next/link";
import Image from "next/image";
import lanyardLogo from "@/components/ui/lanyard.png";
import { FadeIn, PageTransition } from "@/components/ui/motion";
import { CancelRegistrationButton } from "@/components/ActionButtons";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabaseAdmin } from "@/lib/supabase";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";


function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return {
        month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
        day: d.getDate(),
        time: d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        full: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
}

const categoryIcons: Record<string, { icon: string; color: string; bg: string }> = {
    Technical: { icon: "laptop_mac", color: "text-indigo-400", bg: "bg-indigo-500/15" },
    Cultural: { icon: "music_note", color: "text-purple-400", bg: "bg-purple-500/15" },
    Sports: { icon: "sports_soccer", color: "text-emerald-400", bg: "bg-emerald-500/15" },
};

function getCat(category: string | null) {
    return categoryIcons[category || ""] || { icon: "event", color: "text-cyan-400", bg: "bg-cyan-500/15" };
}

export default async function BookingsPage() {
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
    const userEmail = user?.email || "";

    // Fetch the logged-in user's registrations.
    const { data: registrations } = await supabaseAdmin
        .from("Registration")
        .select(`*, Event ( title, date, location, category, status )`)
        .eq("user_id", user?.id)
        .order("createdAt", { ascending: false });

    const allBookings = registrations || [];
    const upcomingBookings = allBookings.filter((b) => {
        const event = b.Event as Record<string, string> | null;
        return event?.status === "UPCOMING";
    });
    const pastBookings = allBookings.filter((b) => {
        const event = b.Event as Record<string, string> | null;
        return event?.status !== "UPCOMING";
    });

    return (
        <div className="bg-background text-foreground antialiased overflow-hidden h-screen flex font-sans">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar */}
            <aside className="group/sidebar w-[72px] hover:w-[280px] bg-card/50 backdrop-blur-2xl h-full flex flex-col justify-between border-r border-white/[0.06] shrink-0 shadow-[4px_0_30px_-5px_rgba(0,0,0,0.5)] relative z-20 transition-all duration-300 ease-in-out overflow-hidden">
                <div className="p-4 group-hover/sidebar:p-8 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-10 h-11">
                        <div className="w-11 h-11 min-w-[2.75rem] flex items-center justify-center rounded-xl overflow-hidden ring-1 ring-white/10">
                            <Image src={lanyardLogo} alt="EventSphere Logo" width={32} height={32} className="object-contain" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">EventSphere</span>
                    </div>
                    <nav className="space-y-2">
                        <Link href="/student/dashboard" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">dashboard</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Dashboard</span>
                        </Link>
                        <Link href="/explore" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">explore</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Explore Events</span>
                        </Link>
                        <Link href="/bookings" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/10 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">confirmation_number</span>
                            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">My Bookings</span>
                        </Link>
                    </nav>
                </div>
                <div className="p-3 group-hover/sidebar:p-6 transition-all duration-300">
                    <SignOutButton userName={userName} userEmail={userEmail} variant="student" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative p-8 z-10">
                <PageTransition>
                    <FadeIn direction="down">
                        <header className="mb-8">
                            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">My Bookings</h1>
                            <p className="text-muted-foreground font-medium text-sm">Your registered events and booking history.</p>
                        </header>
                    </FadeIn>

                    {/* Stats */}
                    <FadeIn direction="up" delay={0.1}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/15 rounded-xl border border-indigo-500/25 text-indigo-400">
                                        <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Total Bookings</p>
                                        <h3 className="text-2xl font-extrabold text-white">{allBookings.length}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/25 text-emerald-400">
                                        <span className="material-symbols-outlined text-[24px]">event_available</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Upcoming</p>
                                        <h3 className="text-2xl font-extrabold text-white">{upcomingBookings.length}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/15 rounded-xl border border-purple-500/25 text-purple-400">
                                        <span className="material-symbols-outlined text-[24px]">history</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Past Events</p>
                                        <h3 className="text-2xl font-extrabold text-white">{pastBookings.length}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </FadeIn>

                    {/* Upcoming Bookings */}
                    <FadeIn direction="up" delay={0.2}>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/20">
                                    <span className="material-symbols-outlined text-[18px]">upcoming</span>
                                </div>
                                Upcoming Bookings
                            </h2>

                            {upcomingBookings.length === 0 ? (
                                <Card className="bg-card/50 backdrop-blur-xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04]">
                                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-[48px] text-muted-foreground/50 mb-4">event_busy</span>
                                        <p className="text-muted-foreground font-semibold text-lg mb-1">No upcoming bookings</p>
                                        <p className="text-muted-foreground/70 text-sm mb-4">Explore events and register to see them here.</p>
                                        <Link href="/explore">
                                            <Badge className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 font-bold cursor-pointer hover:bg-indigo-500/30 transition-colors">Browse Events →</Badge>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {upcomingBookings.map((booking) => {
                                        const event = booking.Event as Record<string, string> | null;
                                        if (!event) return null;
                                        const date = formatDate(event.date);
                                        const cat = getCat(event.category);
                                        return (
                                            <Card key={booking.id} className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-2xl overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-10px_rgba(99,102,241,0.15)] transition-all duration-500 ring-1 ring-white/[0.04]">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <div className={`${cat.bg} p-3 rounded-xl ${cat.color} border border-white/[0.06] shrink-0`}>
                                                            <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="font-bold text-white text-lg leading-tight mb-1 group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[14px]">location_on</span> {event.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-500/15 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0">
                                                                <span className="text-[9px] font-extrabold">{date.month}</span>
                                                                <span className="text-lg font-black">{date.day}</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">{date.time}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                                                                Confirmed
                                                            </Badge>
                                                            <CancelRegistrationButton registrationId={booking.id} />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </FadeIn>

                    {/* Past Bookings */}
                    <FadeIn direction="up" delay={0.3}>
                        {pastBookings.length > 0 && (
                            <section className="mb-10">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="p-1.5 bg-muted rounded-lg text-muted-foreground border border-white/[0.06]">
                                        <span className="material-symbols-outlined text-[18px]">history</span>
                                    </div>
                                    Past Bookings
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {pastBookings.map((booking) => {
                                        const event = booking.Event as Record<string, string> | null;
                                        if (!event) return null;
                                        const date = formatDate(event.date);
                                        const cat = getCat(event.category);
                                        return (
                                            <Card key={booking.id} className="bg-card/30 backdrop-blur-xl border-white/[0.04] shadow-xl overflow-hidden opacity-60 hover:opacity-100 transition-all duration-500 ring-1 ring-white/[0.02]">
                                                <CardContent className="p-5">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className={`${cat.bg} p-2 rounded-lg ${cat.color} opacity-50 shrink-0`}>
                                                            <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-white text-base leading-tight mb-1">{event.title}</h3>
                                                            <p className="text-xs text-muted-foreground">{date.full} • {event.location}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-white/5 text-muted-foreground border border-white/10 font-bold text-xs">Completed</Badge>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </FadeIn>
                </PageTransition>
            </main>
        </div>
    );
}
