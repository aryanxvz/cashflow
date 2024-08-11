
import z from "zod"

export const CreateTransactionSchema = z.object({
    amount: z.coerce.number().positive().multipleOf(0.01),
    date: z.coerce.date(),
    description: z.string().optional(),
    category: z.string(),
    type: z.union([z.literal("Income"), z.literal("Expense")])
})

export type CreateTransactionSchemaType = z.infer<
    typeof CreateTransactionSchema
>