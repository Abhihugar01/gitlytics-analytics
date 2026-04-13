import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Mail, MessageSquare, Settings, History, CheckCircle2, Plus, Trash2, Shield, AlertCircle, Clock, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { settingsAPI } from '../services/api';
import CreateRuleModal from '../components/CreateRuleModal';

export default function SmartAlerts() {
    const { userId } = useStore();
    const [settings, setSettings] = useState({ email: true, slack: true, push: false });
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!userId) return;
        settingsAPI.getNotifications(userId)
            .then(res => {
                setSettings(res.data.settings || { email: true, slack: true, push: false });
                setRules(res.data.rules || []);
            })
            .catch(() => toast.error('Failed to load settings'))
            .finally(() => setLoading(false));
    }, [userId]);

    const toggleChannel = async (channel) => {
        const newVal = !settings[channel];
        const prev = { ...settings };
        setSettings({ ...settings, [channel]: newVal });
        
        try {
            await settingsAPI.updateNotifications(userId, { [channel]: newVal });
            toast.success(`${channel.charAt(0).toUpperCase() + channel.slice(1)} alerts updated`);
        } catch (err) {
            setSettings(prev);
            toast.error('Failed to update setting');
        }
    };

    const addRule = async (rule) => {
        try {
            const res = await settingsAPI.addRule(userId, rule);
            setRules(res);
            toast.success('Alert rule added!');
        } catch (err) {
            toast.error('Failed to add rule');
        }
    };

    const deleteRule = async (idx) => {
        try {
            const res = await settingsAPI.deleteRule(userId, idx);
            setRules(res);
            toast.success('Rule removed');
        } catch (err) {
            toast.error('Failed to delete rule');
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-500">Loading Smart Intel...</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="text-brand-400" /> Smart Alerts
                    </h1>
                    <p className="text-gray-500 mt-1">Configure automated triggers and monitor your notification history.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={16} /> Create Rule
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 space-y-6">
                    {/* Channel Controls */}
                    <div className="glass-card p-6 border-brand-500/10">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Mail size={16} /> Broadcast Channels
                        </h3>
                        <div className="space-y-4">
                            {[
                                { key: 'email', name: "Email Digest", details: "abhishek@domain.com", icon: Mail },
                                { key: 'slack', name: "Slack Hook", details: "Analytics-HQ #alerts", icon: MessageSquare },
                                { key: 'push', name: "Push Notify", details: "Browser & Mobile", icon: Bell },
                            ].map((chan) => (
                                <div key={chan.key} className="flex items-center justify-between p-4 rounded-xl bg-surface-200 border border-surface-300">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${settings[chan.key] ? 'text-brand-400' : 'text-gray-600'}`}>
                                            <chan.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{chan.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{chan.details}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleChannel(chan.key)}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${settings[chan.key] ? 'bg-brand-500' : 'bg-surface-400'}`}
                                    >
                                        <motion.div 
                                            animate={{ x: settings[chan.key] ? 20 : 2 }}
                                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notification History Mock */}
                    <div className="glass-card p-6 border-brand-500/10 opacity-60 grayscale hover:grayscale-0 transition-all">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <History size={16} /> Recent Activity
                        </h3>
                        <div className="space-y-3">
                            <div className="text-[10px] text-gray-500 italic mb-4">Historical log is view-only</div>
                            {[
                                { type: "Critical", text: "Health Score for 'experiment-ai' dropped to 12%", time: "2h ago" },
                                { type: "Security", text: "New CVE detected in 'gitlytics-backend'", time: "4h ago" },
                                { type: "Alert", text: "Weekly velocity report is now ready", time: "1d ago" },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 p-2">
                                    <div className={`mt-1 ${log.type === 'Critical' ? 'text-red-400' : 'text-brand-400'}`}>
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400"><span className="font-bold text-white">[{log.type}]</span> {log.text}</p>
                                        <p className="text-[10px] text-gray-600 mt-0.5">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-2 space-y-6">
                    {/* Active Rules List */}
                    <div className="glass-card p-6 border-brand-500/10 min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Settings size={16} /> Active Alert Rules
                            </h3>
                            <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-1 rounded-md">{rules.length} Active</span>
                        </div>

                        {rules.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="p-4 rounded-full bg-surface-200 text-gray-600">
                                    <BellOff size={32} />
                                </div>
                                <div>
                                    <p className="text-white font-bold">No active alert rules</p>
                                    <p className="text-gray-500 text-sm max-w-xs">Create your first rule to start receiving automated DevOps intelligence.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(true)} className="btn-secondary text-xs">Configure Now</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rules.map((rule, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={rule.id || i} 
                                        className="p-5 rounded-2xl bg-surface-200 border border-surface-300 group hover:border-brand-500/30 transition-all relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => deleteRule(i)} className="text-gray-500 hover:text-red-400">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                                                {rule.trigger === 'health_drop' && <AlertCircle size={20} />}
                                                {rule.trigger === 'security_vuln' && <Shield size={20} />}
                                                {rule.trigger === 'stale_pr' && <Clock size={20} />}
                                                {rule.trigger === 'velocity_drop' && <TrendingDown size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white capitalize">{rule.trigger.replace('_', ' ')}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">ID: {rule.id?.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 text-xs">
                                            <div className="flex justify-between text-gray-400">
                                                <span>Condition</span>
                                                <span className="text-white font-bold">{rule.trigger === 'security_vuln' ? 'Any detection' : `Value < ${rule.threshold}${rule.trigger === 'health_drop' ? '%' : 'd'}`}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Channel</span>
                                                <span className="text-brand-400 uppercase font-bold tracking-tighter">{rule.channel}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quiet Hours Promo */}
                    <div className="p-8 rounded-3xl bg-brand-gradient flex flex-col items-center text-center space-y-4 shadow-2xl shadow-brand-500/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <BellOff size={48} className="text-white/80" />
                        <div>
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Quiet Hours Active</h2>
                            <p className="text-white/70 text-sm max-w-md mt-1 italic">Silent mode is currently enabled for non-critical telemetry.</p>
                        </div>
                        <button className="px-6 py-2 rounded-full border border-white/20 text-white font-bold text-xs hover:bg-white/10 transition-all z-10">
                            Schedule Overrides
                        </button>
                    </div>
                </div>
            </div>

            <CreateRuleModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={addRule} 
            />
        </div>
    );
}
