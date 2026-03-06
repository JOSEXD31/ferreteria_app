"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building, FileText, Settings, Shield } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function ConfigHeader() {
    const pathname = usePathname()

    const navItems = [
        { href: "/configuracion", label: "Empresa", icon: Building },
        { href: "/configuracion/comprobantes", label: "Comprobantes", icon: FileText },
        { href: "/configuracion/usuarios", label: "Usuarios", icon: Shield },
    ]

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 md:px-6 justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 w-full shrink-0">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Settings className="text-blue-500" /> <span className="hidden sm:inline">Configuración del Sistema</span>
                </h1>
            </div>

            <div className="flex flex-1 justify-center overflow-x-auto hide-scrollbar px-2 max-w-2xl">
                <nav className="flex space-x-1 lg:space-x-2 w-max">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all text-sm font-medium
                                    ${isActive
                                        ? "bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400 shadow-sm"
                                        : "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                    }`}
                            >
                                <Icon className="h-4 w-4 shrink-0" /> <span className="hidden sm:inline-block">{label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Placeholder / ThemeToggle Space */}
            <div className="w-10 min-w-[40px] shrink-0" aria-hidden="true" />
        </header>
    )
}
