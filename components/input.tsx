import { InputHTMLAttributes } from "react";

interface InputProps {
    name: string;
    errors?: string[];
}

export default function Input({
    errors = [],
    name,
    ...rest
}: InputProps & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="flex flex-col gap-2">
            <input
                className="bg-transparent rounded-md w-full h-10 ring-1 ring-neutral-200 p-3
                focus:outline-none transition focus:ring-myblue placeholder:text-neutral-400"
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
