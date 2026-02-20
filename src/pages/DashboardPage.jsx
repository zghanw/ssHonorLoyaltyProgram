import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Star, Gift, TrendingUp, ArrowRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import api from '../api/client';

function StatCard({ icon: Icon, label, value, color, sub }) {
    return (
        <div className="stat-card animate-fade-in">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-100 mt-0.5">{value ?? '—'}</p>
                {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/dashboard/stats').then((r) => setStats(r.data)).catch(() => { });
    }, []);

    return (
        <AppLayout>
            <TopBar title="Dashboard" subtitle="Overview of your loyalty management system" />
            <main className="flex-1 p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        icon={Users}
                        label="Total Customers"
                        value={stats?.total_customers?.toLocaleString()}
                        color="bg-brand-600/20 text-brand-400"
                        sub="Registered members"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Points Issued"
                        value={stats?.total_points_issued?.toLocaleString()}
                        color="bg-green-600/20 text-green-400"
                        sub="All time"
                    />
                    <StatCard
                        icon={Star}
                        label="Total Redemptions"
                        value={stats?.total_redemptions?.toLocaleString()}
                        color="bg-gold-500/20 text-gold-400"
                        sub="Gifts redeemed"
                    />
                    <StatCard
                        icon={Gift}
                        label="Active Gifts"
                        value={stats?.active_gifts?.toLocaleString()}
                        color="bg-purple-600/20 text-purple-400"
                        sub="In catalog"
                    />
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { to: '/customers', label: 'Add Customer', desc: 'Register a new member', icon: Users },
                            { to: '/gifts', label: 'Manage Gifts', desc: 'Update gift catalog', icon: Gift },
                            { to: '/redemption', label: 'Redeem Gift', desc: 'Process a redemption', icon: Star },
                        ].map(({ to, label, desc, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className="card p-4 flex items-center gap-4 hover:border-brand-700 hover:bg-surface-hover transition-all duration-200 group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-brand-600/15 text-brand-400 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600/25 transition-colors">
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-200">{label}</p>
                                    <p className="text-xs text-gray-500">{desc}</p>
                                </div>
                                <ArrowRight size={15} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
