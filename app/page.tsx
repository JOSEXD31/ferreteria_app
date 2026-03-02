"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    role: "",
  })
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async () => {
    setIsLoading(true); // ⏳ Activar loading
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("username", data.user.name);
        localStorage.setItem("userId", data.user.id);
        router.push("/dashboard");
      } else {
        setErrorMessage(data.message || "Error de autenticación");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Error al intentar iniciar sesión");
    } finally {
      setIsLoading(false); // ✅ Siempre desactiva loading si no hay redirección
    }
  };



  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <img
          src="/fondo.webp"
          alt="Fondo"
          className="w-full h-full object-cover"
        />
        {/* Capa oscura encima de la imagen */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 dark:from-black via-slate-50 dark:via-gray-900/80 to-white dark:to-slate-900/80" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center h-full p-6">

        {/* Columna izquierda (Bienvenido y logo) */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 space-y-6 text-slate-900 dark:text-white">
          <h1 className="text-5xl text-opacity-80 text-slate-900 dark:text-white font-bold fade-down">¡Bienvenido!</h1>
          <img
            src="/tufibra_logo.webp"
            alt="Logo Tufibra"
            className="w-24 sm:w-28 md:w-32 lg:w-56 xl:w-64 h-auto mx-auto fade-up"
          />
        </div>
        {/* Columna/formulario (responsivo centrado) */}
        <Card className="w-full max-w-md bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl backdrop-blur-md px-6 py-8 space-y-6">
          <div className="text-center space-y-2 lg:hidden">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white text-opacity-80 fade-down">¡Bienvenido!</h1>
            <img
              src="/tufibra_logo.webp"
              alt="Logo Tufibra"
              className="w-28 sm:w-32 md:w-36 h-auto mx-auto fade-up"
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-opacity-80">Inicio de Sesión</h2>
          </div>

          <div className="space-y-4">
            {/* Usuario */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-medium">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingrese su usuario"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="bg-slate-300/60 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-slate-500 dark:text-slate-400 focus:ring-cyan-500"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="bg-slate-300/60 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-slate-500 dark:text-slate-400 pr-10 focus:ring-cyan-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700 dark:text-slate-300 font-medium">
                Rol
              </Label>
              <Select
                value={credentials.role}
                onValueChange={(value) => setCredentials({ ...credentials, role: value })}
              >
                <SelectTrigger className="bg-slate-300/60 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-cyan-500">
                  <SelectValue placeholder="Seleccione su rol" />
                </SelectTrigger>
                <SelectContent className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="vendedor">Vendedor / Oficina</SelectItem>
                  <SelectItem value="almacen">Almacén</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="bg-red-600/80 text-slate-900 dark:text-white text-sm px-4 py-2 rounded-md animate-pulse justify-center items-center text-center">
                {errorMessage}
              </div>
            )}

            {/* Botón */}
            <Button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-900 dark:text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center"
              disabled={isLoading || !credentials.username || !credentials.password || !credentials.role}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-slate-900 dark:text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </Button>


          </div>
        </Card>
      </div>
    </div>
  );

}
