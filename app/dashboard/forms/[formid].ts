import prisma  from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { formid } = req.query;

  if (!formid || isNaN(Number(formid))) {  // ✅ Ensure formid is a valid number
    console.error("⚠️ Invalid form ID received:", formid);
    return res.status(400).json({ error: "Invalid form ID" });
  }

  try {
    console.log(`🔍 Fetching form with ID: ${formid}`);

    const form = await prisma.form.findUnique({
      where: { id: Number(formid) }, // ✅ Convert formid to a number
    });

    console.log("📜 Query Result:", form);

    if (!form) {
      console.error(`❌ Form not found for ID: ${formid}`);
      return res.status(404).json({ error: "Form not found" });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error("❌ Error fetching form:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
