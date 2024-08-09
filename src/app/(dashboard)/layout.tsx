import NavBar from "@/components/NavBar";
import { ReactNode } from "react";

export default function layout({ children }: { children: ReactNode }) {
    return (
        <div className="relative flex h-screen w-full flex-col">
            <NavBar />
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}