
"use client"
import { usePathname } from "next/navigation"
import AppLogo from "./AppLogo"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "./ui/button"
import { UserButton } from "@clerk/nextjs"
import { ThemeSwitch } from "./ThemeSwitch"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Menu } from "lucide-react"

export default function NavBar() {
    return (
        <>
            <DesktopNavbar />
            <MobileNavbar />
        </>
    )
}

function DesktopNavbar() {
    return (
        <div className="border-b border-separate bg-background hidden md:block">
            <nav className="flex items-center justify-between px-8 lg:px-12">
                <div className="flex h-[70px] min-h-[60px] items-center gap-x-4">
                    <AppLogo />
                    <div className="flex h-full ml-8">
                        {items.map(items => <NavBarItem key={items.label} link={items.link} label={items.label}/>)}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeSwitch />
                    <UserButton />
                </div>
            </nav>
        </div>
    )
}

function MobileNavbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="block border-separate bg-background md:hidden">
            <nav className="container flex items-center justify-between px-8">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}>
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[275px] sm:w-[540px] pl-8" side={"left"}>
                        <AppLogo />
                        <div className="flex flex-col gap-1 pt-4">
                            {items.map(items => <NavBarItem key={items.label} link={items.link} label={items.label} clickCallback={() => 
                                setIsOpen((prev) => !prev)
                            }/>)}
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="flex h-[80px] min-h-[60px] gap-x-4 items-center">
                    <AppLogo />
                </div>
                <div className="flex items-center gap-2">
                    <ThemeSwitch />
                    <UserButton />
                </div>
            </nav>
        </div>
    )
}


const items = [
    {label: "Dashboard", link: "/"},
    {label: "Transactions", link: "/transactions"},
    {label: "Manage", link: "/manage"}
]

function NavBarItem({ link, label, clickCallback }: { link: string, label: string, clickCallback?: () => void }){
    const pathname = usePathname()
    const isActive = pathname === link

    return (
        <div className="relative flex items-center">
            <Link href={link} className={cn(buttonVariants({variant: "ghost"}), "w-full justify-start text-lg text-muted-foreground hover:text-foreground", isActive && "text-foreground" )} onClick={() => { if(clickCallback) clickCallback() }}>
                {label}
            </Link>
            {
                isActive && (
                    <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block"></div>
                )
            }
        </div>
    )
}