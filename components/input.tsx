import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps {
    name: string;
    errors?: string[];
    leadingIcon?: ReactNode;
}

export default function Input({
    errors = [],
    name,
    leadingIcon,
    ...rest
}: InputProps & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="flex flex-col gap-2">
            <div className="relative">
                {leadingIcon ? (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        {leadingIcon}
                    </span>
                ) : null}
                <input
                    className={`bg-transparent rounded-md w-full h-10 ring-1 ring-neutral-200 p-3
                    focus:outline-none transition focus:ring-myblue placeholder:text-neutral-400 ${leadingIcon ? "pl-10" : ""}`}
                    name={name}
                    {...rest}
                />
            </div>
            {errors.map((error, index) => (
                <span key={index} className="text-red-500 text-sm">
                    {error}
                </span>
            ))}
        </div>
    );
}
