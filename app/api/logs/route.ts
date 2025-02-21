import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Log from "@/models/Log"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const formData = await req.formData()
    const date = formData.get("date") as string
    const hours = formData.get("hours") as string
    const projectId = formData.get("projectId") as string
    const userId = formData.get("userId") as string
    const remarks = formData.get("remarks") as string
    const photo = formData.get("photo") as File | null

    if (!date || !hours || !projectId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Cloudinary config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? "Set" : "Not set",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "Set" : "Not set",
    })

    let photoUrl = ""
    if (photo) {
      const arrayBuffer = await photo.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error)
              reject(error)
            } else {
              resolve(result)
            }
          })
          .end(buffer)
      })
      photoUrl = (result as any).secure_url
    }

    const log = await Log.create({
      date,
      hours: Number(hours),
      projectId,
      userId,
      remarks,
      photoUrl,
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error("Error creating log:", error)
    return NextResponse.json({ error: "Error creating log", details: (error as Error).message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    console.log("GET /api/logs: Start")
    await connectToDatabase()
    console.log("GET /api/logs: Database connected")

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    console.log("GET /api/logs: UserId:", userId)

    if (!userId) {
      console.log("GET /api/logs: UserId is missing")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("GET /api/logs: Fetching logs")
    const logs = await Log.find({ userId }).populate("projectId").sort({ date: -1 })
    console.log(`GET /api/logs: Found ${logs.length} logs`)

    return NextResponse.json(logs)
  } catch (error) {
    console.error("GET /api/logs: Error fetching logs:", error)
    return NextResponse.json({ error: "Error fetching logs", details: (error as Error).message }, { status: 500 })
  }
}

