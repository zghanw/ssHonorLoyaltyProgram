import { useEffect, useState } from 'react';
import { Plus, Package, Edit2, Trash2, X } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { getGifts, createGift, updateGift, deleteGift } from '../api/gifts';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', points_required: '', stock: '' };

function GiftModal({ gift, onClose, onSaved }) {
    const [form, setForm] = useState(gift ? { ...gift, points_required: String(gift.points_required), stock: String(gift.stock) } : EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const isEdit = !!gift;

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = { ...form, points_required: parseInt(form.points_required), stock: parseInt(form.stock) };
        try {
            if (isEdit) await updateGift(gift.id, payload);
            else await createGift(payload);
            toast.success(isEdit ? 'Gift updated!' : 'Gift added!');
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to save gift');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-gray-100">{isEdit ? 'Edit Gift' : 'Add Gift'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Gift Name *</label>
                        <input className="input" value={form.name} onChange={set('name')} required placeholder="e.g. Coffee Voucher" />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea className="input resize-none" rows={2} value={form.description} onChange={set('description')} placeholder="Brief description…" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">Points Required *</label>
                            <input className="input" type="number" min="0" value={form.points_required} onChange={set('points_required')} required placeholder="500" />
                        </div>
                        <div>
                            <label className="label">Stock *</label>
                            <input className="input" type="number" min="0" value={form.stock} onChange={set('stock')} required placeholder="50" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                            {isEdit ? 'Save Changes' : 'Add Gift'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function GiftsPage() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'add' | giftObject

    const fetchGifts = async () => {
        try {
            const res = await getGifts();
            setGifts(res.data);
        } catch {
            toast.error('Failed to load gifts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGifts(); }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;
        try {
            await deleteGift(id);
            toast.success('Gift deleted');
            fetchGifts();
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <AppLayout>
            <TopBar title="Gift Catalog" subtitle="Manage redeemable gifts" />
            {modal !== null && (
                <GiftModal
                    gift={modal === 'add' ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={fetchGifts}
                />
            )}

            <main className="flex-1 p-6">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-gray-500">{gifts.length} gift{gifts.length !== 1 ? 's' : ''} in catalog</p>
                    <button onClick={() => setModal('add')} className="btn-primary">
                        <Plus size={15} /> Add Gift
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading…</div>
                ) : gifts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No gifts yet. Add your first gift!</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {gifts.map((g) => (
                            <div key={g.id} className="card p-5 flex flex-col gap-3 hover:border-brand-700 transition-colors animate-fade-in">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                                        <Package size={18} className="text-gold-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-100 truncate">{g.name}</h3>
                                        {g.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{g.description}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Points</p>
                                        <p className="text-base font-bold text-gold-400">{g.points_required.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Stock</p>
                                        <p className={`text-base font-bold ${g.stock <= 5 ? 'text-red-400' : 'text-gray-200'}`}>{g.stock}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto pt-2 border-t border-surface-border">
                                    <button onClick={() => setModal(g)} className="btn-secondary flex-1 justify-center text-xs py-1.5">
                                        <Edit2 size={13} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(g.id, g.name)} className="btn-danger flex-1 justify-center text-xs py-1.5">
                                        <Trash2 size={13} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </AppLayout>
    );
}
