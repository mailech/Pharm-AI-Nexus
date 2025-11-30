import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export type BodyType = 'male' | 'female';

export type OrganName =
    // Head & Sensory
    | 'head'
    | 'brain'
    | 'eyes'
    | 'ears'
    | 'neck'
    // Torso
    | 'chest_wall'
    | 'heart'
    | 'lungs'
    | 'lung_left'
    | 'lung_right'
    | 'upper_back'
    | 'lower_back'
    // Upper Limbs
    | 'shoulders'
    | 'arm_left'
    | 'arm_right'
    | 'hand_left'
    | 'hand_right'
    // Abdomen
    | 'abdomen'
    | 'stomach'
    | 'liver'
    | 'kidney_left'
    | 'kidney_right'
    | 'intestines'
    | 'pelvis'
    // Lower Limbs
    | 'leg_left'
    | 'leg_right'
    | 'foot_left'
    | 'foot_right'
    // Female-specific
    | 'uterus'
    | 'ovary_left'
    | 'ovary_right';

export type OrganImpact = {
    [key in OrganName]?: number; // 0 to 1 severity
};

interface HumanBodySceneProps {
    organImpact?: OrganImpact;
    onOrganClick?: (organ: OrganName) => void;
    bodyOpacity?: number;
    bodyType?: BodyType; // NEW: Gender selection
}

// Color mapping based on severity
const getSeverityColor = (severity: number = 0): string => {
    if (severity > 0.7) return '#ef4444'; // Red - High
    if (severity > 0.4) return '#f59e0b'; // Orange - Moderate
    if (severity > 0.1) return '#eab308'; // Yellow - Low
    return '#10b981'; // Green - Safe
};

// Individual organ component
function Organ({
    name,
    position,
    geometry,
    baseColor,
    severity = 0,
    onClick,
    opacity = 0.85,
    selected = false,
    onSelect
}: {
    name: OrganName;
    position: [number, number, number];
    geometry: THREE.BufferGeometry;
    baseColor: string;
    severity?: number;
    onClick?: (name: OrganName) => void;
    opacity?: number;
    selected?: boolean;
    onSelect?: (name: OrganName) => void;
}) {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<Mesh>(null);

    const color = severity > 0 ? getSeverityColor(severity) : baseColor;
    const emissiveIntensity = severity > 0 ? severity * 0.6 : (hovered || selected ? 0.3 : 0);

    useFrame((state) => {
        if (meshRef.current && severity > 0.7) {
            const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.9;
            meshRef.current.scale.setScalar(pulse);
        } else if (meshRef.current) {
            meshRef.current.scale.setScalar(hovered || selected ? 1.05 : 1.0);
        }
    });

    return (
        <group>
            <mesh
                ref={meshRef}
                position={position}
                geometry={geometry}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(name);
                    onClick?.(name);
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = 'default';
                }}
            >
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity}
                    transparent
                    opacity={opacity}
                    roughness={0.4}
                    metalness={0.1}
                />
            </mesh>
            {(selected || hovered) && (
                <Html position={position} center distanceFactor={5} style={{ pointerEvents: 'none' }}>
                    <div className={`bg-slate-900/60 backdrop-blur-sm border ${severity > 0 ? 'border-red-500/70' : 'border-teal-500/70'} rounded-lg p-3 text-xs text-white min-w-[200px] max-w-[280px] pointer-events-none z-50 transition-opacity duration-200 ${selected || hovered ? 'opacity-100' : 'opacity-0'}`}>
                        <div className={`font-bold ${severity > 0 ? 'text-red-400' : 'text-teal-400'} mb-1 capitalize`}>{name.replace('_', ' ')}</div>
                        <div className="text-slate-300 mb-2">Risk: {(severity * 100).toFixed(0)}%</div>
                        <div className="text-slate-400 text-[10px] mb-1">
                            {severity > 0.7 ? 'High risk - Monitor closely' :
                                severity > 0.4 ? 'Moderate risk' :
                                    severity > 0 ? 'Low risk' : 'No risk detected'}
                        </div>
                        {(onClick as any)?.symptoms && (onClick as any).symptoms.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-700">
                                <div className="text-[10px] font-semibold text-teal-300 mb-1">Possible Effects:</div>
                                <ul className="text-[9px] text-slate-400 space-y-0.5 list-disc list-inside">
                                    {(onClick as any).symptoms.slice(0, 5).map((symptom: string, idx: number) => (
                                        <li key={idx}>{symptom}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </Html>
            )}
        </group>
    );
}

// Nerve branch component
function NerveBranch({
    start,
    end,
}: {
    start: [number, number, number];
    end: [number, number, number];
}) {
    const midpoint: [number, number, number] = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2,
    ];

    const length = Math.sqrt(
        Math.pow(end[0] - start[0], 2) +
        Math.pow(end[1] - start[1], 2) +
        Math.pow(end[2] - start[2], 2)
    );

    const direction = new THREE.Vector3(
        end[0] - start[0],
        end[1] - start[1],
        end[2] - start[2]
    ).normalize();

    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    return (
        <mesh position={midpoint} quaternion={quaternion}>
            <cylinderGeometry args={[0.008, 0.008, length, 6]} />
            <meshStandardMaterial
                color="#22d3ee"
                emissive="#22d3ee"
                emissiveIntensity={0.4}
                transparent
                opacity={0.6}
            />
        </mesh>
    );
}

// Organ/Region positions - Exported for use in Network Graph
export const organPositions = {
    // Head & Sensory
    head: [0, 1.8, 0] as [number, number, number],
    brain: [0, 1.7, 0] as [number, number, number],
    eyes: [0, 1.75, 0.15] as [number, number, number],
    ears: [0.2, 1.7, 0] as [number, number, number],
    neck: [0, 1.45, 0] as [number, number, number],

    // Torso
    chest_wall: [0, 1.05, 0.15] as [number, number, number],
    heart: [-0.06, 0.95, 0.12] as [number, number, number],
    lungs: [0, 1.0, 0.08] as [number, number, number],
    lung_left: [-0.16, 1.0, 0.08] as [number, number, number],
    lung_right: [0.16, 1.0, 0.08] as [number, number, number],
    upper_back: [0, 1.1, -0.15] as [number, number, number],
    lower_back: [0, 0.6, -0.15] as [number, number, number],

    // Upper Limbs
    shoulders: [0.35, 1.25, 0] as [number, number, number],
    arm_left: [-0.4, 0.85, 0] as [number, number, number],
    arm_right: [0.4, 0.85, 0] as [number, number, number],
    hand_left: [-0.42, 0.4, 0] as [number, number, number],
    hand_right: [0.42, 0.4, 0] as [number, number, number],

    // Abdomen
    abdomen: [0, 0.65, 0.1] as [number, number, number],
    stomach: [-0.09, 0.72, 0.12] as [number, number, number],
    liver: [0.14, 0.68, 0.1] as [number, number, number],
    kidney_left: [-0.13, 0.58, -0.02] as [number, number, number],
    kidney_right: [0.13, 0.58, -0.02] as [number, number, number],
    intestines: [0, 0.42, 0.1] as [number, number, number],
    pelvis: [0, 0.25, 0] as [number, number, number],

    // Lower Limbs
    leg_left: [-0.13, -0.15, 0] as [number, number, number],
    leg_right: [0.13, -0.15, 0] as [number, number, number],
    foot_left: [-0.13, -0.95, 0.05] as [number, number, number],
    foot_right: [0.13, -0.95, 0.05] as [number, number, number],

    // Female-specific
    uterus: [0, 0.28, 0.08] as [number, number, number],
    ovary_left: [-0.08, 0.3, 0.06] as [number, number, number],
    ovary_right: [0.08, 0.3, 0.06] as [number, number, number],
};

export function HumanBodyScene({
    organImpact = {},
    onOrganClick,
    bodyOpacity = 0.15,
    bodyType = 'male' // Default to male
}: HumanBodySceneProps) {
    const bodyRef = useRef<Group>(null);
    const [selectedOrgan, setSelectedOrgan] = useState<OrganName | null>(null);

    const handleOrganSelect = (name: OrganName) => {
        setSelectedOrgan(prev => prev === name ? null : name);
    };

    // Gentle rotation animation
    useFrame((state) => {
        if (bodyRef.current) {
            bodyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.25;
        }
    });

    // Body proportions based on gender
    const isFemale = bodyType === 'female';

    // Organ geometries (shared between genders)
    const organGeometries = {
        brain: new THREE.SphereGeometry(0.18, 32, 32),
        heart: new THREE.ConeGeometry(0.12, 0.18, 32),
        lung: new THREE.SphereGeometry(0.14, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.8),
        liver: new THREE.BoxGeometry(0.22, 0.16, 0.14, 2, 2, 2),
        kidney: new THREE.CapsuleGeometry(0.06, 0.12, 16, 32),
        stomach: new THREE.SphereGeometry(0.13, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.7),
        intestines: new THREE.TorusGeometry(0.15, 0.06, 16, 32, Math.PI * 1.5),
        // Female-specific organs
        uterus: new THREE.ConeGeometry(0.1, 0.15, 16),
        ovary: new THREE.SphereGeometry(0.04, 16, 16),
    };

    return (
        <group ref={bodyRef} position={[0, 0.3, 0]} name="HumanBody" onClick={(e) => { e.stopPropagation(); setSelectedOrgan(null); }}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 3]} intensity={0.8} castShadow />
            <pointLight position={[-2, 2, -2]} intensity={0.4} color="#60a5fa" />
            <spotLight position={[0, 4, 0]} angle={0.5} penumbra={0.5} intensity={0.5} />

            {/* === OUTER BODY STRUCTURE === */}
            <group name="BodyOuter">
                {/* Head & Neck */}
                <Organ name="head" position={[0, 1.7, 0]} geometry={new THREE.SphereGeometry(0.22, 32, 32)} baseColor="#ffd7ba" severity={organImpact.head} onClick={onOrganClick} opacity={bodyOpacity} selected={selectedOrgan === 'head'} onSelect={handleOrganSelect} />
                <Organ name="neck" position={[0, 1.42, 0]} geometry={new THREE.CylinderGeometry(0.09, 0.11, 0.16, 24)} baseColor="#ffd7ba" severity={organImpact.neck} onClick={onOrganClick} opacity={bodyOpacity} selected={selectedOrgan === 'neck'} onSelect={handleOrganSelect} />

                {/* Torso */}
                <Organ name="chest_wall" position={[0, 1.05, 0]} geometry={new THREE.CapsuleGeometry(isFemale ? 0.27 : 0.25, 0.5, 16, 32)} baseColor="#ffd7ba" severity={organImpact.chest_wall} onClick={onOrganClick} opacity={bodyOpacity * 0.8} selected={selectedOrgan === 'chest_wall'} onSelect={handleOrganSelect} />
                <Organ name="abdomen" position={[0, 0.5, 0]} geometry={new THREE.CapsuleGeometry(isFemale ? 0.24 : 0.22, 0.4, 16, 32)} baseColor="#ffd7ba" severity={organImpact.abdomen} onClick={onOrganClick} opacity={bodyOpacity * 0.8} selected={selectedOrgan === 'abdomen'} onSelect={handleOrganSelect} />

                {/* Shoulders */}
                <group position={[-(isFemale ? 0.26 : 0.3), 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <Organ name="shoulders" position={[0, 0, 0]} geometry={new THREE.CapsuleGeometry(0.08, 0.12, 12, 24)} baseColor="#ffd7ba" severity={organImpact.shoulders} onClick={onOrganClick} opacity={bodyOpacity * 1.3} selected={selectedOrgan === 'shoulders'} onSelect={handleOrganSelect} />
                </group>
                <group position={[(isFemale ? 0.26 : 0.3), 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <Organ name="shoulders" position={[0, 0, 0]} geometry={new THREE.CapsuleGeometry(0.08, 0.12, 12, 24)} baseColor="#ffd7ba" severity={organImpact.shoulders} onClick={onOrganClick} opacity={bodyOpacity * 1.3} selected={selectedOrgan === 'shoulders'} onSelect={handleOrganSelect} />
                </group>

                {/* Arms */}
                <group position={[-0.4, 1.15, 0]}>
                    <group position={[0, -0.18, 0]} rotation={[0, 0, 0.15]}>
                        <Organ name="arm_left" position={[0, 0, 0]} geometry={new THREE.CapsuleGeometry(0.055, 0.32, 12, 24)} baseColor="#ffd7ba" severity={organImpact.arm_left} onClick={onOrganClick} opacity={bodyOpacity * 1.3} selected={selectedOrgan === 'arm_left'} onSelect={handleOrganSelect} />
                    </group>
                    <group position={[-0.02, -0.52, 0]} rotation={[0, 0, 0.1]}>
                        <Organ name="arm_left" position={[0, 0, 0]} geometry={new THREE.CapsuleGeometry(0.045, 0.28, 12, 24)} baseColor="#ffd7ba" severity={organImpact.arm_left} onClick={onOrganClick} opacity={bodyOpacity * 1.3} selected={selectedOrgan === 'arm_left'} onSelect={handleOrganSelect} />
                    </group>
                    <Organ name="hand_left" position={[-0.03, -0.75, 0]} geometry={new THREE.SphereGeometry(0.06, 16, 16)} baseColor="#ffd7ba" severity={organImpact.hand_left} onClick={onOrganClick} opacity={bodyOpacity * 1.5} selected={selectedOrgan === 'hand_left'} onSelect={handleOrganSelect} />
                </group>

                <group position={[0.4, 1.15, 0]}>
                    <group position={[0, -0.18, 0]} rotation={[0, 0, -0.15]}>
                        <Organ name="arm_right" position={[0, 0, 0]} geometry={new THREE.CapsuleGeometry(0.055, 0.32, 12, 24)} baseColor="#ffd7ba" severity={organImpact.arm_right} onClick={onOrganClick} opacity={bodyOpacity * 1.3} selected={selectedOrgan === 'arm_right'} onSelect={handleOrganSelect} />
                    </group>
                    <group position={[0.02, -0.52, 0]} rotation={[0, 0, -0.1]}>
                        <Organ name="arm_right" position={[0, 0, 0]} geometry={new THREE.CapsuleGeometry(0.045, 0.28, 12, 24)} baseColor="#ffd7ba" severity={organImpact.arm_right} onClick={onOrganClick} opacity={bodyOpacity * 1.3} selected={selectedOrgan === 'arm_right'} onSelect={handleOrganSelect} />
                    </group>
                    <Organ name="hand_right" position={[0.03, -0.75, 0]} geometry={new THREE.SphereGeometry(0.06, 16, 16)} baseColor="#ffd7ba" severity={organImpact.hand_right} onClick={onOrganClick} opacity={bodyOpacity * 1.5} selected={selectedOrgan === 'hand_right'} onSelect={handleOrganSelect} />
                </group>

                {/* Legs */}
                <group position={[-0.13, 0.15, 0]}>
                    <Organ name="leg_left" position={[0, -0.25, 0]} geometry={new THREE.CapsuleGeometry(0.09, 0.45, 16, 32)} baseColor="#ffd7ba" severity={organImpact.leg_left} onClick={onOrganClick} opacity={bodyOpacity * 1.3} selected={selectedOrgan === 'leg_left'} onSelect={handleOrganSelect} />
                    <Organ name="leg_left" position={[0, -0.75, 0]} geometry={new THREE.CapsuleGeometry(0.07, 0.45, 16, 32)} baseColor="#ffd7ba" severity={organImpact.leg_left} onClick={onOrganClick} opacity={bodyOpacity * 1.3} selected={selectedOrgan === 'leg_left'} onSelect={handleOrganSelect} />
                    <Organ name="foot_left" position={[0, -1.05, 0.08]} geometry={new THREE.BoxGeometry(0.1, 0.06, 0.2)} baseColor="#ffd7ba" severity={organImpact.foot_left} onClick={onOrganClick} opacity={bodyOpacity * 1.5} selected={selectedOrgan === 'foot_left'} onSelect={handleOrganSelect} />
                </group>

                <group position={[0.13, 0.15, 0]}>
                    <Organ name="leg_right" position={[0, -0.25, 0]} geometry={new THREE.CapsuleGeometry(0.09, 0.45, 16, 32)} baseColor="#ffd7ba" severity={organImpact.leg_right} onClick={onOrganClick} opacity={bodyOpacity * 1.3} selected={selectedOrgan === 'leg_right'} onSelect={handleOrganSelect} />
                    <Organ name="leg_right" position={[0, -0.75, 0]} geometry={new THREE.CapsuleGeometry(0.07, 0.45, 16, 32)} baseColor="#ffd7ba" severity={organImpact.leg_right} onClick={onOrganClick} opacity={bodyOpacity * 1.3} selected={selectedOrgan === 'leg_right'} onSelect={handleOrganSelect} />
                    <Organ name="foot_right" position={[0, -1.05, 0.08]} geometry={new THREE.BoxGeometry(0.1, 0.06, 0.2)} baseColor="#ffd7ba" severity={organImpact.foot_right} onClick={onOrganClick} opacity={bodyOpacity * 1.5} selected={selectedOrgan === 'foot_right'} onSelect={handleOrganSelect} />
                </group>
            </group>

            {/* === INTERNAL ORGANS === */}
            <group name="Organs">
                <Organ
                    name="brain"
                    position={organPositions.brain}
                    geometry={organGeometries.brain}
                    baseColor="#fca5a5"
                    severity={organImpact.brain}
                    onClick={() => onOrganClick?.('brain')}
                    selected={selectedOrgan === 'brain'}
                    onSelect={handleOrganSelect}
                />

                <Organ
                    name="heart"
                    position={organPositions.heart}
                    geometry={organGeometries.heart}
                    baseColor="#dc2626"
                    severity={organImpact.heart}
                    onClick={onOrganClick}
                    selected={selectedOrgan === 'heart'}
                    onSelect={handleOrganSelect}
                />

                <Organ
                    name="lung_left"
                    position={organPositions.lung_left}
                    geometry={organGeometries.lung}
                    baseColor="#fca5a5"
                    severity={organImpact.lung_left}
                    onClick={onOrganClick}
                    selected={selectedOrgan === 'lung_left'}
                    onSelect={handleOrganSelect}
                />

                <Organ
                    name="lung_right"
                    position={organPositions.lung_right}
                    geometry={organGeometries.lung}
                    baseColor="#fca5a5"
                    severity={organImpact.lung_right}
                    onClick={onOrganClick}
                    selected={selectedOrgan === 'lung_right'}
                    onSelect={handleOrganSelect}
                />

                <Organ
                    name="liver"
                    position={organPositions.liver}
                    geometry={organGeometries.liver}
                    baseColor="#92400e"
                    severity={organImpact.liver}
                    onClick={onOrganClick}
                    selected={selectedOrgan === 'liver'}
                    onSelect={handleOrganSelect}
                />

                <Organ
                    name="stomach"
                    position={organPositions.stomach}
                    geometry={organGeometries.stomach}
                    baseColor="#fbbf24"
                    severity={organImpact.stomach}
                    onClick={onOrganClick}
                    selected={selectedOrgan === 'stomach'}
                    onSelect={handleOrganSelect}
                />

                <Organ
                    name="kidney_left"
                    position={organPositions.kidney_left}
                    geometry={organGeometries.kidney}
                    baseColor="#7c2d12"
                    severity={organImpact.kidney_left}
                    onClick={onOrganClick}
                    selected={selectedOrgan === 'kidney_left'}
                    onSelect={handleOrganSelect}
                />

                <Organ
                    name="kidney_right"
                    position={organPositions.kidney_right}
                    geometry={organGeometries.kidney}
                    baseColor="#7c2d12"
                    severity={organImpact.kidney_right}
                    onClick={onOrganClick}
                    selected={selectedOrgan === 'kidney_right'}
                    onSelect={handleOrganSelect}
                />

                <Organ
                    name="intestines"
                    position={organPositions.intestines}
                    geometry={organGeometries.intestines}
                    baseColor="#fde68a"
                    severity={organImpact.intestines}
                    onClick={onOrganClick}
                    selected={selectedOrgan === 'intestines'}
                    onSelect={handleOrganSelect}
                />

                {/* Female-specific organs */}
                {isFemale && (
                    <>
                        <Organ
                            name="uterus"
                            position={organPositions.uterus}
                            geometry={organGeometries.uterus}
                            baseColor="#ec4899"
                            severity={organImpact.uterus}
                            onClick={onOrganClick}
                            selected={selectedOrgan === 'uterus'}
                            onSelect={handleOrganSelect}
                        />

                        <Organ
                            name="ovary_left"
                            position={organPositions.ovary_left}
                            geometry={organGeometries.ovary}
                            baseColor="#f472b6"
                            severity={organImpact.ovary_left}
                            onClick={onOrganClick}
                            selected={selectedOrgan === 'ovary_left'}
                            onSelect={handleOrganSelect}
                        />

                        <Organ
                            name="ovary_right"
                            position={organPositions.ovary_right}
                            geometry={organGeometries.ovary}
                            baseColor="#f472b6"
                            severity={organImpact.ovary_right}
                            onClick={onOrganClick}
                            selected={selectedOrgan === 'ovary_right'}
                            onSelect={handleOrganSelect}
                        />
                    </>
                )}
            </group>

            {/* === NERVOUS SYSTEM === */}
            <group name="NervousSystem">
                {/* FIXED SPINE: Skull to Pelvis only (not into legs!) */}
                <group name="Spine">
                    <mesh position={[0, 1.0, -0.12]}>
                        <cylinderGeometry args={[0.015, 0.015, 1.4, 16]} />
                        <meshStandardMaterial
                            color="#06b6d4"
                            emissive="#06b6d4"
                            emissiveIntensity={0.5}
                            transparent
                            opacity={0.7}
                        />
                    </mesh>
                </group>

                {/* Nerve Branches to Organs */}
                <NerveBranch start={[0, 1.6, -0.12]} end={organPositions.brain} />
                <NerveBranch start={[0, 1.0, -0.12]} end={organPositions.heart} />
                <NerveBranch start={[0, 1.05, -0.12]} end={organPositions.lung_left} />
                <NerveBranch start={[0, 1.05, -0.12]} end={organPositions.lung_right} />
                <NerveBranch start={[0, 0.75, -0.12]} end={organPositions.liver} />
                <NerveBranch start={[0, 0.75, -0.12]} end={organPositions.stomach} />
                <NerveBranch start={[0, 0.6, -0.12]} end={organPositions.kidney_left} />
                <NerveBranch start={[0, 0.6, -0.12]} end={organPositions.kidney_right} />
                <NerveBranch start={[0, 0.5, -0.12]} end={organPositions.intestines} />

                {/* Female-specific nerve branches */}
                {isFemale && (
                    <>
                        <NerveBranch start={[0, 0.35, -0.12]} end={organPositions.uterus} />
                        <NerveBranch start={[0, 0.35, -0.12]} end={organPositions.ovary_left} />
                        <NerveBranch start={[0, 0.35, -0.12]} end={organPositions.ovary_right} />
                    </>
                )}

                {/* Nerve Branches to Limbs (from spine, not extending spine) */}
                <NerveBranch start={[0, 1.15, -0.12]} end={[-0.4, 1.15, 0]} />  {/* Left arm */}
                <NerveBranch start={[0, 1.15, -0.12]} end={[0.4, 1.15, 0]} />   {/* Right arm */}
                <NerveBranch start={[0, 0.3, -0.12]} end={[-0.13, 0.15, 0]} />  {/* Left leg */}
                <NerveBranch start={[0, 0.3, -0.12]} end={[0.13, 0.15, 0]} />   {/* Right leg */}
            </group>

            {/* Subtle glow effect around body */}
            <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshBasicMaterial
                    color="#0ea5e9"
                    transparent
                    opacity={0.02}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}
