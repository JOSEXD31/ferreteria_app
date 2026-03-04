import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: Request) {
    try {
        const data = await request.formData()
        const file: File | null = data.get("file") as unknown as File

        if (!file) {
            return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), "public", "uploads")
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Generate unique name to prevent cache collisions if they upload heavily
        const ext = file.name.split('.').pop()
        const uniqueName = `logo_${Date.now()}.${ext}`

        // Save to disk
        const path = join(uploadDir, uniqueName)
        await writeFile(path, buffer)

        return NextResponse.json({
            success: true,
            message: "File uploaded successfully",
            url: `/uploads/${uniqueName}` // Public URL for Next.js
        })
    } catch (error) {
        console.error("Error uploading file:", error)
        return NextResponse.json({ success: false, message: "Server error during upload" }, { status: 500 })
    }
}
