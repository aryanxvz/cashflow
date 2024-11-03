import prisma from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { z } from "zod";

const getHistoryDataSchema = z.object({
    timeframe: z.enum(["month", "year"]),
    month: z.coerce.number().min(0).max(11).default(0),
    year: z.coerce.number().min(2000).max(3000)
})

export async function GET(request: Request) {
    try {
        const user = await currentUser()
        if (!user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const timeframe = searchParams.get("timeframe")
        const year = searchParams.get("year")
        const month = searchParams.get("month")

        const queryParams = getHistoryDataSchema.safeParse({ timeframe, month, year })

        if (!queryParams.success) {
            return new Response(JSON.stringify({ error: queryParams.error.message }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }

        const data = await getHistoryData(user.id, queryParams.data.timeframe, {
            month: queryParams.data.month,
            year: queryParams.data.year
        })

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        })
    } catch (error) {
        console.error('History data error:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        })
    }
}

export type getHistoryDataResponsetype = Awaited<ReturnType<typeof getHistoryData>>

async function getHistoryData(userId: string, timeframe: Timeframe, period: Period) {
    switch (timeframe) {
        case "year":
            return await getYearHistoryData(userId, period.year)
        case "month":
            return await getMonthHistoryData(userId, period.year, period.month)
    }
}

type HistoryData = {
    expense: number
    income: number
    year: number
    month: number
    day?: number
}

async function getYearHistoryData(userId: string, year: number) {
    const result = await prisma.yearHistory.groupBy({
        by: ["month"],
        where: {
            userId, 
            year
        },
        _sum: {
            expense: true,
            income: true
        }, 
        orderBy: [
            {
                month: "asc"
            }
        ]
    })

    if (!result || result.length === 0) return []

    const history: HistoryData[] = []

    for (let i = 0; i < 12; i++) {
        let expense = 0
        let income = 0

        const month = result.find((row) => row.month === i)
        if (month) {
            expense = month._sum.expense || 0
            income = month._sum.income || 0
        }

        history.push({ year, month: i, expense, income})
    }

    return history
}

async function getMonthHistoryData(userId: string, year: number, month: number) {
    const result = await prisma.monthHistory.groupBy({
        by: ["day"],
        where: {
            userId,
            year,
            month
        },
        _sum: {
            expense: true,
            income: true
        },
        orderBy: [
            {
                day: "asc"
            }
        ]
    })

    if (!result || result.length === 0) return []

    const history: HistoryData[] = []
    const daysinMonth = getDaysInMonth(new Date(year, month))

    for (let i = 1; i <= daysinMonth; i++) {
        let expense = 0
        let income = 0
        const day = result.find((row) => row.day === i)
        if (day) {
            expense = day._sum.expense || 0
            income = day._sum.income || 0
        }
        history.push({ year, month, day: i, expense, income })
    }

    return history
}