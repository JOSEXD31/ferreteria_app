"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useEmpresa } from "@/contexts/empresa-context"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    role: "",
  })
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { empresa, loading: empresaLoading } = useEmpresa()

  const backgroundImages = [
    "/fondo.webp",
    "/fondo2.webp",
    "/fondo3.webp"
  ]
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    setErrorMessage("")
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        localStorage.setItem("userRole", data.user.role)
        localStorage.setItem("username", data.user.name)
        localStorage.setItem("userId", data.user.id)
        router.push("/dashboard")
      } else {
        setErrorMessage(data.message || "Error de autenticación")
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrorMessage("Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-slate-900">
      {/* Background Images with Crossfade */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        {backgroundImages.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Sistema Background ${index + 1}`}
            fill
            className={`object-cover ${index === currentBgIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            style={{
              transition: "opacity 2s ease-in-out, transform 15s ease-out"
            }}
            priority={index === 0}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-900/80 backdrop-blur-[2px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl p-4 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

        {/* Left Branding / Welcome Column */}
        <div className="hidden lg:flex flex-col items-center lg:items-start justify-center w-1/2 space-y-8 text-white">
          <div className="space-y-2 opacity-0 animate-[fade-in-up_1s_ease-out_forwards]">
            <h2 className="text-xl font-medium text-blue-300 tracking-wide uppercase">{getGreeting()},</h2>
            <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight">
              Bienvenido al <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Sistema de Gestión
              </span>
            </h1>
          </div>

          <div className="relative w-80 h-40 opacity-0 animate-[fade-in-up_1s_ease-out_0.3s_forwards] drop-shadow-2xl">
            {empresaLoading ? (
              <div className="w-full h-full bg-slate-800/50 rounded-xl animate-pulse" />
            ) : empresa?.logo_url ? (
              <Image
                src={empresa.logo_url}
                alt={empresa.nombre || "Logo"}
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-start">
                <span className="text-3xl font-bold italic tracking-wider text-slate-200">
                  {empresa?.nombre || "MI EMPRESA"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Glassmorphism Form Column */}
        <div className="w-full max-w-[420px] opacity-0 animate-[fade-in-up_1s_ease-out_0.3s_forwards]">
          <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">

            {/* Mobile Branding (shown only on small screens) */}
            <div className="lg:hidden flex flex-col items-center space-y-4 mb-8">
              {empresa?.logo_url ? (
                <div className="relative w-56 h-28">
                  <Image src={empresa.logo_url} alt="Logo" fill className="object-contain" />
                </div>
              ) : (
                <Building2 className="w-16 h-16 text-blue-400" />
              )}
              <h2 className="text-2xl font-bold text-white text-center">
                {empresa?.nombre || "Sistema de Gestión"}
              </h2>
            </div>

            <div className="text-center mb-8 hidden lg:block">
              <h3 className="text-2xl font-bold text-white">Iniciar Sesión</h3>
              <p className="text-slate-400 text-sm mt-2">Introduce tus datos para continuar</p>
            </div>

            <div className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2 group">
                <Label htmlFor="username" className="text-slate-200 text-sm font-medium ml-1 transition-colors group-focus-within:text-blue-400">
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="h-12 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 rounded-xl transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2 group">
                <Label htmlFor="password" className="text-slate-200 text-sm font-medium ml-1 transition-colors group-focus-within:text-blue-400">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="h-12 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 rounded-xl transition-all pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Role Select */}
              <div className="space-y-2 group">
                <Label htmlFor="role" className="text-slate-200 text-sm font-medium ml-1 transition-colors group-focus-within:text-blue-400">
                  Rol de Acceso
                </Label>
                <Select
                  value={credentials.role}
                  onValueChange={(value) => setCredentials({ ...credentials, role: value })}
                >
                  <SelectTrigger className="h-12 bg-slate-900/50 border-slate-600/50 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 rounded-xl transition-all">
                    <SelectValue placeholder="Selecciona tu perfil" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white rounded-xl shadow-2xl">
                    <SelectItem value="admin" className="focus:bg-blue-600/50 cursor-pointer py-3">Administrador</SelectItem>
                    <SelectItem value="vendedor" className="focus:bg-blue-600/50 cursor-pointer py-3">Vendedor / Cajero</SelectItem>
                    <SelectItem value="almacen" className="focus:bg-blue-600/50 cursor-pointer py-3">Jefe de Almacén</SelectItem>
                    {/*<SelectItem value="tecnico" className="focus:bg-blue-600/50 cursor-pointer py-3">Personal Técnico</SelectItem>*/}
                  </SelectContent>
                </Select>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm px-4 py-3 rounded-xl flex items-center justify-center animate-in fade-in slide-in-from-top-2">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleLogin}
                className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 group relative overflow-hidden"
                disabled={isLoading || !credentials.username || !credentials.password || !credentials.role}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <span>Ingresar al Sistema</span>
                )}
              </Button>
            </div>

          </div>

          <div className="mt-8 text-center bg-transparent">
            <p className="text-slate-400 text-xs">
              &copy; {new Date().getFullYear()} HCLSERVICE. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  )
}

