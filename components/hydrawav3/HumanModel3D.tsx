"use client"

import { useRef, Suspense } from "react"
import { useFrame } from "@react-three/fiber"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function Limb({ length, radius = 0.06, color = "#C4956A", up = false }: {
  length: number; radius?: number; color?: string; up?: boolean
}) {
  const offset = up ? length / 2 : -length / 2
  return (
    <mesh position={[0, offset, 0]}>
      <cylinderGeometry args={[radius * 0.85, radius, length, 14]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
    </mesh>
  )
}

function Joint({ r = 0.072, color = "#C97A56" }: { r?: number; color?: string }) {
  return (
    <mesh>
      <sphereGeometry args={[r, 14, 14]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
    </mesh>
  )
}

const BL = {
  footH: 0.055, foot: 0.13, shin: 0.38, thigh: 0.40,
  pelvisW: 0.19, torso: 0.52, shoulderW: 0.24,
  upperArm: 0.28, forearm: 0.24, neck: 0.13, headR: 0.17,
}

type ExId = "bodyweight_squat"|"reverse_lunge"|"single_leg_balance"|"hip_hinge"|"calf_raise"

interface PF {
  lHipFlex: number
  rHipFlex: number
  lKneeFlex: number
  rKneeFlex: number
  trunkFlex: number
  heelRise: number
  pelvisDrop: number
  lArm: number
  rArm: number
}

const POSES: Record<ExId, { s: PF; p: PF; spd: number }> = {
  bodyweight_squat: {
    s: { lHipFlex: 0, rHipFlex: 0, lKneeFlex: 0, rKneeFlex: 0, trunkFlex: 0, heelRise: 0, pelvisDrop: 0, lArm: 0.05, rArm: 0.05 },
    p: { lHipFlex: 0.65, rHipFlex: 0.65, lKneeFlex: 1.05, rKneeFlex: 1.05, trunkFlex: 0.28, heelRise: 0, pelvisDrop: 0.28, lArm: 0.45, rArm: 0.45 },
    spd: 0.9,
  },
  reverse_lunge: {
    s: { lHipFlex: 0, rHipFlex: 0, lKneeFlex: 0, rKneeFlex: 0, trunkFlex: 0, heelRise: 0, pelvisDrop: 0, lArm: 0.05, rArm: 0.05 },
    p: { lHipFlex: 0.65, rHipFlex: -0.35, lKneeFlex: 1.05, rKneeFlex: 1.15, trunkFlex: 0.12, heelRise: 0, pelvisDrop: 0.22, lArm: 0.18, rArm: 0.18 },
    spd: 0.75,
  },
  single_leg_balance: {
    s: { lHipFlex: 0, rHipFlex: 0, lKneeFlex: 0, rKneeFlex: 0, trunkFlex: 0, heelRise: 0, pelvisDrop: 0, lArm: 0.15, rArm: 0.15 },
    p: { lHipFlex: 0, rHipFlex: 0.85, lKneeFlex: 0, rKneeFlex: 1.0, trunkFlex: 0.02, heelRise: 0, pelvisDrop: 0, lArm: 0.65, rArm: 0.65 },
    spd: 0.45,
  },
  hip_hinge: {
    s: { lHipFlex: 0, rHipFlex: 0, lKneeFlex: 0, rKneeFlex: 0, trunkFlex: 0, heelRise: 0, pelvisDrop: 0, lArm: 0, rArm: 0 },
    p: { lHipFlex: 0.25, rHipFlex: 0.25, lKneeFlex: 0.18, rKneeFlex: 0.18, trunkFlex: 0.85, heelRise: 0, pelvisDrop: 0.04, lArm: -0.15, rArm: -0.15 },
    spd: 0.7,
  },
  calf_raise: {
    s: { lHipFlex: 0, rHipFlex: 0, lKneeFlex: 0, rKneeFlex: 0, trunkFlex: 0, heelRise: 0, pelvisDrop: 0, lArm: 0.05, rArm: 0.05 },
    p: { lHipFlex: 0, rHipFlex: 0, lKneeFlex: 0, rKneeFlex: 0, trunkFlex: 0, heelRise: 0.17, pelvisDrop: 0, lArm: 0.05, rArm: 0.05 },
    spd: 1.0,
  },
}

function lp(a: number, b: number, t: number) { return a + (b - a) * t }
function ease(t: number) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2 }

function AnimatedHuman({ exerciseId }: { exerciseId: string }) {
  const clock    = useRef(0)
  const rootRef  = useRef<THREE.Group>(null)
  const trunkRef = useRef<THREE.Group>(null)
  // Hip pivots — thigh hangs DOWN from here
  const lHipRef  = useRef<THREE.Group>(null)
  const rHipRef  = useRef<THREE.Group>(null)
  // Knee pivots — shin hangs DOWN from here (at bottom of thigh)
  const lKneeRef = useRef<THREE.Group>(null)
  const rKneeRef = useRef<THREE.Group>(null)
  const lArmRef  = useRef<THREE.Group>(null)
  const rArmRef  = useRef<THREE.Group>(null)

  const pose = POSES[exerciseId as ExId] ?? POSES.bodyweight_squat

  useFrame((_, dt) => {
    clock.current += dt * pose.spd

    const raw = (Math.sin(clock.current) + 1) / 2
    const t = ease(Math.max(0, Math.min(1, raw)))

    const v = (k: keyof PF) => lp(pose.s[k], pose.p[k], t)

    if (lHipRef.current) lHipRef.current.rotation.x = v("lHipFlex")
    if (rHipRef.current) rHipRef.current.rotation.x = v("rHipFlex")

    if (lKneeRef.current) lKneeRef.current.rotation.x = -v("lKneeFlex")
    if (rKneeRef.current) rKneeRef.current.rotation.x = -v("rKneeFlex")

    if (trunkRef.current) trunkRef.current.rotation.x = v("trunkFlex")

    if (lArmRef.current) lArmRef.current.rotation.z = v("lArm")
    if (rArmRef.current) rArmRef.current.rotation.z = -v("rArm")

    if (rootRef.current) {
      rootRef.current.position.y = v("heelRise") - v("pelvisDrop")
    }
  })

  const sk = "#C4956A"; const jt = "#C97A56"; const dk = "#9E7248"
  // Standing rest position: pelvis at full leg height above ground
  const pelvisY = BL.footH + BL.shin + BL.thigh

  return (
    <group ref={rootRef}>
      {/* ── SPINE ROOT at pelvis height ─────────────────────────────────── */}
      <group position={[0, pelvisY, 0]}>

        {/* Pelvis bar */}
        <mesh>
          <boxGeometry args={[BL.pelvisW * 2 + 0.09, 0.12, 0.16]} />
          <meshStandardMaterial color={sk} roughness={0.6} />
        </mesh>

        {/* ── LEFT LEG: hip pivot → thigh → knee pivot → shin → ankle → foot */}
        {/* Hip socket at left side of pelvis */}
        <group position={[-BL.pelvisW, 0, 0]}>
          <Joint r={0.083} color={jt} />
          {/* lHipRef rotates the whole left leg from the hip */}
          <group ref={lHipRef}>
            {/* Thigh goes DOWN (-y) */}
            <Limb length={BL.thigh} radius={0.079} color={sk} />
            {/* Knee at bottom of thigh */}
            <group position={[0, -BL.thigh, 0]}>
              <Joint r={0.068} color={jt} />
              {/* lKneeRef rotates shin from the knee */}
              <group ref={lKneeRef}>
                {/* Shin goes DOWN (-y) */}
                <Limb length={BL.shin} radius={0.054} color={sk} />
                {/* Ankle at bottom of shin */}
                <group position={[0, -BL.shin, 0]}>
                  <Joint r={0.058} color={jt} />
                  {/* Foot */}
                  <mesh position={[0, -BL.footH / 2, BL.foot * 0.3]}>
                    <boxGeometry args={[0.086, BL.footH, BL.foot]} />
                    <meshStandardMaterial color={dk} roughness={0.8} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>

        {/* ── RIGHT LEG (mirror) */}
        <group position={[BL.pelvisW, 0, 0]}>
          <Joint r={0.083} color={jt} />
          <group ref={rHipRef}>
            <Limb length={BL.thigh} radius={0.079} color={sk} />
            <group position={[0, -BL.thigh, 0]}>
              <Joint r={0.068} color={jt} />
              <group ref={rKneeRef}>
                <Limb length={BL.shin} radius={0.054} color={sk} />
                <group position={[0, -BL.shin, 0]}>
                  <Joint r={0.058} color={jt} />
                  <mesh position={[0, -BL.footH / 2, BL.foot * 0.3]}>
                    <boxGeometry args={[0.086, BL.footH, BL.foot]} />
                    <meshStandardMaterial color={dk} roughness={0.8} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>

        {/* ── TRUNK pivots at pelvis for hip hinge ──────────────────────── */}
        <group ref={trunkRef}>
          {/* Torso UP */}
          <mesh position={[0, BL.torso / 2 + 0.065, 0]}>
            <cylinderGeometry args={[0.125, 0.16, BL.torso, 14]} />
            <meshStandardMaterial color={sk} roughness={0.55} />
          </mesh>

          {/* Shoulder bar */}
          <group position={[0, BL.torso + 0.065, 0]}>
            <mesh>
              <boxGeometry args={[BL.shoulderW * 2 + 0.09, 0.11, 0.13]} />
              <meshStandardMaterial color={sk} roughness={0.6} />
            </mesh>

            {/* Left arm */}
            <group position={[-(BL.shoulderW + 0.045), 0, 0]}>
              <Joint r={0.07} color={jt} />
              <group ref={lArmRef}>
                <Limb length={BL.upperArm} radius={0.051} color={sk} />
                <group position={[0, -BL.upperArm, 0]}>
                  <Joint r={0.051} color={jt} />
                  <group rotation={[0.28, 0, 0]}>
                    <Limb length={BL.forearm} radius={0.042} color={sk} />
                    <mesh position={[0, -BL.forearm - 0.05, 0]}>
                      <sphereGeometry args={[0.05, 10, 10]} />
                      <meshStandardMaterial color={dk} roughness={0.7} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>

            {/* Right arm */}
            <group position={[BL.shoulderW + 0.045, 0, 0]}>
              <Joint r={0.07} color={jt} />
              <group ref={rArmRef}>
                <Limb length={BL.upperArm} radius={0.051} color={sk} />
                <group position={[0, -BL.upperArm, 0]}>
                  <Joint r={0.051} color={jt} />
                  <group rotation={[0.28, 0, 0]}>
                    <Limb length={BL.forearm} radius={0.042} color={sk} />
                    <mesh position={[0, -BL.forearm - 0.05, 0]}>
                      <sphereGeometry args={[0.05, 10, 10]} />
                      <meshStandardMaterial color={dk} roughness={0.7} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>

            {/* Neck + head */}
            <group position={[0, 0.055, 0]}>
              <Limb length={BL.neck} radius={0.066} color={sk} up />
              <mesh position={[0, BL.neck + BL.headR * 0.9, 0]}>
                <sphereGeometry args={[BL.headR, 16, 16]} />
                <meshStandardMaterial color={sk} roughness={0.5} />
              </mesh>
              <mesh position={[-BL.headR * 0.8, BL.neck + BL.headR * 0.9, BL.headR * 0.56]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color={dk} roughness={0.6} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[0.26, 0.34, 32]} />
        <meshBasicMaterial color="#C97A56" opacity={0.2} transparent />
      </mesh>
    </group>
  )
}

function HumanModel3DInner({
  exerciseId,
  zoom = 1,
}: {
  exerciseId: string
  zoom?: number
}) {
  return (
    <Canvas
      camera={{ position: [-3.2 / zoom, 0.85, 0.3 / zoom], fov: 44, near: 0.1, far: 100 }}
      style={{ background: "transparent" }}
      shadows
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[-5, 7, 3]} intensity={1.3} castShadow />
      <directionalLight position={[3, 2, -2]} intensity={0.4} color="#C97A56" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <shadowMaterial opacity={0.12} />
      </mesh>
      <AnimatedHuman exerciseId={exerciseId} />
      <OrbitControls
        enableZoom={false} enablePan={false}
        target={[0, 0.85, 0]}
        minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.9}
        minAzimuthAngle={-Math.PI / 5} maxAzimuthAngle={Math.PI / 5}
      />
    </Canvas>
  )
}

function HumanModel3DWithSuspense({
  exerciseId,
  zoom = 1,
}: {
  exerciseId: string
  zoom?: number
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C97A56] border-t-transparent" />
        </div>
      }
    >
      <HumanModel3DInner exerciseId={exerciseId} zoom={zoom} />
    </Suspense>
  )
}

const HumanModel3D = HumanModel3DWithSuspense

export default HumanModel3D