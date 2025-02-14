"use server";

import  prisma  from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const getForms = async () => {
    try {
        const user = await currentUser();
        if (!user?.id) {
            console.error("❌ User not found or unauthorized");
            return { success: false, message: "User not found" };
        }

        console.log(`🔍 Fetching forms for user: ${user.id}`);

        // ✅ Ensure Prisma is connected
        await prisma.$connect();

        const forms = await prisma.form.findMany({
            where: { ownerId: user.id },
        });

        console.log("📜 Forms retrieved:", forms);

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
