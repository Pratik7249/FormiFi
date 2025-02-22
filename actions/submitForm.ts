"use server"
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server"

export const submitForm = async (formId: number, formData: FormData) => {
    try {
        const user = await currentUser();

        if (!user) {
            console.log("No user found");
            return { success: false, message: "User not found" };
        }

        if (!formId) {
            return { success: false, message: "Form id not found" };
        }

        const form = await prisma.form.findUnique({
            where: { id: formId }
        });

        if (!form) {
            return { success: false, message: "Form not found" };
        }

        // ✅ Convert FormData into a JSON object
        const jsonObject: Record<string, any> = {};
        formData.forEach((value, key) => {
            jsonObject[key] = value;
        });

        console.log("🚀 Parsed JSON Data:", JSON.stringify(jsonObject, null, 2));

        // ✅ Save JSON content properly in Supabase
        await prisma.submissions.create({
            data: {
                formId,
                content: JSON.stringify(jsonObject), // Convert JSON object to string before storing
            }
        });

        await prisma.form.update({
            where: { id: formId },
            data: {
                submissions: {
                    increment: 1
                }
            }
        });

        return { success: true, message: "Form submitted successfully." };
    } catch (error) {
        console.error("❌ Error during form submission:", error);
        return { success: false, message: "An error occurred while submitting the form." };
    }
};


