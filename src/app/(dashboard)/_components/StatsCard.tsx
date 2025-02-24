
"use client"
import { getBalanceStatsResponseType } from "@/app/api/stats/balance/route"
import SkeletonWrapper from "@/components/SkeletonWrapper"
import { Card } from "@/components/ui/card"
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers"
import { UserSettings } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { ReactNode, useCallback, useMemo, useEffect } from "react"
import CountUp from "react-countup"

interface Props {
    from: Date
    to: Date
    userSettings: UserSettings
}

export default function StatsCards({ from, to, userSettings }: Props) {
    useEffect(() => {
        console.log('StatsCards Dates:', {
            originalFrom: from.toISOString(),
            originalTo: to.toISOString(),
            utcFrom: DateToUTCDate(from).toISOString(),
            utcTo: DateToUTCDate(to).toISOString(),
        });
    }, [from, to]);

    const statsQuery = useQuery<getBalanceStatsResponseType>({
        queryKey: ["overview", "stats", from.toISOString(), to.toISOString()],
        queryFn: async () => {
            const fromUTC = DateToUTCDate(from);
            const toUTC = DateToUTCDate(to);
            
            const url = `/api/stats/balance?from=${fromUTC.toISOString()}&to=${toUTC.toISOString()}`;
            console.log('Fetching stats with URL:', url);
            
            const res = await fetch(url);
            const data = await res.json();
            console.log('Stats Response:', data);
            return data;
        }
    })

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    const income = statsQuery.data?.income || 0
    const expense = statsQuery.data?.expense || 0
    const balance = income - expense

    return (
        <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatsCard 
                    formatter={formatter}
                    value={income}
                    title="Income"
                    icon={<TrendingUp className="h-12 w-12 items-center rounded-lg p-2 mx-2 2xl:mx-4 text-emerald-700 bg-emerald-600/10 dark:text-emerald-500 dark:bg-emerald-400/10"/>}
                />
            </SkeletonWrapper>

            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatsCard 
                    formatter={formatter}
                    value={expense}
                    title="Expense"
                    icon={<TrendingDown className="h-12 w-12 items-center rounded-lg p-2 mx-2 2xl:mx-4 text-red-700 bg-red-600/10 dark:text-red-500 dark:bg-red-400/10"/>}
                />
            </SkeletonWrapper>

            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatsCard 
                    formatter={formatter}
                    value={balance}
                    title="Balance"
                    icon={<Wallet className="h-12 w-12 items-center rounded-lg p-2 mx-2 2xl:mx-4 text-violet-700 bg-violet-600/10 dark:text-violet-500 dark:bg-violet-400/10"/>}
                />
            </SkeletonWrapper>
        </div>
    )
}

function StatsCard({ formatter, title, value, icon }: { formatter: Intl.NumberFormat, title: String, value: number, icon: ReactNode }) {
    const formatFn = useCallback((value: number) => {
        return formatter.format(value)
    }, [formatter])

    return (
        <Card className="flex h-24 w-full items-center gap-2 p-4">
            {icon}
            <div className="flex flex-col items-start gap-0">
                <p className="text-muted-foreground">{title}</p>
                <CountUp preserveValue redraw={false} end={value} decimals={2} formattingFn={formatFn} className="text-2xl" />
            </div>
        </Card>
    )
}