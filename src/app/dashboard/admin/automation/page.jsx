'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Clock, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AutomationController() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/automation');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleRetry = async (id) => {
        try {
            const res = await fetch('/api/admin/automation', {
                method: 'POST',
                body: JSON.stringify({ id }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                toast.success('Retry Initiated');
                fetchLogs();
            } else {
                throw new Error('Retry Failed');
            }
        } catch (error) {
            toast.error('Retry failed');
        }
    };

    const StatusBadge = ({ status }) => {
        if (status === 'SUCCESS') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Sent</span>;
        if (status === 'FAILED') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> Failed</span>;
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Automation Logs <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{logs.length}</span>
                    </h2>
                    <p className="text-gray-500 text-sm">Monitor and retry automated emails & messages.</p>
                </div>
                <button onClick={fetchLogs} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Refresh">
                    <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="p-4">Type</th>
                                <th className="p-4">Target</th>
                                <th className="p-4">Subject/Content</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Retries</th>
                                <th className="p-4">Time</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-400">No automation logs found.</td>
                                </tr>
                            ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 font-medium text-gray-800">
                                            {log.type === 'EMAIL' ? <Mail className="w-4 h-4 text-blue-500" /> : <MessageSquare className="w-4 h-4 text-purple-500" />}
                                            {log.type}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs">{log.target}</td>
                                    <td className="p-4 max-w-xs truncate" title={log.payload?.body}>
                                        {log.payload?.subject || 'Message Content'}
                                    </td>
                                    <td className="p-4"><StatusBadge status={log.status} /></td>
                                    <td className="p-4 text-center">{log.retryCount}</td>
                                    <td className="p-4 text-xs text-gray-400">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        {log.status !== 'SUCCESS' && (
                                            <button
                                                onClick={() => handleRetry(log.id)}
                                                className="px-3 py-1.5 bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-700 rounded-lg text-xs font-bold transition"
                                            >
                                                Retry
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
