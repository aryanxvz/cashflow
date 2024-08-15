
"use client"
import { useCallback, useState } from "react"
import { TransactionType } from "../../../lib/types"
import { useForm } from "react-hook-form"
import { CreateCategorySchema, CreateCategorySchemaType } from "../../../schema/categories"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button";
import React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, PlusSquare } from "lucide-react"
import { DialogTitle } from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CreateCategory } from "@/app/(dashboard)/_actions/categories"
import { Category } from "@prisma/client"
import { toast } from "sonner"

interface Props {
    type: TransactionType
    successCallback: (category: Category) => void
}

export default function CreateCategoryDialog({ type, successCallback }: Props) {
    const [open,  setOpen] = useState(false)
    const form = useForm<CreateCategorySchemaType>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: {
            type
        }
    })

    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: CreateCategory,
        onSuccess: async (data: Category) => {
            form.reset({
                name: "",
                type
            })

            toast.dismiss("create-category")
            toast.success(`Category ${data.name} created successfully!`, {
                id: "create-category"
            })

            successCallback(data)

            await queryClient.invalidateQueries({
                queryKey: ["categories"]
            })

            setOpen(false)
        },

        onError: () => {
            toast.dismiss("create-category")

            toast.error("Something went wrong", {
                id: "create-catgory"
            })
        }
    })

    const onSubmit = useCallback((values: CreateCategorySchemaType) => {
            toast.loading("Creating category...", {
                id: "create-category",
            });
            mutate(values);
    },[mutate]);


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"ghost"} className="flex items-center justify-start border-separate rounded-none border-b px-3 py-3 text-muted-foreground">
                    <PlusSquare className="mr-2 h-4 w-4"/>Create new
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create new<span className={cn("m-1", type === "Income" ? "text-emerald-500" : "text-red-500")}>{type}</span>category
                    </DialogTitle>
                    <DialogDescription>
                        Categories are used top group your transactions
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField control={form.control} name="name" render = {({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Category" {...field} />
                                </FormControl>
                                <FormDescription>Transaction description (optional)</FormDescription>
                            </FormItem>
                        )}/>
                    </form>
                </Form>
            
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant={"secondary"} onClick={() => { form.reset() }}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                        {!isPending && "Create"} {isPending && <Loader2 className="animate-spin"/>}
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}