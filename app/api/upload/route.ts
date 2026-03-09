import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: Request) {
    try {
        const data = await request.formData()
        const file: File | null = data.get("file") as unknown as File
        const type = data.get("type") as string || "logo" // "logo" or "favicon"

        if (!file) {
            return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        if (type === "favicon") {
            const path = join(process.cwd(), "public", "favicon.ico")
            await writeFile(path, buffer)
            return NextResponse.json({
                success: true,
                message: "Favicon actualizado correctamente",
                url: "/favicon.ico"
            })
        }

        // Handle regular logo
        const uploadDir = join(process.cwd(), "public", "uploads")
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        const ext = file.name.split('.').pop()
        const uniqueName = `logo_${Date.now()}.${ext}`
        const path = join(uploadDir, uniqueName)
        await writeFile(path, buffer)

        return NextResponse.json({
            success: true,
            message: "Logo subido correctamente",
            url: `/uploads/${uniqueName}`
        })
    } catch (error) {
        console.error("Error uploading file:", error)
        return NextResponse.json({ success: false, message: "Error del servidor durante la subida" }, { status: 500 })
    }
}
