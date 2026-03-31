'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface HeroSceneProps {
  teamColor?: string
}

function buildF1Car(color: string): THREE.Group {
  const group = new THREE.Group()

  const teamMat = new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.15 })
  const carbonMat = new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0.4, roughness: 0.5 })
  const tireMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.1, roughness: 0.9 })
  const rimMat = new THREE.MeshStandardMaterial({ color: '#aaaaaa', metalness: 0.95, roughness: 0.05 })
  const glassMat = new THREE.MeshStandardMaterial({ color: '#223344', metalness: 0.3, roughness: 0.1, transparent: true, opacity: 0.7 })

  // ── Main chassis / body ──────────────────────────────────────
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 0.72), teamMat)
  body.position.set(0, 0.22, 0)
  group.add(body)

  // Engine cover (high rear section)
  const engineCover = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.38, 0.56), teamMat)
  engineCover.position.set(-0.5, 0.38, 0)
  group.add(engineCover)

  // Nose cone
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.38), teamMat)
  nose.position.set(1.65, 0.16, 0)
  group.add(nose)

  // ── Cockpit ──────────────────────────────────────────────────
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.1, 0.36), glassMat)
  cockpit.position.set(0.35, 0.48, 0)
  group.add(cockpit)

  // Cockpit surround
  const cockpitRim = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.44), carbonMat)
  cockpitRim.position.set(0.35, 0.44, 0)
  group.add(cockpitRim)

  // ── Halo ─────────────────────────────────────────────────────
  const haloL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.05), carbonMat)
  haloL.position.set(0.35, 0.57, -0.17)
  group.add(haloL)
  const haloR = haloL.clone()
  haloR.position.z = 0.17
  group.add(haloR)
  const haloTop = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.36), carbonMat)
  haloTop.position.set(0.35, 0.72, 0)
  group.add(haloTop)

  // ── Sidepods ─────────────────────────────────────────────────
  const spL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.28, 0.3), teamMat)
  spL.position.set(-0.05, 0.16, -0.52)
  group.add(spL)
  const spR = spL.clone()
  spR.position.z = 0.52
  group.add(spR)

  // Sidepod inlet
  const inletL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.12), carbonMat)
  inletL.position.set(0.66, 0.2, -0.54)
  group.add(inletL)
  const inletR = inletL.clone()
  inletR.position.z = 0.54
  group.add(inletR)

  // ── Floor / undertray ────────────────────────────────────────
  const floor = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.04, 1.35), carbonMat)
  floor.position.set(-0.1, 0.04, 0)
  group.add(floor)

  // ── Front wing ───────────────────────────────────────────────
  const fwMain = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 1.85), teamMat)
  fwMain.position.set(1.85, 0.06, 0)
  group.add(fwMain)

  const fwFlap = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 1.6), teamMat)
  fwFlap.position.set(1.83, 0.12, 0)
  group.add(fwFlap)

  const fwEpL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.13, 0.04), teamMat)
  fwEpL.position.set(1.8, 0.09, -0.93)
  group.add(fwEpL)
  const fwEpR = fwEpL.clone()
  fwEpR.position.z = 0.93
  group.add(fwEpR)

  // Front wing connector / cascade
  const fwConn = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.04), teamMat)
  fwConn.position.set(1.7, 0.1, -0.7)
  group.add(fwConn)
  const fwConnR = fwConn.clone()
  fwConnR.position.z = 0.7
  group.add(fwConnR)

  // ── Rear wing ────────────────────────────────────────────────
  const rwMain = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 1.0), teamMat)
  rwMain.position.set(-1.78, 0.72, 0)
  group.add(rwMain)
  const rwFlap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.96), teamMat)
  rwFlap.position.set(-1.78, 0.79, 0)
  group.add(rwFlap)

  const rwEpL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.05), teamMat)
  rwEpL.position.set(-1.78, 0.74, -0.51)
  group.add(rwEpL)
  const rwEpR = rwEpL.clone()
  rwEpR.position.z = 0.51
  group.add(rwEpR)

  const rwSuppL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.52, 0.05), carbonMat)
  rwSuppL.position.set(-1.78, 0.46, -0.25)
  group.add(rwSuppL)
  const rwSuppR = rwSuppL.clone()
  rwSuppR.position.z = 0.25
  group.add(rwSuppR)

  // Beam wing
  const beamWing = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.6), carbonMat)
  beamWing.position.set(-1.6, 0.52, 0)
  group.add(beamWing)

  // ── Wheels ────────────────────────────────────────────────────
  const wheelPositions = [
    { x: 1.38, z: -0.57, front: true },
    { x: 1.38, z: 0.57, front: true },
    { x: -1.28, z: -0.6, front: false },
    { x: -1.28, z: 0.6, front: false },
  ]

  wheelPositions.forEach(({ x, z, front }) => {
    const radius = front ? 0.29 : 0.32
    const width = front ? 0.26 : 0.32

    const wheelGeom = new THREE.CylinderGeometry(radius, radius, width, 24)
    const wheel = new THREE.Mesh(wheelGeom, tireMat)
    wheel.rotation.x = Math.PI / 2
    wheel.position.set(x, radius, z)
    group.add(wheel)

    // Rim
    const rimGeom = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.02, 18)
    const rim = new THREE.Mesh(rimGeom, rimMat)
    rim.rotation.x = Math.PI / 2
    rim.position.set(x, radius, z)
    group.add(rim)

    // Wheel nut / hub
    const hubGeom = new THREE.CylinderGeometry(0.06, 0.06, width + 0.04, 8)
    const hub = new THREE.Mesh(hubGeom, new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.1 }))
    hub.rotation.x = Math.PI / 2
    hub.position.set(x, radius, z)
    group.add(hub)

    // Suspension arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(z) * 1.5, 0.03, 0.03), carbonMat)
    arm.position.set(x, radius, z * 0.3)
    arm.rotation.z = Math.atan2(0, Math.abs(z))
    group.add(arm)
  })

  // ── Exhaust ───────────────────────────────────────────────────
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.3, 8), carbonMat)
  exhaust.rotation.x = Math.PI / 2
  exhaust.rotation.z = Math.PI / 8
  exhaust.position.set(-1.55, 0.45, 0)
  group.add(exhaust)

  // ── DRS actuator ─────────────────────────────────────────────
  const drs = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.4), carbonMat)
  drs.position.set(-1.78, 0.76, 0)
  group.add(drs)

  // Cast shadows
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  return group
}

function createSpeedLines(count: number): THREE.Points {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30
    positions[i * 3 + 1] = (Math.random() - 0.8) * 4
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({ color: '#ffffff', size: 0.04, transparent: true, opacity: 0.3 })
  return new THREE.Points(geo, mat)
}

export default function HeroScene({ teamColor = '#E8002D' }: HeroSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    car: THREE.Group
    speedLines: THREE.Points
    teamLight: THREE.PointLight
    animId: number
    t: number
  } | null>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog('#050508', 20, 50)

    // Camera — side angle shot
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.set(0, 3.5, 9)
    camera.lookAt(0, 0.5, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    mount.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight('#ffffff', 0.3)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight('#fff5e0', 2.5)
    sun.position.set(5, 8, 3)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 30
    sun.shadow.camera.left = -8
    sun.shadow.camera.right = 8
    sun.shadow.camera.top = 6
    sun.shadow.camera.bottom = -6
    scene.add(sun)

    const rimLight = new THREE.DirectionalLight('#4466ff', 1.2)
    rimLight.position.set(-5, 3, -4)
    scene.add(rimLight)

    // Team colour glow under car
    const teamLight = new THREE.PointLight(teamColor, 4, 4)
    teamLight.position.set(0, 0.3, 0)
    scene.add(teamLight)

    // Headlight-style front
    const frontLight = new THREE.SpotLight('#ffffff', 3, 10, Math.PI / 8, 0.5)
    frontLight.position.set(4, 2, 0)
    scene.add(frontLight)

    // Track surface
    const trackGeo = new THREE.PlaneGeometry(60, 5)
    const trackMat = new THREE.MeshStandardMaterial({ color: '#1a1a1f', metalness: 0.1, roughness: 0.95 })
    const track = new THREE.Mesh(trackGeo, trackMat)
    track.rotation.x = -Math.PI / 2
    track.receiveShadow = true
    scene.add(track)

    // Racing line (white strip)
    const lineGeo = new THREE.PlaneGeometry(60, 0.12)
    const lineMat = new THREE.MeshStandardMaterial({ color: '#ffffff', opacity: 0.15, transparent: true })
    const racingLine = new THREE.Mesh(lineGeo, lineMat)
    racingLine.rotation.x = -Math.PI / 2
    racingLine.position.y = 0.001
    scene.add(racingLine)

    // Kerb strips at edge of track
    for (let i = -29; i < 30; i += 2) {
      const kerbMat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? '#cc0000' : '#ffffff' })
      const kerb = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.02, 0.3), kerbMat)
      kerb.position.set(i, 0.01, 2.3)
      scene.add(kerb)
      const kerbR = kerb.clone()
      kerbR.position.z = -2.3
      scene.add(kerbR)
    }

    // Speed line particles
    const speedLines = createSpeedLines(300)
    scene.add(speedLines)

    // F1 Car
    const car = buildF1Car(teamColor)
    car.position.set(10, 0, 0)
    car.rotation.y = Math.PI / 2 // Face the direction of travel (along -X)
    scene.add(car)

    let t = 0

    function animate() {
      const id = requestAnimationFrame(animate)
      sceneRef.current!.animId = id
      t += 0.016

      // Car drives from right (+X) to left (-X)
      const speed = 8
      const x = 10 - ((t * speed) % 22)
      car.position.x = x

      // Wheels spin
      car.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const geom = child.geometry
          if (geom instanceof THREE.CylinderGeometry && geom.parameters.radiusTop > 0.15) {
            child.rotation.y += 0.15
          }
        }
      })

      // Subtle body roll / bounce
      car.position.y = Math.sin(t * 12) * 0.01
      car.rotation.z = Math.sin(t * 8) * 0.005

      // Team glow follows car
      teamLight.position.x = car.position.x

      // Speed lines drift
      const posAttr = speedLines.geometry.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < posAttr.count; i++) {
        let px = posAttr.getX(i) - 0.15
        if (px < -15) px = 15
        posAttr.setX(i, px)
      }
      posAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    sceneRef.current = { renderer, scene, camera, car, speedLines, teamLight, animId: 0, t: 0 }
    sceneRef.current.t = 0

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(sceneRef.current?.animId ?? 0)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [teamColor])

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ background: 'transparent' }}
    />
  )
}
