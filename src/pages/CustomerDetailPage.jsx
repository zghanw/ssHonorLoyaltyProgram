import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Phone, Mail, Star, Clock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { getCustomer, addPoints, deductPoints, getTransactions } from '../api/customers';
import toast from 'react-hot-toast';

function PointsModal({ type, customerId, onClose, onDone }) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const isAdd = type === 'add';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fn = isAdd ? addPoints : deductPoints;
            await fn(customerId, { amount: parseInt(amount), description });
            toast.success(isAdd ? `+${amount} points added!` : `-${amount} points deducted!`);
            onDone();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to update points');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-sm p-6 shadow-2xl">
                <h2 className="text-base font-semibold text-gray-100 mb-5">
                    {isAdd ? '+ Add Points' : '− Deduct Points'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Amount *</label>
                        <input className="input" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="e.g. 100" />
                    </div>
                    <div>
                        <label className="label">Description *</label>
                        <input className="input" value={description} onChange={e => setDescription(e.target.value)} required placeholder={isAdd ? 'e.g. Purchase RM200' : 'e.g. Manual adjustment'} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
                        <button type="submit" disabled={loading} className={isAdd ? 'btn-primary flex-1 justify-center' : 'btn-danger flex-1 justify-center'}>
                            {loading ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : (isAdd ? 'Add Points' : 'Deduct Points')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const TYPE_STYLES = {
    earn: 'bg-green-500/15 text-green-400',
    redeem: 'bg-gold-500/15 text-gold-400',
    manual_adjust: 'bg-brand-500/15 text-brand-400',
};

export default function CustomerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [modal, setModal] = useState(null); // 'add' | 'deduct' | null

    const load = async () => {
        try {
            const [cRes, tRes] = await Promise.all([getCustomer(id), getTransactions(id)]);
            setCustomer(cRes.data);
            setTransactions(tRes.data);
        } catch {
            toast.error('Failed to load customer');
            navigate('/customers');
        }
    };

    useEffect(() => { load(); }, [id]);

    if (!customer) {
        return (
            <AppLayout>
                <TopBar title="Customer Details" />
                <main className="flex-1 p-6 flex items-center justify-center text-gray-500">Loading…</main>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <TopBar title="Customer Details" subtitle={customer.full_name} />
            {modal && <PointsModal type={modal} customerId={id} onClose={() => setModal(null)} onDone={load} />}

            <main className="flex-1 p-6 space-y-5">
                {/* Back */}
                <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
                    <ArrowLeft size={15} /> Back to Customers
                </button>

                {/* Profile Card */}
                <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                        {customer.full_name[0]}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-100">{customer.full_name}</h2>
                        <div className="flex flex-wrap gap-4 mt-1">
                            <span className="flex items-center gap-1.5 text-sm text-gray-400"><Phone size={13} />{customer.phone_number}</span>
                            {customer.email && <span className="flex items-center gap-1.5 text-sm text-gray-400"><Mail size={13} />{customer.email}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1">
                        <p className="text-xs text-gray-500">Total Points</p>
                        <div className="flex items-center gap-2">
                            <Star size={18} className="text-gold-400" />
                            <span className="text-3xl font-bold text-gold-400">{customer.total_points.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={() => setModal('add')} className="btn-primary">
                        <Plus size={15} /> Add Points
                    </button>
                    <button onClick={() => setModal('deduct')} className="btn-secondary">
                        <Minus size={15} /> Deduct Points
                    </button>
                </div>

                {/* Transaction History */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Clock size={14} /> Transaction History
                    </h3>
                    <div className="card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-surface-border">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={4} className="py-10 text-center text-gray-500">No transactions yet.</td></tr>
                                ) : transactions.map((t) => (
                                    <tr key={t.id} className="border-t border-surface-border hover:bg-surface-hover transition-colors">
                                        <td className="py-3 px-4">
                                            <span className={`badge ${TYPE_STYLES[t.type] || 'bg-gray-700 text-gray-400'}`}>
                                                {t.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-300">{t.description}</td>
                                        <td className={`py-3 px-4 text-right font-semibold ${t.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-500 text-xs">
                                            {new Date(t.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
