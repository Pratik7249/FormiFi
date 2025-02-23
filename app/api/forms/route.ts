import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url, process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000");
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    const forms = await prisma.form.findMany({
      where: { ownerId: userId },
    }) ?? [];
    console.log("Request URL:", req.url);


    return NextResponse.json({ success: true, data: forms }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching forms:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
