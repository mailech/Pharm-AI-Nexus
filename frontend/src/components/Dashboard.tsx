import React, { useState } from 'react';
import { Activity, Plus, X, Search, MessageSquare, Shield, Network, User, BarChart3 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HumanBodyScene } from './HumanBody3D';
import DrugNetwork3D from './DrugNetwork3D';
import NetworkBodyView from './NetworkBodyView';
import ChatPanel from './ChatPanel';
import BlockchainExplorer from './BlockchainExplorer';
import AnalyticsDashboard from './AnalyticsDashboard';
import GraphTab from './GraphTab';
import { checkInteractions } from '../api';

export default function Dashboard() {
    const [drugs, setDrugs] = useState<string[]>(['Warfarin', 'Aspirin']);
    const [newDrug, setNewDrug] = useState('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
    const [rightPanelMode, setRightPanelMode] = useState<'chat' | 'audit' | 'analytics' | 'graph'>('chat');
    const [centerViewMode, setCenterViewMode] = useState<'body' | 'network'>('body');
    const [networkSubMode, setNetworkSubMode] = useState<'3d_map' | 'graph'>('3d_map');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [auditRefreshTrigger, setAuditRefreshTrigger] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const addDrug = () => {
        if (newDrug && !drugs.includes(newDrug)) {
            setDrugs([...drugs, newDrug]);
            setNewDrug('');
        }
    };

    const removeDrug = (drug: string) => {
        setDrugs(drugs.filter(d => d !== drug));
    };

    const runAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await checkInteractions(drugs);
            setAnalysis(result);
            setAuditRefreshTrigger(prev => prev + 1); // Trigger audit log refresh
        } catch (e) {
            console.error(e);
            setError("Failed to analyze interactions. Please ensure the backend is running.");
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handlePrescriptionUpload = (detectedDrugs: string[]) => {
        // Add new drugs that aren't already in the list
        const newDrugs = detectedDrugs.filter(d => !drugs.includes(d));
        if (newDrugs.length > 0) {
            setDrugs(prev => [...prev, ...newDrugs]);
            // Auto-run analysis after a short delay to allow state update
            setTimeout(() => {
                // We can't call runAnalysis directly here because 'drugs' state won't be updated yet in that closure
                // But since we updated state, the user can just click "Run Analysis" or we can use a useEffect
                // For now, let's just add them and let the user click run, or trigger it via a separate effect if needed.
                // Actually, let's trigger it manually with the new list
                checkInteractions([...drugs, ...newDrugs]).then(result => {
                    setAnalysis(result);
                    setAuditRefreshTrigger(prev => prev + 1);
                });
            }, 500);
        }
    };

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ctrl+Enter to run analysis
            if (e.ctrlKey && e.key === 'Enter' && drugs.length >= 2 && !loading) {
                runAnalysis();
            }
            // Escape to clear analysis
            if (e.key === 'Escape' && analysis) {
                setAnalysis(null);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [drugs, loading, analysis]);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
            {/* Left Panel: Controls */}
            <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-900/50 p-4 gap-6 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-teal-400 flex items-center gap-2 mb-1">
                        <Activity className="animate-pulse" /> PharmAI Nexus
                    </h1>
                    <p className="text-xs text-slate-500">MEDICATION SAFETY SYSTEM</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <label className="text-xs font-semibold text-slate-400 mb-2 block">ACTIVE MEDICATIONS</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                value={newDrug}
                                onChange={(e) => setNewDrug(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addDrug()}
                                className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm focus:border-teal-500 outline-none"
                                placeholder="Add drug..."
                            />
                            <button onClick={addDrug} className="bg-teal-600 p-1 rounded hover:bg-teal-500"><Plus size={16} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {drugs.map(d => (
                                <span key={d} className="bg-slate-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-slate-600">
                                    {d} <button onClick={() => removeDrug(d)} className="hover:text-red-400"><X size={12} /></button>
                                </span>
                            ))}
                        </div>

                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <label className="text-xs font-semibold text-slate-400 mb-2 block">PATIENT PROFILE</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setGender('male')}
                                    className={`flex-1 py-1 text-xs font-bold rounded border ${gender === 'male' ? 'bg-teal-600 border-teal-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                                >
                                    MALE
                                </button>
                                <button
                                    onClick={() => setGender('female')}
                                    className={`flex-1 py-1 text-xs font-bold rounded border ${gender === 'female' ? 'bg-teal-600 border-teal-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                                >
                                    FEMALE
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={runAnalysis}
                        disabled={loading || drugs.length < 2}
                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-teal-900/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ANALYZING...
                            </>
                        ) : (
                            <>
                                RUN ANALYSIS <Search size={18} />
                            </>
                        )}
                    </button>
                </div>

                {analysis && (
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                        <div className="text-xs font-semibold text-slate-400">DETECTED INTERACTIONS</div>
                        {analysis.drug_interactions && analysis.drug_interactions.map((inter: any, i: number) => {
                            const severityColor = inter.severity > 0.7 ? 'text-red-400' : inter.severity > 0.4 ? 'text-yellow-400' : 'text-green-400';
                            const bgColor = inter.severity > 0.7 ? 'bg-red-900/20 border-red-500/30' : inter.severity > 0.4 ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-green-900/20 border-green-500/30';

                            return (
                                <div key={i} className={`${bgColor} border p-3 rounded-lg`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-bold ${severityColor} text-sm`}>{inter.drugA} + {inter.drugB}</span>
                                        <span className={`text-xs px-1 rounded ${severityColor} bg-slate-800`}>
                                            {(inter.severity * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        {inter.mechanism}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Center: 3D Visualization */}
            <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="absolute inset-0">
                    {centerViewMode === 'body' ? (
                        <>
                            <Canvas camera={{ position: [0, 1.0, 5], fov: 50 }}>
                                <color attach="background" args={['#020617']} />
                                <HumanBodyScene
                                    bodyType={gender}
                                    organImpact={(() => {
                                        const impacts = analysis?.region_impacts || analysis?.organ_impacts || {};
                                        // Normalize: extract severity and symptoms from dict values
                                        const normalized: any = {};
                                        for (const [region, value] of Object.entries(impacts)) {
                                            if (typeof value === 'object' && value !== null && 'severity' in value) {
                                                normalized[region] = (value as any).severity;
                                                // Store symptoms separately for tooltip access
                                                (normalized as any)[`${region}_symptoms`] = (value as any).symptoms || [];
                                            } else {
                                                normalized[region] = value;
                                            }
                                        }
                                        return normalized;
                                    })()}
                                    onOrganClick={(organ) => setSelectedOrgan(organ)}
                                    bodyOpacity={0.15}
                                />
                                {/* Interactive Controls */}
                                <OrbitControls
                                    target={[0, 1.0, 0]}
                                    enablePan={true}
                                    enableZoom={true}
                                    enableRotate={true}
                                    minDistance={2}
                                    maxDistance={8}
                                    maxPolarAngle={Math.PI / 1.5}
                                    minPolarAngle={Math.PI / 4}
                                />
                            </Canvas>

                            {/* Tooltip for hovered organ */}
                            {selectedOrgan && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-teal-500/50 px-4 py-2 rounded-lg pointer-events-none">
                                    <p className="text-teal-400 font-bold text-sm capitalize">
                                        {selectedOrgan.replace('_', ' ')}
                                    </p>
                                </div>
                            )}

                            {/* Risk Mitigation Card */}
                            {analysis && (
                                <div className="absolute bottom-4 left-4 w-64 bg-slate-900/90 backdrop-blur border border-red-500/30 rounded-lg p-3 shadow-lg pointer-events-auto">
                                    <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
                                        <Shield size={16} className="text-red-400" />
                                        <h3 className="text-xs font-bold text-slate-200">KEY RISKS & MITIGATION</h3>
                                    </div>
                                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                        {(() => {
                                            const impacts = analysis.region_impacts || analysis.organ_impacts || {};
                                            const highRiskOrgans = Object.entries(impacts)
                                                .map(([name, data]: [string, any]) => ({
                                                    name,
                                                    severity: typeof data === 'object' ? data.severity : data,
                                                    symptoms: typeof data === 'object' ? data.symptoms : []
                                                }))
                                                .filter(o => o.severity >= 0.5)
                                                .sort((a, b) => b.severity - a.severity)
                                                .slice(0, 3);

                                            if (highRiskOrgans.length === 0) {
                                                return <p className="text-[10px] text-slate-400">No high-risk organs detected.</p>;
                                            }

                                            const riskMap: any = {
                                                liver: { risk: "Liver strain/enzyme elevation", mitigation: "Avoid alcohol, limit acetaminophen." },
                                                kidneys: { risk: "Reduced filtration function", mitigation: "Hydrate well, monitor BP." },
                                                kidney_left: { risk: "Reduced filtration function", mitigation: "Hydrate well, monitor BP." },
                                                kidney_right: { risk: "Reduced filtration function", mitigation: "Hydrate well, monitor BP." },
                                                stomach: { risk: "Ulcers or GI bleeding", mitigation: "Take with food, avoid NSAIDs." },
                                                heart: { risk: "Rhythm or BP issues", mitigation: "Monitor pulse/BP regularly." },
                                                brain: { risk: "Dizziness or confusion", mitigation: "Avoid driving if dizzy." },
                                                lungs: { risk: "Respiratory depression", mitigation: "Monitor breathing rate." }
                                            };

                                            return highRiskOrgans.map((organ, i) => {
                                                const info = riskMap[organ.name.toLowerCase()] || { risk: "General organ stress", mitigation: "Monitor for symptoms." };
                                                return (
                                                    <div key={i} className="text-xs">
                                                        <div className="flex justify-between text-red-300 font-semibold">
                                                            <span className="capitalize">{organ.name.replace('_', ' ')}</span>
                                                            <span>{(organ.severity * 100).toFixed(0)}%</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 mb-0.5">{info.risk}</p>
                                                        <p className="text-[10px] text-teal-400 italic">Mitigation: {info.mitigation}</p>
                                                    </div>
                                                );
                                            });
                                        })()}
                                        {analysis.global_risk > 0.7 && (
                                            <div className="pt-2 border-t border-slate-700 text-[10px] text-yellow-400 font-semibold">
                                                ⚠️ Overall risk is high – please contact your doctor before changing any medication.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // Network View - Supports Toggle
                        networkSubMode === '3d_map' ? (
                            <NetworkBodyView analysis={analysis} drugs={drugs} onOrganClick={setSelectedOrgan} gender={gender} />
                        ) : (
                            <DrugNetwork3D analysis={analysis} drugs={drugs} />
                        )
                    )}
                </div>

                {/* View Toggle & Stats */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur border border-slate-700 p-1 rounded-lg flex pointer-events-auto">
                        <button
                            onClick={() => setCenterViewMode('body')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors flex items-center gap-1 ${centerViewMode === 'body' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <User size={14} /> BODY
                        </button>
                        <button
                            onClick={() => setCenterViewMode('network')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors flex items-center gap-1 ${centerViewMode === 'network' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Network size={14} /> NETWORK
                        </button>
                    </div>

                    {/* Sub-toggle for Network View */}
                    {centerViewMode === 'network' && (
                        <div className="bg-black/40 backdrop-blur border border-slate-700 p-1 rounded-lg flex pointer-events-auto animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={() => setNetworkSubMode('3d_map')}
                                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${networkSubMode === '3d_map' ? 'bg-teal-600/50 text-teal-100' : 'text-slate-400 hover:text-white'}`}
                            >
                                3D MAP
                            </button>
                            <button
                                onClick={() => setNetworkSubMode('graph')}
                                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${networkSubMode === 'graph' ? 'bg-teal-600/50 text-teal-100' : 'text-slate-400 hover:text-white'}`}
                            >
                                GRAPH
                            </button>
                        </div>
                    )}

                    <div className="bg-black/40 backdrop-blur border border-slate-700 p-3 rounded-lg pointer-events-auto">
                        <div className="text-xs text-slate-400">GLOBAL RISK</div>
                        <div className={`text-xl font-bold ${analysis?.global_risk > 0.7 ? 'text-red-500' :
                            analysis?.global_risk > 0.4 ? 'text-yellow-500' : 'text-teal-500'
                            }`}>
                            {analysis?.global_risk ? `${(analysis.global_risk * 100).toFixed(0)}%` : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Tabs (Agent / Audit / Analytics) */}
            <div className="w-96 border-l border-slate-800 z-10 flex flex-col bg-slate-900/80 backdrop-blur">
                <div className="flex border-b border-slate-800">
                    <button
                        className={`flex-1 p-2 text-xs font-bold flex items-center justify-center gap-1 transition-colors ${rightPanelMode === 'chat'
                            ? 'text-teal-400 bg-slate-800/50 border-b-2 border-teal-400'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                        onClick={() => setRightPanelMode('chat')}
                    >
                        <MessageSquare size={12} /> AGENT
                    </button>
                    <button
                        className={`flex-1 p-2 text-xs font-bold flex items-center justify-center gap-1 transition-colors ${rightPanelMode === 'audit'
                            ? 'text-teal-400 bg-slate-800/50 border-b-2 border-teal-400'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                        onClick={() => setRightPanelMode('audit')}
                    >
                        <Shield size={12} /> AUDIT
                    </button>
                    <button
                        className={`flex-1 p-2 text-xs font-bold flex items-center justify-center gap-1 transition-colors ${rightPanelMode === 'graph'
                            ? 'text-teal-400 bg-slate-800/50 border-b-2 border-teal-400'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                        onClick={() => setRightPanelMode('graph')}
                    >
                        <BarChart3 size={12} /> GRAPH
                    </button>
                    <button
                        className={`flex-1 p-2 text-xs font-bold flex items-center justify-center gap-1 transition-colors ${rightPanelMode === 'analytics'
                            ? 'text-teal-400 bg-slate-800/50 border-b-2 border-teal-400'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                        onClick={() => setRightPanelMode('analytics')}
                    >
                        <Activity size={12} /> DATA
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {rightPanelMode === 'chat' ? (
                        <ChatPanel
                            context={{ current_drugs: drugs, analysis_result: analysis }}
                            onPrescriptionUpload={handlePrescriptionUpload}
                        />
                    ) : rightPanelMode === 'audit' ? (
                        <BlockchainExplorer refreshTrigger={auditRefreshTrigger} />
                    ) : rightPanelMode === 'graph' ? (
                        <GraphTab analysis={analysis} />
                    ) : (
                        <AnalyticsDashboard analysis={analysis} />
                    )}
                </div>
            </div>


            {/* Error Toast */}
            {
                error && (
                    <div className="absolute bottom-4 right-4 bg-red-900/90 border border-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
                        <div className="bg-red-500 rounded-full p-1">
                            <X size={12} />
                        </div>
                        <span className="text-sm font-medium">{error}</span>
                        <button onClick={() => setError(null)} className="ml-2 text-red-300 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>
                )
            }
        </div >
    );
}
