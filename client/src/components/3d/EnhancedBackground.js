import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Text3D, OrbitControls, useGLTF, PerspectiveCamera, useTexture, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
// Remove or comment if not used directly
// import { gsap } from 'gsap';

// Interactive Particles Component
const ParticleField = ({ count = 1000 }) => {
  const { viewport, mouse } = useThree();
  const particlesRef = useRef();
  const [initialized, setInitialized] = useState(false);
  
  // Optimize with useMemo for the buffer attributes
  const particleAttributes = useMemo(() => {
    // Create position, color and size arrays
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    // Fill with random values
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 15;
      positions[i3 + 1] = (Math.random() - 0.5) * 15;
      positions[i3 + 2] = (Math.random() - 0.5) * 15;
      
      // Color
      colors[i3] = Math.random() * 0.5 + 0.5;
      colors[i3 + 1] = Math.random() * 0.3 + 0.3;
      colors[i3 + 2] = Math.random() * 0.5 + 0.5;
      
      // Size
      sizes[i] = Math.random() * 2;
    }
    
    return { positions, colors, sizes };
  }, [count]);
  
  // Initialize particles with proper buffer attributes
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const { positions, colors, sizes } = particleAttributes;
    
    // Create buffer attributes
    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Mark as initialized
    setInitialized(true);
  }, [particleAttributes]);
  
  // Update particles in animation loop with proper safety checks
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    
    // Make sure particles and geometry exist
    if (!particlesRef.current || !initialized) return;
    
    // Update rotation
    particlesRef.current.rotation.x = elapsedTime * 0.05;
    particlesRef.current.rotation.y = elapsedTime * 0.075;
    
    // Get position attribute with safety check
    const positionAttr = particlesRef.current.geometry.attributes.position;
    if (!positionAttr || !positionAttr.array) return;
    
    const positions = positionAttr.array;
    const mouseX = (mouse.x * viewport.width) / 2;
    const mouseY = (mouse.y * viewport.height) / 2;
    
    // Only update every few frames for performance
    if (Math.floor(elapsedTime * 10) % 2 === 0) {
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        
        // Calculate distance from mouse
        const dx = mouseX - x;
        const dy = mouseY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Move particles slightly toward mouse
        if (dist < 3) {
          positions[i3] += dx * 0.01;
          positions[i3 + 1] += dy * 0.01;
        }
      }
      
      positionAttr.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.1}
        sizeAttenuation={true}
        vertexColors={true}
        transparent
        alphaMap={useMemo(() => {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const context = canvas.getContext('2d');
          
          // Create radial gradient
          const gradient = context.createRadialGradient(
            64, 64, 0, 64, 64, 64
          );
          
          // Add colors to gradient
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(0.5, 'rgba(128, 128, 255, 0.4)');
          gradient.addColorStop(1, 'rgba(0, 0, 128, 0)');
          
          // Fill with gradient
          context.fillStyle = gradient;
          context.fillRect(0, 0, 128, 128);
          
          // Create and return texture
          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          return texture;
        }, [])}
        alphaTest={0.001}
        depthWrite={false}
      />
    </points>
  );
};

// 3D Educational Model Component
const EducationalModel = ({ position = [0, 0, 0], scale = 1 }) => {
  const modelRef = useRef();
  const bookRef = useRef();
  const pencilRef = useRef();
  const globeRef = useRef();
  const brainRef = useRef();
  const lightBulbRef = useRef();
  const { mouse } = useThree();
  
  useFrame((state, delta) => {
    // Follow mouse movement slightly
    if (modelRef.current) {
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        mouse.x * 0.5,
        0.05
      );
      modelRef.current.rotation.x = THREE.MathUtils.lerp(
        modelRef.current.rotation.x,
        -mouse.y * 0.2,
        0.05
      );
    }
    
    if (bookRef.current) {
      bookRef.current.rotation.y += delta * 0.5;
      // Pages opening and closing effect
      bookRef.current.children[1].position.y = Math.abs(Math.sin(state.clock.elapsedTime * 0.5)) * 0.3 + 0.2;
      bookRef.current.children[1].rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.3;
      // Pulse effect
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.04;
      globeRef.current.scale.set(scale, scale, scale);
    }
    
    if (pencilRef.current) {
      pencilRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
      // Writing motion
      pencilRef.current.position.x = -2.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      pencilRef.current.position.z = Math.cos(state.clock.elapsedTime * 2) * 0.2;
    }
    
    if (brainRef.current) {
      // Pulsating brain effect
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      brainRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    if (lightBulbRef.current) {
      // Flickering light effect
      lightBulbRef.current.children[1].material.emissiveIntensity = 
        0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.2 + Math.random() * 0.1;
    }
  });

  return (
    <group ref={modelRef} position={position} scale={scale}>
      {/* Book */}
      <group ref={bookRef} position={[0, 0, 0]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.2, 3]} />
          <meshStandardMaterial color="#3050BB" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[2, 0.05, 3]} />
          <meshStandardMaterial color="#4060DD" metalness={0.3} roughness={0.2} />
        </mesh>
        {/* Book pages */}
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[1.8, 0.1, 2.8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        {/* Text lines on pages */}
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, 0.16, -1 + i * 0.5]}>
            <boxGeometry args={[1.4, 0.02, 0.1]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        ))}
      </group>

      {/* Globe */}
      <group ref={globeRef} position={[3, 1.5, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial 
            color="#2563EB" 
            metalness={0.2}
            roughness={0.6}
            emissive="#1E40AF"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.05, 64, 64]} />
          <meshStandardMaterial 
            color="#3B82F6" 
            wireframe={true} 
            transparent 
            opacity={0.3} 
          />
        </mesh>
        {/* Continents */}
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[
            Math.sin(i * Math.PI * 0.4) * 0.8,
            Math.cos(i * Math.PI * 0.4) * 0.8,
            Math.sin(i * Math.PI * 0.6) * 0.8,
          ]}>
            <sphereGeometry args={[0.2 + Math.random() * 0.1, 16, 16]} />
            <meshStandardMaterial color="#10B981" />
          </mesh>
        ))}
      </group>

      {/* Pencil */}
      <group ref={pencilRef} position={[-2.5, 1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 3, 32]} />
          <meshStandardMaterial color="#FDBA74" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
          <coneGeometry args={[0.1, 0.5, 32]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
      
      {/* Brain */}
      <group ref={brainRef} position={[-2, 2.5, 1]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.8, 32, 32]} />
          <MeshDistortMaterial
            color="#EC4899"
            speed={2}
            distort={0.3}
            radius={1}
          />
        </mesh>
        {/* Neurons */}
        {[...Array(15)].map((_, i) => (
          <mesh 
            key={i} 
            position={[
              (Math.random() - 0.5) * 1.8,
              (Math.random() - 0.5) * 1.8,
              (Math.random() - 0.5) * 1.8,
            ]}
            scale={0.08 + Math.random() * 0.05}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial 
              color="#F472B6" 
              emissive="#9D174D"
              emissiveIntensity={0.5} 
            />
          </mesh>
        ))}
        {/* Neuron connections */}
        {[...Array(20)].map((_, i) => (
          <mesh key={i + 'line'}>
            <tubeGeometry 
              args={[
                new THREE.LineCurve3(
                  new THREE.Vector3(
                    (Math.random() - 0.5) * 1.6,
                    (Math.random() - 0.5) * 1.6,
                    (Math.random() - 0.5) * 1.6
                  ),
                  new THREE.Vector3(
                    (Math.random() - 0.5) * 1.6,
                    (Math.random() - 0.5) * 1.6,
                    (Math.random() - 0.5) * 1.6
                  )
                ),
                16,
                0.02,
                8
              ]} 
            />
            <meshStandardMaterial 
              color="#F472B6"
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>
      
      {/* Light Bulb */}
      <group ref={lightBulbRef} position={[2, 2.5, 1.5]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial 
            color="#FBBF24" 
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial 
            color="#FBBF24" 
            emissive="#FBBF24"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Bulb base */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 32]} />
          <meshStandardMaterial color="#78716C" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>      {/* Floating particles */}
      <Stars radius={12} depth={50} count={1000} factor={5} saturation={0.5} fade speed={1.5} />
    </group>
  );
};

const EnhancedBackground = () => {
  // Create a safe texture loader that handles undefined paths
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  
  // Create a material reference to use with textures
  const [backgroundMaterial] = useState(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#3730a3',
      roughness: 0.5,
      metalness: 0.2 
    })
  );
  
  // Safe loading function with error handling
  const loadTextureWithFallback = (path) => {
    // Skip loading if path is undefined
    if (!path) {
      console.warn('Texture path is undefined, using fallback');
      return Promise.resolve(null);
    }
    
    return new Promise((resolve) => {
      textureLoader.load(
        path,
        (texture) => resolve(texture),
        undefined, // onProgress callback is optional
        (error) => {
          console.warn(`Failed to load texture: ${path}`, error);
          resolve(null); // Return null instead of throwing an error
        }
      );
    });
  };

  // Use the texture loader with the defined material
  useEffect(() => {
    // Generate a programmatic background texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1E1B4B');  // Dark indigo
    gradient.addColorStop(1, '#312E81');  // Lighter indigo
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise/stars
    context.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      context.fillRect(x, y, size, size);
    }
    
    // Create and apply texture
    const texture = new THREE.CanvasTexture(canvas);
    backgroundMaterial.map = texture;
    backgroundMaterial.needsUpdate = true;
    
    console.info('Using generated background texture');
  }, [backgroundMaterial]);
  
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 10], fov: 45 }}>
        <color attach="background" args={['#050816']} />
        <fog attach="fog" args={['#050816', 5, 20]} />
        
        <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={45} />
        
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048}
        />
        <pointLight position={[2, 2.5, 1.5]} intensity={1.5} color="#FBBF24" />
        <pointLight position={[-2, 2.5, 1]} intensity={0.5} color="#EC4899" />
        
        <React.Suspense fallback={null}>
          <Float 
            speed={1.5} 
            rotationIntensity={0.2} 
            floatIntensity={0.5}
            floatingRange={[-0.2, 0.2]}
          >
            <EducationalModel position={[0, -1, 0]} scale={0.8} />
          </Float>
          <ParticleField count={800} />
        </React.Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          maxPolarAngle={Math.PI / 2} 
          minPolarAngle={Math.PI / 3} 
          autoRotate={false}
          enableRotate={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
};

// Function to create a particle texture
const createParticleTexture = () => {
  // Create the canvas and context
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  
  // Create and fill the gradient
  const gradient = context.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );
  
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(128, 128, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 128, 0)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Return the texture instead of downloading it
  return new THREE.CanvasTexture(canvas);
  
  // Remove the auto-download code:
  // const dataURL = canvas.toDataURL();
  // const img = new Image();
  // img.src = dataURL;
  // const link = document.createElement('a');
  // link.href = dataURL;
  // link.download = 'particleTexture.png';
  // document.body.appendChild(link);
  // link.click();
  // document.body.removeChild(link);
};

export default EnhancedBackground;
