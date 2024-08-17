
import React from "react"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import CreateTransactionDialog from "@/app/(dashboard)/_components/CreateTransactionDialog"

export default async function page() {
    const user = await currentUser()
    if (!user) {
        redirect("/sign-in")
    }

    const userSettings = await prisma.userSettings.findUnique({
        where: {
            userId: user.id
        }
    })

    if (!userSettings) {
        redirect("/wizard")
    }

    return (
        <div className="h-full bg-background">
            <div className="border-b bg-card">
                <div className="conatiner flex flex-wrap items-center justify-between gap-6 py-6 px-12">
                    <p className="font-bold text-2xl">Hello, {user.firstName}!</p>
                    <div className="flex items-center gap-3">
                        <CreateTransactionDialog trigger={
                            <Button variant={"outline"} className="border-emerald-500 bg-emerald-950 hover:bg-emerald-700 text-white hover:text-white">New Income</Button>
                        } type="Income" />

                        <CreateTransactionDialog trigger={
                            <Button variant={"outline"} className="border-red-500 bg-red-950 hover:bg-red-700 text-white hover:text-white">New Expense</Button>
                        } type="Expense" />
                    </div>
                </div>
            </div>
        </div>
    )
}