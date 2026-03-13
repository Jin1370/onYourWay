"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const upsertEntrySchema = z.object({
    entryId: z.coerce.number().int().positive().optional(),
    courseName: z.string().trim().min(1, "수업명을 입력해주세요."),
    classRoom: z.string().trim().optional().default(""),
    day: z.enum(["MON", "TUE", "WED", "THU", "FRI"]),
    startHour: z.coerce.number().int().min(8).max(21),
    startMinutePart: z.enum(["0", "30"]),
    endHour: z.coerce.number().int().min(8).max(22),
    endMinutePart: z.enum(["0", "30"]),
    color: z.string().trim().min(1).default("#bfdbfe"),
});

export async function upsertScheduleEntry(
    _prevState: unknown,
    formData: FormData,
) {
    const rawEntryId = formData.get("entryId");

    const parsed = upsertEntrySchema.safeParse({
        entryId:
            typeof rawEntryId === "string" && rawEntryId
                ? Number(rawEntryId)
                : undefined,
        courseName: formData.get("courseName"),
        classRoom: formData.get("classRoom"),
        day: formData.get("day"),
        startHour: formData.get("startHour"),
        startMinutePart: formData.get("startMinutePart"),
        endHour: formData.get("endHour"),
        endMinutePart: formData.get("endMinutePart"),
        color: formData.get("color") || "#bfdbfe",
    });

    if (!parsed.success) {
        return parsed.error.flatten();
    }

    const startMinute =
        parsed.data.startHour * 60 + Number(parsed.data.startMinutePart);
    const endMinute =
        parsed.data.endHour * 60 + Number(parsed.data.endMinutePart);
    const earliestMinute = 8 * 60;
    const latestMinute = 22 * 60;

    if (startMinute < earliestMinute || endMinute > latestMinute) {
        return {
            fieldErrors: {
                endHour: [
                    "수업 시간은 08:00~22:00 범위에서만 설정할 수 있습니다.",
                ],
                endMinutePart: [] as string[],
                startHour: [] as string[],
                startMinutePart: [] as string[],
                courseName: [] as string[],
                classRoom: [] as string[],
                day: [] as string[],
                color: [] as string[],
                entryId: [] as string[],
            },
            formErrors: [] as string[],
        };
    }

    if (endMinute <= startMinute) {
        return {
            fieldErrors: {
                endHour: ["종료 시간은 시작 시간보다 늦어야 합니다."],
                endMinutePart: [] as string[],
                startHour: [] as string[],
                startMinutePart: [] as string[],
                courseName: [] as string[],
                classRoom: [] as string[],
                day: [] as string[],
                color: [] as string[],
                entryId: [] as string[],
            },
            formErrors: [] as string[],
        };
    }

    const session = await getSession();
    if (!session.id) {
        return {
            fieldErrors: {},
            formErrors: ["로그인이 필요합니다."],
        };
    }

    const conflict = await db.scheduleEntry.findFirst({
        where: {
            userId: session.id,
            day: parsed.data.day,
            startMinute: {
                lt: endMinute,
            },
            endMinute: {
                gt: startMinute,
            },
            ...(parsed.data.entryId
                ? {
                      id: {
                          not: parsed.data.entryId,
                      },
                  }
                : {}),
        },
        select: {
            id: true,
        },
    });

    if (conflict) {
        return {
            fieldErrors: {},
            formErrors: ["해당 시간대에 이미 등록된 수업이 있습니다."],
        };
    }

    if (parsed.data.entryId) {
        await db.scheduleEntry.updateMany({
            where: {
                id: parsed.data.entryId,
                userId: session.id,
            },
            data: {
                courseName: parsed.data.courseName,
                classRoom: parsed.data.classRoom || null,
                day: parsed.data.day,
                startMinute,
                endMinute,
                color: parsed.data.color,
            },
        });
    } else {
        await db.scheduleEntry.create({
            data: {
                userId: session.id,
                courseName: parsed.data.courseName,
                classRoom: parsed.data.classRoom || null,
                day: parsed.data.day,
                startMinute,
                endMinute,
                color: parsed.data.color,
            },
        });
    }

    revalidatePath("/university");
    return {
        fieldErrors: {},
        formErrors: [] as string[],
    };
}

export async function deleteScheduleEntry(entryId: number) {
    const session = await getSession();
    if (!session.id) return;

    await db.scheduleEntry.deleteMany({
        where: {
            id: entryId,
            userId: session.id,
        },
    });

    revalidatePath("/university");
}

const createTodoSchema = z.object({
    content: z.string().trim().min(1, "할 일을 입력해주세요.").max(100),
});

export async function createUniversityTodo(
    _prevState: unknown,
    formData: FormData,
) {
    const parsed = createTodoSchema.safeParse({
        content: formData.get("content"),
    });

    if (!parsed.success) {
        return parsed.error.flatten();
    }

    const session = await getSession();
    if (!session.id) {
        return {
            fieldErrors: {},
            formErrors: ["로그인이 필요합니다."],
        };
    }

    await db.universityTodo.create({
        data: {
            userId: session.id,
            content: parsed.data.content,
        },
    });

    revalidatePath("/university");
    return {
        fieldErrors: {},
        formErrors: [] as string[],
    };
}

export async function toggleUniversityTodo(todoId: number) {
    const session = await getSession();
    if (!session.id) return;

    const todo = await db.universityTodo.findFirst({
        where: {
            id: todoId,
            userId: session.id,
        },
        select: {
            id: true,
            isDone: true,
        },
    });

    if (!todo) return;

    await db.universityTodo.update({
        where: {
            id: todo.id,
        },
        data: {
            isDone: !todo.isDone,
        },
    });

    revalidatePath("/university");
}

export async function deleteUniversityTodo(todoId: number) {
    const session = await getSession();
    if (!session.id) return;

    await db.universityTodo.deleteMany({
        where: {
            id: todoId,
            userId: session.id,
        },
    });

    revalidatePath("/university");
}
