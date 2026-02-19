import { TextareaHTMLAttributes } from "react";

interface InputContentProps {
    name: string;
    errors?: string[];
    rowsNum: number;
}

export default function InputContent({
    errors = [],
    name,
    rowsNum,
    ...rest
}: InputContentProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <div className="flex flex-col gap-2">
            <textarea
                className="bg-transparent rounded-md w-full ring-1 ring-neutral-200 p-3
                focus:outline-none transition focus:ring-myblue placeholder:text-neutral-400"
                rows={rowsNum}
                name={name}
                {...rest}
            />
            {errors.map((error, index) => (
                <span key={index} className="text-red-500 text-sm">
                    {error}
                </span>
            ))}
        </div>
    );
}
