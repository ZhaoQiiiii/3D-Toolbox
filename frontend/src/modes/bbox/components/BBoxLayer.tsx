import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { DragEntry, Vec3 } from "../lib/bbox";
import {
  MIN_EDGE_RADIUS,
  boxEdges,
  centerOf,
  cornerPositions,
} from "../lib/bbox";
import { CornerHandle } from "./CornerHandle";

interface Props {
  boxId: string;
  min: Vec3;
  max: Vec3;
  handleRadius: number;
  lineWidth: number;
  /** Semantic label shown above the box (null / empty hides it). */
  label: string | null;
  showLabel: boolean;
  dragRefs: React.MutableRefObject<DragEntry[]>;
}

const UP = new THREE.Vector3(0, 1, 0);

/** A visible box edge (thin cylinder, display only). Exported for the
 *  SceneGraph read-only overlay, which renders the same look. */
export function EdgeCylinder({
  start,
  end,
  radius,
  color,
  raycast,
}: {
  start: Vec3;
  end: Vec3;
  radius: number;
  color: string;
  /** Optional raycast override — the silent overlay passes a no-op so the
   *  cylinders can never intercept picks. */
  raycast?: () => void;
}) {
  const av = new THREE.Vector3(start[0], start[1], start[2]);
  const bv = new THREE.Vector3(end[0], end[1], end[2]);
  const mid = av.clone().add(bv).multiplyScalar(0.5);
  const dir = bv.clone().sub(av);
  const length = dir.length();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());

  return (
    <mesh position={mid} quaternion={quaternion} raycast={raycast}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/**
 * Renders a single labelled AABB: 12 white edge cylinders, white corner
 * spheres and a label. No face fill.
 */
export function BBoxLayer({
  boxId,
  min,
  max,
  handleRadius,
  lineWidth,
  label,
  showLabel,
  dragRefs,
}: Props) {
  const corners = cornerPositions(min, max);
  const edges = boxEdges();
  const radius = Math.max(MIN_EDGE_RADIUS, lineWidth / 2);
  const center = centerOf(min, max);

  // Every box renders in the same look, selected or not: white edges and
  // corners, no fill.
  const edgeColor = "#ffffff";
  const handleColor = "#ffffff";

  return (
    <group>
      {edges.map(([a, b], i) => (
        <EdgeCylinder
          key={i}
          start={corners[a]!}
          end={corners[b]!}
          radius={radius}
          color={edgeColor}
        />
      ))}

      {corners.map((c, i) => (
        <CornerHandle
          key={i}
          boxId={boxId}
          corner={i}
          position={c}
          radius={handleRadius}
          color={handleColor}
          dragRefs={dragRefs}
        />
      ))}

      {showLabel && label && (
        <Html
          position={[center[0], center[1], max[2]]}
          center
          style={{
            pointerEvents: "none",
            whiteSpace: "nowrap",
            padding: "4px 10px",
            borderRadius: 5,
            background: "#000",
            color: "#fff",
            fontFamily: "monospace",
            fontSize: 14,
            lineHeight: 1.2,
            userSelect: "none",
          }}
        >
          {label}
        </Html>
      )}
    </group>
  );
}
