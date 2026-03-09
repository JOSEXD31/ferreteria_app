"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface EmpresaData {
    id_empresa: number
    nombre: string
    ruc: string | null
    direccion: string | null
    telefono: string | null
    email: string | null
    logo_url: string | null
    moneda: string
    igv_porcentaje: number
    mensaje_ticket: string | null
}

interface EmpresaContextType {
    empresa: EmpresaData | null
    loading: boolean
    refreshEmpresa: () => Promise<void>
}

const EmpresaContext = createContext<EmpresaContextType>({
    empresa: null,
    loading: true,
    refreshEmpresa: async () => { },
})

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
    const [empresa, setEmpresa] = useState<EmpresaData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchEmpresa = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/empresa")
            if (res.ok) {
                const data = await res.json()
                setEmpresa(data)
            }
        } catch (error) {
            console.error("Error fetching empresa context:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmpresa()
    }, [])

    return (
        <EmpresaContext.Provider value={{ empresa, loading, refreshEmpresa: fetchEmpresa }}>
            {children}
        </EmpresaContext.Provider>
    )
}

export function useEmpresa() {
    return useContext(EmpresaContext)
}
