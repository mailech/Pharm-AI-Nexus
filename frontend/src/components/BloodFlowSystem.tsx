import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BloodFlowSystemProps {
    organImpacts: Record<string, number>;
    visible?: boolean;
}

interface VesselPath {
    name: string;
    points: THREE.Vector3[];
    organ: string;
    radius: number;
}

export function BloodFlowSystem({ organImpacts = {}, visible = true }: BloodFlowSystemProps) {
    const groupRef = useRef<THREE.Group>(null);
    const timeRef = useRef(0);

    // Define major blood vessels
    const vessels: VesselPath[] = useMemo(() => [
        // Carotid arteries to brain
        {
            name: 'carotid_left',
            points: [
                new THREE.Vector3(-0.05, 1.2, 0),
                new THREE.Vector3(-0.08, 1.4, 0),
                new THREE.Vector3(-0.06, 1.6, 0.05),
                new THREE.Vector3(-0.03, 1.7, 0.08)
            ],
            organ: 'brain',
            radius: 0.012
        },
        {
            name: 'carotid_right',
            points: [
                new THREE.Vector3(0.05, 1.2, 0),
                new THREE.Vector3(0.08, 1.4, 0),
                new THREE.Vector3(0.06, 1.6, 0.05),
                new THREE.Vector3(0.03, 1.7, 0.08)
            ],
            organ: 'brain',
            radius: 0.012
        },
        // Aorta - main trunk
        {
            name: 'aorta_ascending',
            points: [
                new THREE.Vector3(0, 1.0, 0.05),
                new THREE.Vector3(0, 1.1, 0.03),
                new THREE.Vector3(0, 1.15, 0)
            ],
            organ: 'heart',
            radius: 0.018
        },
        {
            name: 'aorta_descending',
            points: [
                new THREE.Vector3(0, 1.0, 0),
                new THREE.Vector3(0, 0.8, -0.02),
                new THREE.Vector3(0, 0.6, -0.02),
                new THREE.Vector3(0, 0.4, 0),
                new THREE.Vector3(0, 0.2, 0)
            ],
            organ: 'heart',
            radius: 0.016
        },
        // Coronary arteries (heart)
        {
            name: 'coronary_left',
            points: [
                new THREE.Vector3(0, 1.05, 0.05),
                new THREE.Vector3(-0.05, 1.03, 0.08),
                new THREE.Vector3(-0.08, 1.0, 0.1)
            ],
            organ: 'heart',
            radius: 0.008
        },
        {
            name: 'coronary_right',
            points: [
                new THREE.Vector3(0, 1.05, 0.05),
                new THREE.Vector3(0.05, 1.03, 0.08),
                new THREE.Vector3(0.08, 1.0, 0.1)
            ],
            organ: 'heart',
            radius: 0.008
        },
        // Hepatic artery (liver)
        {
            name: 'hepatic',
            points: [
                new THREE.Vector3(0, 0.7, 0),
                new THREE.Vector3(0.08, 0.68, 0.05),
                new THREE.Vector3(0.14, 0.68, 0.1)
            ],
            organ: 'liver',
            radius: 0.01
        },
        // Renal arteries (kidneys)
        {
            name: 'renal_left',
            points: [
                new THREE.Vector3(0, 0.6, -0.02),
                new THREE.Vector3(-0.08, 0.59, 0),
                new THREE.Vector3(-0.13, 0.58, -0.02)
            ],
            organ: 'kidney_left',
            radius: 0.01
        },
        {
            name: 'renal_right',
            points: [
                new THREE.Vector3(0, 0.6, -0.02),
                new THREE.Vector3(0.08, 0.59, 0),
                new THREE.Vector3(0.13, 0.58, -0.02)
            ],
            organ: 'kidney_right',
            radius: 0.01
        },
        // Gastric artery (stomach)
        {
            name: 'gastric',
            points: [
                new THREE.Vector3(0, 0.75, 0),
                new THREE.Vector3(-0.05, 0.73, 0.08),
                new THREE.Vector3(-0.08, 0.7, 0.12)
            ],
            organ: 'stomach',
            radius: 0.009
        },
        // Pulmonary arteries (lungs)
        {
            name: 'pulmonary_left',
            points: [
                new THREE.Vector3(0, 1.05, 0.02),
                new THREE.Vector3(-0.1, 1.0, 0.05),
                new THREE.Vector3(-0.15, 0.95, 0.08)
            ],
            organ: 'lungs',
            radius: 0.012
        },
        {
            name: 'pulmonary_right',
            points: [
                new THREE.Vector3(0, 1.05, 0.02),
                new THREE.Vector3(0.1, 1.0, 0.05),
                new THREE.Vector3(0.15, 0.95, 0.08)
            ],
            organ: 'lungs',
            radius: 0.012
        },
        // Iliac arteries (legs)
        {
            name: 'iliac_left',
            points: [
                new THREE.Vector3(0, 0.25, 0),
                new THREE.Vector3(-0.08, 0.1, 0),
                new THREE.Vector3(-0.13, -0.1, 0)
            ],
            organ: 'leg_left',
            radius: 0.011
        },
        {
            name: 'iliac_right',
            points: [
                new THREE.Vector3(0, 0.25, 0),
                new THREE.Vector3(0.08, 0.1, 0),
                new THREE.Vector3(0.13, -0.1, 0)
            ],
            organ: 'leg_right',
            radius: 0.011
        }
    ], []);

    // Get color based on organ risk
    const getVesselColor = (organ: string): THREE.Color => {
        const risk = organImpacts[organ] || 0;

        if (risk > 0.7) {
            return new THREE.Color(1, 0.2, 0.2); // Red - high risk
        } else if (risk > 0.4) {
            return new THREE.Color(1, 0.8, 0.2); // Yellow - moderate risk
        } else {
            return new THREE.Color(0.2, 0.9, 1); // Cyan - normal
        }
    };

    // Animate blood flow
    useFrame((_, delta) => {
        timeRef.current += delta;

        if (groupRef.current) {
            groupRef.current.children.forEach((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                    child.material.uniforms.time.value = timeRef.current;
                }
            });
        }
    });

    // Create vessel meshes
    const vesselMeshes = useMemo(() => {
        return vessels.map((vessel) => {
            const curve = new THREE.CatmullRomCurve3(vessel.points);
            const tubeGeometry = new THREE.TubeGeometry(curve, 64, vessel.radius, 8, false);

            const color = getVesselColor(vessel.organ);
            const risk = organImpacts[vessel.organ] || 0;

            // Custom shader for animated blood flow
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: color },
                    pulseSpeed: { value: 2.0 + risk * 3.0 },
                    glowIntensity: { value: 0.5 + risk * 0.5 }
                },
                vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
                fragmentShader: `
          uniform float time;
          uniform vec3 color;
          uniform float pulseSpeed;
          uniform float glowIntensity;
          varying vec2 vUv;
          varying vec3 vNormal;
          
          void main() {
            // Animated dashed pattern
            float dash = step(0.5, fract((vUv.x * 10.0) - time * pulseSpeed));
            
            // Pulsing effect
            float pulse = 0.5 + 0.5 * sin(time * pulseSpeed * 2.0);
            
            // Fresnel glow
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            
            // Combine effects
            vec3 finalColor = color * (0.6 + 0.4 * dash) * (0.8 + 0.2 * pulse);
            finalColor += color * fresnel * glowIntensity;
            
            float alpha = 0.7 + 0.3 * dash;
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
                transparent: true,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            return (
                <mesh key={vessel.name} geometry={tubeGeometry} material={material} />
            );
        });
    }, [vessels, organImpacts, getVesselColor]);

    if (!visible) return null;

    return (
        <group ref={groupRef}>
            {vesselMeshes}
        </group>
    );
}
