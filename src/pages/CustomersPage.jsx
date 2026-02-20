import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Phone, User, Trash2, Eye } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { getCustomers, createCustomer, deleteCustomer } from '../api/customers';
import toast from 'react-hot-toast';

function AddCustomerModal({ onClose, onCreated }) {
    const [form, setForm] = useState({ full_name: '', phone_number: '', email: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCustomer(form);
            toast.success('Customer registered!');
            onCreated();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to add customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-md p-6 shadow-2xl">
                <h2 className="text-base font-semibold text-gray-100 mb-5">Register New Customer</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Full Name *</label>
                        <input className="input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required placeholder="e.g. Lim Xiao Ming" />
                    </div>
                    <div>
                        <label className="label">Phone Number *</label>
                        <input className="input" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} required placeholder="e.g. 0123456789" />
                    </div>
                    <div>
                        <label className="label">Email (optional)</label>
                        <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. mingming@gmail.com" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCustomers = useCallback(async () => {
        try {
            const res = await getCustomers(search ? { search } : {});
            setCustomers(res.data);
        } catch {
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const t = setTimeout(fetchCustomers, 300);
        return () => clearTimeout(t);
    }, [fetchCustomers]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
        try {
            await deleteCustomer(id);
            toast.success('Customer deleted');
            fetchCustomers();
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <AppLayout>
            <TopBar title="Customers" subtitle="Manage registered loyalty members" />
            {showModal && <AddCustomerModal onClose={() => setShowModal(false)} onCreated={fetchCustomers} />}

            <main className="flex-1 p-6">
                {/* Toolbar */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            className="input pl-9"
                            placeholder="Search by name or phone…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        <Plus size={15} /> Add Customer
                    </button>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-surface-border">
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                                <th className="py-3 px-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500">Loading…</td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500">No customers found.</td></tr>
                            ) : customers.map((c) => (
                                <tr key={c.id} className="border-t border-surface-border hover:bg-surface-hover transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-700/40 flex items-center justify-center text-brand-300 text-xs font-bold uppercase flex-shrink-0">
                                                {c.full_name[0]}
                                            </div>
                                            <span className="font-medium text-gray-200">{c.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-400">
                                        <span className="flex items-center gap-1.5"><Phone size={12} />{c.phone_number}</span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500">{c.email || '—'}</td>
                                    <td className="py-3 px-4 text-right font-semibold text-gold-400">{c.total_points.toLocaleString()}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => navigate(`/customers/${c.id}`)}
                                                className="p-1.5 rounded-md text-gray-400 hover:text-brand-400 hover:bg-brand-600/10 transition-colors"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id, c.full_name)}
                                                className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </AppLayout>
    );
}
