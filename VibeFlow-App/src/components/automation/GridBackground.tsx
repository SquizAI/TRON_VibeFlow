import React from 'react';
import { Layer, Line, Circle, Rect } from 'react-konva';
import { STAGE_CONFIG } from '../../types/automation';

interface GridBackgroundProps {
  width: number;
  height: number;
  scale: number;
}

const GridBackground: React.FC<GridBackgroundProps> = ({ width, height, scale }) => {
  // Grid configuration from STAGE_CONFIG
  const gridSize = STAGE_CONFIG.grid.spacing; // Base grid size (will be affected by scale)
  const adjustedGridSize = gridSize * scale;
  
  // Small dot configuration
  const dotRadius = STAGE_CONFIG.grid.dotSize;
  const dotColor = STAGE_CONFIG.grid.dotColor; // Dark blue dots as per user preference
  const dotOpacity = 0.6;
  const dotGlowRadius = 3;
  
  // Major cross configuration
  const crossSize = STAGE_CONFIG.grid.crossSize;
  const majorGridInterval = 5; // Every 5 grid cells will have a cross instead of dot
  const crossColor = STAGE_CONFIG.grid.crossColor; // Blue crosses at major intersections as per user preference
  const crossOpacity = 0.7;
  const crossThickness = STAGE_CONFIG.grid.lineWidth;
  
  // Calculate number of dots to display
  const dotsX = Math.ceil(width / adjustedGridSize) + 1;
  const dotsY = Math.ceil(height / adjustedGridSize) + 1;
  
  // Create grid dots and crosses
  const dots = [];
  const crosses = [];
  
  for (let x = 0; x < dotsX; x++) {
    for (let y = 0; y < dotsY; y++) {
      const posX = x * adjustedGridSize;
      const posY = y * adjustedGridSize;
      
      // Check if this should be a major cross
      const isMajorX = x % majorGridInterval === 0;
      const isMajorY = y % majorGridInterval === 0;
      
      if (isMajorX && isMajorY) {
        // Add a cross at major intersections
        crosses.push(
          <React.Fragment key={`cross-${x}-${y}`}>
            {/* Horizontal line of cross */}
            <Line 
              points={[
                posX - crossSize, posY,
                posX + crossSize, posY
              ]}
              stroke={crossColor}
              strokeWidth={crossThickness}
              opacity={crossOpacity}
              perfectDrawEnabled={false}
              shadowColor={crossColor}
              shadowBlur={6}
              shadowOpacity={0.7}
              lineCap="round"
            />
            {/* Vertical line of cross */}
            <Line 
              points={[
                posX, posY - crossSize,
                posX, posY + crossSize
              ]}
              stroke={crossColor}
              strokeWidth={crossThickness}
              opacity={crossOpacity}
              perfectDrawEnabled={false}
              shadowColor={crossColor}
              shadowBlur={6}
              shadowOpacity={0.7}
              lineCap="round"
            />
            {/* Add a small circle at the center of cross for extra emphasis */}
            <Circle
              x={posX}
              y={posY}
              radius={1 * scale}
              fill={crossColor}
              opacity={0.8}
              perfectDrawEnabled={false}
              shadowColor={crossColor}
              shadowBlur={4}
              shadowOpacity={0.6}
            />
          </React.Fragment>
        );
      } else {
        // Add a small dot at regular intersections with subtle glow
        dots.push(
          <Circle 
            key={`dot-${x}-${y}`}
            x={posX}
            y={posY}
            radius={dotRadius * scale}
            fill={dotColor}
            opacity={dotOpacity}
            perfectDrawEnabled={false}
            shadowColor={dotColor}
            shadowBlur={dotGlowRadius}
            shadowOpacity={0.3}
          />
        );
      }
    }
  }
  
  // Add a subtle glow to the entire layer using STAGE_CONFIG
  const shadowBlur = STAGE_CONFIG.glow.blur;
  const shadowColor = STAGE_CONFIG.glow.color;
  
  return (
    <Layer>
      {/* Background layer for the grid - flat 2D look as per user preference */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={STAGE_CONFIG.background.color} // Darker background with subtle blue accents
        perfectDrawEnabled={false}
        shadowColor={shadowColor}
        shadowBlur={shadowBlur * 0.5}
        shadowOpacity={0.2}
      />
      
      {/* Render all dots - small blue dots instead of solid grid lines */}
      {dots}
      
      {/* Render all crosses - blue crosses at major grid intersections */}
      {crosses}
    </Layer>
  );
};

export default GridBackground;
