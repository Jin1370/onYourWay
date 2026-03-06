import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import UniversitySchedule from "./university-schedule";

async function getMyScheduleEntries(userId: number) {
    return db.scheduleEntry.findMany({
        where: {
            userId,
        },
        orderBy: [{ day: "asc" }, { startMinute: "asc" }],
        select: {
            id: true,
            courseName: true,
            classRoom: true,
            day: true,
            startMinute: true,
            endMinute: true,
            color: true,
        },
    });
}

async function getMyUniversityTodos(userId: number) {
    return db.universityTodo.findMany({
        where: {
            userId,
        },
        orderBy: [{ isDone: "asc" }, { created_at: "desc" }],
        select: {
            id: true,
            content: true,
            isDone: true,
        },
    });
}

export default async function UniversityPage() {
    const session = await getSession();
    if (!session.id) {
        redirect("/");
    }

    const [entries, todos] = await Promise.all([
        getMyScheduleEntries(session.id),
        getMyUniversityTodos(session.id),
    ]);
    return <UniversitySchedule entries={entries} todos={todos} />;
}
