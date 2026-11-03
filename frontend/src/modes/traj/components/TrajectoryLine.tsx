import { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import type { TrajPoint } from "../lib/traj-types";

const TRAJ_COLOR = "#1677ff";

interface Props {
  points: TrajPoint[];
  playIndex: number;
}

/**
 * Renders a trajectory in the scene's Z-up frame: blue polyline, per-point
 * yaw cones, green start ring, red end marker and an orange playhead sphere.
 * The line is drawn at its recorded coordinates and is not movable.
 */
export function TrajectoryLine({ points, playIndex }: Props) {
  const linePoints = useMemo(
    () => points.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
    [points],
  );

  if (points.length === 0) return null;
  const start = points[0]!;
  const end = points[points.length - 1]!;
  const play = points[Math.min(playIndex, points.length - 1)]!;

  return (
    <>
      {points.length >= 2 && (
        <Line points={linePoints} color={TRAJ_COLOR} lineWidth={2} />
      )}

      {/* Per-point yaw cones (z-up: yaw rotates about local Z). */}
      {points.map((p, i) => (
        <group key={i} position={[p.x, p.y, p.z]} rotation={[0, 0, p.yaw_rad]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.03, 0.1, 8]} />
            <meshBasicMaterial color={TRAJ_COLOR} />
          </mesh>
        </group>
      ))}

      {/* Start: green ring on the local floor (XY plane). */}
      <mesh position={[start.x, start.y, start.z]}>
        <ringGeometry args={[0.1, 0.14, 24]} />
        <meshBasicMaterial color="#52c41a" side={THREE.DoubleSide} />
      </mesh>

      {/* End: red wireframe square (mirrors the HTML report's endpoint box). */}
      <mesh position={[end.x, end.y, end.z]}>
        <boxGeometry args={[0.16, 0.16, 0.02]} />
        <meshBasicMaterial color="#f5222d" wireframe />
      </mesh>

      {/* Playhead: orange sphere at the active point. */}
      <mesh position={[play.x, play.y, play.z]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#fa8c16" />
      </mesh>
    </>
  );
}
