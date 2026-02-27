"use client";

import dynamic from "next/dynamic";

const GL = dynamic(() => import("@/components/gl").then(mod => ({ default: mod.GL })), {
    ssr: false,
});

export default function ParticleBackground() {
    return <GL />;
}
