import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

interface AnalyticsDashboardProps {
    analysis?: any;
}

export default function AnalyticsDashboard({ analysis }: AnalyticsDashboardProps) {
    const [globalAnalytics, setGlobalAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!analysis) {
            fetchAnalytics();
        } else {
            setLoading(false);
        }
    }, [analysis]);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`${API_URL}/analytics/summary`);
            setGlobalAnalytics(res.data);
        } catch (e) {
            console.error("Failed to fetch analytics", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-teal-500">
                <div className="animate-pulse">Loading Analytics...</div>
            </div>
        );
    }

    // Use provided analysis OR global fallback
    const data = analysis ? {
        severity_distribution: {
            Major: analysis.drug_interactions.filter((i: any) => i.severity > 0.7).length,
            Moderate: analysis.drug_interactions.filter((i: any) => i.severity > 0.4 && i.severity <= 0.7).length,
            Minor: analysis.drug_interactions.filter((i: any) => i.severity <= 0.4).length
        },
        top_risky_pairs: analysis.drug_interactions.map((i: any) => ({
            pair: `${i.drugA} + ${i.drugB}`,
            count: (i.severity * 100).toFixed(0) // Using severity % as "count" or score for display
        })).sort((a: any, b: any) => b.count - a.count),
        total_interactions: analysis.drug_interactions.length,
        high_risk_count: analysis.drug_interactions.filter((i: any) => i.severity > 0.7).length
    } : globalAnalytics;

    if (!data) return null;

    // Calculate totals if using global analytics (which has different structure)
    const totalInteractions = analysis
        ? data.total_interactions
        : Object.values(data.severity_distribution || {}).reduce((a: any, b: any) => a + b, 0);

    const highRiskCount = analysis
        ? data.high_risk_count
        : (data.severity_distribution?.Major || 0);

    return (
        <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 h-full overflow-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-teal-400" size={20} />
                <h3 className="text-teal-400 font-bold">
                    {analysis ? "CURRENT ANALYSIS" : "GLOBAL ANALYTICS"}
                </h3>
            </div>

            {/* Severity Distribution */}
            <div className="mb-6">
                <h4 className="text-xs font-semibold text-slate-400 mb-3">SEVERITY DISTRIBUTION</h4>
                <div className="space-y-2">
                    {Object.entries(data.severity_distribution || {}).map(([severity, count]: [string, any]) => {
                        if (count === 0 && analysis) return null; // Hide empty categories for current analysis

                        const color = severity === 'Major' ? 'bg-red-500' : severity === 'Moderate' ? 'bg-yellow-500' : 'bg-slate-500';
                        const total = totalInteractions || 1; // Avoid divide by zero
                        const percentage = ((count / total) * 100).toFixed(0);

                        return (
                            <div key={severity} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-300">{severity}</span>
                                    <span className="text-slate-400">{count} ({percentage}%)</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${color} transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {analysis && totalInteractions === 0 && (
                        <p className="text-slate-500 text-sm italic">No interactions detected.</p>
                    )}
                </div>
            </div>

            {/* Top Risky Pairs */}
            <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                    <TrendingUp size={14} /> {analysis ? "DETECTED INTERACTIONS" : "TOP RISKY PAIRS"}
                </h4>
                <div className="space-y-2">
                    {data.top_risky_pairs?.length > 0 ? (
                        data.top_risky_pairs.map((item: any, i: number) => (
                            <div key={i} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 hover:border-red-500/30 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-300 font-mono">{item.pair}</span>
                                    <div className="flex items-center gap-1">
                                        <AlertCircle size={12} className="text-red-400" />
                                        <span className="text-xs text-red-400 font-bold">
                                            {analysis ? `Risk: ${item.count}%` : item.count}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-sm italic">None found.</p>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/30 p-3 rounded">
                        <div className="text-xs text-slate-400">Total Interactions</div>
                        <div className="text-2xl font-bold text-teal-400">
                            {totalInteractions}
                        </div>
                    </div>
                    <div className="bg-slate-800/30 p-3 rounded">
                        <div className="text-xs text-slate-400">High Risk</div>
                        <div className="text-2xl font-bold text-red-400">
                            {highRiskCount}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
