"use client";

import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { useMemo } from "react";

interface LifelogViewerProps {
    content: string;
}

function parseContent(content: string): JSONContent | null {
    try {
        const parsed = JSON.parse(content) as JSONContent;
        if (!parsed || typeof parsed !== "object") return null;
        return parsed;
    } catch {
        return null;
    }
}

export default function LifelogViewer({ content }: LifelogViewerProps) {
    const parsed = useMemo(() => parseContent(content), [content]);
    const editor = useEditor({
        extensions: [StarterKit, Image, Underline],
        content: parsed || {
            type: "doc",
            content: [{ type: "paragraph", content: [{ type: "text", text: content }] }],
        },
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "tiptap-viewer prose prose-sm max-w-none",
            },
        },
    });

    return <EditorContent editor={editor} />;
}
