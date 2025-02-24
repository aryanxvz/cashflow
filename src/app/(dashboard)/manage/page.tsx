
"use client"
import { CurrencyBox } from "@/components/CurrencyBox"
import SkeletonWrapper from "@/components/SkeletonWrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionType } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { PlusSquare, TrashIcon, TrendingDown, TrendingUp } from "lucide-react"
import CreateCategoryDialog from "../_components/CreateCategoryDialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Category } from "@prisma/client"
import DeleteCategories from "../_components/DeleteCategory"

export default function page() {
    return (
        <>
            <div className="border-b bg-card">
                <div className="flex flex-wrap items-center justify-between gap-6 py-8 px-8 lg:px-12">
                    <div>
                        <p className="text-3xl font-bold">Manage</p>
                        <p className="text-muted-foreground">Manage your account settings and categories</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 py-4 px-8 pb-16">
                <Card>
                    <CardHeader>
                        <CardTitle>Currency</CardTitle>
                        <CardDescription>Set your default currency for transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CurrencyBox />
                    </CardContent>
                </Card>

                <CategoryList type="Income" />
                <CategoryList type="Expense" />
            </div>
        </>
    )
}

function CategoryList({ type }: { type: TransactionType }) {
    const categoriesQuery = useQuery({
        queryKey: ["categories", type],
        queryFn: () => fetch(`/api/categories?type=${type}`).then((res) => res.json())
    })

    const dataAvailable = categoriesQuery.data && categoriesQuery.data.length > 0

    return (
        <SkeletonWrapper isLoading={categoriesQuery.isLoading}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-4">
                            { type === "Expense" ? (
                                <TrendingDown className="h-12 w-12 items-center rounded-lg bg-red-500/10 text-red-500 p-2" />
                            ) : (
                                <TrendingUp className="h-12 w-12 items-center rounded-lg bg-emerald-500/10 text-emerald-500 p-2" />
                            )}
                            <div>
                                { type === "Income" ? "Incomes" : "Expenses" } categories
                                <div className="text-sm text-muted-foreground">Sorted by name</div>
                            </div>
                        </div>

                        <CreateCategoryDialog type={type}
                            successCallback={() => categoriesQuery.refetch()}
                            trigger = {
                                <Button className="gap-2 text-sm">
                                    <PlusSquare className="h-4 w-4" />
                                    <div className="hidden lg:inline">
                                        Create Category
                                    </div>
                                </Button>
                            }
                        />

                    </CardTitle>
                </CardHeader>
                <Separator />

                {!dataAvailable && (
                    <div className="flex h-40 w-full flex-col items-center justify-center">
                        <p>
                            Np{" "}
                            <span className={cn("m-1", type === "Income" ? "text-emerald-500" : "text-red-500" )}>
                                {type}
                            </span> categories yet
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Create one to get started
                        </p>
                    </div>
                )}

                {dataAvailable && (
                    <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {categoriesQuery.data.map((category: Category) => (
                            <CategoryCard category={category} key={category.name} />
                        ))}
                    </div>
                )}
                
            </Card>
        </SkeletonWrapper>
    )
}

function CategoryCard({ category }: { category: Category }) {
    return (
        <div className="flex flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1] border-separate">
            <div className="flex flex-col items-center gap-2 p-4">
                <span>
                    {category.name}
                </span>
            </div>

            <DeleteCategories category={category} trigger={
                <Button className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20" variant={"secondary"}>
                    <TrashIcon className="h-4 w-4" /> Remove
                </Button>
            } />
        </div>
    )
}