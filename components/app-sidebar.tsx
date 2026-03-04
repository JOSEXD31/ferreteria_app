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
  Tags,
  Scale,
  Truck,
  Settings
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useEmpresa } from "@/contexts/empresa-context"

export function AppSidebar() {
  const [userRole, setUserRole] = useState("")
  const [username, setUsername] = useState("")
  const router = useRouter()
  const { empresa } = useEmpresa()

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
    setUsername(localStorage.getItem("username") || "")
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("username")
    router.push("/")
  }

  type MenuItem = {
    title: string;
    url: string;
    icon: any;
    items?: { title: string; url: string }[];
  }

  const baseMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
  ]

  const getAdditionalMenuItems = (): MenuItem[] => {
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
          /*{
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
          },*/
          {
            title: "Reportes",
            url: "/reportes",
            icon: BarChart3,
          },
          {
            title: "Usuarios",
            url: "/usuarios",
            icon: Shield,
          },
          {
            title: "Configuración",
            url: "/configuracion",
            icon: Settings,
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
          /*{
            title: "Caja",
            url: "/caja",
            icon: DollarSign,
          },*/
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
    <Sidebar className="border-r border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-xl text-slate-900 dark:text-white [--sidebar-background:theme(colors.white)] dark:[--sidebar-background:theme(colors.gray.800)] [--sidebar-foreground:theme(colors.slate.900)] dark:[--sidebar-foreground:theme(colors.white)] [--sidebar-border:theme(colors.slate.200)] dark:[--sidebar-border:theme(colors.gray.700)]">
      <SidebarHeader className="border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 p-2">
        <div className="flex flex-col items-center space-x-3 p-2">
          {empresa?.logo_url ? (
            <div className="relative w-48 h-40">
              <Image
                src={empresa.logo_url}
                alt={empresa.nombre}
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="flex items-center justify-center p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800">
              <span className="font-bold text-lg text-indigo-700 dark:text-indigo-400 text-center tracking-tight leading-tight">
                {empresa?.nombre || "Ferretería System"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
            Navegación Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allMenuItems.map((item) => (
                item.items ? (
                  <Collapsible key={item.title} asChild className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="text-slate-600 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-white">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild className="text-gray-400 hover:text-slate-900 dark:text-white hover:bg-gray-700/50">
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="text-slate-600 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-white">
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm">
                {username ? username.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">{username}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{userRole}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700/50"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
