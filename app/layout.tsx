import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tu Fibra Digital",
  description: "Sistema para gestionar órdenes de trabajo",
  generator: 'Hairo'
}

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
          <ThemeToggle />
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  )
}
