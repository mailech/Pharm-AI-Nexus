import { useMemo } from 'react';

interface HealthImpactPanelProps {
    analysis?: any;
    gender?: 'male' | 'female';
}

interface OrganImpactData {
    name: string;
    risk: number;
    severity: 'high' | 'moderate' | 'low' | 'safe';
    explanation: string;
    suggestion: string;
    icon: string;
}

const getOrganIcon = (organ: string): string => {
    const iconMap: Record<string, string> = {
        brain: '🧠',
        heart: '❤️',
        lungs: '🫁',
        lung_left: '🫁',
        lung_right: '🫁',
        liver: '🫀',
        kidney_left: '🫘',
        kidney_right: '🫘',
        stomach: '🍔',
        intestines: '🌀',
        uterus: '🌸',
        ovary_left: '🌸',
        ovary_right: '🌸'
    };
    return iconMap[organ.toLowerCase()] || '🔴';
};

const getOrganExplanation = (organ: string, risk: number, drugs: string[] = []): string => {
    const organName = organ.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (risk > 0.7) {
        return `${organName} is experiencing high metabolic strain due to ${drugs.length > 0 ? drugs.join(' + ') : 'medication processing'}.`;
    } else if (risk > 0.4) {
        return `${organName} shows moderate impact from medication metabolism.`;
    } else if (risk > 0.1) {
        return `${organName} has minor involvement in drug processing.`;
    }
    return `${organName} is functioning normally.`;
};

const getSuggestion = (organ: string, risk: number): string => {
    if (risk > 0.7) {
        const suggestions: Record<string, string> = {
            liver: 'Avoid alcohol, monitor liver enzymes',
            kidney_left: 'Stay hydrated, monitor kidney function',
            kidney_right: 'Stay hydrated, monitor kidney function',
            heart: 'Monitor blood pressure and heart rate',
            stomach: 'Take with food, avoid spicy foods',
            brain: 'Watch for dizziness or confusion',
            lungs: 'Monitor breathing, avoid smoking'
        };
        return suggestions[organ.toLowerCase()] || 'Consult healthcare provider immediately';
    } else if (risk > 0.4) {
        return 'Monitor symptoms, maintain regular checkups';
    } else if (risk > 0.1) {
        return 'Continue normal activities, stay aware';
    }
    return 'No special precautions needed';
};

export default function HealthImpactPanel({ analysis }: HealthImpactPanelProps) {
    const organImpacts: OrganImpactData[] = useMemo(() => {
        if (!analysis) return [];

        const impacts = analysis.region_impacts || analysis.organ_impacts || {};
        const drugList = analysis.drugs || [];

        return Object.entries(impacts)
            .map(([organ, riskData]: [string, any]) => {
                // Handle both number and object risk values
                let risk = 0;
                let drugs: string[] = [];

                if (typeof riskData === 'number') {
                    risk = riskData;
                } else if (typeof riskData === 'object' && riskData.severity !== undefined) {
                    risk = riskData.severity;
                    drugs = riskData.drugs || [];
                }

                const severity: 'high' | 'moderate' | 'low' | 'safe' =
                    risk > 0.7 ? 'high' :
                        risk > 0.4 ? 'moderate' :
                            risk > 0.1 ? 'low' : 'safe';

                return {
                    name: organ,
                    risk,
                    severity,
                    explanation: getOrganExplanation(organ, risk, drugs.length > 0 ? drugs : drugList),
                    suggestion: getSuggestion(organ, risk),
                    icon: getOrganIcon(organ)
                };
            })
            .filter(impact => impact.risk > 0.05) // Only show organs with meaningful impact
            .sort((a, b) => b.risk - a.risk); // Sort by risk descending
    }, [analysis]);

    if (!analysis || organImpacts.length === 0) {
        return (
            <div className="w-80 h-full bg-slate-900/80 backdrop-blur border-l border-slate-700 p-4 overflow-y-auto">
                <h2 className="text-teal-400 font-bold text-lg mb-4 flex items-center gap-2">
                    <span>🏥</span>
                    <span>Health Impact</span>
                </h2>
                <div className="text-slate-400 text-sm text-center py-8">
                    Run analysis to see organ impacts
                </div>
            </div>
        );
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'border-red-500 bg-red-500/10';
            case 'moderate': return 'border-yellow-500 bg-yellow-500/10';
            case 'low': return 'border-blue-500 bg-blue-500/10';
            default: return 'border-green-500 bg-green-500/10';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-400';
            case 'moderate': return 'text-yellow-400';
            case 'low': return 'text-blue-400';
            default: return 'text-green-400';
        }
    };

    return (
        <div className="w-80 h-full bg-slate-900/80 backdrop-blur border-l border-slate-700 overflow-y-auto">
            <div className="sticky top-0 bg-slate-900/95 border-b border-slate-700 p-4 z-10">
                <h2 className="text-teal-400 font-bold text-lg flex items-center gap-2">
                    <span>🏥</span>
                    <span>Health Impact</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                    {organImpacts.length} organ{organImpacts.length !== 1 ? 's' : ''} affected
                </p>
            </div>

            <div className="p-4 space-y-3">
                {organImpacts.map((impact) => (
                    <div
                        key={impact.name}
                        className={`border rounded-lg p-3 transition-all hover:scale-[1.02] ${getSeverityColor(impact.severity)}`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{impact.icon}</span>
                                <div>
                                    <h3 className="font-bold text-white capitalize text-sm">
                                        {impact.name.replace(/_/g, ' ')}
                                    </h3>
                                    <p className={`text-xs font-semibold ${getSeverityTextColor(impact.severity)}`}>
                                        {impact.severity.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-lg font-bold ${getSeverityTextColor(impact.severity)}`}>
                                    {(impact.risk * 100).toFixed(0)}%
                                </div>
                                <div className="text-[10px] text-slate-400">Risk</div>
                            </div>
                        </div>

                        {/* Risk Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${impact.severity === 'high' ? 'bg-red-500' :
                                    impact.severity === 'moderate' ? 'bg-yellow-500' :
                                        impact.severity === 'low' ? 'bg-blue-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${Math.min(impact.risk * 100, 100)}%` }}
                            />
                        </div>

                        {/* Explanation */}
                        <p className="text-slate-300 text-xs mb-2 leading-relaxed">
                            {impact.explanation}
                        </p>

                        {/* Suggestion */}
                        <div className="bg-slate-800/50 rounded p-2 mt-2">
                            <p className="text-[10px] text-slate-400 font-semibold mb-1">RECOMMENDED ACTION:</p>
                            <p className="text-xs text-teal-300">
                                {impact.suggestion}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Global Risk Summary */}
            {analysis.global_risk !== undefined && (
                <div className="sticky bottom-0 bg-slate-900/95 border-t border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Global Risk:</span>
                        <span className={`text-lg font-bold ${analysis.global_risk > 0.7 ? 'text-red-400' :
                            analysis.global_risk > 0.4 ? 'text-yellow-400' :
                                'text-green-400'
                            }`}>
                            {(analysis.global_risk * 100).toFixed(0)}%
                        </span>
                    </div>
                    {analysis.global_risk > 0.7 && (
                        <p className="text-red-400 text-xs mt-2 animate-pulse">
                            ⚠️ High-risk interaction detected. Consult healthcare provider.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
