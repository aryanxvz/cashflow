"use server"
import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function DeleteTransaction(id: string) {
    try {
        const user = await currentUser()
        if (!user) {
            redirect("/sign-in")
        }

        const transaction = await prisma.transaction.findUnique({
            where: {
                userId: user.id,
                id
            }
        })

        if (!transaction) {
            throw new Error("Transaction not found")
        }

        // Use a transaction to ensure all operations succeed or fail together
        await prisma.$transaction([
            // Update month history
            prisma.monthHistory.update({
                where: {
                    day_month_year_userId: {
                        userId: user.id,
                        day: transaction.date.getUTCDate(),
                        month: transaction.date.getUTCMonth(),
                        year: transaction.date.getUTCFullYear(),
                    },
                },
                data: {
                    ...(transaction.type === "Expense" && {
                        expense: {
                            decrement: transaction.amount
                        },
                    }),
                    ...(transaction.type === "Income" && {
                        income: {
                            decrement: transaction.amount
                        },
                    }),
                }
            }),

            // Update year history
            prisma.yearHistory.update({
                where: {
                    month_year_userId: {
                        userId: user.id,
                        month: transaction.date.getUTCMonth(),
                        year: transaction.date.getUTCFullYear(),
                    },
                },
                data: {
                    ...(transaction.type === "Expense" && {
                        expense: {
                            decrement: transaction.amount
                        },
                    }),
                    ...(transaction.type === "Income" && {
                        income: {
                            decrement: transaction.amount
                        },
                    }),
                }
            }),

            // Delete the transaction
            prisma.transaction.delete({
                where: {
                    id: transaction.id,
                    userId: user.id
                }
            })
        ])

        return { success: true }
    } catch (error) {
        console.error('Delete transaction error:', error)
        throw error
    }
}