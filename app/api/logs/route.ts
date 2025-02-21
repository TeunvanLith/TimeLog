import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Log from "@/models/Log"

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
    console.log("GET /api/logs: Logs data:", JSON.stringify(logs, null, 2))

    return NextResponse.json(logs)
  } catch (error) {
    console.error("GET /api/logs: Error fetching logs:", error)
    return NextResponse.json({ error: "Error fetching logs", details: (error as Error).message }, { status: 500 })
  }
}

