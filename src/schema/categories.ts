import exp from "constants";
import { z } from "zod";

export const CreateCategorySchema = z.object({
    name: z.string().min(3).max(20),
    icon: z.string().max(20).optional(),
    type: z.enum(["Income", "Expense"])
})

export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>