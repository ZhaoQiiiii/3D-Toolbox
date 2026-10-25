import { useCallback } from "react";
import * as THREE from "three";
import type { DragEntry, Vec3 } from "../lib/bbox";
import { upsertDragEntry } from "../lib/bbox";

interface Props {
  boxId: string;
  corner: number;
  position: Vec3;
  radius: number;
  color: string;
  dragRefs: React.MutableRefObject<DragEntry[]>;
}

/** Invisible grab sphere. Decoupled from the drawn radius so small corner
 *  dots stay easy to hit and drag. */
const PICK_RADIUS = 0.08;

/**
 * A single draggable corner sphere, registered into the shared `dragRefs`
 * registry with its box id and corner face-pairs so the Picker can map a drag
 * back to the correct box + corner.
 */
export function CornerHandle({ boxId, corner, position, radius, color, dragRefs }: Props) {
  const key = `${boxId}:corner:${corner}`;

  const setRef = useCallback(
    (el: THREE.Mesh | null) => {
      upsertDragEntry(
        dragRefs.current,
        key,
        { boxId, corner },
        el,
      );
    },
    [boxId, corner, dragRefs, key],
  );

  return (
    <group position={position}>
      <mesh raycast={() => {}}>
        <sphereGeometry args={[radius, 20, 20]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={setRef}>
        <sphereGeometry args={[PICK_RADIUS, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
