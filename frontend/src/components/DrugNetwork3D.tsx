import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';

interface DrugNetwork3DProps {
    analysis?: any;
    drugs?: string[];
}

export default function DrugNetwork3D({ analysis, drugs = [] }: DrugNetwork3DProps) {
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // 1. Measure Container Size
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
                // Re-center on resize
                if (fgRef.current) {
                    fgRef.current.zoomToFit(400, 50);
                }
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Generate Graph Data
    const graphData = useMemo(() => {
        // ... (existing logic) ...
        if (!drugs.length) return { nodes: [], links: [] };

        const nodes: any[] = [];
        const links: any[] = [];
        const addedNodes = new Set<string>();

        // 1. Add Drug Nodes
        drugs.forEach(drug => {
            if (!addedNodes.has(drug)) {
                nodes.push({
                    id: drug,
                    group: 'drug',
                    risk: 0, // Will update based on interactions
                    desc: 'Pharmaceutical Agent'
                });
                addedNodes.add(drug);
            }
        });

        // 2. Process Interactions
        if (analysis && analysis.drug_interactions) {
            analysis.drug_interactions.forEach((inter: any) => {
                const { drugA, drugB, severity } = inter;

                // Update drug risk levels
                const severityScore = severity; // Severity is now float 0-1

                const d1Node = nodes.find(n => n.id === drugA);
                const d2Node = nodes.find(n => n.id === drugB);

                if (d1Node) d1Node.risk = Math.max(d1Node.risk, severityScore);
                if (d2Node) d2Node.risk = Math.max(d2Node.risk, severityScore);

                // Add Interaction Link
                links.push({
                    source: drugA,
                    target: drugB,
                    type: 'interaction',
                    severity: severity,
                    color: severityScore > 0.7 ? '#ef4444' : severityScore > 0.4 ? '#eab308' : '#10b981'
                });
            });
        }

        // 3. Process Organ Impacts (Global)
        if (analysis && analysis.organ_impacts) {
            Object.entries(analysis.organ_impacts).forEach(([organ, score]: [string, any]) => {
                const organId = organ;

                if (!addedNodes.has(organId)) {
                    nodes.push({
                        id: organId,
                        group: 'organ',
                        desc: 'Human Organ',
                        val: 1 + (score * 2), // Scale size by impact
                        risk: score
                    });
                    addedNodes.add(organId);
                }

                drugs.forEach(drug => {
                    links.push({
                        source: drug,
                        target: organId,
                        type: 'impact',
                        color: '#2dd4bf',
                        particles: true
                    });
                });
            });
        }

        // 3. Add Nervous System Root (Optional - for visual structure)
        if (nodes.some(n => n.group === 'organ')) {
            nodes.push({ id: 'Nervous System', group: 'system', desc: 'Central Nervous System' });
            // Connect Brain to Nervous System if exists
            if (addedNodes.has('brain')) {
                links.push({ source: 'Nervous System', target: 'brain', type: 'system', color: '#64748b' });
            }
        }

        return { nodes, links };
    }, [analysis, drugs]);

    // 2. Auto-Fit on Data Change
    useEffect(() => {
        if (fgRef.current && graphData.nodes.length > 0) {
            // Wait for engine to warm up slightly
            setTimeout(() => {
                fgRef.current.d3Force('charge').strength(-120); // Increase repulsion
                fgRef.current.zoomToFit(800, 80); // 800ms animation, 80px padding
            }, 500);
        }
    }, [graphData]);

    const getNodeColor = (node: any) => {
        if (node.group === 'drug') {
            if (node.risk >= 0.8) return '#ef4444'; // Red
            if (node.risk >= 0.4) return '#eab308'; // Yellow
            return '#10b981'; // Green
        }
        if (node.group === 'organ') return '#2dd4bf'; // Teal
        if (node.group === 'system') return '#8b5cf6'; // Purple
        return '#cbd5e1';
    };

    const handleNodeClick = useCallback((node: any) => {
        // Aim at node on click
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        if (fgRef.current) {
            fgRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );
        }
    }, [fgRef]);

    if (!drugs.length) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-950">
                <p className="text-slate-500">Add drugs to visualize network</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full relative bg-slate-950 overflow-hidden">
            <ForceGraph3D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeLabel="id"
                nodeColor={getNodeColor}
                nodeRelSize={6}

                // Custom Node Object (Text + Sphere)
                nodeThreeObject={(node: any) => {
                    const group = new THREE.Group();

                    // Sphere
                    const geometry = new THREE.SphereGeometry(node.group === 'organ' ? 4 : 5, 32, 32);
                    const material = new THREE.MeshLambertMaterial({
                        color: getNodeColor(node),
                        transparent: true,
                        opacity: 0.9,
                        emissive: getNodeColor(node),
                        emissiveIntensity: 0.2
                    });
                    const sphere = new THREE.Mesh(geometry, material);
                    group.add(sphere);

                    // Text Label
                    const sprite = new SpriteText(node.id);
                    sprite.color = '#ffffff';
                    sprite.textHeight = 4;
                    sprite.position.y = 8;
                    group.add(sprite);

                    return group;
                }}

                // Link Styling
                linkWidth={(link: any) => link.type === 'interaction' ? 2 : 0.5}
                linkColor={(link: any) => link.color}
                linkDirectionalParticles={(link: any) => link.type === 'impact' ? 2 : 0}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}

                // Container
                backgroundColor="#020617"
                showNavInfo={false}
                onNodeClick={handleNodeClick}

                // Physics
                d3VelocityDecay={0.3}
                cooldownTicks={100}
                onEngineStop={() => fgRef.current.zoomToFit(400)}
            />

            {/* Legend Overlay */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm border border-teal-500/30 rounded-lg p-4 text-xs pointer-events-none select-none">
                <h3 className="text-teal-400 font-bold mb-3 uppercase tracking-wider">Network Legend</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-slate-300">Safe Drug</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
                        <span className="text-slate-300">Moderate Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                        <span className="text-slate-300">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]"></div>
                        <span className="text-slate-300">Affected Organ</span>
                    </div>
                    <div className="h-px bg-slate-700 my-2"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-red-500"></div>
                        <span className="text-slate-300">Interaction</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-teal-500/50 border-t border-dashed border-teal-500"></div>
                        <span className="text-slate-300">Organ Impact</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
