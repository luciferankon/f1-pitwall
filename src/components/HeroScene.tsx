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

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    // ── Scene ──────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050508)
    scene.fog = new THREE.FogExp2(0x050508, 0.055)

    // ── Camera ─────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 150)
    camera.position.set(8, 3.2, 5)
    camera.lookAt(0, 0.6, 0)

    // ── Parse team color ─────────────────────────────────────────
    const tcHex = parseInt(teamColor.replace('#', '0x'), 16)

    // ── Lights ─────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0d0d1a, 3))
    scene.add(new THREE.HemisphereLight(0x112244, 0x000000, 1.5))

    const keyLight = new THREE.DirectionalLight(0xffffff, 6)
    keyLight.position.set(5, 10, 4)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.setScalar(2048)
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 40
    keyLight.shadow.camera.left = -8
    keyLight.shadow.camera.right = 8
    keyLight.shadow.camera.top = 8
    keyLight.shadow.camera.bottom = -8
    keyLight.shadow.bias = -0.001
    scene.add(keyLight)

    const fillLight = new THREE.PointLight(tcHex, 12, 14)
    fillLight.position.set(-4, 2.5, 2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0x2244ff, 3)
    rimLight.position.set(-7, 4, -5)
    scene.add(rimLight)

    const underGlow = new THREE.PointLight(tcHex, 5, 6)
    underGlow.position.set(0, -0.2, 0)
    scene.add(underGlow)

    const rearLight = new THREE.PointLight(0xff3300, 4, 5)
    rearLight.position.set(-3, 1, 0)
    scene.add(rearLight)

    // ── Materials ────────────────────────────────────────────
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: tcHex,
      metalness: 0.85,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    })
    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x0e0e0e,
      metalness: 0.5,
      roughness: 0.25,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
    })
    const darkMat  = new THREE.MeshStandardMaterial({ color: 0x111118, metalness: 0.3, roughness: 0.7 })
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x88aadd,
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.8,
      transparent: true,
      opacity: 0.35,
    })
    const tireMat    = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, metalness: 0.0, roughness: 0.95 })
    const rimMat     = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.92, roughness: 0.12 })
    const whiteMat   = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.2 })
    const haloMat    = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 })
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.98, roughness: 0.05 })

    // ── Helper ─────────────────────────────────────────────
    function box(bw: number, bh: number, bd: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat)
      m.position.set(x, y, z)
      m.castShadow = true
      m.receiveShadow = true
      return m
    }

    // ── Build F1 Car ───────────────────────────────────────────
    const car = new THREE.Group()

    car.add(box(4.0, 0.055, 1.25, carbonMat, 0, 0.035, 0))
    car.add(box(2.8, 0.42, 0.60, bodyMat, 0.1, 0.32, 0))
    car.add(box(2.0, 0.30, 0.38, bodyMat, -0.2, 0.22, -0.44))
    car.add(box(2.0, 0.30, 0.38, bodyMat, -0.2, 0.22,  0.44))
    car.add(box(0.28, 0.22, 0.06, darkMat, 0.85, 0.24, -0.64))
    car.add(box(0.28, 0.22, 0.06, darkMat, 0.85, 0.24,  0.64))
    car.add(box(1.05, 0.52, 0.54, bodyMat, -0.78, 0.46, 0))
    car.add(box(0.75, 0.42, 0.50, bodyMat, -1.28, 0.38, 0))

    const noseSegs: [number, number, number][] = [
      [0.44, 0.28, 0.56], [0.38, 0.24, 0.50], [0.36, 0.20, 0.42],
      [0.34, 0.16, 0.34], [0.30, 0.12, 0.24], [0.26, 0.08, 0.16],
    ]
    noseSegs.forEach(([bw, bh, bd], i) => {
      car.add(box(bw, bh, bd, bodyMat, 1.25 + i * 0.22, 0.20 - i * 0.018, 0))
    })
    car.add(box(0.22, 0.06, 0.10, darkMat, 2.55, 0.13, 0))

    car.add(box(0.72, 0.16, 0.54, bodyMat, 0.55, 0.48, 0))
    car.add(box(0.58, 0.13, 0.48, bodyMat, 0.22, 0.47, 0))
    car.add(box(0.52, 0.15, 0.36, glassMat, 0.45, 0.54, 0))

    car.add(box(0.07, 0.24, 0.07, haloMat, 0.72, 0.60, -0.14))
    car.add(box(0.07, 0.24, 0.07, haloMat, 0.72, 0.60,  0.14))
    car.add(box(0.68, 0.055, 0.34, haloMat, 0.45, 0.72, 0))
    car.add(box(0.30, 0.055, 0.14, haloMat, 0.78, 0.72, 0))

    car.add(box(0.10, 0.035, 1.60, carbonMat, 2.08, 0.07, 0))
    car.add(box(0.12, 0.032, 1.45, bodyMat,   2.05, 0.13, 0))
    car.add(box(0.10, 0.030, 1.32, carbonMat, 2.03, 0.18, 0))
    car.add(box(0.28, 0.22, 0.055, bodyMat, 2.04, 0.10, -0.80))
    car.add(box(0.28, 0.22, 0.055, bodyMat, 2.04, 0.10,  0.80))
    car.add(box(0.10, 0.045, 0.28, bodyMat, 1.88, 0.20, -0.60))
    car.add(box(0.10, 0.045, 0.28, bodyMat, 1.88, 0.20,  0.60))

    car.add(box(0.10, 0.048, 1.08, bodyMat,   -1.70, 0.80, 0))
    car.add(box(0.09, 0.040, 0.98, carbonMat, -1.67, 0.90, 0))
    car.add(box(0.055, 0.28, 0.055, carbonMat, -1.72, 0.68, -0.46))
    car.add(box(0.055, 0.28, 0.055, carbonMat, -1.72, 0.68,  0.46))
    car.add(box(0.20, 0.30, 0.055, bodyMat, -1.70, 0.73, -0.57))
    car.add(box(0.20, 0.30, 0.055, bodyMat, -1.70, 0.73,  0.57))
    car.add(box(0.07, 0.038, 0.74, carbonMat, -1.62, 0.48, 0))

    function makeWheel(x: number, z: number, front: boolean) {
      const g = new THREE.Group()
      const tr = front ? 0.265 : 0.305
      const tw = front ? 0.215 : 0.285
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(tr, tr, tw, 28), tireMat)
      tire.rotation.x = Math.PI / 2; tire.castShadow = true; g.add(tire)
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(tr * 0.68, tr * 0.68, tw + 0.01, 12), rimMat)
      rim.rotation.x = Math.PI / 2; g.add(rim)
      for (let i = 0; i < 6; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(tr * 0.55, 0.025, 0.025), rimMat)
        spoke.rotation.z = (i / 6) * Math.PI * 2
        g.add(spoke)
      }
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, tw + 0.02, 8), bodyMat)
      cap.rotation.x = Math.PI / 2; g.add(cap)
      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, tw + 0.03, 6), whiteMat)
      nut.rotation.x = Math.PI / 2; g.add(nut)
      g.position.set(x, tr, z)
      return g
    }

    const wheelFL = makeWheel( 1.42, -0.72, true)
    const wheelFR = makeWheel( 1.42,  0.72, true)
    const wheelRL = makeWheel(-1.38, -0.76, false)
    const wheelRR = makeWheel(-1.38,  0.76, false)
    car.add(wheelFL, wheelFR, wheelRL, wheelRR)

    for (const z of [-0.72, 0.72]) {
      car.add(box(0.78, 0.028, 0.028, darkMat, 1.05, 0.23, z * 0.6))
      car.add(box(0.78, 0.028, 0.028, darkMat, 1.05, 0.34, z * 0.6))
    }
    for (const z of [-0.76, 0.76]) {
      car.add(box(0.72, 0.028, 0.028, darkMat, -0.98, 0.28, z * 0.58))
      car.add(box(0.72, 0.028, 0.028, darkMat, -0.98, 0.38, z * 0.58))
    }

    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.038, 0.22, 10), exhaustMat)
    exhaust.rotation.z = Math.PI / 2
    exhaust.position.set(-1.78, 0.56, 0)
    exhaust.castShadow = true
    car.add(exhaust)

    car.rotation.y = Math.PI * 0.12
    scene.add(car)

    // ── Environment ────────────────────────────────────────────
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 0.98, metalness: 0.0 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const pitFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 5),
      new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.9, metalness: 0.05 })
    )
    pitFloor.rotation.x = -Math.PI / 2
    pitFloor.position.y = 0.001
    pitFloor.receiveShadow = true
    scene.add(pitFloor)

    const gridMat = new THREE.MeshBasicMaterial({ color: 0x1e1e28, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    for (let x = -5; x <= 5; x++) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 5), gridMat)
      line.rotation.x = -Math.PI / 2
      line.position.set(x, 0.002, 0)
      scene.add(line)
    }
    for (let z = -2; z <= 2; z++) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.02), gridMat)
      line.rotation.x = -Math.PI / 2
      line.position.set(0, 0.002, z)
      scene.add(line)
    }

    const stripMat = new THREE.MeshBasicMaterial({ color: tcHex, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
    for (const z of [-2.2, 2.2]) {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.08), stripMat)
      strip.rotation.x = -Math.PI / 2
      strip.position.set(0, 0.003, z)
      scene.add(strip)
    }

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(20, 6, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x08080e, roughness: 1, metalness: 0 })
    )
    wall.position.set(0, 3, -4.5)
    wall.receiveShadow = true
    scene.add(wall)

    for (let i = -2; i <= 2; i++) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.0, 0.01),
        new THREE.MeshStandardMaterial({
          color: tcHex,
          emissive: new THREE.Color(tcHex),
          emissiveIntensity: 0.08,
          roughness: 0.3,
          metalness: 0.6,
        })
      )
      panel.position.set(i * 2.6, 2.5, -4.3)
      scene.add(panel)
    }

    // ── Particles ────────────────────────────────────────────
    const PARTICLE_COUNT = 500
    const pPos = new Float32Array(PARTICLE_COUNT * 3)
    const pVel = new Float32Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 22
      pPos[i * 3 + 1] = Math.random() * 2.5
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 7
      pVel[i] = 0.025 + Math.random() * 0.055
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({ color: tcHex, size: 0.022, sizeAttenuation: true, transparent: true, opacity: 0.5 })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    for (let i = 1; i <= 3; i++) {
      const gm = new THREE.MeshBasicMaterial({ color: tcHex, transparent: true, opacity: 0.08 / i, side: THREE.DoubleSide })
      const ring = new THREE.Mesh(new THREE.RingGeometry(i * 0.9, i * 0.9 + 0.06, 48), gm)
      ring.rotation.x = -Math.PI / 2
      ring.position.set(0, 0.002, 0)
      scene.add(ring)
    }

    // ── Animate ────────────────────────────────────────────
    const clock = new THREE.Clock()
    let animId = 0

    function animate() {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      camera.position.x = Math.cos(t * 0.14) * 8.5
      camera.position.z = Math.sin(t * 0.14) * 8.5 * 0.75
      camera.position.y = 2.8 + Math.sin(t * 0.25) * 0.35
      camera.lookAt(0, 0.7, 0)

      car.position.y = Math.sin(t * 1.1) * 0.018
      car.rotation.y = Math.PI * 0.12 + Math.sin(t * 0.35) * 0.04

      const s = 3.5 * 0.016
      wheelFL.rotation.z += s; wheelFR.rotation.z += s
      wheelRL.rotation.z += s; wheelRR.rotation.z += s

      fillLight.intensity = 10 + Math.sin(t * 1.8) * 2.5
      underGlow.intensity = 4  + Math.sin(t * 2.2) * 1.5
      rearLight.intensity = 3  + Math.sin(t * 1.3) * 1.5

      const pos = particles.geometry.attributes.position
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos.setX(i, pos.getX(i) - pVel[i])
        if (pos.getX(i) < -11) pos.setX(i, 11)
      }
      pos.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // ── Resize ────────────────────────────────────────────
    function onResize() {
      if (!mountRef.current) return
      const nw = mountRef.current.clientWidth
      const nh = mountRef.current.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
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
