"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
    href: string;
    icon: string;
    label: string;
}

const navItems: NavItem[] = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/admin/events", icon: "calendar_month", label: "Manage Events" },
    { href: "/admin/registrations", icon: "group", label: "Registrations" },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

    const displayEmail = user?.email ?? "admin@college.edu";
    const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Admin";
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <aside className="group/sidebar w-[72px] hover:w-[280px] bg-card/50 backdrop-blur-2xl h-full flex flex-col justify-between border-r border-white/[0.06] shrink-0 shadow-[4px_0_30px_-5px_rgba(0,0,0,0.5)] relative z-20 transition-all duration-300 ease-in-out overflow-hidden">
            <div className="p-4 group-hover/sidebar:p-8 transition-all duration-300">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 h-11">
                    <div className="w-11 h-11 min-w-[2.75rem] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40 text-white ring-1 ring-white/20">
                        <span className="material-symbols-outlined font-bold text-[24px]">rocket_launch</span>
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">EventSphere</span>
                </div>

                {/* Nav */}
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3.5 rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/10 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white hover:shadow-md hover:-translate-y-0.5"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px] min-w-[20px]">{item.icon}</span>
                                <span className={`${isActive ? "font-semibold" : "font-medium"} text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User profile + Logout */}
            <div className="p-3 group-hover/sidebar:p-6 transition-all duration-300 space-y-2">
                {/* Logout button — visible on hover */}
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 w-10 h-10 group-hover/sidebar:w-full group-hover/sidebar:h-auto group-hover/sidebar:px-4 group-hover/sidebar:py-3 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all duration-300 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[20px] min-w-[20px]">logout</span>
                    <span className="font-medium text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 hidden group-hover/sidebar:inline">
                        Sign Out
                    </span>
                </button>

                {/* User info */}
                <div className="flex items-center gap-3 p-2 group-hover/sidebar:p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 hover:shadow-lg">
                    <Avatar className="h-10 w-10 min-w-[2.5rem] ring-2 ring-indigo-500/30 shadow-md shadow-indigo-500/20">
                        <AvatarFallback className="bg-indigo-900/50 text-indigo-300 font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">
                        <p className="text-sm font-bold text-white truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
