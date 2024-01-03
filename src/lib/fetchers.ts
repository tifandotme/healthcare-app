import useSWR, { mutate } from "swr"

import type { ProductCategoriesInputs, ProductInputs, Response } from "@/types"
import type { ApiResponse, IProduct } from "@/types/api"

/**
 * Generic fetcher for `swr`
 */
export async function fetcher<TData>(
  endpoint: string,
  options?: RequestInit,
): Promise<TData> {
  const url = new URL(endpoint, process.env.NEXT_PUBLIC_DB_URL)
  const res = await fetch(url, options)

  if (!res.ok) {
    throw new Error("Failed to fetch at " + endpoint)
  }

  return res.json()
}

interface ProductsFilter {
  drug_class?: number
  search?: string
  limit?: number
  sort?: "name" | "date"
  sort_by?: "asc" | "desc"
  page?: number
}

export const useProductData = (filters: ProductsFilter) => {
  const { drug_class, search, limit, sort, sort_by, page } = filters

  let url = "/v1/products?"
  if (search) url += `search=${search}&`
  if (limit) url += `limit=${limit}&`
  if (sort) url += `sort=${sort}&`
  if (sort_by) url += `sort_by=${sort_by}&`
  if (drug_class) url += `drug_class=${drug_class}&`
  if (page) url += `page=${page}`

  const { data, isLoading, mutate, error } =
    useSWR<ApiResponse<IProduct[]>>(url)

  const resetFilters = () => {
    mutate()
  }

  return {
    data,
    error,
    isLoading,
    mutate,
    resetFilters,
  }
}

export async function updatePost(
  mode: "add" | "edit",
  payload: ProductInputs,
  id?: number,
): Promise<Response> {
  try {
    const { ...data } = payload
    // const convertedImage = await convertToCloudinaryURL(image)

    // if (!convertedImage) {
    //   throw new Error("Failed to upload the image. Try again later")
    // }

    const url = new URL(
      `${mode === "edit" ? `/v1/products/${id}` : "/v1/products"}`,
      process.env.NEXT_PUBLIC_DB_URL,
    )
    const options: RequestInit = {
      method: mode === "add" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        // image: convertedImage,
        // slug: mode === "add" ? slugify(data.name) : undefined,
      }),
    }

    // satisfies Partial<Omit<ProductsSchema, "id">>

    const res = await fetch(url, options)

    if (!res.ok) {
      throw new Error("Failed to update a product")
    }

    // Revalidate path if edited
    // if (mode === "edit") {
    //   const slug = (await res.json()).slug as string

    //   await fetch(`/api/revalidate?slug=${slug}`)
    // }

    if (mode === "edit") {
      mutate(url)
    }

    return {
      success: true,
      message: `Product ${mode === "add" ? "added" : "updated"}`,
    }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong",
    }
  }
}

export async function deletePost(id: number): Promise<Response> {
  try {
    const url = new URL(`/v1/products/${id}`, process.env.NEXT_PUBLIC_DB_URL)
    const options: RequestInit = {
      method: "DELETE",
    }

    const res = await fetch(url, options)

    if (!res.ok) {
      throw new Error("Failed to delete a product")
    }

    mutate(url)

    return {
      success: true,
      message: "Products deleted",
    }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong",
    }
  }
}

export async function updateProductCategory(
  mode: "add" | "edit",
  payload: ProductCategoriesInputs,
  id?: number,
): Promise<Response> {
  try {
    const { ...data } = payload

    const url = new URL(
      `${
        mode === "edit"
          ? `/v1/product-categories/${id}`
          : "/v1/product-categories"
      }`,
      process.env.NEXT_PUBLIC_DB_URL,
    )
    const options: RequestInit = {
      method: mode === "add" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        // slug: mode === "add" ? slugify(data.name) : undefined,
      }),
    }

    const res = await fetch(url, options)

    if (!res.ok) {
      throw new Error("Failed to update a product category")
    }

    // Revalidate path if edited
    // if (mode === "edit") {
    //   const slug = (await res.json()).slug as string
    //   await fetch(`/api/revalidate?slug=${slug}`)
    // }

    if (mode === "edit") {
      mutate(url)
    }

    return {
      success: true,
      message: `Product category ${mode === "add" ? "added" : "updated"}`,
    }
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong please try again",
    }
  }
}

export async function deleteProductCategory(id: number): Promise<Response> {
  try {
    const url = new URL(
      `/v1/product-categories/${id}`,
      process.env.NEXT_PUBLIC_DB_URL,
    )
    const options: RequestInit = {
      method: "DELETE",
    }

    const res = await fetch(url, options)

    if (!res.ok) {
      throw new Error("Failed to delete a product category")
    }

    return {
      success: true,
      message: "Product category deleted",
    }
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong please try again",
    }
  }
}
