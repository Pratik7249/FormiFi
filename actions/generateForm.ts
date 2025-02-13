"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

export const generateForm = async (prevState: unknown, formData: FormData) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Validate form data
    const schema = z.object({
      description: z.string().min(1, "Description required"),
    });

    const result = schema.safeParse({
      description: formData.get("description") as string,
    });

    if (!result.success) {
      return {
        success: false,
        message: "Invalid form data",
        error: result.error.errors,
      };
    }

    const description = result.data.description;

    // AI prompt for form generation
    const prompt = `Generate a structured form in JSON format based on the following description:
    ---
    Description: "${description}"
    ---
    Ensure the response is ONLY valid JSON with no extra text, no explanations, and no markdown formatting such as \`\`\`json or \`\`\`. 
    The JSON format should be:
    {
      "title": "Job Application Form",
      "fields": [
        {
          "label": "Name",
          "type": "text",
          "required": true
        }
      ],
      "button": {
        "label": "Submit"
      }
    }
    Respond with RAW JSON ONLY.
    `;

    console.log("📤 Sending request to Ollama...");

    // Send request to Ollama
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-coder",
        prompt: prompt,
        stream: false, // ✅ Ensure it's false
      }),
    });

    if (!response.ok) {
      throw new Error(`❌ Ollama API Error: ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log("🔍 Full AI Response:", responseText);

    

    let formJsonData;
    try {
      // Directly parse JSON from response
      formJsonData = JSON.parse(responseText);
      console.log("✅ Successfully Parsed JSON:", formJsonData);
    } catch (error) {
      console.error("❌ Error parsing AI response as JSON:", error);
      return {
        success: false,
        message: "Generated form content is not valid JSON",
        rawResponse: responseText, // Send raw response for debugging
      };
    }

    // Save the form to the database
    const form = await prisma.form.create({
      data: {
        ownerId: user.id,
        content: JSON.stringify(formJsonData), // Store as string
      },
    });

    revalidatePath("/dashboard/forms");

    return {
      success: true,
      message: "✅ Form Generated Successfully",
      data: form,
    };
  } catch (error) {
    console.error("❌ ERROR generating form:", error);
    return {
      success: false,
      message: "An error occurred while generating the form",
    };
  }
};
