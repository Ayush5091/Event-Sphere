"use client";

import { useState } from "react";
import { ProfileEditModal } from "./ProfileEditModal";

interface ProfileTriggerProps {
    children: React.ReactNode;
}

export function ProfileTrigger({ children }: ProfileTriggerProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div onClick={() => setOpen(true)} className="cursor-pointer contents">
                {children}
            </div>
            <ProfileEditModal open={open} onOpenChange={setOpen} />
        </>
    );
}
