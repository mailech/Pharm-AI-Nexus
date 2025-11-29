# Interactive 3D Controls - User Guide

## Mouse Controls

### 🖱️ **Rotate** (Left Mouse Button)
- **Click and drag** anywhere on the 3D scene
- Rotates the human body in all directions
- Smooth, natural rotation

### 🔍 **Zoom** (Mouse Wheel)
- **Scroll up** to zoom in (closer view)
- **Scroll down** to zoom out (wider view)
- **Min distance**: 2 units (prevents going inside the body)
- **Max distance**: 8 units (prevents zooming too far)

### 🤚 **Pan** (Right Mouse Button or Middle Mouse Button)
- **Right-click and drag** to pan the view
- Moves the camera position without rotating
- Useful for centering specific organs

## Organ Interaction

### 👆 **Hover**
- Move your mouse over any organ
- Organ will **glow brighter**
- Cursor changes to **pointer**
- **Tooltip appears** at bottom of screen showing organ name

### 🖱️ **Click**
- Click any organ to select it
- Triggers callback for detailed information
- Can be used to show:
  - Risk analysis
  - Affected medications
  - Recommendations

## Visual Feedback

### Color Coding
- **Green** (#10b981): Safe / No risk
- **Yellow** (#eab308): Low risk (0.1-0.4)
- **Orange** (#f59e0b): Moderate risk (0.4-0.7)
- **Red** (#ef4444): High risk (0.7-1.0)

### Animations
- **Pulse Effect**: High-risk organs (>0.5) pulse rhythmically
- **Glow on Hover**: Organs emit light when hovered
- **Smooth Rotation**: Body gently sways side-to-side

## Camera Limits

To prevent disorientation, the camera has constraints:

- **Polar Angle**: 
  - Min: 45° (prevents looking from below)
  - Max: 120° (prevents looking from directly above)
- **Zoom Range**: 2-8 units
- **Auto-rotate**: Disabled (you have full control)

## Tips for Best Experience

1. **Start with rotation**: Get familiar with the body from all angles
2. **Use zoom for details**: Zoom in to see specific organs clearly
3. **Pan for precision**: Use right-click to center organs of interest
4. **Hover to identify**: Not sure what an organ is? Just hover!
5. **Click for info**: Click organs to get detailed analysis

## Keyboard Shortcuts

While the 3D view is focused:
- **Escape**: Reset camera to default position (if implemented)
- **Space**: Pause/resume auto-rotation (if enabled)

## Troubleshooting

**Problem**: Controls feel sluggish
- **Solution**: Close other browser tabs, your GPU may be busy

**Problem**: Can't rotate
- **Solution**: Make sure you're clicking inside the 3D canvas area

**Problem**: Tooltip not showing
- **Solution**: Hover directly over an organ (the colored shapes inside the body)

**Problem**: Zoomed in too close
- **Solution**: Scroll down to zoom out, or refresh the page

## Technical Details

The interactive controls use:
- **OrbitControls** from `@react-three/drei`
- **React state** for hover/click management
- **CSS transforms** for tooltip positioning
- **Pointer events** for organ interaction
