import React, { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { DamageAssessment, DamageDetail } from "../types";

// Standard canonical percentage coordinates (0-100) for common automotive components
const CANONICAL_PART_POLYGONS: Record<string, string[]> = {
  hood: ["20,34 80,34 86,56 50,62 14,56"],
  front_bumper: ["10,64 90,64 88,86 50,92 12,86"],
  rear_bumper: ["12,68 88,68 86,90 50,94 14,90"],
  front_left_headlight: ["14,50 28,48 30,60 16,62"],
  front_right_headlight: ["72,48 86,50 84,62 70,60"],
  headlights_pair: ["14,50 28,48 30,60 16,62", "72,48 86,50 84,62 70,60"],
  front_grille: ["32,54 68,54 66,70 34,70"],
  front_windshield: ["24,14 76,14 82,34 18,34"],
  front_left_fender: ["4,42 18,40 22,60 6,62"],
  front_right_fender: ["82,40 96,42 94,62 78,60"],
  left_door: ["14,38 44,38 44,72 14,70"],
  right_door: ["56,38 86,38 86,70 56,72"],
  rear_right_door: ["52,38 86,38 86,72 52,72"],
  rear_left_door: ["14,38 48,38 48,72 14,72"],
  left_side_mirror: ["8,34 18,34 17,44 7,44"],
  right_side_mirror: ["82,34 92,34 93,44 83,44"],
  wiper_blades: ["26,34 74,34 72,40 28,40"],
  roof: ["28,4 72,4 76,14 24,14"],
};

// Robust mapping from part name to canonical coordinates if no explicit bounding box exists
function getFallbackCoordinatesForPart(partName: string): { type: "polygon"; points: string[] } | { type: "bbox"; box: [number, number, number, number] } {
  const name = partName.toLowerCase();

  if (name.includes("hood") || name.includes("bonnet")) {
    return { type: "polygon", points: CANONICAL_PART_POLYGONS.hood };
  }
  if (name.includes("bumper")) {
    if (name.includes("rear")) {
      return { type: "polygon", points: CANONICAL_PART_POLYGONS.rear_bumper };
    }
    return { type: "polygon", points: CANONICAL_PART_POLYGONS.front_bumper };
  }
  if (name.includes("grille") || name.includes("radiator")) {
    return { type: "polygon", points: CANONICAL_PART_POLYGONS.front_grille };
  }
  if (name.includes("windshield") || name.includes("windscreen") || name.includes("front glass")) {
    return { type: "polygon", points: CANONICAL_PART_POLYGONS.front_windshield };
  }
  if (name.includes("wiper")) {
    return { type: "polygon", points: CANONICAL_PART_POLYGONS.wiper_blades };
  }
  if (name.includes("headlight") || name.includes("headlamp") || name.includes("lamp")) {
    if (name.includes("left") || name.includes("driver")) {
      return { type: "polygon", points: CANONICAL_PART_POLYGONS.front_left_headlight };
    }
    if (name.includes("right") || name.includes("passenger")) {
      return { type: "polygon", points: CANONICAL_PART_POLYGONS.front_right_headlight };
    }
    return { type: "polygon", points: CANONICAL_PART_POLYGONS.headlights_pair };
  }
  if (name.includes("fender") || name.includes("quarter panel")) {
    if (name.includes("left") || name.includes("driver")) {
      return { type: "polygon", points: CANONICAL_PART_POLYGONS.front_left_fender };
    }
    if (name.includes("right") || name.includes("passenger")) {
      return { type: "polygon", points: CANONICAL_PART_POLYGONS.front_right_fender };
    }
    return { type: "polygon", points: CANONICAL_PART_POLYGONS.front_left_fender };
  }
  if (name.includes("mirror")) {
    if (name.includes("left") || name.includes("driver")) {
      return { type: "polygon", points: CANONICAL_PART_POLYGONS.left_side_mirror };
    }
    return { type: "polygon", points: CANONICAL_PART_POLYGONS.right_side_mirror };
  }
  if (name.includes("door")) {
    if (name.includes("rear")) {
      if (name.includes("right") || name.includes("passenger")) {
        return { type: "polygon", points: CANONICAL_PART_POLYGONS.rear_right_door };
      }
      return { type: "polygon", points: CANONICAL_PART_POLYGONS.rear_left_door };
    }
    if (name.includes("right") || name.includes("passenger")) {
      return { type: "polygon", points: CANONICAL_PART_POLYGONS.right_door };
    }
    return { type: "polygon", points: CANONICAL_PART_POLYGONS.left_door };
  }
  if (name.includes("roof")) {
    return { type: "polygon", points: CANONICAL_PART_POLYGONS.roof };
  }

  // Generic central vehicle quadrant default
  return { type: "bbox", box: [35, 20, 65, 80] };
}

interface DamageVisualOverlayProps {
  imageUrl: string;
  assessment: DamageAssessment | null;
  selectedPart: string | null;
  onSelectPart: (partName: string | null) => void;
  damageCategory?: string | null;
  setDamageCategory?: (cat: string | null) => void;
  className?: string;
}

export default function DamageVisualOverlay({
  imageUrl,
  assessment,
  selectedPart,
  onSelectPart,
  className = "",
}: DamageVisualOverlayProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  });

  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  // Helper to handle image load and record natural size
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  };

  // Pre-load / cache handling for image natural size
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setNaturalSize({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      }
    };
  }, [imageUrl]);

  // Check if image is already loaded in DOM
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth) {
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, [imageUrl]);

  // Recalculate overlay bounds matching background object-cover bounds precisely
  const updateOverlaySize = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) return;

    if (!naturalSize) {
      setOverlayStyle({
        position: "absolute",
        left: "0px",
        top: "0px",
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      });
      return;
    }

    const imgRatio = naturalSize.width / naturalSize.height;
    const containerRatio = containerWidth / containerHeight;

    let overlayWidth = containerWidth;
    let overlayHeight = containerHeight;
    let overlayLeft = 0;
    let overlayTop = 0;

    // Strict object-cover geometric scaling math:
    if (imgRatio > containerRatio) {
      // Image is wider than container, height is 100%, width scales and centers
      overlayWidth = containerHeight * imgRatio;
      overlayLeft = (containerWidth - overlayWidth) / 2;
    } else {
      // Image is taller than container, width is 100%, height scales and centers
      overlayHeight = containerWidth / imgRatio;
      overlayTop = (containerHeight - overlayHeight) / 2;
    }

    setOverlayStyle({
      position: "absolute",
      left: `${overlayLeft}px`,
      top: `${overlayTop}px`,
      width: `${overlayWidth}px`,
      height: `${overlayHeight}px`,
    });
  }, [naturalSize]);

  // Handle ResizeObserver to maintain precise responsive alignment
  useEffect(() => {
    updateOverlaySize();
  }, [naturalSize, updateOverlaySize]);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      updateOverlaySize();
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [updateOverlaySize]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Filter: ONLY damaged parts from assessment are rendered
  const damagedDetails: DamageDetail[] = assessment?.damage_details || [];

  // Check if a detail matches the currently selected part
  const isDetailSelected = (detail: DamageDetail): boolean => {
    if (!selectedPart) return false;
    const s1 = selectedPart.toLowerCase().trim();
    const s2 = detail.part_name.toLowerCase().trim();
    return s1 === s2 || s1.includes(s2) || s2.includes(s1);
  };

  const hoveredDetail = hoveredIndex !== null ? damagedDetails[hoveredIndex] : null;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden group/overlay ${className}`}
    >
      {/* Background Image */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Vehicle Damage Appraisal"
        className="w-full h-full object-cover transition-transform duration-500"
        onLoad={handleImageLoad}
        referrerPolicy="no-referrer"
      />

      {/* SVG Interactive Overlay - ONLY draws damaged parts */}
      <svg
        className="absolute z-10"
        style={overlayStyle}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <filter id="damagedGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ef4444" floodOpacity="0.8" />
          </filter>
        </defs>

        {damagedDetails.map((detail, idx) => {
          const isSelected = isDetailSelected(detail);
          const isHovered = hoveredIndex === idx;

          // Single unified high-visibility RED styling for all damaged parts
          let fillClass = "fill-red-500/25";
          let strokeClass = "stroke-red-500 stroke-[1.5px]";
          let filterProp: string | undefined = undefined;

          if (isSelected) {
            fillClass = "fill-red-500/45";
            strokeClass = "stroke-red-400 stroke-[2.5px]";
            filterProp = "url(#damagedGlow)";
          } else if (isHovered) {
            fillClass = "fill-red-500/40";
            strokeClass = "stroke-red-400 stroke-[2px]";
          }

          const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            onSelectPart(isSelected ? null : detail.part_name);
          };

          // 1. Explicit Bounding Box from AI or Preset
          if (detail.bounding_box && detail.bounding_box.length === 4) {
            const [ymin, xmin, ymax, xmax] = detail.bounding_box;
            const x = Math.max(0, Math.min(100, xmin));
            const y = Math.max(0, Math.min(100, ymin));
            const width = Math.max(2, Math.min(100 - x, xmax - xmin));
            const height = Math.max(2, Math.min(100 - y, ymax - ymin));

            return (
              <g key={`bbox-${idx}`}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx="2"
                  filter={filterProp}
                  className={`transition-all duration-150 cursor-pointer ${fillClass} ${strokeClass}`}
                  onClick={handleClick}
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              </g>
            );
          }

          // 2. Explicit Polygon Points
          if (detail.polygon_points) {
            return (
              <polygon
                key={`poly-explicit-${idx}`}
                points={detail.polygon_points}
                filter={filterProp}
                className={`transition-all duration-150 cursor-pointer ${fillClass} ${strokeClass}`}
                onClick={handleClick}
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          }

          // 3. Fallback to Canonical Vehicle Zone Coordinates
          const fallback = getFallbackCoordinatesForPart(detail.part_name);
          if (fallback.type === "bbox") {
            const [ymin, xmin, ymax, xmax] = fallback.box;
            const x = xmin;
            const y = ymin;
            const width = xmax - xmin;
            const height = ymax - ymin;

            return (
              <rect
                key={`poly-fb-rect-${idx}`}
                x={x}
                y={y}
                width={width}
                height={height}
                rx="2"
                filter={filterProp}
                className={`transition-all duration-150 cursor-pointer ${fillClass} ${strokeClass}`}
                onClick={handleClick}
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          }

          return fallback.points.map((polyPoints, polyIdx) => (
            <polygon
              key={`poly-fb-${idx}-${polyIdx}`}
              points={polyPoints}
              filter={filterProp}
              className={`transition-all duration-150 cursor-pointer ${fillClass} ${strokeClass}`}
              onClick={handleClick}
              onMouseEnter={() => setHoveredIndex(idx)}
            />
          ));
        })}
      </svg>

      {/* Interactive Tooltip for Damaged Components ONLY */}
      {hoveredDetail && (() => {
        const isSelected = isDetailSelected(hoveredDetail);

        // Position tooltip inside visible container bounds
        const tooltipLeft = mousePos.x > 65 ? "right-3" : "left-3";
        const tooltipTop = mousePos.y > 65 ? "bottom-3" : "top-3";

        return (
          <div
            className={`absolute ${tooltipTop} ${tooltipLeft} z-20 pointer-events-none bg-slate-950/95 border border-red-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-[220px] animate-fadeIn transition-all duration-150`}
          >
            <div className="flex items-center gap-1.5 border-b border-red-500/20 pb-1.5 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-bold text-white text-xs truncate">{hoveredDetail.part_name}</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-400">Damage Level:</span>
                <span className="font-bold text-red-400 font-mono text-xs">{hoveredDetail.damage_percentage}%</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-400">Recommended:</span>
                <span className="font-bold text-white uppercase text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                  {hoveredDetail.action_required}
                </span>
              </div>
              {hoveredDetail.damage_description && (
                <p className="text-slate-300 font-sans italic text-[10px] line-clamp-2 leading-relaxed pt-1 border-t border-slate-900 mt-1">
                  "{hoveredDetail.damage_description}"
                </p>
              )}
              <div className="text-[9px] text-red-400 font-mono font-bold pt-1 text-center flex items-center justify-center gap-1">
                <span>{isSelected ? "Click to deselect" : "Click to view estimate"}</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Damaged Parts Indicator Badge */}
      {damagedDetails.length > 0 && (
        <div className="absolute top-2 left-2 z-15 pointer-events-none bg-slate-950/90 border border-red-500/40 rounded-lg px-2.5 py-1 text-[9px] text-red-300 flex items-center gap-1.5 font-mono uppercase tracking-wider backdrop-blur-sm shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>{damagedDetails.length} Damaged {damagedDetails.length === 1 ? "Part" : "Parts"} Highlighted</span>
        </div>
      )}
    </div>
  );
}

