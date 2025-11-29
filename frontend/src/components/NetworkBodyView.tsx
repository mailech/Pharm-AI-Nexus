import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { HumanBodyScene, organPositions, type OrganName } from './HumanBody3D';
import { BloodFlowSystem } from './BloodFlowSystem';

interface NetworkBodyViewProps {
    analysis?: any;
    drugs?: string[];
    onOrganClick?: (organ: string) => void;
    gender?: 'male' | 'female';
}

// Warning Ring Component for high-risk organs
function WarningRing({ position, severity }: { position: [number, number, number], severity: number }) {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z += 0.02;
            const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.1 + (1.0 + severity * 0.2);
            ringRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <group position={position}>
            <mesh ref={ringRef}>
                <torusGeometry args={[0.25, 0.02, 16, 32]} />
                <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.7}
                />
            </mesh>
            <Html position={[0, 0.35, 0]} center distanceFactor={8}>
                <div className="text-red-500 text-2xl font-bold animate-pulse">!</div>
            </Html>
        </group>
    );
}

// Floating Drug Sphere Component
function DrugSphere({
    name,
    position,
    risk,
    onClick,
    onHover,
    mechanisms
}: {
    name: string;
    position: [number, number, number];
    risk: number;
    onClick: () => void;
    onHover: (hovering: boolean) => void;
    mechanisms?: string;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
            meshRef.current.rotation.y += 0.01;
        }
    });

    const color = risk > 0.7 ? '#ef4444' : risk > 0.4 ? '#eab308' : '#10b981';

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setClicked(!clicked);
                    onClick();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    onHover(true);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                    onHover(false);
                }}
            >
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.8 : 0.4}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
            <Html position={[0, 0.4, 0]} center distanceFactor={10}>
                <div className={`px-2 py-1 rounded text-xs font-bold text-white whitespace-nowrap pointer-events-none transition-opacity ${hovered ? 'bg-slate-900/90 border border-teal-500' : 'bg-black/50 opacity-70'}`}>
                    {name}
                </div>
            </Html>
            {clicked && mechanisms && (
                <Html position={[0, -0.5, 0]} center distanceFactor={8}>
                    <div className="bg-slate-900/95 border border-teal-500 rounded-lg p-3 text-xs text-white max-w-[250px] pointer-events-none">
                        <div className="font-bold text-teal-400 mb-1">{name}</div>
                        <div className="text-slate-300 text-[10px]">{mechanisms}</div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// Animated Connection Line
function ConnectionLine({ start, end, color, dashed = false }: { start: [number, number, number], end: [number, number, number], color: string, dashed?: boolean }) {
    return (
        <group>
            <Line
                points={[start, end]}
                color={color}
                lineWidth={3}
                dashed={dashed}
                dashScale={2}
                dashSize={0.2}
                gapSize={0.1}
                transparent
                opacity={0.8}
            />
            {!dashed && (
                <Line
                    points={[start, end]}
                    color={color}
                    lineWidth={8}
                    transparent
                    opacity={0.2}
                />
            )}
        </group>
    );
}

// Camera Controller for smooth auto-centering
function CameraController({ target, distance }: { target: [number, number, number], distance: number }) {
    const { camera, controls } = useThree();
    const targetRef = useRef(new THREE.Vector3(...target));
    const distanceRef = useRef(distance);
    const isAnimating = useRef(false);

    useEffect(() => {
        // When target/distance changes (new analysis), start animating
        targetRef.current.set(...target);
        distanceRef.current = distance;
        isAnimating.current = true;

        // Stop animation after 2 seconds to allow user control
        const timer = setTimeout(() => {
            isAnimating.current = false;
        }, 2000);

        return () => clearTimeout(timer);
    }, [target, distance]);

    useFrame((state, delta) => {
        if (!isAnimating.current) return;

        // Smooth camera transition
        const targetPos = new THREE.Vector3(
            targetRef.current.x,
            targetRef.current.y + 1,
            targetRef.current.z + distanceRef.current
        );

        // Lerp camera position
        camera.position.lerp(targetPos, 2 * delta);

        // Update controls target if available
        if (controls) {
            // @ts-ignore
            controls.target.lerp(targetRef.current, 2 * delta);
            // @ts-ignore
            controls.update();
        }

        // Stop if close enough
        if (camera.position.distanceTo(targetPos) < 0.1) {
            isAnimating.current = false;
        }
    });

    return null;
}

export default function NetworkBodyView({ analysis, drugs = [], onOrganClick, gender = 'male' }: NetworkBodyViewProps) {
    const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
    const [drugRadius, setDrugRadius] = useState(2.0);
    const [drugHeight, setDrugHeight] = useState(1.0);
    const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 1, 0]);
    const [cameraDistance, setCameraDistance] = useState(6);
    const [horizontalOffset, setHorizontalOffset] = useState(2.0); // Default 2.0 to shift view left (avoiding right panel)

    // Calculate drug positions with boundary constraints
    const drugNodes = useMemo(() => {
        const nodes = drugs.map((drug, i) => {
            const angle = (i / drugs.length) * Math.PI * 2;
            const x = Math.cos(angle) * drugRadius;
            const z = Math.sin(angle) * drugRadius;
            const y = drugHeight;

            let risk = 0;
            let mechanism = '';
            if (analysis?.drug_interactions) {
                analysis.drug_interactions.forEach((inter: any) => {
                    if (inter.drugA === drug || inter.drugB === drug) {
                        risk = Math.max(risk, inter.severity);
                        mechanism = inter.mechanism;
                    }
                });
            }

            return { name: drug, position: [x, y, z] as [number, number, number], risk, mechanism };
        });

        // Auto-center: Calculate bounding box and adjust camera
        if (nodes.length > 0) {
            const positions = nodes.map(n => n.position);
            const xs = positions.map(p => p[0]);
            const ys = positions.map(p => p[1]);
            const zs = positions.map(p => p[2]);

            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            const minZ = Math.min(...zs);
            const maxZ = Math.max(...zs);

            // Always center on origin (where body is) + manual offset
            const centerX = horizontalOffset;
            const centerY = 1; // Body height
            const centerZ = 0;

            // Calculate required distance to fit all nodes
            const width = maxX - minX;
            const height = maxY - minY;
            const depth = maxZ - minZ;
            const maxDimension = Math.max(width, height, depth);
            const distance = Math.max(6, maxDimension * 2 + 4); // Increased padding

            setCameraTarget([centerX, centerY, centerZ]);
            setCameraDistance(distance);
        }

        return nodes;
    }, [drugs, analysis, drugRadius, drugHeight, horizontalOffset]);

    const links = useMemo(() => {
        const lines: React.ReactElement[] = [];
        if (!analysis) return lines;

        drugNodes.forEach(drugNode => {
            if (selectedDrug && drugNode.name !== selectedDrug) return;

            const affectedOrgans = new Set<string>();
            const impacts = analysis.region_impacts || analysis.organ_impacts;
            if (impacts) {
                Object.keys(impacts).forEach(organ => {
                    affectedOrgans.add(organ);
                });
            }

            affectedOrgans.forEach(organName => {
                const key = organName.toLowerCase() as OrganName;
                const targetPos = organPositions[key];

                if (targetPos) {
                    const organRisk = impacts[organName] || 0;
                    lines.push(
                        <ConnectionLine
                            key={`link-${drugNode.name}-${organName}`}
                            start={drugNode.position}
                            end={targetPos}
                            color={organRisk > 0.7 ? '#ef4444' : organRisk > 0.4 ? '#eab308' : '#2dd4bf'}
                        />
                    );
                }
            });
        });

        if (analysis.side_effect_spread) {
            Object.entries(analysis.side_effect_spread).forEach(([source, targets]: [string, any]) => {
                const sourcePos = organPositions[source.toLowerCase() as OrganName];
                if (sourcePos) {
                    targets.forEach((target: string) => {
                        const targetPos = organPositions[target.toLowerCase() as OrganName];
                        if (targetPos) {
                            lines.push(
                                <ConnectionLine
                                    key={`prop-${source}-${target}`}
                                    start={sourcePos}
                                    end={targetPos}
                                    color="#06b6d4"
                                    dashed={true}
                                />
                            );
                        }
                    });
                }
            });
        }

        return lines;
    }, [analysis, drugNodes, selectedDrug]);

    const highRiskOrgans = useMemo(() => {
        const impacts = analysis?.region_impacts || analysis?.organ_impacts;
        if (!impacts) return [];
        return Object.entries(impacts)
            .filter(([_, risk]: [string, any]) => risk > 0.8)
            .map(([organ, risk]) => ({ organ, risk }));
    }, [analysis]);

    return (
        <div className="w-full h-full relative bg-slate-950">
            <Canvas camera={{ position: [cameraTarget[0], cameraTarget[1] + 1, cameraTarget[2] + cameraDistance], fov: 55 }}>
                <color attach="background" args={['#020617']} />

                {/* Camera auto-centering controller */}
                <CameraController target={cameraTarget} distance={cameraDistance} />

                <HumanBodyScene
                    bodyType={gender}
                    organImpact={analysis?.region_impacts || analysis?.organ_impacts}
                    onOrganClick={onOrganClick}
                    bodyOpacity={0.1}
                />

                <BloodFlowSystem
                    organImpacts={analysis?.bloodflow_impacts || analysis?.organ_impacts || {}}
                    visible={true}
                />

                {highRiskOrgans.map(({ organ, risk }) => {
                    const pos = organPositions[organ.toLowerCase() as OrganName];
                    return pos ? (
                        <WarningRing key={`warning-${organ}`} position={pos} severity={risk as number} />
                    ) : null;
                })}

                {drugNodes.map((node, i) => (
                    <DrugSphere
                        key={i}
                        {...node}
                        onClick={() => setSelectedDrug(selectedDrug === node.name ? null : node.name)}
                        onHover={() => { }}
                        mechanisms={node.mechanism}
                    />
                ))}

                {links}

                <Stars radius={50} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />

                <OrbitControls
                    target={cameraTarget}
                    enablePan={true}
                    enableZoom={true}
                    minDistance={3}
                    maxDistance={12}
                    enableDamping={true}
                    dampingFactor={0.05}
                />
            </Canvas>

            {/* Overlay UI */}
            <div className="absolute top-4 left-4 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur border border-teal-500/30 p-4 rounded-lg pointer-events-auto">
                    <h3 className="text-teal-400 font-bold text-sm mb-2">NETWORK RISK MAP</h3>
                    <div className="space-y-1 text-xs text-slate-400 mb-3">
                        <p>• Floating nodes: Active Drugs</p>
                        <p>• Solid lines: Direct Impact</p>
                        <p>• Dashed lines: Side Effect Spread</p>
                        <p>• Red rings: High Risk ({'>'}80%)</p>
                    </div>

                    {/* Position Controls */}
                    <div className="border-t border-slate-700 pt-3 mt-3 space-y-2">
                        <div className="text-xs font-semibold text-teal-300 mb-2">GRAPH POSITION</div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">
                                Radius: {drugRadius.toFixed(1)}
                            </label>
                            <input
                                type="range"
                                min="1.2"
                                max="3.5"
                                step="0.1"
                                value={drugRadius}
                                onChange={(e) => setDrugRadius(parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">
                                Height: {drugHeight.toFixed(1)}
                            </label>
                            <input
                                type="range"
                                min="-1"
                                max="3"
                                step="0.1"
                                value={drugHeight}
                                onChange={(e) => setDrugHeight(parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">
                                Horizontal: {horizontalOffset.toFixed(1)}
                            </label>
                            <input
                                type="range"
                                min="-5"
                                max="5"
                                step="0.1"
                                value={horizontalOffset}
                                onChange={(e) => setHorizontalOffset(parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {selectedDrug && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-teal-500 p-4 rounded-lg max-w-sm">
                    <h4 className="text-teal-400 font-bold mb-1">{selectedDrug}</h4>
                    <p className="text-xs text-slate-300">Showing connections for {selectedDrug}. Click again to reset view.</p>
                </div>
            )}

            {!analysis && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-slate-900/90 border border-slate-700 p-6 rounded-lg text-center">
                        <p className="text-slate-400">Run analysis to visualize drug interactions</p>
                    </div>
                </div>
            )}
        </div>
    );
}
