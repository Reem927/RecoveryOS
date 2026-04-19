import { AppSidebar } from "./app-sidebar"
import { Topbar } from "./topbar"

type Crumb = { label: string; href?: string }

export function AppShell({
  title,
  eyebrow,
  breadcrumbs,
  actions,
  children,
}: {
  title: string
  eyebrow?: string
  breadcrumbs?: Crumb[]
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-[#F2EDE6] text-[#1F2937]">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} eyebrow={eyebrow} breadcrumbs={breadcrumbs} actions={actions} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
