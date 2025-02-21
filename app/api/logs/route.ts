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
    const photo = formData.get("photo") as File

    if (!date || !hours || !projectId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let photoUrl = ""
    if (photo) {
      const arrayBuffer = await photo.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error) reject(error)
            else resolve(result)
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
    return NextResponse.json({ error: "Error creating log" }, { status: 500 })
  }
}

