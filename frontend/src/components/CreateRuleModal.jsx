import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle, Shield, TrendingDown, Clock } from 'lucide-react';

const TRIGGERS = [
    { id: 'health_drop', label: 'Health Score Drop', icon: AlertCircle, details: 'Triggers when score falls below threshold' },
    { id: 'security_vuln', label: 'New Vulnerability', icon: Shield, details: 'Triggers on any new CVE detection' },
    { id: 'stale_pr', label: 'Stale PR', icon: Clock, details: 'Triggers for PRs older than X days' },
    { id: 'velocity_drop', label: 'Velocity Drop', icon: TrendingDown, details: 'Triggers on significant commit drop' },
];

export default function CreateRuleModal({ isOpen, onClose, onSave }) {
    const [trigger, setTrigger] = useState(TRIGGERS[0].id);
    const [threshold, setThreshold] = useState(50);
    const [channel, setChannel] = useState('email');

    if (!isOpen) return null;

    const handleSave = () => {
        const rule = {
            trigger,
            threshold: parseInt(threshold),
            channel,
            createdAt: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9),
        };
        onSave(rule);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg glass-card p-8 border-brand-500/30 overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient" />
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Create Alert Rule</h2>
                        <p className="text-gray-500 text-sm mt-1">Define triggers for automated notifications.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">1. Select Trigger Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {TRIGGERS.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTrigger(t.id)}
                                    className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
                                        trigger === t.id 
                                        ? 'bg-brand-500/10 border-brand-500 text-white shadow-lg shadow-brand-500/10' 
                                        : 'bg-surface-200 border-surface-300 text-gray-400 hover:border-white/20'
                                    }`}
                                >
                                    <t.icon size={18} className={trigger === t.id ? 'text-brand-400' : 'text-gray-600'} />
                                    <span className="text-sm font-bold mt-2">{t.label}</span>
                                    <span className="text-[10px] opacity-60 leading-tight mt-1">{t.details}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {(trigger === 'health_drop' || trigger === 'stale_pr') && (
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">
                                2. {trigger === 'health_drop' ? 'Score Threshold (%)' : 'Stale Threshold (Days)'}
                            </label>
                            <input 
                                type="number" 
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                className="w-full bg-surface-200 border border-surface-300 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">3. Primary Output Channel</label>
                        <select 
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                            className="w-full bg-surface-200 border border-surface-300 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px] bg-[right_1rem_center] bg-no-repeat"
                        >
                            <option value="email">Email Digest</option>
                            <option value="slack">Slack Hook</option>
                            <option value="push">Mobile Push</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                         <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-surface-300 text-gray-400 font-bold hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="flex-1 btn-primary flex items-center justify-center gap-2">
                            <Plus size={18} /> Save Rule
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
