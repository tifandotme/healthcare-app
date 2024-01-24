/* eslint-disable @next/next/no-img-element */

import React from "react"
import Link from "next/link"
import useSWR from "swr"

import type { Option } from "@/types"
import type { ITransaction, ResponseGetAll } from "@/types/api"
import { PAYMENT_STATUS_OPTION } from "@/config"
import { formatDate, formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ChartLoader from "@/components/chart/chartLoader"
import { MainLayout } from "@/components/layouts/main"
import DropdownFilter from "@/features/products/components/filter-sorter"
import PaginationComponent from "@/features/products/components/pagination-product"

function TransactionListPage() {
  const [orderStatus, setOrderStatus] = React.useState<string>("")
  const [page, setCurrentPage] = React.useState<number>(1)
  const limit = 10
  const { data, isLoading } = useSWR<
    ResponseGetAll<Omit<ITransaction[], "orders">>
  >(() => {
    const params = new URLSearchParams()
    if (orderStatus) params.set("transaction_status_id", orderStatus)
    if (limit) params.set("limit", limit.toString())
    if (page) params.set("page", page.toString())

    return `/v1/transactions?${params.toString()}`
  })

  const mapStatus = (id: string): Option => {
    const output = PAYMENT_STATUS_OPTION.find((status) => status.value === id)
    if (output) return output
    return {
      label: "",
      value: "",
    }
  }

  const renderBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant={"destructive"}>Unpaid</Badge>
      case 2:
        return <Badge className="bg-orange-500">Waiting for Confirmation</Badge>
      case 3:
        return <Badge className="bg-yellow-500">Payment Rejected</Badge>
      case 4:
        return <Badge variant={"success"}>Paid</Badge>
      case 5:
        return <Badge variant={"destructive"}>Canceled</Badge>
      default:
        return <Badge variant={"default"}>Unknown</Badge>
    }
  }

  return (
    <div className="flex justify-center py-9">
      <div className="flex w-full max-w-6xl flex-col gap-3">
        <div className="self-center text-3xl font-bold ">Transaction List</div>
        <div className="flex items-center gap-5">
          <DropdownFilter
            title="Order Status"
            buttonOpener={mapStatus(orderStatus).label || "Order Status"}
            setFilter={setOrderStatus}
            filter={orderStatus ?? ""}
            options={PAYMENT_STATUS_OPTION}
          />
        </div>
        <div className="grid grid-cols-1 gap-5">
          {isLoading ? (
            <ChartLoader />
          ) : (
            data &&
            data.data.items.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-base text-gray-500 dark:text-gray-400">
                        Transaction ID: {order.id}
                      </div>
                      <h3 className="text-lg font-semibold md:text-xl">
                        {order?.address}
                      </h3>
                    </div>
                    <div className="flex items-center justify-center rounded-md p-2 text-xl font-medium">
                      {renderBadge(order.transaction_status.id)}
                    </div>
                  </div>
                  <Separator />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-medium">
                      {order.payment_method}
                    </div>
                  </div>
                  <div className="text-lg text-gray-500 dark:text-gray-400">
                    Order Date: {formatDate(order?.date)}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-apple-500">
                      {formatPrice(order.total_payment)}
                    </span>
                  </div>
                  <Link
                    href={`/order/transaction-detail/${order.id}`}
                    className="text-blue-500"
                  >
                    View Detail
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
          {!isLoading && data && data.data.items.length === 0 && (
            <div className="flex py-9">
              <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-3">
                <img
                  src={`${process.env.NEXT_PUBLIC_SITE_PATH}/images/empty-order.svg`}
                  className=""
                  width="600px"
                  height="600px"
                  alt=""
                />
                <div className="self-center text-3xl font-bold ">
                  No Order Found
                </div>
              </div>
            </div>
          )}
        </div>
        <PaginationComponent
          page={data?.data.current_page || 1}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  )
}
TransactionListPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>
}
export default TransactionListPage