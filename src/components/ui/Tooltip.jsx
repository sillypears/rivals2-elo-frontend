

export default function Tooltip({ message, children }) {
    return (
    <div class="group relative flex">
        {children}
        <span class="absolute bottom-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-150">{message}</span>
    </div>
    )
}

