"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GetFormatterForCurrency } from "@/lib/helpers"
import { Period, Timeframe } from "@/lib/types"
import { UserSettings } from "@prisma/client"
import { useEffect, useMemo, useState } from "react"
import HistoryPeriodSelector from "./HistoryPeriodSelector"
import { useQuery } from "@tanstack/react-query"
import SkeletonWrapper from "@/components/SkeletonWrapper"
import { CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, Bar, BarChart } from "recharts"
import { Separator } from "@/components/ui/separator"

type HistoryData = {
    expense: number
    income: number
    year: number
    month: number
    day?: number
    balance?: number
}

interface ChartProps {
    data: HistoryData[]
    userSettings: UserSettings
    timeframe: Timeframe
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

    return (
        <div className="mx-8 md:mx-12 pb-12">
            <h2 className="mt-12 ml-2 mb-2 text-3xl font-bold">History</h2>
            <Card className="col-span-12 mt-2 w-full">
                <CardHeader className="gap-2">
                    <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
                        <HistoryPeriodSelector
                            period={period}
                            setPeriod={setPeriod}
                            timeframe={timeframe}
                            setTimeframe={setTimeframe}
                        />

                        <div className="hidden md:flex h-10 gap-2">
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

                <CardContent className="py-4 px-1 md:p-12">
                    <SkeletonWrapper isLoading={historyDataQuery.isFetching}>
                        {dataAvailable ? (
                            <>
                                <HistoryAreaChart 
                                    data={historyDataQuery.data} 
                                    userSettings={userSettings}
                                    timeframe={timeframe}
                                />
                                <div className="hidden lg:block">
                                    <Separator className="my-16" />
                                    <HistoryBarChart 
                                        data={historyDataQuery.data} 
                                        userSettings={userSettings}
                                        timeframe={timeframe}
                                    />
                                </div>
                            </>
                        ) : (
                            <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                                <p className="text-lg font-medium text-center px-4">No data for the selected period</p>
                                <p className="text-sm text-muted-foreground text-center px-4">
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

const useScreenSize = () => {
    const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const handleResize = () => {
            setScreenWidth(window.innerWidth)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return {
        isSmall: screenWidth < 640, // sm
        isMedium: screenWidth >= 640 && screenWidth < 1024, // updated to lg breakpoint
        isLarge: screenWidth >= 1024 // updated to lg breakpoint
    }
}

const getTickInterval = (timeframe: Timeframe, screenSize: ReturnType<typeof useScreenSize>, dataLength: number) => {
    if (screenSize.isLarge) return 0 // Show all ticks on large screens (1024px and above)
    
    // For small and medium screens (below 1024px)
    if (timeframe === "month") {
        // Group 5 dates together
        return Math.max(Math.floor(dataLength / 5) - 1, 0)
    } else { // year timeframe
        // Group 2 months together
        return 1
    }
}

const useNumberFormatter = (currency: string, screenSize: ReturnType<typeof useScreenSize>) => {
    return useMemo(() => {
        // For small and medium devices, create a formatter without decimals
        if (screenSize.isSmall || screenSize.isMedium) {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
        }
        
        // Return original formatter for large devices
        return GetFormatterForCurrency(currency)
    }, [currency, screenSize.isSmall, screenSize.isMedium])
}


//area-chart
const HistoryAreaChart: React.FC<ChartProps> = ({ data, userSettings, timeframe }) => {
    const screenSize = useScreenSize()
    const formatter = useNumberFormatter(userSettings.currency, screenSize)
    
    const formatXAxisTick = (data: HistoryData) => {
        const date = new Date(data.year, data.month, data.day || 1)
        if (timeframe === "year") {
            return date.toLocaleDateString("default", { month: "short" })
        }
        return date.toLocaleDateString("default", { day: "2-digit" })
    }
  
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey={formatXAxisTick}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        padding={{ left: 10, right: 10 }}
                        interval={getTickInterval(timeframe, screenSize, data.length)}
                    />
                    <YAxis 
                        tickFormatter={value => formatter.format(value)}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                    <Tooltip
                        cursor={{ opacity: 0.1 }}
                        content={(props) => (
                            <CustomTooltip {...props} timeframe={timeframe} formatter={formatter} />
                        )}
                    />
                    <Area
                        name="Income"
                        type="monotone"
                        dataKey="income"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#incomeGradient)"
                    />
                    <Area
                        name="Expense"
                        type="monotone"
                        dataKey="expense"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#expenseGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

//bar-chart
const HistoryBarChart: React.FC<ChartProps> = ({ data, userSettings, timeframe }) => {
    const screenSize = useScreenSize()
    const formatter = useNumberFormatter(userSettings.currency, screenSize)

    const formatXAxisTick = (data: HistoryData) => {
        const date = new Date(data.year, data.month, data.day || 1)
        if (timeframe === "year") {
            return date.toLocaleDateString("default", { month: "short" })
        }
        return date.toLocaleDateString("default", { day: "2-digit" })
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
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
                        interval={getTickInterval(timeframe, screenSize, data.length)}
                        textAnchor="end"
                    />

                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatter.format(value)}
                    />

                    <Tooltip
                        cursor={{ opacity: 0.1 }}
                        content={(props) => (
                            <CustomTooltip {...props} timeframe={timeframe} formatter={formatter} />
                        )}
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
    )
}

//tooltip
const CustomTooltip = ({ active, payload, label, timeframe, formatter: originalFormatter }: any) => {
    const screenSize = useScreenSize()
    const currency = originalFormatter.resolvedOptions().currency
    const formatter = useNumberFormatter(currency, screenSize)
    
    if (!active || !payload || !payload.length) return null
    const data = payload[0].payload as HistoryData
    
    const formatLabel = (data: HistoryData) => {
        const date = new Date(data.year, data.month, data.day || 1)
        if (timeframe === "year") {
            return date.toLocaleDateString("default", { month: "long", year: "numeric" })
        }
        return date.toLocaleDateString("default", { day: "2-digit", month: "long", year: "numeric" })
    }

    return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
            <p className="mb-1 font-medium">
                {formatLabel(data)}
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
}