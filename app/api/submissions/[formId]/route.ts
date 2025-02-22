import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: { formId?: string } }
) {
  console.log("🚀 API request received. Context:", context); // Debug log

  if (!context.params?.formId) {
    return NextResponse.json(
      { success: false, message: "Missing form ID in URL" },
      { status: 400 }
    );
  }

  const formId = Number(context.params.formId);
  console.log("✅ Extracted formId:", formId); // Debug log

  if (isNaN(formId) || formId <= 0) {
    return NextResponse.json(
      { success: false, message: `Invalid form ID: ${context.params.formId}` },
      { status: 400 }
    );
  }

  try {
    const submissions = await prisma.submissions.findMany({
      where: { formId },
    });

    if (!submissions.length) {
      return NextResponse.json(
        { success: false, message: "No submissions found" },
        { status: 404 }
      );
    }

    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}


