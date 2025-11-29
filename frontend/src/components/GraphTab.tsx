import { BarChart3, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface GraphTabProps {
    analysis?: any;
}

export default function GraphTab({ analysis }: GraphTabProps) {
    if (!analysis) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-950">
                <div className="bg-slate-900/90 border border-slate-700 p-8 rounded-lg text-center max-w-md">
                    <Info className="mx-auto mb-4 text-slate-500" size={48} />
                    <p className="text-slate-400 text-lg">No analysis data available</p>
                    <p className="text-slate-500 text-sm mt-2">Run an analysis to see alternatives and recommendations</p>
                </div>
            </div>
        );
    }

    const organImpacts = analysis.organ_impacts || {};
    const alternatives = analysis.alternatives || [];
    const drugInteractions = analysis.drug_interactions || [];
    const globalRisk = analysis.global_risk || 0;

    const maxOrganRisk = Math.max(...Object.values(organImpacts).map((v: any) => v), 0);

    return (
        <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-900/30 to-emerald-900/30 border border-teal-500/30 rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-teal-400 flex items-center gap-2 mb-2">
                        <BarChart3 size={28} />
                        Analysis Report
                    </h1>
                    <p className="text-slate-400 text-sm">Comprehensive medication safety analysis and recommendations</p>
                </div>

                {/* Global Risk Alert */}
                {globalRisk > 0.7 && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="text-red-400 font-bold mb-1">High Risk Detected</h3>
                            <p className="text-red-300 text-sm">
                                Global risk score: {(globalRisk * 100).toFixed(0)}%. Immediate medical consultation recommended.
                            </p>
                        </div>
                    </div>
                )}

                {/* Medication Alternatives */}
                {alternatives.length > 0 && (
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                            <CheckCircle2 size={20} />
                            Safer Alternatives
                        </h2>
                        <div className="space-y-3">
                            {alternatives.map((alt: any, i: number) => (
                                <div key={i} className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-white mb-1">{alt.drug}</div>
                                        <div className="text-sm text-slate-400">{alt.reason}</div>
                                    </div>
                                    <button className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                                        Consider
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Organ Impact Breakdown */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                        <BarChart3 size={20} />
                        Organ Impact Analysis
                    </h2>
                    {Object.keys(organImpacts).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(organImpacts)
                                .sort(([, a]: any, [, b]: any) => b - a)
                                .map(([organ, risk]: [string, any]) => {
                                    const percentage = (risk * 100).toFixed(0);
                                    const color = risk > 0.7 ? 'bg-red-500' : risk > 0.4 ? 'bg-yellow-500' : 'bg-green-500';
                                    const textColor = risk > 0.7 ? 'text-red-400' : risk > 0.4 ? 'text-yellow-400' : 'text-green-400';

                                    return (
                                        <div key={organ} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-slate-300 capitalize">{organ.replace('_', ' ')}</span>
                                                <span className={`text-sm font-bold ${textColor}`}>{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-full ${color} transition-all duration-500 rounded-full`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No organ impacts detected</p>
                    )}
                </div>

                {/* Interaction Mechanisms */}
                {drugInteractions.length > 0 && (
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                            <Info size={20} />
                            Interaction Mechanisms
                        </h2>
                        <div className="space-y-3">
                            {drugInteractions.map((inter: any, i: number) => {
                                const severityColor = inter.severity > 0.7 ? 'text-red-400' : inter.severity > 0.4 ? 'text-yellow-400' : 'text-green-400';
                                const bgColor = inter.severity > 0.7 ? 'bg-red-900/20 border-red-500/30' : inter.severity > 0.4 ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-green-900/20 border-green-500/30';

                                return (
                                    <div key={i} className={`${bgColor} border rounded-lg p-4`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`font-bold ${severityColor}`}>
                                                {inter.drugA} + {inter.drugB}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${severityColor} bg-slate-800`}>
                                                Risk: {(inter.severity * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300">{inter.mechanism}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* Recommended Actions */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-teal-400 mb-4">Recommended Actions</h2>
                    <div className="space-y-2">
                        {globalRisk > 0.8 && (
                            <div className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                <span className="text-slate-300">Immediate medical consultation required due to high-risk interactions</span>
                            </div>
                        )}
                        {maxOrganRisk > 0.7 && (
                            <div className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                                <span className="text-slate-300">Monitor organ function closely - regular checkups recommended</span>
                            </div>
                        )}
                        {alternatives.length > 0 && (
                            <div className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                                <span className="text-slate-300">Consider safer alternatives listed above</span>
                            </div>
                        )}
                        {globalRisk > 0.5 && (
                            <div className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                <span className="text-slate-300">Discuss dosage adjustments with healthcare provider</span>
                            </div>
                        )}
                        {globalRisk < 0.3 && (
                            <div className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                <span className="text-slate-300">Current medication combination appears safe - continue as prescribed</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
