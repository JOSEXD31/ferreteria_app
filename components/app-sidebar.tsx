"use client"

import { useEffect, useState } from "react"
import {
  Home,
  Users,
  User,
  Wrench,
  LogOut,
  ClipboardList,
  DollarSign,
  Package,
  ShoppingCart,
  Shield,
  BarChart3,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function AppSidebar() {
  const [userRole, setUserRole] = useState("")
  const [username, setUsername] = useState("")
  const router = useRouter()

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
    setUsername(localStorage.getItem("username") || "")
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("username")
    router.push("/")
  }

  const baseMenuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
  ]

  const getAdditionalMenuItems = () => {
    switch (userRole) {
      case "admin":
        return [
          {
            title: "Inventario",
            url: "/inventory",
            icon: Package,
          },
          {
            title: "Ventas",
            url: "/sales",
            icon: ShoppingCart,
          },
          {
            title: "Compras",
            url: "/purchases",
            icon: ClipboardList,
          },
          {
            title: "Clientes",
            url: "/clients",
            icon: Users,
          },
          {
            title: "Servicios / Trabajos",
            url: "/trabajos",
            icon: Wrench,
          },
          {
            title: "Técnicos",
            url: "/technicians",
            icon: User,
          },
          {
            title: "Caja",
            url: "/caja",
            icon: DollarSign,
          },
          {
            title: "Usuarios",
            url: "/usuarios",
            icon: Shield,
          },
          {
            title: "Reportes",
            url: "/reportes",
            icon: BarChart3,
          },
        ]
      case "vendedor":
        return [
          {
            title: "Ventas",
            url: "/sales",
            icon: ShoppingCart,
          },
          {
            title: "Inventario",
            url: "/inventory",
            icon: Package,
          },
          {
            title: "Clientes",
            url: "/clients",
            icon: Users,
          },
          {
            title: "Caja",
            url: "/caja",
            icon: DollarSign,
          },
        ]
      case "almacen":
        return [
          {
            title: "Inventario",
            url: "/inventory",
            icon: Package,
          },
          {
            title: "Compras",
            url: "/purchases",
            icon: ClipboardList,
          },
        ]
      case "tecnico":
        return [
          {
            title: "Mis Trabajos",
            url: "/trabajos",
            icon: Wrench,
          },
          {
            title: "Inventario",
            url: "/inventory",
            icon: Package,
          },
        ]
      default:
        return []
    }
  }

  const allMenuItems = [...baseMenuItems, ...getAdditionalMenuItems()]

  return (
    <Sidebar className="border-r border-gray-700 bg-gray-800 backdrop-blur-xl text-white [--sidebar-background:theme(colors.gray.800)] [--sidebar-foreground:theme(colors.white)] [--sidebar-border:theme(colors.gray.700)]">
      <SidebarHeader className="border-b bg-white p-2">
        <div className="flex flex-col items-center space-x-3">
          <Image
            src="/tufibra_logo.webp"
            alt="Logo"
            width={160}
            height={160}
            priority
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 text-xs uppercase tracking-wider">
            Navegación Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-gray-200 hover:bg-gray-700/50 hover:text-white">
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm">
                {username ? username.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">{username}</p>
              <p className="text-xs text-slate-400">{userRole}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white hover:bg-gray-700/50"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
