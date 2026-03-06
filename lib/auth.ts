import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || "ferreteria-secret-key-2024-change-me-in-prod"
  return new TextEncoder().encode(secret)
}

export async function encrypt(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecretKey())
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, getSecretKey(), {
    algorithms: ["HS256"],
  })
  return payload
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null
  return await decrypt(session)
}

export async function updateSession(request: any) {
  const session = request.cookies.get("session")?.value
  if (!session) return

  const parsed = await decrypt(session)
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const res = new Response()
  res.headers.set(
    "Set-Cookie",
    `session=${await encrypt(parsed)}; HttpOnly; Path=/; Expires=${parsed.expires.toUTCString()}; SameSite=Lax`
  )
  return res
}
