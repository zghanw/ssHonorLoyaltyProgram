import { useEffect, useState } from 'react';
import { Search, Star, Gift, CheckCircle, X } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { getCustomers } from '../api/customers';
import { getGifts } from '../api/gifts';
import { redeemGift } from '../api/redemptions';
import toast from 'react-hot-toast';

export default function RedemptionPage() {
    const [customers, setCustomers] = useState([]);
    const [gifts, setGifts] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedGift, setSelectedGift] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        getCustomers().then(r => setCustomers(r.data)).catch(() => { });
        getGifts().then(r => setGifts(r.data)).catch(() => { });
    }, []);

    const filtered = customers.filter(c =>
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone_number.includes(search)
    );

    const canRedeem = selectedCustomer && selectedGift &&
        selectedCustomer.total_points >= selectedGift.points_required &&
        selectedGift.stock > 0;

    const handleRedeem = async () => {
        if (!canRedeem) return;
        setLoading(true);
        try {
            await redeemGift({ customer_id: selectedCustomer.id, gift_id: selectedGift.id });
            setSuccess(true);
            // Refresh data
            const [cRes, gRes] = await Promise.all([getCustomers(), getGifts()]);
            setCustomers(cRes.data);
            setGifts(gRes.data);
            // Update selected customer points
            setSelectedCustomer(prev => ({ ...prev, total_points: prev.total_points - selectedGift.points_required }));
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Redemption failed');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setSelectedCustomer(null);
        setSelectedGift(null);
        setSuccess(false);
        setSearch('');
    };

    return (
        <AppLayout>
            <TopBar title="Redemption" subtitle="Redeem gifts for customers" />

            <main className="flex-1 p-6">
                {success ? (
                    /* Success State */
                    <div className="max-w-md mx-auto mt-16 card p-8 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} className="text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-100 mb-1">Redemption Successful!</h2>
                        <p className="text-gray-400 text-sm">
                            <span className="text-brand-400 font-medium">{selectedCustomer?.full_name}</span> redeemed{' '}
                            <span className="text-gold-400 font-medium">{selectedGift?.name}</span> for{' '}
                            <span className="text-gold-400 font-medium">{selectedGift?.points_required.toLocaleString()} pts</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Remaining balance: <span className="text-gray-300 font-semibold">{selectedCustomer?.total_points.toLocaleString()} pts</span>
                        </p>
                        <button onClick={reset} className="btn-primary mt-6 mx-auto">
                            New Redemption
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Step 1: Customer */}
                        <div className="lg:col-span-1 space-y-3">
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">1 — Select Customer</h2>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input className="input pl-9 text-sm" placeholder="Search name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                                {filtered.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => { setSelectedCustomer(c); setSelectedGift(null); setSuccess(false); }}
                                        className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${selectedCustomer?.id === c.id
                                                ? 'border-brand-500 bg-brand-600/15'
                                                : 'border-surface-border bg-surface-card hover:border-brand-700 hover:bg-surface-hover'
                                            }`}
                                    >
                                        <p className="text-sm font-medium text-gray-200">{c.full_name}</p>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-xs text-gray-500">{c.phone_number}</p>
                                            <span className="flex items-center gap-1 text-xs font-semibold text-gold-400">
                                                <Star size={11} />{c.total_points.toLocaleString()} pts
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Gift */}
                        <div className="lg:col-span-1 space-y-3">
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">2 — Select Gift</h2>
                            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                                {gifts.map(g => {
                                    const affordable = selectedCustomer ? selectedCustomer.total_points >= g.points_required : true;
                                    const inStock = g.stock > 0;
                                    return (
                                        <button
                                            key={g.id}
                                            onClick={() => inStock && setSelectedGift(g)}
                                            disabled={!inStock}
                                            className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${selectedGift?.id === g.id
                                                    ? 'border-gold-500 bg-gold-500/10'
                                                    : !inStock
                                                        ? 'border-surface-border bg-surface-hover opacity-50 cursor-not-allowed'
                                                        : !affordable
                                                            ? 'border-surface-border bg-surface-card opacity-60'
                                                            : 'border-surface-border bg-surface-card hover:border-gold-600 hover:bg-surface-hover'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-200">{g.name}</p>
                                                <span className="flex items-center gap-1 text-xs font-semibold text-gold-400">
                                                    <Star size={11} />{g.points_required.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5">
                                                <p className="text-xs text-gray-500">{g.description || '—'}</p>
                                                <span className={`text-xs font-medium ${inStock ? 'text-gray-400' : 'text-red-400'}`}>
                                                    {inStock ? `${g.stock} left` : 'Out of stock'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 3: Confirm */}
                        <div className="lg:col-span-1 space-y-3">
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">3 — Confirm</h2>
                            <div className="card p-5 space-y-4">
                                {selectedCustomer ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Customer</p>
                                            <p className="text-sm font-semibold text-gray-200">{selectedCustomer.full_name}</p>
                                        </div>
                                        <button onClick={() => setSelectedCustomer(null)} className="text-gray-600 hover:text-gray-400"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">No customer selected</p>
                                )}

                                {selectedGift ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Gift</p>
                                            <p className="text-sm font-semibold text-gray-200">{selectedGift.name}</p>
                                        </div>
                                        <button onClick={() => setSelectedGift(null)} className="text-gray-600 hover:text-gray-400"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">No gift selected</p>
                                )}

                                {selectedCustomer && selectedGift && (
                                    <div className="bg-surface rounded-lg p-3 space-y-1.5 border border-surface-border text-xs">
                                        <div className="flex justify-between text-gray-400">
                                            <span>Balance before</span>
                                            <span className="font-semibold text-gray-200">{selectedCustomer.total_points.toLocaleString()} pts</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Cost</span>
                                            <span className="font-semibold text-red-400">−{selectedGift.points_required.toLocaleString()} pts</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400 pt-1 border-t border-surface-border">
                                            <span>Balance after</span>
                                            <span className={`font-semibold ${canRedeem ? 'text-green-400' : 'text-red-400'}`}>
                                                {(selectedCustomer.total_points - selectedGift.points_required).toLocaleString()} pts
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {!canRedeem && selectedCustomer && selectedGift && selectedCustomer.total_points < selectedGift.points_required && (
                                    <p className="text-xs text-red-400">Insufficient points for this gift.</p>
                                )}

                                <button
                                    onClick={handleRedeem}
                                    disabled={!canRedeem || loading}
                                    className="btn-gold w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? <span className="w-4 h-4 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin" />
                                        : <Gift size={15} />
                                    }
                                    {loading ? 'Processing…' : 'Confirm Redemption'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </AppLayout>
    );
}
