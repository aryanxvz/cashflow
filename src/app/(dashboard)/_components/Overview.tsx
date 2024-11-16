"use client"
import { UserSettings } from "@prisma/client"
import { differenceInDays, startOfMonth, startOfDay, endOfDay } from "date-fns"
import React, { useState } from "react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MAX_DATE_RANGE_DAYS } from "@/lib/constant"
import { toast } from "sonner"
import StatsCards from "./StatsCard"
import CategoriesStats from "./CategoreiesStats"
import { DateToUTCDate } from "@/lib/helpers"

export default function Overview({ userSettings }: { userSettings: UserSettings }) {
    // Initialize with UTC dates
    const [dateRange, setDateRange] = useState<{from: Date; to: Date}>({
        from: DateToUTCDate(startOfDay(startOfMonth(new Date()))),
        to: DateToUTCDate(endOfDay(new Date()))
    })

    return (
        <div className="mx-8 md:mx-12">
            <div className="flex flex-wrap items-end justify-between gap-4 py-4">
                <h2 className="text-2xl font-bold">Overview</h2>
                <div className="flex items-center">
                    <DateRangePicker
                        initialDateFrom={dateRange.from}
                        initialDateTo={dateRange.to}
                        showCompare={false} 
                        onUpdate={(values) => {
                            const { from, to } = values.range

                            if (!from || !to) return
                            if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                                toast.error(`The selected date range is too big. Max allowed range is ${MAX_DATE_RANGE_DAYS} days`)
                                return
                            }
                            
                            setDateRange({
                                from: DateToUTCDate(startOfDay(from)),
                                to: DateToUTCDate(endOfDay(to))
                            })
                        }}/>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <StatsCards
                    userSettings={userSettings}
                    from={dateRange.from}
                    to={dateRange.to}
                />

                <CategoriesStats 
                    userSettings={userSettings}
                    from={dateRange.from}
                    to={dateRange.to}
                />
            </div>
        </div>
    )
}