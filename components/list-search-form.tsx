import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type HiddenParam = {
    name: string;
    value: string;
};

export default function ListSearchForm({
    action,
    placeholder,
    defaultValue,
    hiddenParams = [],
}: {
    action: string;
    placeholder: string;
    defaultValue?: string;
    hiddenParams?: HiddenParam[];
}) {
    return (
        <form
            action={action}
            method="get"
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
        >
            {hiddenParams.map((param) => (
                <input
                    key={`${param.name}-${param.value}`}
                    type="hidden"
                    name={param.name}
                    value={param.value}
                />
            ))}
            <div className="flex items-center gap-2">
                <MagnifyingGlassIcon className="size-4 text-neutral-700" />
                <input
                    type="search"
                    name="q"
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-500"
                />
            </div>
        </form>
    );
}
