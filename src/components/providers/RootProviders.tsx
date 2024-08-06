
"use client"
import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"

export default function RootProviders({ children } : { children: ReactNode }) {
    return <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>{children}</ThemeProvider>
}