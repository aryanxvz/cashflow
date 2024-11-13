
import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DateToUTCDate, DateToUTCEndOfDay } from "@/lib/helpers";

export async function GET(request:Request) {
    const user = await currentUser()
    if (!user) {
        redirect("sign-in")
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const queryParams = OverviewQuerySchema.safeParse({ from, to })
    if (!queryParams.success) {
        return Response.json(queryParams.error.message, {
            status: 400
        })
    }

    // Convert to UTC dates with proper day boundaries
    const fromDate = DateToUTCDate(queryParams.data.from)
    const toDate = DateToUTCEndOfDay(queryParams.data.to)

    console.log('API Date Range:', {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString()
    });

    const stats = await getBalanceStats(
        user.id,
        fromDate,
        toDate
    )

    return Response.json({
        ...stats,
        dateRange: {
            from: fromDate.toISOString(),
            to: toDate.toISOString()
        }
    })
}

export type getBalanceStatsResponseType = Awaited<ReturnType<typeof getBalanceStats>>

async function getBalanceStats(userId: string, from: Date, to: Date) {
    console.log('Database Query Date Range:', {
        from: from.toISOString(),
        to: to.toISOString()
    });

    const total = await prisma.transaction.groupBy({
        by: ["type"],
        where: {
            userId,
            date: {
                gte: from,
                lte: to
            }
        },
        _sum: {
            amount: true
        }
    })

    const result = {
        expense: total.find(t => t.type === "Expense")?._sum.amount || 0,
        income: total.find(t => t.type === "Income")?._sum.amount || 0
    };

    console.log('Query Result:', { total, result });
    
    return result;
}