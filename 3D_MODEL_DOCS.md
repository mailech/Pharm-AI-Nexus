# 3D Human Body Model - Technical Documentation

## Overview
The new `HumanBody3D` component creates a **procedural, anatomically accurate 3D human body** with visible internal organs.

## Features

### ✅ Realistic Human Shape
- **Head**: Spherical geometry (0.18 units radius)
- **Neck**: Cylindrical connection
- **Torso**: Upper and lower sections with realistic proportions
- **Arms**: Left and right, with upper and lower segments
- **Legs**: Left and right, with upper and lower segments
- **Semi-transparent skin**: Allows organs to be visible

### ✅ Internal Organs (12 Total)
Each organ is a separate mesh with correct anatomical positioning:

| Organ | Position | Color | Clickable |
|-------|----------|-------|-----------|
| Brain | Head (top) | Light pink | ✅ |
| Heart | Left chest | Red | ✅ |
| Lung_Left | Left chest | Pink | ✅ |
| Lung_Right | Right chest | Pink | ✅ |
| Liver | Right abdomen | Brown | ✅ |
| Stomach | Left abdomen | Yellow | ✅ |
| Kidney_Left | Left lower back | Dark brown | ✅ |
| Kidney_Right | Right lower back | Dark brown | ✅ |
| Intestines | Lower abdomen | Light yellow | ✅ |
| Pancreas | Upper abdomen | Yellow | ✅ |
| Spleen | Left upper abdomen | Dark brown | ✅ |
| Bladder | Pelvic region | Light yellow | ✅ |

### ✅ Nervous System
- **Spinal cord**: Blue glowing cylinder running down the back
- **Nerve branches**: Connections to arms and legs
- **Emissive material**: Subtle glow effect

## Risk Visualization

Organs change color based on risk scores (0-1):

```typescript
const getRiskColor = (score: number) => {
    if (score > 0.7) return '#ef4444'; // Red - High risk
    if (score > 0.4) return '#eab308'; // Yellow - Moderate risk
    return '#10b981'; // Green - Low risk
};
```

### Example Usage

```tsx
<HumanBody3D
    organStatus={{
        Heart: 0.9,      // High risk - Red
        Liver: 0.6,      // Moderate risk - Yellow
        Kidney_Left: 0.2 // Low risk - Green
    }}
    onOrganClick={(organ) => console.log(`Clicked: ${organ}`)}
/>
```

## Animations

- **Slow rotation**: Gentle side-to-side rotation for better viewing
- **Emissive glow**: Organs with risk scores glow proportionally

## Interaction

- **Hover**: Cursor changes to pointer over organs
- **Click**: Triggers `onOrganClick` callback with organ name
- **Color feedback**: Visual indication of risk level

## Technical Details

### Proportions
- Total height: ~2.5 units
- Centered at origin (0, 0, 0)
- Y-axis up, Z-axis forward

### Materials
- **Skin**: Semi-transparent (#ffd7ba, opacity 0.25-0.3)
- **Organs**: Solid with emissive glow when at risk
- **Nerves**: Blue emissive (#60a5fa)

### Performance
- Optimized geometry (low poly count)
- Efficient rendering for real-time browser use
- No external model files required

## Comparison: Old vs New

| Feature | Old Model | New Model |
|---------|-----------|-----------|
| Shape | Abstract boxes | Realistic human |
| Body parts | Unclear | Head, torso, arms, legs |
| Organs | 5 basic | 12 detailed |
| Nervous system | ❌ | ✅ Visible |
| Anatomical accuracy | Low | High |
| Clickable organs | ✅ | ✅ |
| Risk visualization | ✅ | ✅ Enhanced |

## Future Enhancements

Possible upgrades:
1. Replace with professional GLTF model from Sketchfab/TurboSquid
2. Add breathing animation
3. Add skeletal system
4. More detailed organ geometry
5. Texture mapping for realistic skin
