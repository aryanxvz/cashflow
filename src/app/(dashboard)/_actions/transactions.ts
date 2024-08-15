
"use server"
import { currentUser } from "@clerk/nextjs/server";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "../../../schema/transaction";
import { redirect } from "next/navigation";
import prisma from "../../../lib/prisma";

export async function CreateTransaction(form : CreateTransactionSchemaType) {
    const parsedBody = CreateTransactionSchema.safeParse(form)
    if (!parsedBody.success) {
        throw new Error(parsedBody.error.message)
    }

    const user = await currentUser()
    if (!user) {
        redirect("sign-in")
    }

    const { amount, category, date, description, type } = parsedBody.data
    const categoryRow = await prisma.category.findFirst({
        where: {
            userId: user.id,
            name: category
        }
    })

    if (!categoryRow) {
        throw new Error("Category not found")
    }

    //
    await prisma.$transaction([
        prisma.transaction.create({
            data: {
                userId: user.id,
                amount,
                date,
                type,
                description: description || "",
                category: categoryRow.name
            },
        }),

        prisma.monthHistory.upsert({
            where: {
                day_month_year_userId: {
                    userId: user.id,
                    day: date.getUTCDate(),
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear()
                },
            },
            create: {
                userId: user.id,
                day: date.getUTCDate(),
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                expense: type === "Expense" ? amount: 0,
                income: type === "Income" ? amount: 0
            },
            update: {
                expense: {
                    increment: type === "Expense" ? amount : 0
                },
                income: {
                    increment: type === "Income" ? amount : 0
                },
            },
        }),

        prisma.yearHistory.upsert({
            where: {
                month_year_userId: {
                    userId: user.id,
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear()
                },
            },
            create: {
                userId: user.id,
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                expense: type === "Expense" ? amount: 0,
                income: type === "Income" ? amount: 0
            },
            update: {
                expense: {
                    increment: type === "Expense" ? amount : 0
                },
                income: {
                    increment: type === "Income" ? amount : 0
                }
            }
        })
        
    ])
}