import type { z } from "zod"

import type { productCategoriesSchema } from "@/lib/validations/product-categories-schema"
import type { productSchema } from "@/lib/validations/products-schema"

export type ResponseGetAll<TData = unknown> = {
  data: {
    total_items: number
    total_pages: number
    current_page_total_items: number
    current_page: number
    items: TData
  }
  errors?: string[]
}

export type ResponseById<TData = unknown> = {
  data: TData
  errors?: string[]
}

// GET /v1/pharmacies/:id

export type Pharmacy = {
  id: number
  pharmacy_admin_id: number
  name: string
  address: string
  sub_district: string
  district: string
  city: string
  province: string
  postal_code: string
  latitude: string
  longitude: string
  pharmacist_name: string
  pharmacist_license_no: string
  pharmacist_phone_no: string
  operational_hours_open: number
  operational_hours_close: number
  operational_days: string[]
}

// FOR SCHEMAS
export type ProductsSchema = {
  data: {
    id: number
  } & z.infer<typeof productSchema>
}

export type ProductsCategoriesSchema = {
  data: {
    id: number
  } & z.infer<typeof productCategoriesSchema>
}

// USE THIS FOR FAKE DATA
export type ProductsResponse = {
  total_items?: number
  total_pages?: number
  current_page_total_items?: number
  current_page?: number
  items: Item[]
}

// GET ALL PRODUCTS AND PRODUCTS/:ID

export type Item = {
  id: number
  name: string
  generic_name: string
  content: string
  manufacturer_id: number
  description: string
  drug_classification_id: number
  product_category_id: number
  drug_form: string
  unit_in_pack: string
  selling_unit: string
  weight: number
  length: number
  width: number
  height: number
  image: string
  price: string
  created_at: Date
  updated_at: Date
}

// GET ALL PRODUCT CATEGORIES FOR FAKER

export type ProductCategoriesResponse = {
  data: Categories[]
}

export type Categories = {
  id: number
  name: string
}

export type ProductsManufacturers = {
  id: number
}

export type ProductsManufacturersResponse = {
  data: Manufacturers[]
}

export type Manufacturers = {
  id: number
  name: string
}

export type DrugClass = {
  id: number
}

export type DrugClassResponse = {
  data: DrugClasses[]
}

export type DrugClasses = {
  id: number
  name: string
}

// FOR REAL BACKEND USES
export interface ApiResponse<T> {
  data: {
    total_items?: number
    total_pages?: number
    current_page_total_items?: number
    current_page?: number
    items: T
  }
}
export interface IDrugClassification {
  id: number
  name: string
}

export interface IManufacturer {
  id: number
  name: string
}
export interface IProductCategory {
  id: number
  name: string
}
export interface IProduct {
  id: number
  name: string
  generic_name: string
  content: string
  manufacturer_id: number
  description: string
  drug_classification_id: number
  product_category_id: number
  drug_form: string
  unit_in_pack: string
  selling_unit: string
  weight: number
  length: number
  width: number
  height: number
  image: string
  price: string
  created_at: string
  updated_at: string
}
