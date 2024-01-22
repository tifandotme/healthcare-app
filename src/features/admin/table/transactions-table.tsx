import React from "react"
import Link from "next/link"
import { DotsHorizontalIcon, ExternalLinkIcon } from "@radix-ui/react-icons"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import type { KeyedMutator } from "swr"

import type {
  ITransaction,
  ITransactionStatus,
  ResponseGetAll,
} from "@/types/api"
import { deleteProducts, updatePayment } from "@/lib/fetchers"
import { formatPrice } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TransactionsTableProps<TData = Omit<ITransaction[], "orders">> {
  data: TData
  mutate: KeyedMutator<ResponseGetAll<TData>>
  pageCount: number
  current_page: number
}

export function TransactionTable({
  data,
  mutate,
  pageCount,
  current_page,
}: TransactionsTableProps) {
  const transaction = data.map((m, index) => ({
    id: (current_page - 1) * 10 + (index + 1),
    payment_method: m.payment_method,
    total_payment: m.total_payment,
    date: m.date,
    transaction_status: m.transaction_status,
  }))

  type Data = (typeof transaction)[number]

  const columns = React.useMemo<ColumnDef<Data, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="No" />
        ),
      },
      {
        accessorKey: "payment_method",
        minSize: 200,
        maxSize: 200,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment Method" />
        ),
      },
      {
        accessorKey: "total_payment",
        minSize: 200,
        maxSize: 200,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total Payment" />
        ),
        cell: ({ cell }) => {
          const total = cell.getValue() as number
          return <span>{formatPrice(total)}</span>
        },
      },
      {
        accessorKey: "transaction_status",
        minSize: 200,
        maxSize: 200,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status Payment" />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue() as ITransactionStatus
          switch (status.id) {
            case 1:
              return <Badge variant={"destructive"}>{status.name}</Badge>
            case 2:
              return <Badge variant={"secondary"}>{status.name}</Badge>
            case 3:
              return <Badge className="bg-yellow-500">{status.name}</Badge>
            case 4:
              return <Badge variant={"success"}>{status.name}</Badge>
            case 5:
              return <Badge variant={"destructive"}>{status.name}</Badge>
            default:
              return <Badge variant={"default"}>{status.name}</Badge>
          }
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <DotsHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[130px]">
              <DropdownMenuItem asChild>
                <Link
                  href={`/order/transaction-detail/${row.original.id}`}
                  target="_blank"
                  className="flex justify-between"
                >
                  View
                  <ExternalLinkIcon className="ml-1.5 size-3.5" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger
                    className="w-full text-sm"
                    onClick={(e) => e.stopPropagation()}
                    asChild
                  >
                    <span>Accept</span>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Accept</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to accept this payment. This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          const handleAccept = async () => {
                            const { success, message } = await updatePayment(
                              row.original.id,
                              "accept",
                            )
                            if (!success) throw new Error(message)
                            await mutate()
                          }
                          toast.promise(handleAccept(), {
                            loading: "Accepting payment...",
                            success: "Payment accepted successfully",
                            error: (err) => `${err.message}`,
                          })
                        }}
                      >
                        Accept
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger
                    className="w-full text-sm"
                    onClick={(e) => e.stopPropagation()}
                    asChild
                  >
                    <span>Reject</span>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to reject this payment. This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          const handleReject = async () => {
                            const { success, message } = await updatePayment(
                              row.original.id,
                              "reject",
                            )
                            if (!success) throw new Error(message)
                            await mutate()
                          }
                          toast.promise(handleReject(), {
                            loading: "Rejecting payment...",
                            success: "Payment rejected successfully",
                            error: (err) => `${err.message}`,
                          })
                        }}
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [mutate],
  )

  return (
    <DataTable
      columns={columns}
      data={transaction}
      pageCount={pageCount}
      includeSearch={false}
      filterableColumns={[
        {
          id: "transaction_status",
          title: "Status",
          options: [
            { label: "Unpaid", value: "1" },
            { label: "Waiting for Payment", value: "2" },
            { label: "Payment Rejected", value: "3" },
            { label: "Paid", value: "4" },
            { label: "Canceled", value: "5" },
          ],
        },
      ]}
    />
  )
}
