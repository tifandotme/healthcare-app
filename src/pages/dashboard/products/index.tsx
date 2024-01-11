import React from "react"
import { useRouter } from "next/router"
import useSWR from "swr"

import type { IProduct, ResponseGetAll } from "@/types/api"
import { DataTableSkeleton } from "@/components/ui/data-table/data-table-skeleton"
import { DashboardLayout } from "@/components/layouts/dashboard"
import { ProductTable } from "@/features/admin/table/product-table"
import ProductLayout from "@/features/products/components/layout"

export default function ProductTablePage() {
  const router = useRouter()
  const { page, per_page, search, sort } = router.query

  const { data, isLoading, mutate } = useSWR<ResponseGetAll<IProduct[]>>(() => {
    const params = new URLSearchParams()
    if (page) params.set("page", page)
    if (per_page) params.set("limit", per_page)
    if (search) params.set("search", search)
    if (sort) params.set("sort_by", sort.split(".")[0] as string)
    if (sort) params.set("sort", sort.split(".")[1] as string)

    return `/v1/products?${params.toString()}`
  })

  return (
    <>
      <div className="space-y-6 overflow-auto">
        {isLoading && !data && (
          <DataTableSkeleton columnCount={5} filterableFieldCount={0} />
        )}

        {data && (
          <ProductTable
            data={data.data.items}
            mutate={mutate}
            pageCount={data?.data.total_pages}
          />
        )}
      </div>
    </>
  )
}

ProductTablePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardLayout>
      <ProductLayout>{page}</ProductLayout>
    </DashboardLayout>
  )
}
