'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface HeroSceneProps {
  teamColor?: string
}

export default function HeroScene({ teamColor = '#E8002D' }: HeroSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const w = mount.clientWidth
    const h = mount.clientHeight

    // ── Renderer ────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    // ── Scene ────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050508)
    scene.fog = new THREE.FogExp2(0x050508, 0.032)

    // ── Camera ───────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 120)
    camera.position.set(0, 14, 7)
    camera.lookAt(0, 0, -1)

    // ── Team color ───────────────────────────────────────
    const tcHex = parseInt(teamColor.replace('#', '0x'), 16)
    const tcColor = new THREE.Color(tcHex)

    // ── Lights ───────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0d0d1a, 5))
    scene.add(new THREE.HemisphereLight(0x112244, 0x000000, 2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 4)
    keyLight.position.set(8, 20, 6)
    scene.add(keyLight)
    const fillLight = new THREE.PointLight(tcHex, 10, 25)
    fillLight.position.set(-6, 5, 0)
    scene.add(fillLight)

    // ── F1 Circuit — Silverstone-inspired layout ──────────────
    const raw: [number, number, number][] = [
      [ 3.6,  0.00,  0.3], [ 4.4,  0.00, -0.5], [ 4.6,  0.05, -1.5], [ 4.2,  0.10, -2.4],
      [ 3.4,  0.18, -3.0], [ 2.7,  0.20, -3.5], [ 2.0,  0.15, -3.1], [ 1.4,  0.10, -3.6],
      [ 0.7,  0.05, -3.3], [-0.2,  0.00, -3.8], [-1.2,  0.00, -4.1], [-2.0,  0.00, -3.6],
      [-2.6,  0.00, -2.9], [-3.1,  0.00, -1.8], [-3.5,  0.00, -0.6], [-3.4,  0.00,  0.5],
      [-2.8,  0.00,  1.3], [-1.8,  0.00,  1.8], [-0.6,  0.00,  2.2], [ 0.4,  0.08,  2.6],
      [ 1.4,  0.14,  2.3], [ 2.1,  0.10,  1.6], [ 2.4,  0.05,  0.8], [ 3.1,  0.00,  0.5],
    ]
    const circuitPts = raw.map(([x, y, z]) => new THREE.Vector3(x, y, z))
    const curve = new THREE.CatmullRomCurve3(circuitPts, true, 'catmullrom', 0.5)

    // Track tarmac
    const TUBE_SEGS = 350
    const TUBE_RADIUS = 0.24
    scene.add(new THREE.Mesh(
      new THREE.TubeGeometry(curve, TUBE_SEGS, TUBE_RADIUS, 10, true),
      new THREE.MeshStandardMaterial({ color: 0x1c1c24, roughness: 0.95, metalness: 0.02 })
    ))

    // Kerb stripes
    const kerbMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.25 })
    const outerCurvePts = circuitPts.map(p => new THREE.Vector3(p.x * 1.07, p.y, p.z * 1.07))
    const innerCurvePts = circuitPts.map(p => new THREE.Vector3(p.x * 0.93, p.y, p.z * 0.93))
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outerCurvePts, true), TUBE_SEGS, 0.022, 4, true), kerbMat))
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(innerCurvePts, true), TUBE_SEGS, 0.022, 4, true), kerbMat))

    // Team-color edge lines
    const edgeMat = new THREE.LineBasicMaterial({ color: tcHex, transparent: true, opacity: 0.55 })
    const edgeOuter: THREE.Vector3[] = [], edgeInner: THREE.Vector3[] = []
    for (let i = 0; i <= 300; i++) {
      const t = i / 300
      const pt = curve.getPointAt(t)
      const tan = curve.getTangentAt(t).normalize()
      const norm = new THREE.Vector3(-tan.z, 0, tan.x)
      edgeOuter.push(pt.clone().addScaledVector(norm,  TUBE_RADIUS + 0.02))
      edgeInner.push(pt.clone().addScaledVector(norm, -TUBE_RADIUS - 0.02))
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(edgeOuter), edgeMat))
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(edgeInner), edgeMat))

    // Sector overlays (S1=green, S2=yellow, S3=team color)
    for (let s = 0; s < 3; s++) {
      const s0 = s / 3, s1 = (s + 1) / 3
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 80; i++) pts.push(curve.getPointAt(s0 + (i / 80) * (s1 - s0)))
      scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: [0x00dd77, 0xf5c418, tcHex][s], transparent: true, opacity: 0.22 })
      ))
    }

    // Start/finish line
    const sfPt = curve.getPointAt(0)
    const sfNorm = new THREE.Vector3(-curve.getTangentAt(0).normalize().z, 0, curve.getTangentAt(0).normalize().x)
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 12 }, (_, i) => sfPt.clone().addScaledVector(sfNorm, (i / 11 - 0.5) * 0.7))),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
    ))

    // DRS markers
    for (const t of [0.08, 0.42, 0.75]) {
      const p = curve.getPointAt(t)
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00eeff, transparent: true, opacity: 0.8 }))
      dot.position.copy(p).add(new THREE.Vector3(0, 0.12, 0))
      scene.add(dot)
    }

    // Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({ color: 0x07070d, roughness: 1.0 }))
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01
    scene.add(ground)

    // Grid dots
    for (let ix = -6; ix <= 6; ix += 2) for (let iz = -6; iz <= 6; iz += 2) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), new THREE.MeshBasicMaterial({ color: 0x1a1a2e, transparent: true, opacity: 0.7 }))
      d.position.set(ix, 0.005, iz); scene.add(d)
    }

    // ── Car dot ──────────────────────────────────────────
    const carDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 20, 20),
      new THREE.MeshStandardMaterial({ color: tcHex, emissive: tcColor, emissiveIntensity: 4, roughness: 0.0, metalness: 0.8 })
    )
    scene.add(carDot)
    const carLight = new THREE.PointLight(tcHex, 12, 3.5)
    scene.add(carLight)
    const glowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.35, 24),
      new THREE.MeshBasicMaterial({ color: tcHex, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    )
    glowDisc.rotation.x = -Math.PI / 2
    scene.add(glowDisc)

    // ── Trail ───────────────────────────────────────────
    const TRAIL_LEN = 120
    const trailBuf = new Float32Array(TRAIL_LEN * 3)
    const trailGeo = new THREE.BufferGeometry()
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailBuf, 3))
    const trailMat = new THREE.LineBasicMaterial({ color: tcHex, transparent: true, opacity: 0.5 })
    scene.add(new THREE.Line(trailGeo, trailMat))
    const initP = curve.getPointAt(0)
    const trailHistory: THREE.Vector3[] = Array.from({ length: TRAIL_LEN }, () => initP.clone())
    let trailHead = 0

    // Background stars
    const starBuf = new Float32Array(280 * 3)
    for (let i = 0; i < 280; i++) { starBuf[i*3]=(Math.random()-.5)*32; starBuf[i*3+1]=Math.random()*2.5; starBuf[i*3+2]=(Math.random()-.5)*32 }
    const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(starBuf, 3))
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x1e2248, size: 0.05, transparent: true, opacity: 0.7 })))

    // ── Animate ──────────────────────────────────────────
    const clock = new THREE.Clock()
    let animId = 0

    function animate() {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      const carT = (t * 0.055) % 1
      const carPos = curve.getPointAt(carT)
      carPos.y += 0.1
      carDot.position.copy(carPos)
      carLight.position.copy(carPos)
      carLight.intensity = 10 + Math.sin(t * 6) * 3
      glowDisc.position.set(carPos.x, 0.01, carPos.z)

      trailHistory[trailHead % TRAIL_LEN] = carPos.clone()
      trailHead++
      const posAttr = trailGeo.attributes.position
      for (let i = 0; i < TRAIL_LEN; i++) {
        const h = trailHistory[(trailHead - 1 - i + TRAIL_LEN * 2) % TRAIL_LEN]
        posAttr.setXYZ(i, h.x, h.y - 0.02, h.z)
      }
      posAttr.needsUpdate = true
      trailMat.opacity = 0.45 + Math.sin(t * 2) * 0.1

      // Slow cinematic orbit
      const ang = t * 0.055, R = 13
      camera.position.x = Math.cos(ang) * R * 0.55
      camera.position.z = Math.sin(ang) * R * 0.8 + 1
      camera.position.y = 11.5 + Math.sin(t * 0.2) * 1.0
      camera.lookAt(0, 0, -1)

      fillLight.intensity = 8 + Math.sin(t * 1.4) * 3
      renderer.render(scene, camera)
    }

    animate()

    function onResize() {
      if (!mountRef.current) return
      const nw = mountRef.current.clientWidth, nh = mountRef.current.clientHeight
      camera.aspect = nw / nh; camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [teamColor])

  return <div ref={mountRef} className="w-full h-full" />
}
