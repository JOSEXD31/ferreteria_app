"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building2, LogOut, User, Menu, Home, ClipboardList, CreditCard, AlertTriangle, ScrollText } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
    const pathname = usePathname()


    const navigation = [
        { name: "Inicio", href: "/cobranza", icon: Home },
        { name: "Pagos", href: "/cobranza/pagos", icon: CreditCard },
        { name: "Historial de Pagos", href: "/cobranza/historialPagos", icon: ClipboardList },
        { name: "Deudas", href: "/cobranza/deudas", icon: AlertTriangle },
        { name: "Reportes", href: "/cobranza/reportes", icon: ScrollText },
    ]

    return (
        <nav>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Navigation - Desktop */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link key={item.name} href={item.href}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={
                                            isActive
                                                ? "bg-gray-700/50 text-white hover:bg-gray-800 hover:text-white"
                                                : "text-gray-200 hover:bg-gray-700/50 hover:text-white"
                                        }
                                    >
                                        <Icon className="h-4 w-4 mr-2" />
                                        {item.name}
                                    </Button>
                                </Link>
                            )
                        })}
                    </div>

                    {/* User menu */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile menu */}
                        <div className="md:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <Menu className="h-4 w-4 text-white" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {navigation.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <DropdownMenuItem key={item.name} asChild>
                                                <Link href={item.href} className="flex items-center">
                                                    <Icon className="h-4 w-4 mr-2" />
                                                    {item.name}
                                                </Link>
                                            </DropdownMenuItem>
                                        )
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
