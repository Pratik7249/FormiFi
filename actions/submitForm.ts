"use server"
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server"

export const submitForm = async (formId: number, formData: any) => {
    try {
        const user = await currentUser();

        if (!user) {
            console.log("No user found"); // Log the issue for debugging
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

        const content = typeof formData === 'object' ? JSON.stringify(formData) : formData;

        await prisma.submissions.create({
            data: {
                formId,
                content,
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
        console.error("Error during form submission:", error);
        return { success: false, message: "An error occurred while submitting the form." };
    }
};
