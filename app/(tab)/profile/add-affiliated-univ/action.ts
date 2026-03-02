"use server";

import db from "@/lib/db";
import { getUniversityDetails } from "@/lib/university-details";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

export async function saveAffiliatedUniv(univId: number) {
    const session = await getSession();
    await db.user.update({
        where: {
            id: session.id!,
        },
        data: {
            affiliatedUnivId: univId,
        },
    });
    redirect("/profile");
}
export { getUniversityDetails };
