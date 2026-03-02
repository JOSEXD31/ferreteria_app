"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="fixed top-4 right-4 z-50 w-10 h-10" />
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="fixed top-4 right-4 z-50 rounded-full border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:bg-slate-900 dark:border-slate-800"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
