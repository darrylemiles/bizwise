import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function PortalLoading() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="border-b">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex h-12 items-center gap-2 rounded-xl px-3">
                <Skeleton className="size-8 rounded-lg" />

                <div className="grid flex-1 gap-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {[0, 1, 2].map((groupIndex) => (
            <SidebarGroup key={groupIndex}>
              <SidebarGroupLabel>
                <Skeleton className="h-3 w-20" />
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {[0, 1, 2, 3].map((itemIndex) => (
                    <SidebarMenuItem key={itemIndex}>
                      <div className="flex h-8 items-center gap-2 rounded-xl px-3">
                        <Skeleton className="size-4 rounded-md" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t">
          <div className="flex h-12 items-center gap-2 rounded-xl px-3">
            <Skeleton className="size-8 rounded-full" />

            <div className="grid flex-1 gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />

          <Separator orientation="vertical" className="mr-2 h-100%" />

          <div className="flex flex-1 items-center">
            <Skeleton className="h-4 w-32" />
          </div>

          <Skeleton className="size-8 rounded-full" />
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((cardIndex) => (
              <div
                key={cardIndex}
                className="rounded-[min(var(--radius-4xl),24px)] border bg-card p-5 shadow-sm"
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-3 h-8 w-24" />
                <Skeleton className="mt-4 h-3 w-40" />
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
            <div className="rounded-[min(var(--radius-4xl),24px)] border bg-card p-5 shadow-sm">
              <Skeleton className="h-5 w-28" />
              <div className="mt-5 space-y-3">
                {[0, 1, 2, 3, 4].map((rowIndex) => (
                  <Skeleton
                    key={rowIndex}
                    className="h-12 w-full rounded-2xl"
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[min(var(--radius-4xl),24px)] border bg-card p-5 shadow-sm">
              <Skeleton className="h-5 w-32" />
              <div className="mt-5 space-y-4">
                {[0, 1, 2].map((panelIndex) => (
                  <div key={panelIndex} className="space-y-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
