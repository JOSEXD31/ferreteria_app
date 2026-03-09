import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { EmpresaProvider } from "@/contexts/empresa-context"

import { prisma } from "@/lib/prisma"

const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
  try {
    const empresa = await prisma.empresa.findFirst()
    return {
      title: empresa?.nombre_sistema || empresa?.nombre || "Tu Fibra Digital",
      description: "Sistema para gestionar órdenes de trabajo y almacén",
      generator: 'Hairo'
    }
  } catch (error) {
    return {
      title: "Tu Fibra Digital",
      description: "Sistema para gestionar órdenes de trabajo",
    }
  }
}

import ErrorBoundary from "@/components/error-boundary"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <EmpresaProvider>
            <ErrorBoundary>
              <ThemeToggle />
              {children}
              <ToastContainer />
            </ErrorBoundary>
          </EmpresaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

