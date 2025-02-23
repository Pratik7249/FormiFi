"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

const extractJson = (responseText: string): any => {
  try {
    console.log("🔍 Raw AI Response:", responseText);

    // Extract JSON from triple backticks
    let jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) throw new Error("No valid JSON found in AI response.");

    let jsonString = jsonMatch[1].trim();

    // Ensure valid JSON structure
    jsonString = jsonString
      .replace(/,\s*([\}\]])/g, "$1") // Remove trailing commas
      .replace(/\s*}\s*{/g, "},{") // Fix consecutive objects without commas
      .replace(/\s+\]/g, "]") // Remove extra spaces in arrays
      .replace(/\s+\}/g, "}"); // Remove extra spaces in objects

    console.log("📜 Extracted JSON String:", jsonString);

    // Validate JSON using try-catch
    const parsedJson = JSON.parse(jsonString);
    if (!parsedJson.formTitle || !Array.isArray(parsedJson.formFields)) {
      throw new Error("Invalid JSON structure: Missing formTitle or formFields.");
    }

    return parsedJson;
  } catch (error) {
    console.error("❌ JSON Parsing Error:", error);
    return null;
  }
};

export const generateForm = async (
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; message: string; data?: any; error?: any; rawResponse?: any }> => {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return { success: false, message: "User authentication failed." };
    }

    const descriptionRaw = formData.get("description");
    if (!descriptionRaw) {
      return { success: false, message: "Description is missing from form data." };
    }
    const description = descriptionRaw.toString().trim();

    // Validate input
    const schema = z.object({ description: z.string().min(1, "Description required") });
    const result = schema.safeParse({ description });
    if (!result.success) {
      return { success: false, message: "Invalid form data", error: result.error.errors };
    }

    // 🔹 Strict Prompt for JSON Only
    const prompt = `
You are a JSON generator. **ONLY return valid JSON.**
**Rules:**
- No explanations, no extra text—ONLY JSON inside triple backticks.
- **Use double quotes ("")** for all keys and values.
- **Ensure arrays and objects are properly closed**.
- **No trailing commas** at the end of lists.
- **No broken or extra brackets**.
- **Ensure "email" fields use "type": "email"**.

**If your JSON is invalid, you will be rejected.**
**DO NOT use backslashes (\) inside strings unless escaping quotes.**
**DO NOT output extra brackets, stray symbols, or text outside JSON.**

**Example Output:**
\`\`\`json
{
  "formTitle": "Course Registration Form",
  "formFields": [
    { "label": "Student Name", "name": "stud_fullname", "placeholder": "Enter your full name...", "type": "text" },
    { "label": "Email ID", "name": "email_id", "placeholder": "example@domain.com", "type": "email" },
    { "label": "Course Code", "name": "course_code", "placeholder": "Enter course code...", "type": "text" },
    { "label": "Department Name", "name": "dept_name", "placeholder": "Select your department...", "type": "text" },
    { "label": "Semester", "name": "semester_type", "placeholder": "Enter semester...", "type": "text" },
    { "label": "Course Description", "name": "course_description", "placeholder": "Enter course details...", "type": "text" },
    { "label": "Course Instructor", "name": "course_instructor", "placeholder": "Enter instructor's name...", "type": "text" },
    { "label": "Date of Commencement", "name": "commence_date", "placeholder": "Select start date...", "type": "text" }
  ]
}
\`\`\`

Generate a form based on this description: "${description}".
`;





    console.log("📤 Sending request to Ollama...");

    let responseText;
    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-coder", prompt: prompt, stream: false }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      if (!responseData || typeof responseData.response !== "string") {
        throw new Error("Invalid API response structure.");
      }

      responseText = responseData.response;
    } catch (error) {
      console.error("❌ Fetch request failed:", error);
      return { success: false, message: "Failed to connect to AI model." };
    }

    console.log("🔍 Full AI Response:", responseText);

    // Ensure JSON is correctly extracted
    const formJsonData = extractJson(responseText);
    if (!formJsonData) {
      return { success: false, message: "Generated form content is not valid JSON.", rawResponse: responseText };
    }

    console.log("✅ Successfully Parsed JSON:", formJsonData);

    // Save form in DB
    let form;
    try {
      form = await prisma.form.create({
        data: {
          ownerId: user.id,
          content: JSON.stringify(formJsonData),
          published: false,
          shareUrl: crypto.randomUUID(),
          submissions: 0,
          createdAt: new Date(),
        },
      });
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      return { success: false, message: "Failed to save form." };
    }

    revalidatePath("/dashboard/forms");
    return { success: true, message: "✅ Form Generated Successfully", data: form };
  } catch (error) {
    console.error("❌ ERROR generating form:", error);
    return { success: false, message: "An error occurred while generating the form" };
  }
};
