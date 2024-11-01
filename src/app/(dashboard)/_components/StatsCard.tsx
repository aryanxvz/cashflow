
"use client"

import { getBalanceStatsResponseType } from "@/app/api/stats/balance/route"
import SkeletonWrapper from "@/components/SkeletonWrapper"
import { Card } from "@/components/ui/card"
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers"
import { UserSettings } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { ReactNode, useCallback, useMemo } from "react"
import CountUp from "react-countup"

interface Props {
    from: Date
    to: Date
    userSettings: UserSettings
}

export default function StatsCards({ from, to , userSettings }: Props) {
    const statsQuery = useQuery<getBalanceStatsResponseType>({
        queryKey: ["overview", "stats", from, to],
        queryFn: () => fetch(`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then((res) => res.json())
    })

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    const income = statsQuery.data?.income || 0
    const expense = statsQuery.data?.income || 0
    console.log(expense)

    const balance = income - expense

    return (
        <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatsCard 
                    formatter = { formatter }
                    value = {income}
                    title = "Income"
                    icon = { <TrendingUp className="h-12 w-12 items-center rounded-lg p-2 mx-2 2xl:mx-4 text-emerald-500 bg-emerald-400/10"/> }
                />
            </SkeletonWrapper>

            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatsCard 
                    formatter = { formatter }
                    value = {expense}
                    title = "Expense"
                    icon = { <TrendingDown className="h-12 w-12 items-center rounded-lg p-2 mx-2 2xl:mx-4 text-red-500 bg-red-400/10"/> }
                />
            </SkeletonWrapper>

            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatsCard 
                    formatter = { formatter }
                    value = {balance}
                    title = "Balance"
                    icon = { <Wallet className="h-12 w-12 items-center rounded-lg p-2 mx-2 2xl:mx-4 text-violet-500 bg-violet-400/10"/> }
                />
            </SkeletonWrapper>
        </div>
    )
}

function StatsCard({ formatter, title, value, icon }: { formatter: Intl.NumberFormat, title: String, value: number, icon: ReactNode }) {
    const formatFn = useCallback((value: number) => {
        return formatter.format(value)
    },[formatter])

    return (
        <Card className="flex h-24 w-full items-center gap-2 p-4">
            {icon}
            <div className="flex flex-col items-center gap-0">
                <p className="text-muted-foreground">{title}</p>
                <CountUp preserveValue redraw={false} end={value} decimals={2} formattingFn={formatFn} className="text-2xl" />
            </div>
        </Card>
    )
}