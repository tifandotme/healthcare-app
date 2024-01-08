import React from "react"
import { useRouter } from "next/router"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import useSWR from "swr"

import type { PharmacyProductInputs } from "@/types"
import type { IProduct, PharmacyProductById, ResponseGetAll } from "@/types/api"
import { updatePharmacyProduct } from "@/lib/fetchers"
import { cn, toSentenceCase } from "@/lib/utils"
import { pharmacyProductSchema } from "@/lib/validations/pharmacies"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Icons } from "@/components/icons"

interface PharmacyProductFormProps {
  mode: "add" | "edit"
  initialData?: PharmacyProductById
}

export function PharmacyProductForm({
  mode,
  initialData,
}: PharmacyProductFormProps) {
  const router = useRouter()

  const form = useForm<PharmacyProductInputs>({
    resolver: zodResolver(pharmacyProductSchema),
    defaultValues: {
      product_id: initialData?.product_id ?? 0,
      price: initialData?.price ?? "",
      is_active: initialData?.is_active ?? false,
    },
  })

  const onSubmit = async (data: PharmacyProductInputs) => {
    const { success, message } = await updatePharmacyProduct(
      mode,
      {
        pharmacy_id: Number(router.query.id),
        ...data,
      },
      initialData?.id,
    )

    if (success) {
      toast.success(message)
      router.push(`/dashboard/pharmacies/${router.query.id}/products`)
    } else {
      toast.error(message)
    }
  }

  return (
    <Form {...form}>
      <form
        className="grid w-full max-w-2xl gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="product_id"
          render={({ field }) => (
            <ProductsCombobox
              mode={mode}
              productId={form.watch("product_id")}
              value={field.value}
              onValueChange={(value) => field.onChange(+value)}
            />
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10000"
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number(e.target.value).toString())
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormControl>
                <div className="flex py-1">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-muted-foreground">
                Activate this product to make it available for purchase.
              </FormMessage>
            </FormItem>
          )}
        />

        <div className="mt-4 flex gap-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-fit"
          >
            {form.formState.isSubmitting && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {toSentenceCase(mode)} product
          </Button>
        </div>
      </form>
    </Form>
  )
}

interface ProductsComboboxProps {
  mode: "add" | "edit"
  productId: number
  value: number
  onValueChange: (value: string) => void
}

function ProductsCombobox({
  mode,
  productId,
  value,
  onValueChange,
}: ProductsComboboxProps) {
  const [query, setQuery] = React.useState("")
  const debouncedQuery = useDebounce(query)

  const { data, isLoading: isLoadingProducts } = useSWR<
    ResponseGetAll<IProduct[]>
  >(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set("search", debouncedQuery)

    return `/v1/products?${params.toString()}`
  })

  const currProduct = React.useMemo(() => {
    if (!data) return

    return data.data.items.find((product) => product.id === productId)
  }, [productId, data])

  return (
    <FormItem>
      <FormLabel>Product</FormLabel>
      <div className="rounded-bg flex justify-between rounded-md border p-4">
        {currProduct ? (
          <div className="flex flex-col text-sm">
            {currProduct.name}
            <span className="text-muted-foreground">
              {currProduct.generic_name}
            </span>
          </div>
        ) : (
          <div className="flex flex-col text-sm leading-10 text-muted-foreground">
            No product selected
          </div>
        )}
      </div>
      {mode === "add" && (
        <Command shouldFilter={false} className="h-[380px] rounded-md border">
          <CommandInput
            placeholder="Search product.."
            onValueChange={(value) => setQuery(value)}
            className="w-full"
          />
          <CommandList aria-label="Products" className="max-h-none">
            {isLoadingProducts &&
              Array.from({ length: 3 }).map((_, i) => (
                <div className="p-[10px]" key={i}>
                  <Skeleton className="h-[53px] w-full" />
                </div>
              ))}
            {data?.data.items.length === 0 && (
              <div className="p-4 text-center text-sm leading-10">
                No products found
              </div>
            )}
            {!isLoadingProducts &&
              data?.data.items.map((product, idx) => (
                <CommandItem
                  key={product.id}
                  value={String(product.id)}
                  className={cn(
                    "flex items-center justify-between border-b p-4 hover:cursor-pointer",
                    idx === product.length && "border-0",
                  )}
                  onSelect={onValueChange}
                >
                  <div className="flex flex-col">
                    {product.name}
                    <span className="text-muted-foreground">
                      {product.generic_name}
                    </span>
                  </div>
                  {value === product.id && <CheckIcon className="h-4 w-4" />}
                </CommandItem>
              ))}
          </CommandList>
        </Command>
      )}
      <FormMessage />
    </FormItem>
  )
}
