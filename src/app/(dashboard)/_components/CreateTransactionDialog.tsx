"use client"
import React, { ReactNode, useCallback, useState } from "react"
import { TransactionType } from "../../../lib/types"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { CreateTransactionSchema, type CreateTransactionSchemaType } from "../../../schema/transaction"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CategoryPicker from "../_components/CategoryPicker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { CreateTransaction } from "@/app/(dashboard)/_actions/transactions"
import { DateToUTCDate } from "../../../lib/helpers"
import { toast } from "sonner"

interface Props {
    trigger: ReactNode
    type: TransactionType
}

export default function CreateTransactionDialog({ trigger, type }: Props){
    const form = useForm<CreateTransactionSchemaType>({
        resolver: zodResolver(CreateTransactionSchema),
        defaultValues: {
            type,
            date: new Date(),
        }
    })

    const [open , setOpen] = useState(false)

    const handleCategoryChange = useCallback((value: string) => {
        form.setValue("category", value)
    }, [form])

    const queryClient = useQueryClient()

    const {mutate, isPending} = useMutation({
        mutationFn: CreateTransaction,
        onSuccess: () => {
            toast.success("Transaction created successfully" , {
                id: "create-transaction"
            })

            form.reset({
                type,
                description: "",
                amount: 0,
                date: new Date(),
                category: undefined
            })

            queryClient.invalidateQueries({
                queryKey: ["overview"]
            })

            setOpen((prev) => !prev)
        }
    })

    const onSubmit = useCallback((values: CreateTransactionSchemaType) => {
        toast.loading("Creating Transaction..", {
            id: "create-transaction"
        })

        mutate({
            ...values,
            date: DateToUTCDate(values.date)
        })
    }, [mutate])


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Create a new<span className={cn("m-1", type === "Income" ? "text-emerald-500" : "text-red-500")}>
                            {type}
                        </span>
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>

                        <FormField control={form.control} name="description" render = {({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input defaultValue={""} {...field} />
                                </FormControl>
                                <FormDescription>Transaction description (optional)</FormDescription>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="amount" render = {({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input defaultValue={0} type="number" {...field} />
                                </FormControl>
                                <FormDescription>Transaction amount (required)</FormDescription>
                            </FormItem>
                        )}/>

                        <FormField control={form.control} name="category" render = {({ field }) => (
                            <FormItem className="flex flex-col mb-2">
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <CategoryPicker type={type} onChange={handleCategoryChange} />
                                </FormControl>
                                <FormDescription>Select a category for this transaction</FormDescription>
                            </FormItem>
                        )}/>

                        <FormField control={form.control} name="date" render = {({ field }) => (
                            <FormItem className="flex flex-col mb-2">
                                <FormLabel className="ml-1">Transaction Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? (format(field.value, "PPP")): <span>Pick a date</span>}
                                                <CalendarIcon className="h-4 w-4 opacity-50 ml-auto"/>
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={field.value} onSelect={(value) => {
                                            if (!value) return
                                            field.onChange(value)
                                        }} initialFocus/>
                                    </PopoverContent>
                                </Popover>
                                <FormDescription className="ml-1">Select a date for this transaction</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </form>
                </Form>
                <DialogFooter className="flex justify-between">
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