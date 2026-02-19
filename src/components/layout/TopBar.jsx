export default function TopBar({ title, subtitle }) {
    return (
        <header className="h-14 flex items-center px-6 border-b border-surface-border bg-surface-card/60 backdrop-blur-sm sticky top-0 z-10">
            <div>
                <h1 className="text-base font-semibold text-gray-100">{title}</h1>
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
        </header>
    );
}
