"use client"

import type React from "react"

import { createContext, useContext, useRef, useCallback, useState, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface SceneState {
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null
  controls: OrbitControls | null
  model: THREE.Object3D | null
  updateThirdPersonCamera?: () => void
}

interface Transform {
  translation?: {
    x: number
    y: number
    z: number
  }
  rotation?: {
    x: number
    y: number
    z: number
    w: number
  }
}

interface PlaybackSceneContextType {
  sceneState: SceneState
  transform: Transform
  fps: number
  initScene: (container: HTMLDivElement) => void
  disposeScene: () => void
  moveForward: (distance: number) => void
  moveBackward: (distance: number) => void
  moveLeft: (distance: number) => void
  moveRight: (distance: number) => void
  rotateLeft: (angle: number) => void
  rotateRight: (angle: number) => void
  setPosition: (x: number, y: number, z: number) => void
  setRotation: (x: number, y: number, z: number) => void
  setQuaternion: (x: number, y: number, z: number, w: number) => void
  loadModel: (objContent: string, transform?: Transform | null) => Promise<void>
  viewMode: "orbit" | "third-person"
  setViewMode: (mode: "orbit" | "third-person") => void
  focusCamera: () => void
}

const PlaybackSceneContext = createContext<PlaybackSceneContextType | null>(null)

export function usePlaybackScene() {
  const context = useContext(PlaybackSceneContext)
  if (!context) {
    throw new Error("usePlaybackScene must be used within a PlaybackSceneProvider")
  }
  return context
}

interface PlaybackSceneProviderProps {
  children: React.ReactNode
}

export function PlaybackSceneProvider({ children }: PlaybackSceneProviderProps) {
  const [transform, setTransform] = useState<Transform>({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    quaternion: new THREE.Quaternion(),
  })
  const [fps, setFps] = useState(0)
  const [viewMode, setViewMode] = useState<"orbit" | "third-person">("third-person")

  const sceneStateRef = useRef<SceneState>({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    model: null,
  })

  const fpsCounterRef = useRef({
    frames: 0,
    lastTime: performance.now(),
  })

  const animationFrameRef = useRef<number>()

  const updateTransform = useCallback(() => {
    if (sceneStateRef.current.model) {
      setTransform({
        position: sceneStateRef.current.model.position.clone(),
        rotation: sceneStateRef.current.model.rotation.clone(),
        quaternion: sceneStateRef.current.model.quaternion.clone(),
      })
    }
  }, [])

  const animate = useCallback(() => {
    const { renderer, scene, camera, controls, updateThirdPersonCamera } = sceneStateRef.current
    if (!renderer || !scene || !camera) return

    animationFrameRef.current = requestAnimationFrame(animate)

    // Update FPS counter
    fpsCounterRef.current.frames++
    const now = performance.now()
    if (now - fpsCounterRef.current.lastTime >= 1000) {
      setFps(Math.round((fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime)))
      fpsCounterRef.current.frames = 0
      fpsCounterRef.current.lastTime = now
    }

    // Update third-person camera if active
    if (updateThirdPersonCamera) {
      updateThirdPersonCamera()
    }

    // Update controls only if they're enabled
    if (controls?.enabled) {
      controls.update()
    }

    renderer.render(scene, camera)
    updateTransform()
  }, [updateTransform])

  const initScene = useCallback(
    (container: HTMLDivElement) => {
      // Setup scene
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf0f0f0)

      // Setup camera
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
      camera.position.z = 5

      // Setup renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(container.clientWidth, container.clientHeight)
      container.innerHTML = ""
      container.appendChild(renderer.domElement)

      // Setup controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
      directionalLight.position.set(0, 1, 0)
      scene.add(directionalLight)

      // Add grid helper
      const gridHelper = new THREE.GridHelper(100, 100)
      scene.add(gridHelper)

      // Add axes helper
      const axesHelper = new THREE.AxesHelper(5)
      scene.add(axesHelper)

      // Store references
      sceneStateRef.current = {
        scene,
        camera,
        renderer,
        controls,
        model: null,
      }

      // Start animation loop
      animate()

      // Handle window resize
      const handleResize = () => {
        if (!camera || !renderer) return
        camera.aspect = container.clientWidth / container.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.clientWidth, container.clientHeight)
      }
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
      }
    },
    [animate],
  )

  const disposeScene = useCallback(() => {
    const { scene, renderer, controls, model } = sceneStateRef.current

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (model) {
      scene?.remove(model)
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material instanceof THREE.Material) {
            child.material.dispose()
          } else if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose())
          }
        }
      })
    }

    renderer?.dispose()
    controls?.dispose()
    scene?.clear()

    sceneStateRef.current = {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      model: null,
    }
  }, [])

  const loadModel = useCallback(
    async (objContent: string) => {
      const { scene } = sceneStateRef.current
      if (!scene) return

      // Remove existing model if any
      if (sceneStateRef.current.model) {
        scene.remove(sceneStateRef.current.model)
        sceneStateRef.current.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (child.material instanceof THREE.Material) {
              child.material.dispose()
            } else if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose())
            }
          }
        })
      }

      // Create blob URL from OBJ content
      const blob = new Blob([objContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)

      try {
        const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader")
        const loader = new OBJLoader()
        const object = await new Promise<THREE.Group>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject)
        })

        // Center the model
        const box = new THREE.Box3().setFromObject(object)
        const center = box.getCenter(new THREE.Vector3())
        object.position.sub(center)

        // Apply default transform
        object.position.set(0.26805, 0, 1.70
        object.quaternion.set(0, 0.46174857461019, 0, 0.8870108532850403)

        // Add default material if none exists
        object.traverse((child) => {
          if (child instanceof THREE.Mesh && !child.material) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x808080,
              metalness: 0.5,
              roughness: 0.5,
            })
          }
        })

        // Add model to scene
        scene.add(object)
        sceneStateRef.current.model = object
        updateTransform()
      } catch (error) {
        console.error("Error loading model:", error)
      } finally {
        URL.revokeObjectURL(url)
      }
    },
    [updateTransform],
  )

  const moveForward = useCallback(
    (distance: number) => {
      if (!sceneStateRef.current.model) return
      const direction = new THREE.Vector3(0, 0, -1)
      direction.applyQuaternion(sceneStateRef.current.model.quaternion)
      sceneStateRef.current.model.position.add(direction.multiplyScalar(distance))
      updateTransform()
    },
    [updateTransform],
  )

  const moveBackward = useCallback(
    (distance: number) => {
      if (!sceneStateRef.current.model) return
      const direction = new THREE.Vector3(0, 0, 1)
      direction.applyQuaternion(sceneStateRef.current.model.quaternion)
      sceneStateRef.current.model.position.add(direction.multiplyScalar(distance))
      updateTransform()
    },
    [updateTransform],
  )

  const moveLeft = useCallback(
    (distance: number) => {
      if (!sceneStateRef.current.model) return
      const direction = new THREE.Vector3(-1, 0, 0)
      direction.applyQuaternion(sceneStateRef.current.model.quaternion)
      sceneStateRef.current.model.position.add(direction.multiplyScalar(distance))
      updateTransform()
    },
    [updateTransform],
  )

  const moveRight = useCallback(
    (distance: number) => {
      if (!sceneStateRef.current.model) return
      const direction = new THREE.Vector3(1, 0, 0)
      direction.applyQuaternion(sceneStateRef.current.model.quaternion)
      sceneStateRef.current.model.position.add(direction.multiplyScalar(distance))
      updateTransform()
    },
    [updateTransform],
  )

  const rotateLeft = useCallback(
    (angle: number) => {
      if (!sceneStateRef.current.model) return
      sceneStateRef.current.model.rotateY(angle)
      updateTransform()
    },
    [updateTransform],
  )

  const rotateRight = useCallback(
    (angle: number) => {
      if (!sceneStateRef.current.model) return
      sceneStateRef.current.model.rotateY(-angle)
      updateTransform()
    },
    [updateTransform],
  )

  const setPosition = useCallback(
    (x: number, y: number, z: number) => {
      if (!sceneStateRef.current.model) return
      sceneStateRef.current.model.position.set(x, y, z)
      updateTransform()
    },
    [updateTransform],
  )

  const setRotation = useCallback(
    (x: number, y: number, z: number) => {
      if (!sceneStateRef.current.model) return
      sceneStateRef.current.model.rotation.set(x, y, z)
      updateTransform()
    },
    [updateTransform],
  )

  const setQuaternion = useCallback(
    (x: number, y: number, z: number, w: number) => {
      if (!sceneStateRef.current.model) return
      sceneStateRef.current.model.quaternion.set(x, y, z, w)
      updateTransform()
    },
    [updateTransform],
  )

  const focusCamera = useCallback(() => {
    const { camera, model } = sceneStateRef.current
    if (!camera || !model) return

    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    // Calculate camera position based on view mode
    if (viewMode === "third-person") {
      // Third-person camera setup
      const distance = 3
      const height = 1.5
      const direction = new THREE.Vector3(0, 0, -1)
      direction.applyQuaternion(model.quaternion)
      const offset = direction.multiplyScalar(-distance)
      offset.y = height
      camera.position.copy(model.position).add(offset)

      const lookAtPoint = model.position.clone()
      lookAtPoint.y += 0.5
      camera.lookAt(lookAtPoint)
    } else {
      // Orbit camera setup
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = camera.fov * (Math.PI / 180)
      const cameraZ = Math.abs(maxDim / Math.sin(fov / 2))
      camera.position.set(0, 0, cameraZ * 1.5)
      camera.lookAt(center)
    }

    camera.updateProjectionMatrix()
  }, [viewMode])

  useEffect(() => {
    return () => {
      disposeScene()
    }
  }, [disposeScene])

  useEffect(() => {
    if (!sceneStateRef.current.camera || !sceneStateRef.current.model) return

    const { controls } = sceneStateRef.current

    if (viewMode === "third-person") {
      // Disable OrbitControls in third-person mode
      if (controls) {
        controls.enabled = false
      }

      // Focus camera once when switching to third-person
      focusCamera()

      // Create a function to update camera position
      const updateCamera = () => {
        if (!sceneStateRef.current.model || !sceneStateRef.current.camera) return

        const { model, camera } = sceneStateRef.current
        const distance = 3
        const height = 1.5

        const direction = new THREE.Vector3(0, 0, -1)
        direction.applyQuaternion(model.quaternion)
        const offset = direction.multiplyScalar(-distance)
        offset.y = height
        const targetPosition = model.position.clone().add(offset)
        camera.position.copy(targetPosition)

        const lookAtPoint = model.position.clone()
        lookAtPoint.y += 0.5
        camera.lookAt(lookAtPoint)
      }

      // Store the update function for the animation loop
      sceneStateRef.current.updateThirdPersonCamera = updateCamera
    } else {
      // Re-enable OrbitControls in orbit mode
      if (controls) {
        controls.enabled = true
      }

      // Focus camera once when switching to orbit mode
      focusCamera()

      // Remove the update function
      sceneStateRef.current.updateThirdPersonCamera = undefined
    }

    return () => {
      sceneStateRef.current.updateThirdPersonCamera = undefined
    }
  }, [viewMode, focusCamera])

  const value = {
    sceneState: sceneStateRef.current,
    transform,
    fps,
    initScene,
    disposeScene,
    moveForward,
    moveBackward,
    moveLeft,
    moveRight,
    rotateLeft,
    rotateRight,
    setPosition,
    setRotation,
    setQuaternion,
    loadModel,
    viewMode,
    setViewMode,
    focusCamera,
  }

  return <PlaybackSceneContext.Provider value={value}>{children}</PlaybackSceneContext.Provider>
}

