import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { ChevronRightIcon } from "@radix-ui/react-icons"

import { dashboardConfig, siteConfig } from "@/config"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons"
import { SiteFooter } from "@/components/layouts/site-footer"
import { SiteHeader } from "@/components/layouts/site-header"

export function DashboardLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Head>
        <title>{`Dashboard - ${siteConfig.name}`}</title>
      </Head>

      <div className="flex min-h-screen flex-col">
        <SiteHeader />

        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <ScrollArea className="py-6 pr-6 lg:py-8">
              <Sidebar />
            </ScrollArea>
          </aside>

          <main className="flex w-full flex-col overflow-hidden">
            {children}
          </main>
        </div>

        <SiteFooter />
      </div>
    </>
  )
}

export function Sidebar() {
  const pathname = useRouter().pathname

  return (
    <div className="flex w-full flex-col gap-2 p-1">
      {dashboardConfig.sidebarNav.map((item) => {
        const Icon = item.icon ? Icons[item.icon] : ChevronRightIcon

        return (
          <Link key={item.title} href={item.href}>
            <span
              className={cn(
                "group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:bg-muted hover:text-foreground",

                pathname.includes(item.href)
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
