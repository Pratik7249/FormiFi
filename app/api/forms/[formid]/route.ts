import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ensure correct Prisma import

export async function GET(req: Request, { params }: { params: { formid: string } }) {
  const { formid } = params;

  try {
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formid) }, // Ensure correct ID type
    });

    console.log("API Response - Form Data:", form); // Debug log

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
