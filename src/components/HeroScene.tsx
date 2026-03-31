'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface HeroSceneProps {
  teamColor?: string
}

const TEAM_COLORS = ['#E8002D', '#FF8000', '#3671C6', '#27F4D2', '#229971']

function createF1Car(color: number): THREE.Group {
  const g = new THREE.Group()
  const mat = (c: number, emissive: number, ei: number) =>
    new THREE.MeshStandardMaterial({ color: c, metalness: 0.9, roughness: 0.1, emissive, emissiveIntensity: ei })

  // Main body — long low wedge
  const body = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.5, 1.4), mat(color, color, 0.8))
  body.position.set(0, 0.5, 0)
  body.castShadow = true
  g.add(body)

  // Nose — tapered cone
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.2, 6), mat(color, color, 0.6))
  nose.rotation.z = -Math.PI / 2
  nose.position.set(-3.4, 0.45, 0)
  g.add(nose)

  // Cockpit halo
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.9), mat(0x111111, 0x000000, 0))
  cockpit.position.set(-0.3, 0.95, 0)
  g.add(cockpit)

  // Front wing
  const fw = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 2.6), mat(color, color, 0.5))
  fw.position.set(-2.6, 0.2, 0)
  g.add(fw)

  // Front wing endplates
  for (const side of [-1, 1]) {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.06), mat(color, color, 0.4))
    ep.position.set(-2.6, 0.25, side * 1.3)
    g.add(ep)
  }

  // Rear wing main plane
  const rw = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 2.0), mat(color, color, 0.6))
  rw.position.set(2.3, 1.1, 0)
  g.add(rw)

  // Rear wing endplates
  for (const side of [-1, 1]) {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.06), mat(color, color, 0.4))
    ep.position.set(2.3, 1.0, side * 1.0)
    g.add(ep)
  }

  // Sidepods
  for (const side of [-1, 1]) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.5), mat(color, color, 0.3))
    sp.position.set(0.2, 0.55, side * 0.9)
    g.add(sp)
  }

  // Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.6 })
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 12)
  const positions = [[-1.6, 0.42, 1.0], [-1.6, 0.42, -1.0], [1.5, 0.42, 1.0], [1.5, 0.42, -1.0]]
  for (const [x, y, z] of positions) {
    const w = new THREE.Mesh(wheelGeo, wheelMat)
    w.rotation.x = Math.PI / 2
    w.position.set(x, y, z)
    w.castShadow = true
    g.add(w)
  }

  // Underbody glow
  const glow = new THREE.PointLight(color, 2.5, 12)
  glow.position.set(0, 0.1, 0)
  g.add(glow)

  return g
}

export default function HeroScene({ teamColor = '#E8002D' }: HeroSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const w = mount.clientWidth, h = mount.clientHeight

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050508)
    scene.fog = new THREE.FogExp2(0x050508, 0.006)

    // Camera — low dramatic angle, looking slightly up
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 600)
    camera.position.set(0, 3.5, 18)
    camera.lookAt(0, 2, -20)

    // Lights
    scene.add(new THREE.AmbientLight(0x111122, 1.5))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
    keyLight.position.set(30, 40, 20)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0xff4466, 1.2)
    rimLight.position.set(-20, 10, -30)
    scene.add(rimLight)
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.8)
    fillLight.position.set(-30, 20, 10)
    scene.add(fillLight)

    // Ground — reflective wet tarmac
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 200),
      new THREE.MeshStandardMaterial({
        color: 0x0a0a12,
        metalness: 0.85,
        roughness: 0.15,
        emissive: 0x050510,
        emissiveIntensity: 0.5,
      })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Track white lines
    for (const z of [-4, 4]) {
      const lineGeo = new THREE.PlaneGeometry(500, 0.08)
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x333344, transparent: true, opacity: 0.5 })
      const line = new THREE.Mesh(lineGeo, lineMat)
      line.rotation.x = -Math.PI / 2
      line.position.set(0, 0.01, z)
      scene.add(line)
    }

    // Speed line particles — thin horizontal streaks in background
    const SPEED_LINE_COUNT = 200
    const speedBuf = new Float32Array(SPEED_LINE_COUNT * 3)
    const speedVel = new Float32Array(SPEED_LINE_COUNT)
    for (let i = 0; i < SPEED_LINE_COUNT; i++) {
      speedBuf[i * 3] = (Math.random() - 0.5) * 300
      speedBuf[i * 3 + 1] = Math.random() * 15 + 0.5
      speedBuf[i * 3 + 2] = (Math.random() - 0.5) * 80
      speedVel[i] = 1.5 + Math.random() * 3
    }
    const speedGeo = new THREE.BufferGeometry()
    speedGeo.setAttribute('position', new THREE.BufferAttribute(speedBuf, 3))
    const speedMat = new THREE.PointsMaterial({ color: 0x334466, size: 0.15, transparent: true, opacity: 0.4 })
    scene.add(new THREE.Points(speedGeo, speedMat))

    // Cars setup
    interface CarState {
      group: THREE.Group
      speed: number
      x: number
      lane: number
      colorIdx: number
      trail: THREE.Points
      trailPositions: Float32Array
    }

    const cars: CarState[] = []
    const CAR_COUNT = 5
    const TRAIL_LEN = 300

    for (let i = 0; i < CAR_COUNT; i++) {
      const colorIdx = i % TEAM_COLORS.length
      const hex = parseInt(TEAM_COLORS[colorIdx].replace('#', ''), 16)
      const car = createF1Car(hex)
      const lane = (i - 2) * 2.2
      const startX = -120 - i * 45
      car.position.set(startX, 0, lane)
      car.rotation.y = -Math.PI / 2  // face right
      scene.add(car)

      // Trail particles
      const tBuf = new Float32Array(TRAIL_LEN * 3)
      for (let j = 0; j < TRAIL_LEN; j++) {
        tBuf[j * 3] = startX + j * 0.5
        tBuf[j * 3 + 1] = 0.3
        tBuf[j * 3 + 2] = lane
      }
      const tGeo = new THREE.BufferGeometry()
      tGeo.setAttribute('position', new THREE.BufferAttribute(tBuf, 3))
      const tMat = new THREE.PointsMaterial({
        color: hex,
        size: 0.12,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
      })
      const trail = new THREE.Points(tGeo, tMat)
      scene.add(trail)

      cars.push({
        group: car,
        speed: 1.8 + Math.random() * 0.7,
        x: startX,
        lane,
        colorIdx,
        trail,
        trailPositions: tBuf,
      })
    }

    // Spark particles pool
    const SPARK_COUNT = 80
    const sparkBuf = new Float32Array(SPARK_COUNT * 3)
    const sparkVel = new Float32Array(SPARK_COUNT * 3)
    const sparkLife = new Float32Array(SPARK_COUNT)
    for (let i = 0; i < SPARK_COUNT; i++) sparkLife[i] = 0
    const sparkGeo = new THREE.BufferGeometry()
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkBuf, 3))
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffaa44,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    })
    scene.add(new THREE.Points(sparkGeo, sparkMat))
    let sparkHead = 0

    function emitSpark(x: number, y: number, z: number) {
      const i = sparkHead % SPARK_COUNT
      sparkBuf[i * 3] = x
      sparkBuf[i * 3 + 1] = y
      sparkBuf[i * 3 + 2] = z
      sparkVel[i * 3] = (Math.random() - 0.3) * 0.3
      sparkVel[i * 3 + 1] = Math.random() * 0.15
      sparkVel[i * 3 + 2] = (Math.random() - 0.5) * 0.2
      sparkLife[i] = 1.0
      sparkHead++
    }

    // Animation
    const clock = new THREE.Clock()
    let animId = 0

    function animate() {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const dt = clock.getDelta() || 0.016

      // Update cars
      for (const car of cars) {
        car.x += car.speed * 1.5
        car.group.position.x = car.x
        car.group.position.y = Math.sin(t * 3 + car.colorIdx) * 0.02 // subtle bounce

        // Loop when off screen
        if (car.x > 160) {
          car.x = -160
          car.speed = 1.8 + Math.random() * 0.7
        }

        // Update trail — shift and add new point at car position
        const tp = car.trailPositions
        for (let j = TRAIL_LEN - 1; j > 0; j--) {
          tp[j * 3] = tp[(j - 1) * 3]
          tp[j * 3 + 1] = tp[(j - 1) * 3 + 1]
          tp[j * 3 + 2] = tp[(j - 1) * 3 + 2]
        }
        tp[0] = car.x
        tp[1] = 0.25 + Math.random() * 0.05
        tp[2] = car.lane + (Math.random() - 0.5) * 0.1
        car.trail.geometry.attributes.position.needsUpdate = true

        // Emit sparks from underside
        if (Math.random() < 0.15) {
          emitSpark(car.x + (Math.random() - 0.5) * 2, 0.1, car.lane + (Math.random() - 0.5) * 0.8)
        }
      }

      // Update sparks
      for (let i = 0; i < SPARK_COUNT; i++) {
        if (sparkLife[i] > 0) {
          sparkBuf[i * 3] += sparkVel[i * 3]
          sparkBuf[i * 3 + 1] += sparkVel[i * 3 + 1]
          sparkBuf[i * 3 + 2] += sparkVel[i * 3 + 2]
          sparkVel[i * 3 + 1] -= 0.005 // gravity
          sparkLife[i] -= 0.025
          if (sparkLife[i] <= 0) {
            sparkBuf[i * 3 + 1] = -100 // hide
          }
        }
      }
      sparkGeo.attributes.position.needsUpdate = true

      // Update speed lines
      const sp = speedGeo.attributes.position.array as Float32Array
      for (let i = 0; i < SPEED_LINE_COUNT; i++) {
        sp[i * 3] -= speedVel[i]
        if (sp[i * 3] < -150) sp[i * 3] = 150
      }
      speedGeo.attributes.position.needsUpdate = true

      // Camera — subtle cinematic movement
      camera.position.x = Math.sin(t * 0.15) * 3
      camera.position.y = 3.5 + Math.sin(t * 0.25) * 0.5
      camera.position.z = 18 + Math.sin(t * 0.1) * 2
      camera.lookAt(Math.sin(t * 0.1) * 5, 1.5, -15)

      renderer.render(scene, camera)
    }

    animate()

    function onResize() {
      if (!mountRef.current) return
      const nw = mountRef.current.clientWidth, nh = mountRef.current.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
          else (obj.material as THREE.Material).dispose()
        }
      })
      renderer.dispose()
    }
  }, [teamColor])

  return <div ref={mountRef} className="w-full h-full" />
}
