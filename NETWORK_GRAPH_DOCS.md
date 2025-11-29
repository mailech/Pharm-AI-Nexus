# Interactive Drug-Organ Network Graph

## Overview
Complete 3D interactive network visualization for drug-drug and drug-organ interactions.

## Features

### ✨ Node Types
1. **Drug Nodes** (Spheres)
   - Color-coded by risk:
     - 🔴 Red: High risk (>70%)
     - 🟡 Yellow: Moderate risk (40-70%)
     - 🟢 Green: Low risk (<40%)
   - Pulse animation for high-risk drugs
   - Size: 0.25 units

2. **Organ Nodes** (Smaller spheres)
   - Color: Cyan (#06b6d4)
   - Represent affected organs
   - Size: 0.2 units

3. **Interaction Nodes** (Smallest spheres)
   - Color: Purple (#a855f7)
   - Represent interaction mechanisms
   - Size: 0.15 units

### 🕸️ Edge Types
1. **Drug-Drug** - Color by severity (red/yellow/grey)
2. **Drug-Organ** - Cyan edges
3. **Organ-Organ** - Grey physiological connections

### 🎮 Interactions

#### Mouse Controls
- **Left-click + drag**: Rotate view
- **Right-click + drag**: Pan view
- **Scroll wheel**: Zoom in/out
- **Click node**: Highlight connected nodes and edges
- **Hover node**: Show tooltip with details

#### Tooltips
Display on hover:
- Node label
- Node type (drug/organ/interaction)
- Risk percentage (for drugs)

### 🎨 Visual Effects

1. **Force-Directed Layout**
   - Nodes repel each other
   - Connected nodes attract
   - Center gravity keeps graph centered
   - 100 iterations for stable layout

2. **Animations**
   - Pulse effect for high-risk drugs
   - Smooth node scaling on hover/selection
   - Edge fade-in on load
   - Ambient star field background

3. **Highlighting**
   - Click node → highlights all connected nodes
   - Connected edges become more opaque
   - Unconnected elements fade

### 📊 Layout Algorithm

```typescript
Forces applied:
1. Repulsion: 0.5 / (distance²)
2. Attraction: distance * 0.01 (along edges)
3. Center gravity: position * 0.01
4. Damping: velocity * 0.85
```

### 🎯 Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| High risk drug | Red | #ef4444 |
| Moderate risk drug | Yellow | #eab308 |
| Low risk drug | Green | #10b981 |
| Organ | Cyan | #06b6d4 |
| Interaction | Purple | #a855f7 |
| Drug-drug edge | Severity-based | Varies |
| Drug-organ edge | Light cyan | #22d3ee |
| Organ-organ edge | Grey | #64748b |

## Usage

```tsx
import DrugNetwork3D from './components/DrugNetwork3D';

function App() {
  return (
    <div className="w-full h-screen">
      <DrugNetwork3D />
    </div>
  );
}
```

## Data Format

### Expected API Response
```json
{
  "nodes": [
    { "id": "Aspirin", "group": 1 }
  ],
  "links": [
    {
      "source": "Aspirin",
      "target": "Ibuprofen",
      "severity": "Major"
    }
  ]
}
```

### Internal Graph Format
```typescript
interface GraphNode {
  id: string;
  label: string;
  type: 'drug' | 'organ' | 'interaction';
  severity?: number; // 0-1
  position: [number, number, number];
  velocity: [number, number, number];
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'drug-drug' | 'drug-organ' | 'organ-organ';
  severity?: string;
  weight?: number;
}
```

## Components

### NetworkNode
- Renders individual graph nodes
- Handles hover/click events
- Shows tooltips
- Applies pulse animation

### NetworkEdge
- Renders connections between nodes
- Color-coded by type and severity
- Opacity changes on highlight

### NetworkScene
- Manages node/edge rendering
- Handles selection state
- Computes highlighted elements

### useForceLayout Hook
- Implements force-directed layout
- Runs physics simulation
- Returns positioned nodes

## Performance

- **Nodes**: Optimized for 50-100 nodes
- **Edges**: Handles 100-200 edges smoothly
- **Layout**: 100 iterations, ~1-2 seconds
- **Rendering**: 60 FPS with proper GPU

## Future Enhancements

1. **Clustering** - Group related nodes
2. **Filtering** - Show/hide node types
3. **Search** - Find specific drugs/organs
4. **Export** - Save graph as image
5. **Time-based** - Animate changes over time
6. **3D Depth** - Better use of Z-axis
7. **Physics Controls** - Adjust forces in real-time

## Troubleshooting

**Problem**: Graph looks cluttered
- **Solution**: Increase repulsion force or decrease node count

**Problem**: Nodes flying off screen
- **Solution**: Increase center gravity force

**Problem**: Layout not stable
- **Solution**: Increase iteration count or damping

**Problem**: Performance issues
- **Solution**: Reduce node/edge count or simplify geometries
