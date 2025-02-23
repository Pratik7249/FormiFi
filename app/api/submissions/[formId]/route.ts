import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET(req: Request, context: { params: { formid: string } }) {
  const { params } = context; // Destructure params asynchronously
  const formid = params?.formid; // Ensure formid is accessed properly

  if (!formid) {
    return new Response(JSON.stringify({ error: "Form ID is required" }), { status: 400 });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: Number(formid) }, // Convert to number if necessary
    });

    if (!form) {
      return new Response(JSON.stringify({ error: "Form not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(form), { status: 200 });
  } catch (error) {
    console.error("❌ Database error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}



