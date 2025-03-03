"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface Model3D {
  objContent: string | null
  isConverting: boolean
}

interface OBJViewerSceneProps {
  model: Model3D
  className?: string
}

export function OBJViewerScene({ model, className }: OBJViewerSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    model?: THREE.Object3D
    animationFrameId?: number
  }>()

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    // Setup scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.innerHTML = ""
    containerRef.current.appendChild(renderer.domElement)

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

    // Store references
    sceneRef.current = { scene, camera, renderer, controls }

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (sceneRef.current?.animationFrameId) {
        cancelAnimationFrame(sceneRef.current.animationFrameId)
      }
      renderer.dispose()
      controls.dispose()
      scene.clear()
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current) return

    const animate = () => {
      const { scene, camera, renderer, controls } = sceneRef.current!
      sceneRef.current!.animationFrameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (sceneRef.current?.animationFrameId) {
        cancelAnimationFrame(sceneRef.current.animationFrameId)
      }
    }
  }, [])

  // Load OBJ model when content changes
  useEffect(() => {
    if (!sceneRef.current || !model.objContent) {
      // If no model content, just show an empty scene
      if (sceneRef.current) {
        const { scene, camera, renderer } = sceneRef.current
        renderer.render(scene, camera)
      }
      return
    }

    const { scene, camera } = sceneRef.current

    // Remove previous model if it exists
    if (sceneRef.current.model) {
      scene.remove(sceneRef.current.model)
      sceneRef.current.model.traverse((child) => {
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
    const blob = new Blob([model.objContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    // Load new model
    const loader = new OBJLoader()
    loader.load(
      url,
      (object) => {
        // Center the model
        const box = new THREE.Box3().setFromObject(object)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        object.position.sub(center)

        // Adjust camera to fit model
        const maxDim = Math.max(size.x, size.y, size.z)
        const fov = camera.fov * (Math.PI / 180)
        const cameraZ = Math.abs(maxDim / Math.sin(fov / 2))
        camera.position.z = cameraZ * 1.5

        // Add some default material if none exists
        object.traverse((child) => {
          if (child instanceof THREE.Mesh && !child.material) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x808080,
              metalness: 0.5,
              roughness: 0.5,
            })
          }
        })

        camera.updateProjectionMatrix()

        // Add model to scene
        scene.add(object)
        sceneRef.current!.model = object
      },
      undefined,
      (error) => {
        console.error("Error loading OBJ:", error)
      },
    )

    // Cleanup
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [model.objContent])

  if (model.isConverting) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        <p className="text-muted-foreground">Loading 3D model...</p>
      </div>
    )
  }

  if (!model.objContent) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        <p className="text-muted-foreground">No 3D model available</p>
      </div>
    )
  }

  return <div ref={containerRef} className={className} />
}

