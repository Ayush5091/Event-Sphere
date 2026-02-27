import Link from "next/link";
import { FadeIn, PageTransition } from "@/components/ui/motion";
import { CreateEventModal } from "@/components/CreateEventModal";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
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
    TableRow
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { supabaseAdmin } from "@/lib/supabase";

// Helper: get initials from a name
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

// Helper: format relative time
function timeAgo(dateStr: string): string {
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
}

// Helper: extract department from email (name.dept24@sahyadri.edu.in)
function getDept(email: string): string {
    const deptMap: Record<string, string> = {
        cs: "CSE", is: "ISE", ai: "AIML", ec: "ECE", me: "ME", ra: "ROB",
    };
    const match = email.match(/\.([a-z]{2})\d{2}@/);
    if (match) return (deptMap[match[1]] || match[1].toUpperCase()) + " Dept";
    return "Dept";
}

// Accent color palette for table rows
const rowAccents = [
    { text: "text-indigo-400", ring: "ring-indigo-500/40", shadow: "shadow-indigo-500/20", bg: "bg-indigo-900/40", avatarText: "text-indigo-300", rowHover: "hover:bg-indigo-500/[0.06]" },
    { text: "text-purple-400", ring: "ring-purple-500/40", shadow: "shadow-purple-500/20", bg: "bg-purple-900/40", avatarText: "text-purple-300", rowHover: "hover:bg-purple-500/[0.06]" },
    { text: "text-emerald-400", ring: "ring-emerald-500/40", shadow: "shadow-emerald-500/20", bg: "bg-emerald-900/40", avatarText: "text-emerald-300", rowHover: "hover:bg-emerald-500/[0.06]" },
    { text: "text-cyan-400", ring: "ring-cyan-500/40", shadow: "shadow-cyan-500/20", bg: "bg-cyan-900/40", avatarText: "text-cyan-300", rowHover: "hover:bg-cyan-500/[0.06]" },
    { text: "text-amber-400", ring: "ring-amber-500/40", shadow: "shadow-amber-500/20", bg: "bg-amber-900/40", avatarText: "text-amber-300", rowHover: "hover:bg-amber-500/[0.06]" },
];

export default async function DashboardPage() {
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";
    const userEmail = user?.email || "";

    // Fetch stats from Supabase
    const [eventsRes, registrationsRes, recentRegRes, allRegsRes] = await Promise.all([
        supabaseAdmin.from("Event").select("id, status"),
        supabaseAdmin.from("Registration").select("id", { count: "exact", head: true }),
        supabaseAdmin
            .from("Registration")
            .select(`*, Event ( title )`)
            .order("createdAt", { ascending: false })
            .limit(5),
        supabaseAdmin.from("Registration").select("createdAt"),
    ]);

    const events = eventsRes.data || [];
    const totalRegistrations = registrationsRes.count || 0;
    const activeEvents = events.filter((e: Record<string, unknown>) => e.status === "UPCOMING").length;
    const recentRegistrations = recentRegRes.data || [];

    // Build monthly chart data for the last 6 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const monthlyData: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyData.push({ label: monthNames[d.getMonth()], count: 0 });
    }
    const allRegs = allRegsRes.data || [];
    for (const reg of allRegs) {
        const rd = new Date(reg.createdAt as string);
        const idx = monthlyData.findIndex((m) => {
            const md = new Date(now.getFullYear(), now.getMonth() - (5 - monthlyData.indexOf(m)), 1);
            return rd.getMonth() === md.getMonth() && rd.getFullYear() === md.getFullYear();
        });
        if (idx !== -1) monthlyData[idx].count++;
    }
    const maxCount = Math.max(...monthlyData.map((m) => m.count), 1);

    // Generate SVG chart points
    const chartW = 1000;
    const chartH = 260;
    const padX = 60;
    const padY = 30;
    const innerW = chartW - padX * 2;
    const innerH = chartH - padY * 2;
    const points = monthlyData.map((m, i) => ({
        x: padX + (i / (monthlyData.length - 1)) * innerW,
        y: padY + innerH - (m.count / maxCount) * innerH,
        label: m.label,
        count: m.count,
    }));
    const lineD = points.map((p, i) => {
        if (i === 0) return `M${p.x},${p.y}`;
        const prev = points[i - 1];
        const cpx1 = prev.x + (p.x - prev.x) / 3;
        const cpx2 = prev.x + (2 * (p.x - prev.x)) / 3;
        return `C${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
    }).join(" ");
    const areaD = lineD + ` L${points[points.length - 1].x},${chartH} L${points[0].x},${chartH} Z`;

    return (
        <div className="bg-background text-foreground antialiased overflow-hidden h-screen flex font-sans">

            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px]" />
            </div>

            {/* Sidebar — collapsed (icons only) → expands on hover */}
            <aside className="group/sidebar w-[72px] hover:w-[280px] bg-card/50 backdrop-blur-2xl h-full flex flex-col justify-between border-r border-white/[0.06] shrink-0 shadow-[4px_0_30px_-5px_rgba(0,0,0,0.5)] relative z-20 transition-all duration-300 ease-in-out overflow-hidden">
                <div className="p-4 group-hover/sidebar:p-8 transition-all duration-300">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10 h-11">
                        <div className="w-11 h-11 min-w-[2.75rem] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40 text-white ring-1 ring-white/20">
                            <span className="material-symbols-outlined font-bold text-[24px]">rocket_launch</span>
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">EventSphere</span>
                    </div>

                    <nav className="space-y-2">
                        <Link href="/dashboard" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/10 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">dashboard</span>
                            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Dashboard</span>
                        </Link>
                        <Link href="/admin/events" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">calendar_month</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Manage Events</span>
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

                    <FadeIn direction="down" duration={0.5}>
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Dashboard Overview</h1>
                                <p className="text-muted-foreground font-medium text-sm">Welcome back, here&apos;s what&apos;s happening today.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative group w-64">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors text-[20px]">search</span>
                                    <Input
                                        className="pl-10 pr-4 py-2 bg-card/50 backdrop-blur-md border-white/10 rounded-xl focus-visible:ring-indigo-500 focus-visible:ring-offset-0 focus-visible:border-indigo-500 text-white placeholder:text-muted-foreground transition-all hover:border-white/20 hover:shadow-md"
                                        placeholder="Search events..."
                                        type="text"
                                    />
                                </div>
                                <CreateEventModal>
                                    <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 font-bold px-6 border border-white/10 h-11 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300">
                                        <span className="material-symbols-outlined text-[20px] mr-2">add_circle</span>
                                        Create Event
                                    </Button>
                                </CreateEventModal>
                            </div>
                        </header>
                    </FadeIn>

                    <FadeIn direction="up" delay={0.15}>
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

                            {/* Main Chart Card */}
                            <Card className="xl:col-span-2 bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-2xl shadow-black/20 relative overflow-hidden group hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.15)] hover:-translate-y-1 transition-all duration-500 ring-1 ring-white/[0.04]">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-purple-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <CardHeader className="flex flex-row items-start justify-between pb-8 relative z-10">
                                    <div>
                                        <CardTitle className="text-xl text-white">Registration Trends</CardTitle>
                                        <CardDescription className="text-muted-foreground mt-1">Monthly signups over last 6 months</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="flex gap-10 mb-8">
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Registrations</p>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-3xl font-extrabold text-white">{totalRegistrations.toLocaleString()}</h4>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Events</p>
                                            <h4 className="text-3xl font-extrabold text-white">{events.length}</h4>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">This Month</p>
                                            <h4 className="text-3xl font-extrabold text-white">{monthlyData[monthlyData.length - 1].count}</h4>
                                        </div>
                                    </div>

                                    {/* Dynamic Chart */}
                                    <div className="h-56 w-full rounded-xl relative overflow-hidden">
                                        <svg className="w-full h-full" viewBox={`0 0 ${chartW} ${chartH + 30}`} preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                                                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                                                </linearGradient>
                                                <filter id="lineGlow">
                                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                                    <feMerge>
                                                        <feMergeNode in="blur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>

                                            {/* Horizontal grid lines */}
                                            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                                                <line key={pct} x1={padX} y1={padY + innerH * (1 - pct)} x2={chartW - padX} y2={padY + innerH * (1 - pct)} stroke="white" strokeOpacity="0.04" strokeWidth="1" />
                                            ))}

                                            {/* Area fill */}
                                            <path d={areaD} fill="url(#chartGlow)" />

                                            {/* Line */}
                                            <path d={lineD} fill="none" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)" />

                                            {/* Data points + labels */}
                                            {points.map((p, i) => (
                                                <g key={i}>
                                                    {/* Vertical dash line */}
                                                    <line x1={p.x} y1={p.y} x2={p.x} y2={chartH} stroke="white" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="4 4" />
                                                    {/* Glow dot */}
                                                    <circle cx={p.x} cy={p.y} r="8" fill="#818cf8" fillOpacity="0.2" />
                                                    {/* Solid dot */}
                                                    <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#818cf8" strokeWidth="2" />
                                                    {/* Count above dot */}
                                                    <text x={p.x} y={p.y - 14} textAnchor="middle" fill="#c7d2fe" fontSize="12" fontWeight="700">{p.count}</text>
                                                    {/* Month label below */}
                                                    <text x={p.x} y={chartH + 20} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">{p.label}</text>
                                                </g>
                                            ))}
                                        </svg>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Side Stats Cards */}
                            <FadeIn direction="right" delay={0.2}>
                                <div className="space-y-6 flex flex-col h-[400px]">
                                    {/* Total Registrations */}
                                    <Card className="flex-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 border-indigo-400/20 shadow-2xl shadow-indigo-600/25 overflow-hidden relative group hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-10px_rgba(99,102,241,0.4)] transition-all duration-500 ring-1 ring-white/10">
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute -right-6 -top-6 text-white/[0.08] group-hover:text-white/[0.15] transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg]">
                                            <span className="material-symbols-outlined text-[140px] rotate-12">confirmation_number</span>
                                        </div>
                                        <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
                                            <div>
                                                <p className="text-indigo-200 text-sm font-semibold mb-2 uppercase tracking-wide">Total Registrations</p>
                                                <h3 className="text-5xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">{totalRegistrations}</h3>
                                            </div>
                                            <div className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-100 font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/15 shadow-inner">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse"></div>
                                                <span>Live data</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Active Events */}
                                    <Card className="flex-1 bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-2xl shadow-black/20 relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-10px_rgba(168,85,247,0.2)] transition-all duration-500 ring-1 ring-white/[0.04]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        <div className="absolute right-2 bottom-2 text-white/[0.04] group-hover:text-white/[0.1] transition-all duration-500 group-hover:scale-110">
                                            <span className="material-symbols-outlined text-[100px]">event_available</span>
                                        </div>
                                        <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-muted-foreground text-sm font-semibold mb-2 uppercase tracking-wide">Active Events</p>
                                                    <h3 className="text-4xl font-extrabold text-white">{activeEvents}</h3>
                                                </div>
                                                <div className="p-3 bg-purple-500/15 rounded-xl border border-purple-500/25 text-purple-400 shadow-lg shadow-purple-500/10 group-hover:shadow-purple-500/30 group-hover:bg-purple-500/25 transition-all duration-300">
                                                    <span className="material-symbols-outlined text-[24px]">leaderboard</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </FadeIn>
                        </div>
                    </FadeIn>

                    {/* Recent Registrations Table */}
                    <FadeIn direction="up" delay={0.3}>
                        <div className="mb-8">
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-2xl shadow-black/20 overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.1)] transition-all duration-500 ring-1 ring-white/[0.04]">
                                <CardHeader className="bg-white/[0.03] border-b border-white/[0.06] px-6 py-5">
                                    <CardTitle className="text-lg text-white flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/25 shadow-md shadow-indigo-500/10">
                                            <span className="material-symbols-outlined text-[20px]">recent_actors</span>
                                        </div>
                                        Recent Registrations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {recentRegistrations.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <span className="material-symbols-outlined text-[48px] text-muted-foreground/50 mb-4">person_off</span>
                                            <p className="text-muted-foreground font-semibold text-lg mb-1">No registrations yet</p>
                                            <p className="text-muted-foreground/70 text-sm">Registrations will appear here once students sign up for events.</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader className="bg-transparent hover:bg-transparent">
                                                <TableRow className="border-white/[0.06] hover:bg-transparent">
                                                    <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Student</TableHead>
                                                    <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Department</TableHead>
                                                    <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Event</TableHead>
                                                    <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4 text-right">Registered</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentRegistrations.map((reg: Record<string, unknown>, i: number) => {
                                                    const accent = rowAccents[i % rowAccents.length];
                                                    const name = reg.studentName as string;
                                                    const email = reg.studentEmail as string;
                                                    const eventData = reg.Event as Record<string, string> | null;
                                                    const eventTitle = eventData?.title || "Unknown Event";
                                                    const createdAt = reg.createdAt as string;
                                                    return (
                                                        <TableRow key={reg.id as string} className={`border-white/[0.06] ${accent.rowHover} transition-all duration-300 cursor-pointer group`}>
                                                            <TableCell className={`py-4 font-bold text-white group-hover:${accent.text} transition-colors`}>
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className={`h-9 w-9 ring-2 ring-white/[0.06] group-hover:${accent.ring} transition-all duration-300 shadow-md group-hover:${accent.shadow}`}>
                                                                        <AvatarFallback className={`${accent.bg} ${accent.avatarText} text-xs font-bold`}>{getInitials(name)}</AvatarFallback>
                                                                    </Avatar>
                                                                    {name}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-bold shadow-sm hover:bg-white/10 transition-colors">{getDept(email)}</Badge>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-slate-300 font-medium">{eventTitle}</TableCell>
                                                            <TableCell className="py-4 text-right text-muted-foreground">{timeAgo(createdAt)}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </FadeIn>
                </PageTransition>
            </main>
        </div>
    );
}
