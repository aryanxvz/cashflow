"use client"
import { GetTransactionsHistoryResponseType } from "@/app/api/transaction-history/route"
import { DataTableColumnHeader } from "@/components/datatable/columnHeader"
import { DataTableViewOptions } from "@/components/datatable/columnToggle"
import { DataTableFacetedFilter } from "@/components/datatable/facetedFilters"
import SkeletonWrapper from "@/components/SkeletonWrapper"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DateToUTCDate } from "@/lib/helpers"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { generateCsv, download, mkConfig } from "export-to-csv"
import { DownloadIcon, MoreHorizontal, TrashIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import DeleteTransactionDialog from "./DeleteTransactionDialog"

interface Props {
    from: Date
    to: Date
}

const emptyData: any[] = []

type TransactionHistoryRow = GetTransactionsHistoryResponseType[0]

const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true
})

export default function TransactionTable({ from, to }: Props) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const columns: ColumnDef<TransactionHistoryRow>[] = [
        {
            accessorKey: "category",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Category" />
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
            cell: ({ row }) => (
                <div className="capitalize font-medium min-w-[150px] py-2">
                    {row.original.category}
                </div>
            )
        },
        {
            accessorKey: "description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Description" />
            ),
            cell: ({ row }) => (
                <div className="capitalize text-sm text-gray-600 dark:text-gray-300 min-w-[200px] py-2">
                    {row.original.description}
                </div>
            )
        },
        {
            accessorKey: "date",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Date" />
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.date)
                const formattedDate = date.toLocaleDateString("default", {
                    timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit"
                })
                return <div className="text-sm text-muted-foreground min-w-[150px] whitespace-nowrap py-2">
                    {formattedDate}
                </div>
            }
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Type" />
            ),
            cell: ({ row }) => (
                <div className={cn("capitalize text-sm font-medium px-3 py-1 rounded-md w-24 min-w-[150px] text-center",
                    row.original.type === "Income" && "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
                    row.original.type === "Expense" && "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400")}>
                    {row.original.type}
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Amount" />
            ),
            cell: ({ row }) => (
                <div className={cn("text-sm font-semibold whitespace-nowrap py-2 rounded-lg w-32 text-left px-2",
                    row.original.type === "Income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                    {row.original.formatterdAmount}
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            enableHiding: false,
            size: 5,
            cell: ({ row }) => (
                <div className="w-8 ml-2">
                    <RowActions 
                        transaction={row.original}
                        from={from}  // Pass the from prop
                        to={to}     // Pass the to prop
                    />
                </div>
            )
        }
    ]

    const history = useQuery<GetTransactionsHistoryResponseType>({
        queryKey: ["transactions", "history", from, to],
        queryFn: () => fetch(`/api/transaction-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then((res) => res.json())
    })

    const handleExportCSV = (data: any[]) => {
        const csv = generateCsv(csvConfig)(data)
        download(csvConfig)(csv)
    }

    const table = useReactTable({
        data: history.data || emptyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
            columnFilters
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    })

    const categoriesOptions = useMemo(() => {
        const categoriesMap = new Map()
        history.data?.forEach((transaction) => {
            categoriesMap.set(transaction.category, {
                value: transaction.category,
                label: `${transaction.category}`
            })
        })
        const uniqueCategories = new Set(categoriesMap.values())
        return Array.from(uniqueCategories)
    }, [history.data])

    return (
        <div className="w-full space-y-4 pt-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    {table.getColumn("category") && (
                        <DataTableFacetedFilter
                            title="Category"
                            column={table.getColumn("category")}
                            options={categoriesOptions}
                        />
                    )}
                    {table.getColumn("type") && (
                        <DataTableFacetedFilter
                            title="Type"
                            column={table.getColumn("type")}
                            options={[
                                { label: "Income", value: "income" },
                                { label: "Expense", value: "expense" }
                            ]}
                        />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3 flex items-center gap-2"
                        onClick={() => {
                            const data = table.getFilteredRowModel().rows.map(row => ({
                                category: row.original.category,
                                description: row.original.description,
                                type: row.original.type,
                                amount: row.original.amount,
                                formatterdAmount: row.original.formatterdAmount,
                                date: row.original.date,
                            }))
                            handleExportCSV(data)
                        }}
                    >
                        <DownloadIcon className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <DataTableViewOptions table={table} />
                </div>
            </div>
            
            <SkeletonWrapper isLoading={history.isFetching}>
                <div className="rounded-lg border shadow-sm bg-white dark:bg-zinc-950">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="h-11 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 px-4"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 px-4"
                    >
                        Next
                    </Button>
                </div>
            </SkeletonWrapper>
        </div>
    )
}

function RowActions({ transaction, from, to }: { 
    transaction: TransactionHistoryRow; 
    from: Date; 
    to: Date; 
}) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    return (
        <>
            <DeleteTransactionDialog 
                open={showDeleteDialog} 
                setOpen={setShowDeleteDialog} 
                transactionId={transaction.id}
                fromDate={from}
                toDate={to}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 p-0 w-8">
                        <span className="sr-only">Open Menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="flex items-center gap-2"
                        onSelect={() => setShowDeleteDialog(true)}
                    >
                        <TrashIcon className="h-4 w-4 text-muted-foreground" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}