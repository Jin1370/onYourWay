"use client";

import {
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useActionState, useEffect, useMemo, useState } from "react";
import { deleteScheduleEntry, upsertScheduleEntry } from "./action";

type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI";

interface ScheduleEntry {
    id: number;
    courseName: string;
    classRoom: string | null;
    day: Weekday;
    startMinute: number;
    endMinute: number;
    color: string | null;
}

const DAYS: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI"];
const DAY_LABELS: Record<Weekday, string> = {
    MON: "월",
    TUE: "화",
    WED: "수",
    THU: "목",
    FRI: "금",
};

const START_MINUTE = 8 * 60;
const PIXELS_PER_MINUTE = 0.8;
const START_HOUR_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 8);
const END_HOUR_OPTIONS = Array.from({ length: 15 }, (_, i) => i + 8);

function minuteToText(minute: number) {
    const hour = Math.floor(minute / 60);
    const min = minute % 60;
    return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function splitMinute(minute: number) {
    return {
        hour: Math.floor(minute / 60),
        minutePart: minute % 60 === 30 ? "30" : "0",
    } as const;
}

export default function UniversitySchedule({
    entries,
}: {
    entries: ScheduleEntry[];
}) {
    const [state, upsertAction] = useActionState(upsertScheduleEntry, null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
    const [editingEntryId, setEditingEntryId] = useState<number | null>(null);

    const selectedEntry = useMemo(
        () => entries.find((entry) => entry.id === selectedEntryId) || null,
        [entries, selectedEntryId],
    );
    const editingEntry = useMemo(
        () => entries.find((entry) => entry.id === editingEntryId) || null,
        [entries, editingEntryId],
    );
    const scheduleEndMinute = useMemo(() => {
        if (entries.length === 0) return 22 * 60;
        const latestEndMinute = Math.max(
            ...entries.map((entry) => entry.endMinute),
        );
        return Math.max(latestEndMinute, 16 * 60);
    }, [entries]);
    const gridHeight = (scheduleEndMinute - START_MINUTE) * PIXELS_PER_MINUTE;
    const totalHourTicks = Math.floor((scheduleEndMinute - START_MINUTE) / 60);

    useEffect(() => {
        if (!state) return;
        const hasFieldErrors =
            !!state.fieldErrors &&
            Object.values(state.fieldErrors).some((errors) => errors?.length);
        const hasFormErrors = !!state.formErrors?.length;

        if (!hasFieldErrors && !hasFormErrors) {
            setIsModalOpen(false);
            setEditingEntryId(null);
        }
    }, [state]);

    const defaultStart = editingEntry
        ? splitMinute(editingEntry.startMinute)
        : { hour: 9, minutePart: "0" as const };
    const defaultEnd = editingEntry
        ? splitMinute(editingEntry.endMinute)
        : { hour: 10, minutePart: "0" as const };

    return (
        <div className="p-5 pb-24 flex flex-col gap-4">
            <section className="rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-semibold text-lg">시간표</h1>
                    <button
                        type="button"
                        onClick={() => {
                            setEditingEntryId(null);
                            setIsModalOpen(true);
                        }}
                        className="size-4 text-neutral-500 border border-neutral-300 rounded-md flex items-center justify-center hover:bg-neutral-100"
                        aria-label="시간표 추가"
                        title="시간표 추가"
                    >
                        <PlusIcon className="size-5" />
                    </button>
                </div>

                <div className="grid grid-cols-[28px_repeat(5,1fr)] gap-1">
                    <div />
                    {DAYS.map((day) => (
                        <div
                            key={`head-${day}`}
                            className="text-center text-[12px] font-semibold text-neutral-400"
                        >
                            {DAY_LABELS[day]}
                        </div>
                    ))}

                    <div className="relative" style={{ height: gridHeight }}>
                        {Array.from({ length: totalHourTicks + 1 }).map(
                            (_, i) => (
                                <div
                                    key={`time-${i}`}
                                    className="absolute left-0 text-[11px] text-neutral-400"
                                    style={{
                                        top: i * 60 * PIXELS_PER_MINUTE - 5,
                                    }}
                                >
                                    {String(i + START_MINUTE / 60).padStart(
                                        2,
                                        "0",
                                    )}
                                </div>
                            ),
                        )}
                    </div>

                    {DAYS.map((day) => (
                        <div
                            key={`col-${day}`}
                            className="relative rounded-md bg-neutral-50 border border-neutral-200"
                            style={{ height: gridHeight }}
                        >
                            {Array.from({ length: totalHourTicks + 1 }).map(
                                (_, i) => (
                                    <div
                                        key={`${day}-line-${i}`}
                                        className="absolute left-0 right-0 border-t border-neutral-200/70"
                                        style={{
                                            top: i * 60 * PIXELS_PER_MINUTE,
                                        }}
                                    />
                                ),
                            )}
                            {entries
                                .filter((entry) => entry.day === day)
                                .map((entry) => {
                                    const top =
                                        (entry.startMinute - START_MINUTE) *
                                        PIXELS_PER_MINUTE;
                                    const height = Math.max(
                                        (entry.endMinute - entry.startMinute) *
                                            PIXELS_PER_MINUTE,
                                        24,
                                    );
                                    return (
                                        <button
                                            key={entry.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedEntryId((prev) =>
                                                    prev === entry.id
                                                        ? null
                                                        : entry.id,
                                                )
                                            }
                                            className={`absolute left-0.5 right-0.5 rounded p-1 text-[9px] overflow-hidden text-left transition ${
                                                selectedEntryId === entry.id
                                                    ? "brightness-95"
                                                    : ""
                                            }`}
                                            style={{
                                                top,
                                                height,
                                                backgroundColor:
                                                    entry.color || "#bfdbfe",
                                            }}
                                            title={`${entry.courseName} ${minuteToText(entry.startMinute)}-${minuteToText(entry.endMinute)}`}
                                        >
                                            <div className="font-semibold text-[11px] leading-tight line-clamp-1">
                                                {entry.courseName}
                                            </div>
                                            {entry.classRoom && height >= 25 ? (
                                                <div className="line-clamp-1 text-[9px] opacity-85 ">
                                                    {entry.classRoom}
                                                </div>
                                            ) : null}
                                        </button>
                                    );
                                })}
                        </div>
                    ))}
                </div>

                {selectedEntry ? (
                    <div className="mt-8 rounded-lg border border-neutral-200 p-3 flex items-center justify-between">
                        <div className="text-sm">
                            <div className="font-medium">
                                {selectedEntry.courseName}
                            </div>
                            <div className="text-neutral-500">
                                {minuteToText(selectedEntry.startMinute)}-
                                {minuteToText(selectedEntry.endMinute)}
                                {selectedEntry.classRoom
                                    ? ` · ${selectedEntry.classRoom}`
                                    : ""}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingEntryId(selectedEntry.id);
                                    setIsModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-md border hover:bg-neutral-100 text-sm flex items-center gap-1"
                            >
                                <PencilSquareIcon className="size-4" />
                                수정
                            </button>
                            <form
                                action={deleteScheduleEntry.bind(
                                    null,
                                    selectedEntry.id,
                                )}
                            >
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 rounded-md border hover:bg-neutral-100 text-sm flex items-center gap-1 text-red-600"
                                >
                                    <TrashIcon className="size-4" />
                                    삭제
                                </button>
                            </form>
                        </div>
                    </div>
                ) : null}
            </section>

            {isModalOpen ? (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
                    <div className="w-full max-w-screen-sm bg-white rounded-t-2xl sm:rounded-2xl p-4 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-lg">
                                {editingEntry ? "수업 수정" : "시간표 추가"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="size-8 rounded-full hover:bg-neutral-100 flex items-center justify-center"
                                aria-label="닫기"
                            >
                                <XMarkIcon className="size-5" />
                            </button>
                        </div>

                        <form
                            action={upsertAction}
                            noValidate
                            className="flex flex-col gap-3"
                        >
                            {editingEntry ? (
                                <input
                                    type="hidden"
                                    name="entryId"
                                    value={editingEntry.id}
                                />
                            ) : null}
                            <input
                                type="text"
                                name="courseName"
                                placeholder="수업명"
                                defaultValue={editingEntry?.courseName ?? ""}
                                className="border border-neutral-400 rounded-md px-3 py-2"
                            />
                            <input
                                type="text"
                                name="classRoom"
                                placeholder="강의실(선택)"
                                defaultValue={editingEntry?.classRoom ?? ""}
                                className="border border-neutral-400 rounded-md px-3 py-2"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    name="day"
                                    className="border border-neutral-400 rounded-md px-3 py-2 bg-white"
                                    defaultValue={editingEntry?.day ?? "MON"}
                                >
                                    {DAYS.map((day) => (
                                        <option key={day} value={day}>
                                            {DAY_LABELS[day]}요일
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="color"
                                    name="color"
                                    defaultValue={
                                        editingEntry?.color ?? "#bfdbfe"
                                    }
                                    className="w-full h-10 border border-neutral-400 rounded-md p-1"
                                />
                            </div>
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                                <div className="flex gap-2">
                                    <select
                                        name="startHour"
                                        className="border border-neutral-400 rounded-md px-2 py-2 bg-white flex-1/2"
                                        defaultValue={String(
                                            Math.min(
                                                Math.max(defaultStart.hour, 8),
                                                21,
                                            ),
                                        )}
                                    >
                                        {START_HOUR_OPTIONS.map((hour) => (
                                            <option
                                                key={`sh-${hour}`}
                                                value={hour}
                                            >
                                                {String(hour).padStart(2, "0")}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        name="startMinutePart"
                                        className="border border-neutral-400 rounded-md px-2 py-2 bg-white flex-1/2"
                                        defaultValue={defaultStart.minutePart}
                                    >
                                        <option value="0">00</option>
                                        <option value="30">30</option>
                                    </select>
                                </div>
                                <span className="text-neutral-500 text-lg">
                                    ~
                                </span>
                                <div className="flex gap-2">
                                    <select
                                        name="endHour"
                                        className="border border-neutral-400 rounded-md px-2 py-2 bg-white flex-1/2"
                                        defaultValue={String(
                                            Math.min(
                                                Math.max(defaultEnd.hour, 8),
                                                22,
                                            ),
                                        )}
                                    >
                                        {END_HOUR_OPTIONS.map((hour) => (
                                            <option
                                                key={`eh-${hour}`}
                                                value={hour}
                                            >
                                                {String(hour).padStart(2, "0")}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        name="endMinutePart"
                                        className="border border-neutral-400 rounded-md px-2 py-2 bg-white flex-1/2"
                                        defaultValue={defaultEnd.minutePart}
                                    >
                                        <option value="0">00</option>
                                        <option value="30">30</option>
                                    </select>
                                </div>
                            </div>
                            {state?.fieldErrors?.courseName?.length ? (
                                <p className="text-sm text-red-500">
                                    {state.fieldErrors.courseName[0]}
                                </p>
                            ) : null}
                            {state?.formErrors?.length ? (
                                <p className="text-sm text-red-500">
                                    {state.formErrors[0]}
                                </p>
                            ) : null}
                            <button className="primary-btn">
                                {editingEntry ? "수정 저장" : "시간표 추가"}
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
