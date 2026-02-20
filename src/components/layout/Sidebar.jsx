import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, Gift, Star, History, LogOut,
} from 'lucide-react';
import logo from '../../assets/HONORLOGO.jpg';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/gifts', icon: Gift, label: 'Gifts' },
    { to: '/redemption', icon: Star, label: 'Redemption' },
];

export default function Sidebar() {
    const { staff, logout } = useAuth();

    return (
        <aside className="fixed inset-y-0 left-0 w-60 bg-surface-card border-r border-surface-border flex flex-col z-20">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-border">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                    <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
                </div>
                <div>
                    <p className="text-white font-semibold text-sm leading-tight">Loyalty System</p>
                    <p className="text-gray-500 text-xs">Staff Portal</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
                            }`
                        }
                    >
                        <Icon size={17} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Staff Info & Logout */}
            <div className="px-3 py-4 border-t border-surface-border">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-brand-200 uppercase">
                        {staff?.username?.[0] ?? 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{staff?.username ?? 'Staff'}</p>
                        <p className="text-xs text-gray-500 capitalize">{staff?.role ?? 'staff'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                >
                    <LogOut size={17} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
