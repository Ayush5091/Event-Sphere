"use client";

import { GL } from "./gl";
import { useState } from "react";

export function Hero() {
  const [hovering, setHovering] = useState(false);
  return (
    <div className="flex flex-col h-svh">
      <GL hovering={hovering} />
    </div>
  );
}
