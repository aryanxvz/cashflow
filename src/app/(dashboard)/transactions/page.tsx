
"use client"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MAX_DATE_RANGE_DAYS } from "@/lib/constant"
import { differenceInDays, startOfMonth } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import TransactionTable from "./_components/TransactionTable"

export default function page() {
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()),
        to: new Date()
    })

    return (
        <>
            <div className="borger-b bg-card">
                <div className="flex flex-wrap items-center justify-between gap-6 py-8 px-12">
                    <div>
                        <p className="text-3xl font-bold">Transactions</p>
                    </div>
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
                            setDateRange({from, to})
                        }}/>
                </div>
            </div>

            <div className="px-12">
                <TransactionTable from={dateRange.from} to={dateRange.to} />
            </div>
        </>
    )
}