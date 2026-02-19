import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-surface">
            <Sidebar />
            <div className="flex-1 ml-60 flex flex-col min-h-screen">
                {children}
            </div>
        </div>
    );
}
