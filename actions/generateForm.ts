"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

// Function to clean and extract JSON from response
const extractJson = (responseText: string) => {
  try {
    console.log("🔍 Raw AI Response:", responseText);

    // Extract JSON part using regex to find first `{` and last `}`
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    let jsonString = jsonMatch[0];

    // Remove comments (both // and #)
    jsonString = jsonString.replace(/\/\/.*|#.*$/gm, "").trim();

    // Fix incorrect quotes: Replace any curly or single quotes with proper double quotes
    jsonString = jsonString
      .replace(/[“”]/g, '"') // Convert curly double quotes to standard quotes
      .replace(/[‘’]/g, "'") // Convert curly single quotes to standard single quotes
      .replace(/'/g, '"'); // Ensure single quotes are replaced with double quotes for JSON

    console.log("📝 Extracted & Cleaned JSON:", jsonString);

    // Parse JSON
    const parsedData = JSON.parse(jsonString);
    console.log("✅ Successfully Parsed JSON:", parsedData);

    return parsedData;
  } catch (error) {
    console.error("❌ JSON Parsing Error:", error, "Response Text:", responseText);
    return null;
  }
};




export const generateForm = async (_prevState: unknown, formData: FormData) => {
  try {
    const user = await currentUser();
    if (!user || !user.id) return { success: false, message: "User authentication failed." };

    const descriptionRaw = formData.get("description");
    if (!descriptionRaw) return { success: false, message: "Description is missing from form data." };

    const description = descriptionRaw.toString().trim();
    const schema = z.object({ description: z.string().min(1, "Description required") });
    const result = schema.safeParse({ description });

    if (!result.success) {
      return { success: false, message: "Invalid form data", error: result.error.errors };
    }

    // 🚀 **Updated Prompt (Forcing Valid JSON Format)**
    const prompt = `Generate a valid JSON object in the exact format below, with NO extra text, NO explanations, and NO markdown:

{
  "title": "Form Title",
  "button": { "label": "Submit" },
  "fields": [
    { "label": "Name", "type": "text", "required": true }
  ],
  "form_name": "unique_form_id",
  "form_title": "Form Title"
}

### Rules:
- **DO NOT include markdown (no \`\`\`json)**
- **Use only standard double quotes (\\"), NOT curly quotes (“ ”)**
- **Form name should be a lowercase, URL-safe string (e.g., "leave_application")**
- **Use more than one field accordingly**

**User's Form Description:** "${description}"`;

    console.log("📤 Sending request to Ollama:", prompt);

    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-coder", prompt: prompt, stream: false }),
    });

    if (!response.ok) throw new Error(`Ollama API Error: ${response.status} ${response.statusText}`);

    const responseData = await response.json();
    console.log("🔍 Full API Response:", responseData);

    const formJsonData = extractJson(responseData.response);
    if (!formJsonData) return { success: false, message: "Invalid JSON response from AI.", rawResponse: responseData.response };

    console.log("✅ Successfully Parsed JSON:", formJsonData);

    // Save form to database
    const form = await prisma.form.create({ data: { ownerId: user.id, content: JSON.stringify(formJsonData) } });

    revalidatePath("/dashboard/forms");

    return { success: true, message: "✅ Form Generated Successfully", data: form };
  } catch (error) {
    console.error("❌ ERROR:", error);
    return { success: false, message: "An error occurred while generating the form." };
  }
};
