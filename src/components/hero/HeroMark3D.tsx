'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MAX_PARTICLES } from '@/lib/animations/constants';
import { buildFacets, facetColour } from './markGeometry';

/**
 * The 3D B.
 *
 * Only ever mounted on desktop, with motion allowed and WebGL available —
 * HeroVisual makes that call, and this file is behind a dynamic import so none
 * of Three.js reaches a device that will not use it.
 *
 * Colour comes from the artwork, not from a ramp invented here: every facet is
 * painted with the average of the pixels the logo actually draws inside that
 * triangle (scripts/measure-mark.mjs). Lighting is kept deliberately
 * soft so the result reads as the logo with depth, rather than as a different
 * object that happens to be the same shape.
 */

/** Light direction for the baked shading, in the mark's own XY plane. */
const LIGHT_2D = new THREE.Vector2(-0.72, 0.69); // upper left

/**
 * One extruded triangle, shaded into its own vertices.
 *
 * The shading is baked rather than lit. Every attempt to reach the reference
 * look with real lights ran into the same wall: a light bright enough to pick
 * out a 45deg chamfer is also bright enough to blow a flat face to white, and
 * a point light close enough to vary across one facet leaves a visible hot
 * blob on it. Studio renders solve this with a large soft box and hours of
 * bounce; a hero running at 60fps cannot.
 *
 * So the gradient across each face and the bright edge on each chamfer are
 * written straight into the vertex colours, exactly as the flat artwork draws
 * them. The result is deterministic — it cannot blow out, it cannot desaturate,
 * and it matches the 2D logo by construction rather than by tuning. The scene
 * keeps one dim directional light so that rotating the mark still reads as
 * rotation, but it is a seasoning on top of the baked colour, not the source
 * of it.
 */
function Facet({
  facetKey,
  points,
  depth,
}: {
  facetKey: string;
  points: [number, number][];
  depth: number;
}) {
  const colour = facetColour(facetKey);

  const geometry = useMemo(() => {
    // The outline is no longer a triangle: buildFacets truncates each corner,
    // so this is a hexagon. Walk whatever it hands over.
    const shape = new THREE.Shape();
    shape.moveTo(points[0]![0], points[0]![1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i]![0], points[i]![1]);
    shape.closePath();

    // Narrower than it was. The chamfer reads at 0.06 just as well as at 0.075
    // once the corners are truncated, and every unit of bevel is also a unit of
    // outline offset at the corners, so the smaller number leaves more margin
    // between the cut and the point where it would show again.
    const bevel = 0.06;
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      // A true 45deg chamfer: thickness equal to size, one segment. The angle
      // is the point — a chamfer that shares a shading value with the face it
      // borders is invisible, and 45deg is the largest difference available.
      // Rounding it over (2+ segments) blends the two back together.
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 1,
      curveSegments: 1,
    });
    // The shape is already at its correct XY position in the mark, so the only
    // adjustment needed is centring the extrusion on the Z plane. Do NOT call
    // geo.center(): that recentres on the bounding box, and a right triangle's
    // bounding-box centre is not its centroid, so every facet slides away from
    // where the logo puts it.
    geo.translate(0, 0, -depth / 2);

    const light = new THREE.Color(colour.light);
    const base = new THREE.Color(colour.base);
    const dark = new THREE.Color(colour.dark);
    const white = new THREE.Color('#ffffff');

    const pos = geo.attributes.position!;
    const colours = new Float32Array(pos.count * 3);

    // Centroid and radius of the outline, for the across-the-face gradient.
    const cx = points.reduce((a, [x]) => a + x, 0) / points.length;
    const cy = points.reduce((a, [, y]) => a + y, 0) / points.length;
    const radius =
      Math.max(...points.map(([x, y]) => Math.hypot(x - cx, y - cy))) || 1;

    geo.computeBoundingBox();
    const maxZ = geo.boundingBox!.max.z;
    const front = maxZ - 1e-4;
    const rim = maxZ - bevel - 1e-4;

    const c = new THREE.Color();
    const dir = new THREE.Vector2();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // -1 on the shadowed side of the facet, +1 on the lit side.
      dir.set(x - cx, y - cy);
      const along = dir.length() > 1e-6 ? dir.normalize().dot(LIGHT_2D) : 0;
      // Distance out from the centre, so the gradient reaches full range only
      // at the corners rather than washing the middle of the face.
      const reach = Math.min(1, Math.hypot(x - cx, y - cy) / radius);
      const t = (along * reach + 1) / 2;

      if (z > front) {
        // Front face: light at the lit corner, dark at the far one.
        c.copy(dark).lerp(light, t);
      } else if (z > rim) {
        // Chamfer. This is where the mark reads as cut rather than printed.
        //
        // It never goes dark: running it from dark to white across the light
        // direction made the mark look soft, because half of every edge then
        // matched the face beside it and vanished. In the artwork every edge
        // carries a bright line and only its intensity varies.
        //
        // But it does not go near-white either. It did while the material was
        // unlit and the bake had to supply the highlight itself; with the clear
        // coat back, a chamfer baked to white gets a specular on top of white
        // and comes out grey. The bake keeps the facet's own colour and the
        // reflection is left to do the shining.
        c.copy(light).lerp(white, 0.18 + 0.5 * Math.pow(t, 1.4));
      } else {
        // Side wall and back. Never more than a hint, and only near the front.
        c.copy(dark).lerp(base, 0.35 * t);
        // Was 0.7. On white, where the colours were measured, a side wall this
        // dark still had the page behind it to read against. On #08060E the
        // bottom-left facets fell to within a couple of values of the
        // background and the mark simply lost its lower edge.
        c.multiplyScalar(0.86);
      }

      colours[i * 3] = c.r;
      colours[i * 3 + 1] = c.g;
      colours[i * 3 + 2] = c.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colours, 3));
    return geo;
  }, [points, depth, colour.base, colour.dark, colour.light]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow={false} receiveShadow={false}>
      {/*
        Baked colour underneath, real reflections on top.

        `vertexColors` supplies the diffuse — the gradient across each face and
        the bright line along each chamfer, written into the geometry above — so
        the palette is fixed and cannot be washed out no matter what the
        environment does. The clear coat then adds what baking cannot: a real
        specular that slides across the facets as the mark turns, and mirrors
        the light strips in the scene.

        That split is what makes both possible at once. Lighting the colour
        itself is what blew flat faces to white in earlier attempts; here the
        lights only ever add a highlight on top of a colour that is already
        correct, so envMapIntensity can be pushed until the reflections read
        without any risk to the logo underneath.
      */}
      <meshPhysicalMaterial
        vertexColors
        roughness={0.16}
        metalness={0.1}
        clearcoat={1}
        /*
         * Was 0.02, a mirror. A mirror-sharp coat reflects the light strips at
         * their true angular size, which is a hairline: on most facets, at most
         * camera angles, it missed the lens entirely and the mark read as matte
         * paper. Roughening the coat spreads each strip into a band wide enough
         * to actually cross a face, which is what a highlight sweeping over an
         * object looks like.
         */
        clearcoatRoughness={0.055}
        reflectivity={0.95}
        envMapIntensity={1.35}
      />
    </mesh>
  );
}

/**
 * Where the mark sits at each point of the stage.
 *
 * Three views of one object, in world units. x is negative toward the end side
 * of the screen, which in Hebrew is the left, so the mark starts opposite the
 * copy and crosses behind it as the page advances.
 *
 * `at` values are scroll progress over the whole stage, not over one section.
 */
type Pose = {
  at: number;
  x: number;
  y: number;
  z: number;
  rotY: number;
  rotX: number;
  scale: number;
  opacity: number;
};

const POSES: Pose[] = [
  // The hero. Held a third of a radian round so the chamfers catch the key and
  // the silhouette has a visible thickness.
  { at: 0, x: -1.9, y: 0, z: 0, rotY: -0.34, rotX: 0.12, scale: 0.8, opacity: 1 },
  // Turning through face-on as the commitments band passes. This is the only
  // frame where the B is legible as a letter rather than as an object.
  { at: 0.4, x: -1.05, y: 0.1, z: -1.6, rotY: 0.05, rotX: 0.04, scale: 0.56, opacity: 0.34 },
  /*
   * Pushed off to the end edge behind the services grid, and nearly gone.
   *
   * The first attempt drifted it to centre here at a third opacity, which put
   * a large translucent object directly across the section heading. It read as
   * a mistake rather than as depth: text over a busy shape is unreadable at any
   * opacity, which is the same lesson the mobile hero taught. Sending it to the
   * edge instead lets it survive in the gutters between the cards, where it is
   * atmosphere and nothing has to be read through it.
   */
  { at: 1, x: -3.1, y: -0.5, z: -3.6, rotY: 0.75, rotX: -0.09, scale: 0.42, opacity: 0.1 },
];

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Linear blend between the two poses bracketing `p`. */
function poseAt(p: number): Omit<Pose, 'at'> {
  let i = 0;
  while (i < POSES.length - 2 && p > POSES[i + 1]!.at) i += 1;
  const a = POSES[i]!;
  const b = POSES[i + 1]!;
  const span = b.at - a.at || 1;
  // Smoothstep rather than linear. A linear blend between keyframes changes
  // direction abruptly at each one, and on a scrubbed timeline that corner is
  // visible as a flick.
  const raw = clamp01((p - a.at) / span);
  const k = raw * raw * (3 - 2 * raw);
  const mix = (u: number, v: number) => u + (v - u) * k;
  return {
    x: mix(a.x, b.x),
    y: mix(a.y, b.y),
    z: mix(a.z, b.z),
    rotY: mix(a.rotY, b.rotY),
    rotX: mix(a.rotX, b.rotX),
    scale: mix(a.scale, b.scale),
    opacity: mix(a.opacity, b.opacity),
  };
}

/** The mark: rotates gently, leans toward the pointer, recedes as you scroll. */
function Mark({ progress }: { progress: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  /**
   * Almost no gap.
   *
   * The separation between facets comes from their chamfers meeting: two
   * 45deg cuts touching form a V-groove, which is what the artwork shows. Two
   * failure modes bracket this number. At 0.055 the background showed through
   * between the triangles and eighteen pieces with space around them read as
   * floating tiles. At 0.012 the chamfers overlapped and the grooves vanished
   * into one blended plate. This is the width where they just meet.
   */
  const facets = useMemo(
    () =>
      buildFacets({
        gap: 0.04,
        // Small on purpose. The needle is caused by the ANGLE, not by any
        // shortage of room: 45deg gives an offset of bevel / sin(22.5deg) =
        // 2.6x, and any truncation at all replaces it with two 112deg corners
        // where the factor is 1.2x. So the cut only has to exist. 0.13 was
        // tried first and it was far too much - the facets rounded off into
        // octagonal tiles, the corners where four of them meet opened into
        // holes, and the letterform started coming apart. At 0.05 the cut is a
        // 5% nick on a one-unit edge: the needle is gone and the triangle is
        // still a triangle.
        corner: 0.05,
        // Deeper than the 0.28 the 2D generators use. On screen the mark is
        // seen almost face on, so depth only ever shows as the sliver of side
        // wall at the silhouette and as the length of the shadow a facet casts
        // into its neighbour's groove. At 0.28 that sliver was thin enough that
        // the mark read as printed; this is where it reads as machined.
        depth: 0.38,
      }),
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const MAX_TILT = THREE.MathUtils.degToRad(12); // §6.2: +/-12 degrees

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = progress.current ?? 0;

    /*
     * The pose, keyframed across the stage.
     *
     * The mark no longer belongs to the hero. It is held on a sticky layer that
     * spans several sections, and scrolling re-frames it rather than dismissing
     * it: one subject, three views. That is the single idea worth taking from
     * the scroll pieces people call unique, and it is the part that survives
     * being done inside a real document with real headings.
     *
     * Read as a camera move even though the camera never moves. Turning and
     * pushing the object is cheaper than flying a camera, and it keeps the
     * light rig fixed, so the specular streaks sweep across the facets as it
     * goes - which is the thing that reads as travel.
     *
     * The last pose is deliberately faint and small. By then the services grid
     * is the subject and the mark is the room it happens in; a mark still
     * demanding attention behind live copy is a background that has not
     * accepted its job.
     */
    const p = clamp01(t);
    const pose = poseAt(p);

    // Idle motion and pointer lean, both damped away as the stage advances.
    // A mark that is still bobbing while it recedes reads as two animations
    // fighting rather than one move.
    const rest = 1 - p;
    const spin = state.clock.elapsedTime * 0.18;
    const targetY = pose.rotY + (Math.sin(spin) * 0.22 + pointer.current.x * MAX_TILT) * rest;
    const targetX = pose.rotX - pointer.current.y * MAX_TILT * rest;

    // Frame-rate independent easing.
    const ease = 1 - Math.pow(0.001, delta);
    g.rotation.y += (targetY - g.rotation.y) * ease;
    g.rotation.x += (targetX - g.rotation.x) * ease;

    /*
     * Idle float. The periods are deliberately not multiples of each other:
     * matched periods produce a visible repeating loop, and these two drift in
     * and out of phase over about half a minute.
     */
    g.rotation.z = Math.sin(state.clock.elapsedTime * 0.37) * 0.035 * rest;

    g.position.x += (pose.x - g.position.x) * ease;
    g.position.y +=
      (pose.y + Math.sin(state.clock.elapsedTime * 0.55) * 0.075 * rest - g.position.y) * ease;
    g.position.z += (pose.z - g.position.z) * ease;
    g.scale.setScalar(pose.scale);

    const opacity = pose.opacity;
    g.traverse((child) => {
      const mesh = child as THREE.Mesh;
      const material = mesh.material as THREE.Material | undefined;
      if (material && 'opacity' in material) {
        material.transparent = opacity < 0.999;
        material.opacity = opacity;
      }
    });
  });

  return (
    // No rotation prop: useFrame owns all three axes from the first frame.
    <group ref={group}>
      {facets.map((facet) => (
        <Facet key={facet.key} facetKey={facet.key} points={facet.points} depth={facet.depth} />
      ))}
    </group>
  );
}

/** Drifting particle field. Capped at MAX_PARTICLES (§6.2). */
function Particles({ count = MAX_PARTICLES }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.035}
        color="#C495F7"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Caps the device pixel ratio — the single biggest GPU cost in a WebGL hero. */
function PixelRatioGuard() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  }, [gl]);
  return null;
}

export default function HeroMark3D({
  progress,
  active,
}: {
  /** 0 while the hero is at rest, 1 once it has scrolled away. */
  progress: React.RefObject<number>;
  /** False when the hero is off screen — stops the render loop entirely. */
  active: boolean;
}) {
  return (
    <Canvas
      // Rendering stops the moment the hero leaves the viewport rather than
      // burning a frame budget on something nobody can see.
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        // Nudged up with the ambient down, so the mark keeps its overall
        // brightness while the range between its darks and its highlights
        // widens. That gap is the whole difference between glossy and matte.
        gl.toneMappingExposure = 1.22;
      }}
      style={{ pointerEvents: 'none' }}
    >
      <PixelRatioGuard />

      {/* The mark's own colour is baked into its vertices, so ambient is here
          to show that colour as authored rather than to model anything. The two
          directionals are a trace, just enough that turning the mark shifts its
          shading a little. */}
      <ambientLight intensity={1.05} />
      <directionalLight position={[-3, 4, 6]} intensity={0.5} color="#ffffff" />
      <directionalLight position={[4, -2, 3]} intensity={0.22} color="#E635F0" />

      {/* The mirror. Everything the clear coat reflects lives here, and almost
          all of it is deliberately black — a coat that reflects a bright world
          reflects it across whole faces, which is what desaturated the mark in
          earlier attempts. Reflections should be things, not a wash.

          The narrow strips are the things. A thin shape reflects as a thin
          line, so each one draws a hard streak across whichever facets face it,
          and the streaks slide as the mark turns under the pointer. They sit at
          45deg because the whole mark is built on a 45deg grid, so they run
          parallel to the edges they cross. */}
      <Environment resolution={256}>
        <Lightformer intensity={0.5} color="#B387E8" position={[3, 2, 4]} scale={[5, 5, 1]} />
        <Lightformer intensity={0.6} color="#E635F0" position={[-4, 1, -2]} scale={[6, 6, 1]} />

        {/*
          The key. Off to the upper left, matching LIGHT_2D, which is the
          direction the baked gradient already runs — so the reflection agrees
          with the shading underneath instead of contradicting it.

          It is a soft box rather than another hairline: the thin strips draw
          the hard streaks, but a mark lit only by strips has facets that face
          nowhere in particular and go dead. This gives those a broad, low
          sheen so the whole plate reads as one lit object.
        */}
        <Lightformer
          intensity={1.9}
          color="#FFF4FD"
          position={[-3.4, 3.2, 5]}
          rotation={[0, 0, Math.PI / 4]}
          scale={[7, 4, 1]}
        />

        <Lightformer
          intensity={13}
          color="#ffffff"
          position={[2.2, 3.4, 3.2]}
          rotation={[0, 0, Math.PI / 4]}
          scale={[10, 0.18, 1]}
        />
        <Lightformer
          intensity={8.5}
          color="#ffffff"
          position={[-2.6, 1.2, 3.6]}
          rotation={[0, 0, Math.PI / 4]}
          scale={[9, 0.14, 1]}
        />
        <Lightformer
          intensity={6.5}
          color="#F884EC"
          position={[-1.5, -2.8, 3.4]}
          rotation={[0, 0, Math.PI / 4]}
          scale={[8, 0.15, 1]}
        />

        {/*
          The one strip on the other diagonal.

          With every strip at +45deg the highlights all ran the same way, and a
          facet turning out of one streak had nothing to turn into: the specular
          blinked off and the mark went flat for part of every rotation. The
          mark is built on both diagonals — the cell at (1,1) is the one that
          leans the other way and shapes the upper counter — so a streak at
          -45deg has edges to run along, and the two families cross rather than
          stack.
        */}
        <Lightformer
          intensity={7.5}
          color="#ffffff"
          position={[0.6, -0.4, 4.2]}
          rotation={[0, 0, -Math.PI / 4]}
          scale={[9, 0.13, 1]}
        />
      </Environment>

      <Mark progress={progress} />
      <Particles />
    </Canvas>
  );
}
