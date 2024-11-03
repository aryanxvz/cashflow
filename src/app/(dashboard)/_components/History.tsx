
"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GetFormatterForCurrency } from "@/lib/helpers"
import { Period, Timeframe } from "@/lib/types"
import { UserSettings } from "@prisma/client"
import { useMemo, useState } from "react"
import HistoryPeriodSelector from "./HistoryPeriodSelector"
import { useQuery } from "@tanstack/react-query"
import SkeletonWrapper from "@/components/SkeletonWrapper"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

type HistoryData = {
    expense: number
    income: number
    year: number
    month: number
    day?: number
    balance?: number
}

export default function History({ userSettings }: { userSettings: UserSettings }) {
    const [timeframe, setTimeframe] = useState<Timeframe>("month")
    const [period, setPeriod] = useState<Period>({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    })

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    const historyDataQuery = useQuery<HistoryData[]>({
        queryKey: ["overview", "history", timeframe, period],
        queryFn: async () => {
            const response = await fetch(`/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`)
            if (!response.ok) {
                throw new Error('Failed to fetch history data')
            }
            const data = await response.json()
            
            return data.map((item: HistoryData) => ({
                ...item,
                balance: item.income - item.expense
            }))
        }
    })

    const dataAvailable = historyDataQuery.data && historyDataQuery.data.length > 0

    const formatXAxisTick = (data: HistoryData) => {
        const date = new Date(data.year, data.month, data.day || 1)
        if (timeframe === "year") {
            return date.toLocaleDateString("default", { month: "short" })
        }
        return date.toLocaleDateString("default", { day: "2-digit" })
    }

    const formatTooltipLabel = (data: HistoryData) => {
        const date = new Date(data.year, data.month, data.day || 1)
        if (timeframe === "year") {
            return date.toLocaleDateString("default", { month: "long", year: "numeric" })
        }
        return date.toLocaleDateString("default", { day: "2-digit", month: "long", year: "numeric" })
    }

    return (
        <div className="mx-12">
            <h2 className="mt-12 text-3xl font-bold">History</h2>
            <Card className="col-span-12 mt-2 w-full">
                <CardHeader className="gap-2">
                    <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
                        <HistoryPeriodSelector
                            period={period}
                            setPeriod={setPeriod}
                            timeframe={timeframe}
                            setTimeframe={setTimeframe}
                        />

                        <div className="flex h-10 gap-2">
                            <Badge variant="outline" className="flex items-center gap-2 text-sm">
                                <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                                Income
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-2 text-sm">
                                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                                Expense
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                    <SkeletonWrapper isLoading={historyDataQuery.isFetching}>
                        {dataAvailable ? (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={historyDataQuery.data}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                    >
                                        <defs>
                                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                                            </linearGradient>
                                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid 
                                            strokeDasharray="3 3" 
                                            strokeOpacity={0.2} 
                                            vertical={false} 
                                        />
                                        
                                        <XAxis
                                            dataKey={formatXAxisTick}
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            padding={{ left: 10, right: 10 }}
                                        />
                                        
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => formatter.format(value)}
                                        />
                                        
                                        <Tooltip
                                            cursor={{ opacity: 0.1}}
                                            content={({ active, payload }) => {
                                                if (!active || !payload || !payload.length) return null
                                                const data = payload[0].payload as HistoryData
                                                
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-md">
                                                        <p className="mb-1 font-medium">
                                                            {formatTooltipLabel(data)}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-emerald-500">
                                                                Income: {formatter.format(data.income)}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-red-500">
                                                                Expense: {formatter.format(data.expense)}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-violet-400">
                                                                Balance: {formatter.format(data.balance || 0)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                )
                                            }}
                                        />
                                        
                                        <Bar
                                            name="Income"
                                            dataKey="income"
                                            fill="url(#incomeGradient)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        
                                        <Bar
                                            name="Expense"
                                            dataKey="expense"
                                            fill="url(#expenseGradient)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                                <p className="text-lg font-medium">No data for the selected period</p>
                                <p className="text-sm text-muted-foreground">
                                    Try selecting a different period or adding new transactions
                                </p>
                            </Card>
                        )}
                    </SkeletonWrapper>
                </CardContent>
            </Card>
        </div>
    )
}