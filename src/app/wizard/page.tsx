
import React from "react";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";
import { Separator } from "../../components/ui/separator"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import AppLogo from "../../components/AppLogo"
import Link from "next/link";
import { CurrencyBox } from "../../components/CurrencyBox";

export default async function page() {
    const user = await currentUser()
    if (!user) {
        redirect("/sign-in")
    }

    return (
        <div className="container flex items-center justify-center flex-col max-w-2xl gap-4">
            <div className="">
                <h1 className="text-center text-3xl">
                    Welcome, <span className="font-bold ml-2">{user.firstName}!</span>
                </h1>
                <h2 className="text-center text-base text-muted-foreground mt-4">
                    Let&apos;s get started setting up your currency
                </h2>
                <h3 className="text-center text-sm text-muted-foreground mt-2">
                    You can change these settings at any time
                </h3>
            </div>
            <Separator />

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Currency</CardTitle>
                    <CardDescription>Set your default currency</CardDescription>
                </CardHeader>
                <CardContent>
                    <CurrencyBox />
                </CardContent>
            </Card>
            <Separator />

            <Button className="w-full" asChild>
                <Link href={"/"}>I&apos;m done! Take me to the dashboard</Link>
            </Button>
            <div className="mt-8"><AppLogo /></div>
        </div>
    )
}