/* eslint-disable @next/next/no-img-element */

import React from "react"
import Link from "next/link"
import useSWR from "swr"

import type { Option } from "@/types"
import type { OrderWithStatusI, ResponseGetAll } from "@/types/api"
import { ORDER_STATUS_MAP, ORDER_STATUS_OPTION } from "@/config"
import { formatDate, formatPrice } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ChartLoader from "@/components/chart/chartLoader"
import { MainLayout } from "@/components/layouts/main"
import DropdownFilter from "@/features/products/components/filter-sorter"
import Search from "@/features/sales-report/components/search/search"

export const setTextColor = (orderStatus: string): string => {
  let textColor = ""
  if (orderStatus == ORDER_STATUS_MAP.WAITING_FOR_PHARMACY)
    textColor = "text-yellow-500"
  else if (orderStatus == ORDER_STATUS_MAP.PROCESSED)
    textColor = "text-blue-500"
  else if (
    orderStatus == ORDER_STATUS_MAP.CANCELED_BY_USER ||
    orderStatus == ORDER_STATUS_MAP.CANCELED_BY_PHARMACY
  )
    textColor = "text-red-500"
  else if (
    orderStatus == ORDER_STATUS_MAP.SENT ||
    orderStatus == ORDER_STATUS_MAP.ORDER_CONFIRMED
  )
    textColor = "text-green-500"
  else textColor = ""
  return textColor
}

function OrderListPage() {
  const [search, setSearch] = React.useState<string>("")
  const [orderStatus, setOrderStatus] = React.useState<string>("")
  const { data, isLoading } = useSWR<ResponseGetAll<OrderWithStatusI[]>>(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (orderStatus) params.set("order_status_id", orderStatus)
    return `/v1/orders/user?${params.toString()}`
  })

  const mapStatus = (id: string): Option => {
    const output = ORDER_STATUS_OPTION.find((status) => status.value === id)
    if (output) return output
    return {
      label: "",
      value: "",
    }
  }

  return (
    <div className="flex justify-center py-9">
      <div className="flex w-full max-w-6xl flex-col gap-3">
        <div className="self-center text-3xl font-bold ">Order List</div>
        <div className="flex items-center gap-5">
          <Search setValue={setSearch} placeholder="Search Pharmacy" />
          <DropdownFilter
            title="Order Status"
            buttonOpener={mapStatus(orderStatus).label || "Order Status"}
            setFilter={setOrderStatus}
            filter={orderStatus ?? ""}
            options={ORDER_STATUS_OPTION}
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
                      <h3 className="text-lg font-semibold md:text-xl">
                        {order?.Pharmacy.name}
                      </h3>
                      <div className="text-base text-gray-500 dark:text-gray-400">
                        Transaction ID: {order.transaction_id}
                      </div>
                    </div>
                    <div
                      className={`flex items-center justify-center rounded-md p-2 text-xl font-medium ${setTextColor(order.Status.id)}`}
                    >
                      {order.Status.name}
                    </div>
                  </div>
                  <Separator />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-medium">
                      Total Item: {order.no_of_items}
                    </div>
                  </div>
                  <div className="text-lg text-gray-500 dark:text-gray-400">
                    Order Date: {formatDate(order?.date)}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">
                      Total Payment:{" "}
                      <span className="text-3xl font-bold text-apple-500">
                        {formatPrice(order.total_payment)}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/order/detail/${order.id}`}
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
      </div>
    </div>
  )
}
OrderListPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>
}
export default OrderListPage
