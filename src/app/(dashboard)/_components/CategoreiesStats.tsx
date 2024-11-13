"use client"

import { getCategoriesStatsResponseType } from "@/app/api/stats/categories/route"
import SkeletonWrapper from "@/components/SkeletonWrapper"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers"
import { TransactionType } from "@/lib/types"
import { UserSettings } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

interface Props {
    from: Date
    to: Date
    userSettings: UserSettings
}

export default function CategoriesStats({ userSettings, from, to }: Props) {
    const statsQuery = useQuery<getCategoriesStatsResponseType>({
        queryKey: ["overview", "stats", "categories", from, to],
        queryFn: () => fetch(`/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then((res) => res.json())
    })

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    return (
        <div className="flex w-full flex-wrap gap-2 md:flex-nowrap pt-2 lg:pt-0">
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <CategoriesCard 
                    formatter={formatter}
                    type="Income"
                    data={statsQuery.data || []}
                />
            </SkeletonWrapper>

            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <CategoriesCard 
                    formatter={formatter}
                    type="Expense"
                    data={statsQuery.data || []}
                />
            </SkeletonWrapper>
        </div>
    )
}

function CategoriesCard({ type, formatter, data }: {
    type: TransactionType;
    formatter: Intl.NumberFormat;
    data: getCategoriesStatsResponseType;
}){
    const filteredData = data.filter((el) => el.type === type)
    const total = filteredData.reduce((acc, el) => acc + (el._sum?.amount || 0), 0)

    return (
        <Card className="h-60 lg:h-80 w-full col-span-6">
            <CardHeader>
                <CardTitle className="grid grid-flow-row justify-between px-2 text-gray-900 dark:text-muted-foreground md:grid-flow-col">
                    {type === "Income" ? "Income" : "Expenses"} by category
                </CardTitle>
            </CardHeader>

            <div className="flex items-center justify-center gap-2">
                {filteredData.length === 0 && (
                    <div className="flex h-40 lg:h-60 w-full flex-col items-center justify-center">
                        No data for the selected period
                        <p className="text-sm text-muted-foreground text-center px-4">
                            Try selecting a different period or try adding new{" "}
                            {type === "Income" ? "incomes" : "expenses"}
                        </p>
                    </div>
                )}

                {filteredData.length > 0 && (
                    <ScrollArea className="h-60 w-full px-4 2xl:px-6">
                        <div className="flex w-full flex-col gap-4 p-4">
                            {filteredData.map((item) => {
                                const amount = item._sum?.amount || 0;
                                const percentage = (amount * 100) / (total || amount);

                                return (
                                    <div key={item.category} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center text-gray-600 dark:text-gray-400">
                                                {item.category}
                                                <span className="ml-2 text-sm text-gray-600 dark:text-muted-foreground">
                                                    ({percentage.toFixed(0)}%)
                                                </span>
                                            </span>

                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatter.format(amount)}
                                            </span>
                                        </div>

                                        <Progress 
                                            value={percentage}
                                            indicator={type === "Income" ? "bg-emerald-500" : "bg-red-500"}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </Card>
    )
}
