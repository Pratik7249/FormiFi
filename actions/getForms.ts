"use server";

import { prisma } from "@/lib/prisma"; // Ensure correct import
import { currentUser } from "@clerk/nextjs/server";

export const getForms = async () => {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, message: "User not found" };
        }

        await prisma.$connect(); // ✅ Ensure fresh connection

        const forms = await prisma.form.findMany({
            where: {
                ownerId: user.id,
            },
        });

        return {
            success: true,
            message: "Forms found",
            data: forms || [],
        };
    } catch (error: any) {
        console.error("❌ Error fetching forms:", error);
        return { success: false, message: "Internal Server Error" };
    } finally {
        await prisma.$disconnect(); // ✅ Close Prisma connection
    }
};
