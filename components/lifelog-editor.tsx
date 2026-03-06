"use client";

import type { JSONContent } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import {
    BoldIcon,
    ChatBubbleLeftRightIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    HashtagIcon,
    ItalicIcon,
    ListBulletIcon,
    NumberedListIcon,
    PhotoIcon,
    StrikethroughIcon,
    UnderlineIcon,
} from "@heroicons/react/24/outline";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { useEffect, useMemo, useRef, useState } from "react";

interface LifelogEditorProps {
    name: string;
    initialContent?: string;
    errors?: string[];
}

function getInitialDoc(initialContent?: string): JSONContent {
    if (!initialContent) {
        return {
            type: "doc",
            content: [{ type: "paragraph" }],
        };
    }
    try {
        return JSON.parse(initialContent) as JSONContent;
    } catch {
        return {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [{ type: "text", text: initialContent }],
                },
            ],
        };
    }
}

const baseBtnClass = "px-3 py-2 rounded-md text-sm whitespace-nowrap";

export default function LifelogEditor({
    name,
    initialContent,
    errors,
}: LifelogEditorProps) {
    const [serialized, setSerialized] = useState(
        JSON.stringify(getInitialDoc(initialContent)),
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const initialDoc = useMemo(
        () => getInitialDoc(initialContent),
        [initialContent],
    );

    const editor = useEditor({
        extensions: [StarterKit, Image, Underline],
        content: initialDoc,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "tiptap-editor prose prose-sm max-w-none h-[420px] overflow-y-auto p-4 focus:outline-none",
                spellcheck: "false",
                autocorrect: "off",
                autocapitalize: "off",
                "data-gramm": "false",
            },
        },
        onUpdate: ({ editor }) => {
            setSerialized(JSON.stringify(editor.getJSON()));
        },
    });

    useEffect(() => {
        if (!editor) return;
        editor.commands.setContent(initialDoc);
        setSerialized(JSON.stringify(editor.getJSON()));
    }, [editor, initialDoc]);

    const toolbarState = useEditorState({
        editor,
        selector: ({ editor }) => ({
            h1: editor ? editor.isActive("heading", { level: 1 }) : false,
            h2: editor ? editor.isActive("heading", { level: 2 }) : false,
            h3: editor ? editor.isActive("heading", { level: 3 }) : false,
            bold: editor ? editor.isActive("bold") : false,
            italic: editor ? editor.isActive("italic") : false,
            underline: editor ? editor.isActive("underline") : false,
            strike: editor ? editor.isActive("strike") : false,
            bulletList: editor ? editor.isActive("bulletList") : false,
            orderedList: editor ? editor.isActive("orderedList") : false,
            blockquote: editor ? editor.isActive("blockquote") : false,
        }),
    });

    const activeClass = (isActive: boolean) =>
        `${baseBtnClass} ${isActive ? "bg-neutral-200 text-neutral-900" : "hover:bg-neutral-100"}`;

    const uploadImage = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Only image files can be uploaded.");
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            alert("Images must be 3MB or smaller.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            const response = await fetch("/api/posts/image", {
                method: "POST",
                body: formData,
            });
            const result = (await response.json()) as {
                url?: string;
                error?: string;
            };
            if (!response.ok || !result.url) {
                alert(result.error || "Image upload failed.");
                return;
            }
            editor
                ?.chain()
                .focus()
                .insertContent([
                    { type: "image", attrs: { src: result.url } },
                    { type: "paragraph" },
                ])
                .focus("end")
                .run();
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <input type="hidden" name={name} value={serialized} />
            <div className="rounded-xl border border-neutral-200 overflow-hidden">
                <div className="flex items-center gap-1 p-2 bg-neutral-50">
                    <button
                        type="button"
                        title="Heading 1"
                        aria-label="Heading 1"
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                        className={activeClass(Boolean(toolbarState?.h1))}
                    >
                        <span className="relative inline-flex items-center justify-center size-4">
                            <HashtagIcon className="size-4" />
                            <span className="absolute -right-1.5 -bottom-1 text-[8px] font-bold">
                                1
                            </span>
                        </span>
                    </button>
                    <button
                        type="button"
                        title="Heading 2"
                        aria-label="Heading 2"
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                        className={activeClass(Boolean(toolbarState?.h2))}
                    >
                        <span className="relative inline-flex items-center justify-center size-4">
                            <HashtagIcon className="size-4" />
                            <span className="absolute -right-1.5 -bottom-1 text-[8px] font-bold">
                                2
                            </span>
                        </span>
                    </button>
                    <button
                        type="button"
                        title="Heading 3"
                        aria-label="Heading 3"
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
                        className={activeClass(Boolean(toolbarState?.h3))}
                    >
                        <span className="relative inline-flex items-center justify-center size-4">
                            <HashtagIcon className="size-4" />
                            <span className="absolute -right-1.5 -bottom-1 text-[8px] font-bold">
                                3
                            </span>
                        </span>
                    </button>
                    <button
                        type="button"
                        title="Bold"
                        aria-label="Bold"
                        onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                        }
                        className={activeClass(Boolean(toolbarState?.bold))}
                    >
                        <BoldIcon className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Italic"
                        aria-label="Italic"
                        onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                        }
                        className={activeClass(Boolean(toolbarState?.italic))}
                    >
                        <ItalicIcon className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Bullet list"
                        aria-label="Bullet list"
                        onClick={() =>
                            editor?.chain().focus().toggleBulletList().run()
                        }
                        className={activeClass(
                            Boolean(toolbarState?.bulletList),
                        )}
                    >
                        <ListBulletIcon className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Numbered list"
                        aria-label="Numbered list"
                        onClick={() =>
                            editor?.chain().focus().toggleOrderedList().run()
                        }
                        className={activeClass(
                            Boolean(toolbarState?.orderedList),
                        )}
                    >
                        <NumberedListIcon className="size-4" />
                    </button>
                    <button
                        type="button"
                        title="Image"
                        aria-label="Image"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`${baseBtnClass} disabled:opacity-50 hover:bg-neutral-100`}
                    >
                        {isUploading ? (
                            <span className="text-xs">...</span>
                        ) : (
                            <PhotoIcon className="size-4" />
                        )}
                    </button>
                    <button
                        type="button"
                        title={
                            isToolbarExpanded
                                ? "Collapse toolbar"
                                : "Expand toolbar"
                        }
                        aria-label={
                            isToolbarExpanded
                                ? "Collapse toolbar"
                                : "Expand toolbar"
                        }
                        onClick={() => setIsToolbarExpanded((prev) => !prev)}
                        className={`${baseBtnClass} ml-auto hover:bg-neutral-100`}
                    >
                        {isToolbarExpanded ? (
                            <ChevronUpIcon className="size-4" />
                        ) : (
                            <ChevronDownIcon className="size-4" />
                        )}
                    </button>
                </div>

                <div
                    className={`bg-neutral-50 overflow-hidden transition-all duration-250 ease-out ${
                        isToolbarExpanded
                            ? "max-h-14 opacity-100 border-t border-neutral-200"
                            : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="flex items-center gap-1 px-2 py-2">
                        <button
                            type="button"
                            title="Underline"
                            aria-label="Underline"
                            onClick={() =>
                                editor?.chain().focus().toggleUnderline().run()
                            }
                            className={activeClass(
                                Boolean(toolbarState?.underline),
                            )}
                        >
                            <UnderlineIcon className="size-4" />
                        </button>
                        <button
                            type="button"
                            title="Strikethrough"
                            aria-label="Strikethrough"
                            onClick={() =>
                                editor?.chain().focus().toggleStrike().run()
                            }
                            className={activeClass(
                                Boolean(toolbarState?.strike),
                            )}
                        >
                            <StrikethroughIcon className="size-4" />
                        </button>
                        <button
                            type="button"
                            title="Blockquote"
                            aria-label="Blockquote"
                            onClick={() =>
                                editor?.chain().focus().toggleBlockquote().run()
                            }
                            className={activeClass(
                                Boolean(toolbarState?.blockquote),
                            )}
                        >
                            <ChatBubbleLeftRightIcon className="size-4" />
                        </button>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                            await uploadImage(file);
                        }
                        event.target.value = "";
                    }}
                />

                <EditorContent editor={editor} />
            </div>
            {errors?.length ? (
                <p className="text-sm text-red-500">{errors[0]}</p>
            ) : null}
        </div>
    );
}
