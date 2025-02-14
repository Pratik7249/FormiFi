"use server";

import {prisma} from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

// Function to clean and parse JSON from response
const extractJson = (responseText: string) => {
  try {
    console.log("🔍 Raw AI Response:", responseText); // Log raw response for debugging

    // Extract only the JSON portion
    let jsonString = responseText.replace(/```json\n|\n```/g, "").trim();

    // Parse JSON
    const parsedData = JSON.parse(jsonString);

    // Ensure it matches the expected format
    if (
      parsedData &&
      typeof parsedData === "object" &&
      parsedData.title &&
      parsedData.fields &&
      parsedData.button
    ) {
      return parsedData;
    } else {
      throw new Error("Parsed JSON does not match expected structure.");
    }
  } catch (error) {
    console.error("❌ JSON Parsing Error:", error);
    return null;
  }
};

export const generateForm = async (_prevState: unknown, formData: FormData) => {
  try {
    // Ensure user is authenticated
    const user = await currentUser();
    if (!user || !user.id) {
      return { success: false, message: "User authentication failed." };
    }

    // Validate form data
    const descriptionRaw = formData.get("description");
    if (!descriptionRaw) {
      return { success: false, message: "Description is missing from form data." };
    }
    const description = descriptionRaw.toString().trim();

    const schema = z.object({
      description: z.string().min(1, "Description required"),
    });

    const result = schema.safeParse({ description });

    if (!result.success) {
      return {
        success: false,
        message: "Invalid form data",
        error: result.error.errors,
      };
    }

    // AI prompt for form generation
    const prompt = `Generate a structured form in JSON format based on the following description:
    ---
    Description: "${description}"
    ---
    Respond with RAW JSON ONLY, without markdown (\`\`\`json or \`\`\`). 
    The expected format is:
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
    }`;

    console.log("📤 Sending request to Ollama...");

    // Fetch response from AI model
    let responseText;
    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-coder",
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      responseText = responseData.response; // Extracting only the response text
    } catch (error) {
      console.error("❌ Fetch request failed:", error);
      return { success: false, message: "Failed to connect to AI model." };
    }

    console.log("🔍 Full AI Response:", responseText);

    // Extract and parse JSON
    const formJsonData = extractJson(responseText);
    if (!formJsonData) {
      return {
        success: false,
        message: "Generated form content is not valid JSON.",
        rawResponse: responseText, // Debugging info
      };
    }

    console.log("✅ Successfully Parsed JSON:", formJsonData);

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
