"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileEditModal } from "@/components/ProfileEditModal";

interface SignOutButtonProps {
    userName: string;
    userEmail: string;
    variant?: "admin" | "student";
}

export function SignOutButton({ userName, userEmail, variant = "admin" }: SignOutButtonProps) {
    const isStudent = variant === "student";
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Theme colors based on variant
    const ringColor = isStudent ? "ring-blue-500/30 shadow-blue-500/20" : "ring-emerald-500/30 shadow-emerald-500/20";
    const bgFallbackColor = isStudent ? "bg-blue-900/50 text-blue-300" : "bg-emerald-900/50 text-emerald-300";

    return (
        <div className="flex items-center gap-3 p-2 group-hover/sidebar:p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 relative group/profile">
            <Avatar className={`h-10 w-10 min-w-[2.5rem] ring-2 shadow-md ${ringColor}`}>
                <AvatarFallback className={`font-bold ${bgFallbackColor}`}>
                    {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100 flex justify-between items-center">
                <div className="min-w-0 pr-2">
                    <p className="text-sm font-bold text-white truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>

                <div className="flex items-center">
                    {/* Edit Profile Action */}
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(true)}
                        className="text-zinc-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                        title="Edit Profile"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>

                    {/* Sign Out Action Form */}
                    <form action="/auth/signout" method="post">
                        <button
                            type="submit"
                            className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                            title="Sign Out"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Profile Edit Modal */}
            <ProfileEditModal open={isProfileOpen} onOpenChange={setIsProfileOpen} />
        </div>
    );
}
