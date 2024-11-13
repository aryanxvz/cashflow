"use client"
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent,
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DeleteTransaction } from "../_actions/deleteTransaction"

interface Props {
    open: boolean
    setOpen: (open: boolean) => void
    transactionId: string
    fromDate: Date
    toDate: Date
}

export default function DeleteTransactionDialog({ open, setOpen, transactionId, fromDate, toDate }: Props) {
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const result = await DeleteTransaction(id)
            if (!result?.success) {
                throw new Error('Failed to delete transaction')
            }
            return result
        },
        onSuccess: async () => {
            // First close the dialog
            setOpen(false)
            
            // Then invalidate both specific and general queries
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["transactions", "history", fromDate, toDate]
                }),
                queryClient.invalidateQueries({
                    queryKey: ["transactions"]
                })
            ])

            // Show success toast after the query is invalidated
            toast.success("Transaction deleted successfully")
        },
        onError: (error) => {
            console.error('Delete transaction error:', error)
            toast.error("Failed to delete transaction. Please try again.")
        }
    })

    const handleDelete = async () => {
        const toastId = toast.loading("Deleting transaction...")
        try {
            await deleteMutation.mutateAsync(transactionId)
        } catch (error) {
            console.error('Delete handling error:', error)
        } finally {
            toast.dismiss(toastId)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. Your transaction will be permanently deleted!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}