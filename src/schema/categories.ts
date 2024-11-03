import exp from "constants";
import { z } from "zod";

export const CreateCategorySchema = z.object({
    name: z.string().min(3).max(20),
    type: z.enum(["Income", "Expense"])
})

export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>

export const DeleteCategorySchema = z.object({
    name: z.string().min(3).max(20),
    type: z.enum(["Income", "Expense"])
})

export type DeleteCategorySchemaType = z.infer<typeof DeleteCategorySchema>