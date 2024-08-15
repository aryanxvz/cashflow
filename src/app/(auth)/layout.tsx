
import AppLogo from "@/components/AppLogo";
import { ReactNode } from "react";

export default function layout({ children } : { children : ReactNode }) {
    return (
        <div className="flex justify-center items-center flex-col h-screen w-screen relative">
            <AppLogo />
            <div className="mt-6">{children}</div>
        </div>
    )
}