import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const formId = Number(id);

  if (isNaN(formId)) {
    return res.status(400).json({ error: "Invalid form ID" });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) return res.status(404).json({ error: "Form not found" });

    res.status(200).json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
