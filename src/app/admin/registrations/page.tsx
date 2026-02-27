import Link from "next/link";
import Image from "next/image";
import lanyardLogo from "@/components/ui/lanyard.png";
import { FadeIn, PageTransition } from "@/components/ui/motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabaseAdmin } from "@/lib/supabase";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

function getInitials(name: string): string {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getDept(email: string): string {
    const deptMap: Record<string, string> = { cs: "CSE", is: "ISE", ai: "AIML", ec: "ECE", me: "ME", ra: "ROB" };
    const match = email.match(/\.([a-z]{2})\d{2}@/);
    if (match) return (deptMap[match[1]] || match[1].toUpperCase()) + " Dept";
    return "Dept";
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

const rowAccents = [
    { text: "text-indigo-400", ring: "ring-indigo-500/40", bg: "bg-indigo-900/40", avatarText: "text-indigo-300", rowHover: "hover:bg-indigo-500/[0.06]" },
    { text: "text-purple-400", ring: "ring-purple-500/40", bg: "bg-purple-900/40", avatarText: "text-purple-300", rowHover: "hover:bg-purple-500/[0.06]" },
    { text: "text-emerald-400", ring: "ring-emerald-500/40", bg: "bg-emerald-900/40", avatarText: "text-emerald-300", rowHover: "hover:bg-emerald-500/[0.06]" },
    { text: "text-cyan-400", ring: "ring-cyan-500/40", bg: "bg-cyan-900/40", avatarText: "text-cyan-300", rowHover: "hover:bg-cyan-500/[0.06]" },
    { text: "text-amber-400", ring: "ring-amber-500/40", bg: "bg-amber-900/40", avatarText: "text-amber-300", rowHover: "hover:bg-amber-500/[0.06]" },
];

export default async function RegistrationsPage() {
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";
    const userEmail = user?.email || "";

    const { data: registrations } = await supabaseAdmin
        .from("Registration")
        .select(`*, Event ( title, date )`)
        .order("createdAt", { ascending: false });

    const allRegistrations = registrations || [];
    const totalCount = allRegistrations.length;
    const registeredCount = allRegistrations.filter((r) => r.status === "REGISTERED").length;
    const attendedCount = allRegistrations.filter((r) => r.status === "ATTENDED").length;

    return (
        <div className="bg-background text-foreground antialiased overflow-hidden h-screen flex font-sans">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[100px]" />
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
                        <Link href="/dashboard" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">dashboard</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Dashboard</span>
                        </Link>
                        <Link href="/admin/events" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">calendar_month</span>
                            <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Manage Events</span>
                        </Link>
                        <Link href="/admin/registrations" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/10 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] min-w-[20px]">group</span>
                            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">Registrations</span>
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
                                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Registrations</h1>
                                <p className="text-muted-foreground font-medium text-sm">View and manage all student registrations across events.</p>
                            </div>
                            <div className="relative group w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors text-[20px]">search</span>
                                <Input className="pl-10 pr-4 py-2 bg-card/50 backdrop-blur-md border-white/10 rounded-xl focus-visible:ring-indigo-500 focus-visible:ring-offset-0 text-white placeholder:text-muted-foreground" placeholder="Search registrations..." />
                            </div>
                        </header>
                    </FadeIn>

                    {/* Stats */}
                    <FadeIn direction="up" delay={0.1}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/15 rounded-xl border border-indigo-500/25 text-indigo-400">
                                        <span className="material-symbols-outlined text-[24px]">how_to_reg</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Total</p>
                                        <h3 className="text-2xl font-extrabold text-white">{totalCount}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/25 text-emerald-400">
                                        <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Registered</p>
                                        <h3 className="text-2xl font-extrabold text-white">{registeredCount}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-xl ring-1 ring-white/[0.04] hover:-translate-y-1 transition-all duration-500">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/15 rounded-xl border border-purple-500/25 text-purple-400">
                                        <span className="material-symbols-outlined text-[24px]">co_present</span>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Attended</p>
                                        <h3 className="text-2xl font-extrabold text-white">{attendedCount}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </FadeIn>

                    {/* Registrations Table */}
                    <FadeIn direction="up" delay={0.2}>
                        <Card className="bg-card/50 backdrop-blur-2xl border-white/[0.06] shadow-2xl shadow-black/20 overflow-hidden ring-1 ring-white/[0.04]">
                            <CardHeader className="bg-white/[0.03] border-b border-white/[0.06] px-6 py-5">
                                <CardTitle className="text-lg text-white flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/25 shadow-md shadow-blue-500/10">
                                        <span className="material-symbols-outlined text-[20px]">group</span>
                                    </div>
                                    All Registrations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {allRegistrations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <span className="material-symbols-outlined text-[48px] text-muted-foreground/50 mb-4">person_off</span>
                                        <p className="text-muted-foreground font-semibold text-lg mb-1">No registrations yet</p>
                                        <p className="text-muted-foreground/70 text-sm">Registrations will appear here once students sign up.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/[0.06] hover:bg-transparent">
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Student</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Email</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Department</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Event</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Status</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4 text-right">Registered</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allRegistrations.map((reg: Record<string, unknown>, i: number) => {
                                                const accent = rowAccents[i % rowAccents.length];
                                                const name = reg.studentName as string;
                                                const email = reg.studentEmail as string;
                                                const eventData = reg.Event as Record<string, string> | null;
                                                const eventTitle = eventData?.title || "Unknown Event";
                                                const status = reg.status as string;
                                                const createdAt = reg.createdAt as string;
                                                return (
                                                    <TableRow key={reg.id as string} className={`border-white/[0.06] ${accent.rowHover} transition-all duration-300 cursor-pointer group`}>
                                                        <TableCell className="py-4 font-bold text-white">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className={`h-9 w-9 ring-2 ring-white/[0.06] group-hover:${accent.ring} transition-all duration-300`}>
                                                                    <AvatarFallback className={`${accent.bg} ${accent.avatarText} text-xs font-bold`}>{getInitials(name)}</AvatarFallback>
                                                                </Avatar>
                                                                {name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-slate-400 text-sm">{email}</TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-bold shadow-sm">{getDept(email)}</Badge>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-slate-300 font-medium">{eventTitle}</TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge variant="outline" className={`font-bold text-xs border ${status === "ATTENDED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-indigo-500/20 text-indigo-400 border-indigo-500/20"}`}>
                                                                {status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right text-muted-foreground">{timeAgo(createdAt)}</TableCell>
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
