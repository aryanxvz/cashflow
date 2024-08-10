
import React from "react";
import { ReactNode } from "react";

export default function layout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full relative">
            {children}
        </div>
    )
}