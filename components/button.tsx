"use client";

import { useFormStatus } from "react-dom";

interface ButtonProps {
    text: string;
}
export default function Button({ text }: ButtonProps) {
    const { pending } = useFormStatus();
    return (
        <button disabled={pending} className="primary-btn">
            {pending ? "로딩 중" : text}
        </button>
    );
}
