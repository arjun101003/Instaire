import { NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/mongodb"

export async function GET() {
  try {
    await connectDB()
    console.log("Connected to database")

    // Get the User model directly from mongoose
    const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}))

    // Get collection to work with raw operations
    const collection = User.collection

    // List all indexes before changes
    const indexesBefore = await collection.indexes()
    console.log("Current indexes:", indexesBefore)

    // Drop the problematic email index if it exists
    try {
      await collection.dropIndex("email_1")
      console.log("Successfully dropped email_1 index")
    } catch (error) {
      console.log("No email_1 index to drop or error:", error.message)
    }

    // Create a new sparse index for email
    await collection.createIndex(
      { email: 1 },
      {
        unique: true,
        sparse: true,
        background: true,
      },
    )
    console.log("Created new sparse index on email field")

    // List indexes after changes
    const indexesAfter = await collection.indexes()
    console.log("Updated indexes:", indexesAfter)

    return NextResponse.json({
      success: true,
      message: "Database indexes fixed successfully",
      before: indexesBefore,
      after: indexesAfter,
    })
  } catch (error) {
    console.error("Error fixing indexes:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
