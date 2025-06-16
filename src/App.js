import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

const App = () => {
    // Reference to the canvas element where the 3D scene will be rendered
    const mountRef = useRef(null);

    // State for scene elements to be accessed across re-renders
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    // State to keep track of the number of shapes and their references
    const [shapes, setShapes] = useState([]);
    const shapeMeshesRef = useRef([]); // To hold actual Three.js mesh objects

    // Mouse interaction variables (simplified as automatic rotation is preferred)
    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });

    // Function to handle window resizing for responsiveness
    const handleResize = useCallback(() => {
        if (cameraRef.current && rendererRef.current) {
            // For a standard web view, adjust to full window size.
            // In VR, the renderer will manage its own size/aspect ratio based on the headset.
            if (!rendererRef.current.xr.isPresenting) { // Only resize if not in VR
                const width = window.innerWidth;
                const height = window.innerHeight;
                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(width, height);
            }
        }
    }, []);

    // Function to enter VR session
    const enterVR = useCallback(async () => {
        if (!rendererRef.current) {
            console.error("Renderer not initialized.");
            return;
        }

        if (navigator.xr) {
            try {
                const session = await navigator.xr.requestSession('immersive-vr', {
                    requiredFeatures: ['local-floor', 'viewer']
                });

                rendererRef.current.xr.setSession(session);

                // Set the animation loop for VR
                rendererRef.current.setAnimationLoop(() => {
                    // In VR, the camera position and rotation are handled by the XR device.
                    // We only need to animate our shapes.
                    shapeMeshesRef.current.forEach(shape => {
                        shape.rotation.x += 0.005;
                        shape.rotation.y += 0.005;
                    });
                    rendererRef.current.render(sceneRef.current, cameraRef.current);
                });

                // Listen for session end
                session.addEventListener('end', () => {
                    console.log("VR session ended.");
                    // Reset to standard animation loop
                    rendererRef.current.setAnimationLoop(null);
                    // Re-enable browser-based animation loop
                    const animateNonVR = () => {
                        requestAnimationFrame(animateNonVR);
                        shapeMeshesRef.current.forEach(shape => {
                            if (!isDragging.current) { // Only auto-rotate if not dragging
                                shape.rotation.x += 0.005;
                                shape.rotation.y += 0.005;
                            }
                        });
                        rendererRef.current.render(sceneRef.current, cameraRef.current);
                    };
                    animateNonVR();
                    handleResize(); // Adjust canvas size back to browser view
                });

            } catch (error) {
                console.error("Failed to enter VR:", error);
                alert("VR not supported or session failed: " + error.message); // Using alert for now, can replace with custom modal
            }
        } else {
            console.warn("WebXR not available.");
            alert("WebXR not supported in this browser or device."); // Using alert for now
        }
    }, [handleResize]);

    // Function to add a new shape
    const addShape = useCallback(() => {
        if (!sceneRef.current) return;

        const index = shapes.length;
        const geometry = new THREE.BoxGeometry(1, 1, 1); // Smaller box for multiple shapes
        const material = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff, // Random color for each new shape
            roughness: 0.5,
            metalness: 0.5
        });
        const newShape = new THREE.Mesh(geometry, material);

        // Position the new shape next to the others
        // We'll arrange them in a row along the X-axis
        const spacing = 1.5; // Space between shapes
        const startX = -((index * spacing) / 2); // Initial offset to center the group
        newShape.position.set(startX + (index * spacing), 0, 0);

        sceneRef.current.add(newShape);
        shapeMeshesRef.current.push(newShape); // Add to the ref for managing meshes
        setShapes(prevShapes => [...prevShapes, { id: Date.now(), mesh: newShape }]); // Add to state for re-render if needed
    }, [shapes.length]); // Re-create if shapes.length changes

    // Effect for setting up the Three.js scene (runs once on mount)
    useEffect(() => {
        const initialMountPoint = mountRef.current;
        const currentRendererInstance = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = currentRendererInstance;
        const canvasElement = currentRendererInstance.domElement;

        currentRendererInstance.xr.enabled = true; // Enable WebXR in the renderer

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x1a1a2e); // Darker background

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current = camera;
        camera.position.z = 5;

        if (initialMountPoint) {
            initialMountPoint.appendChild(canvasElement);
            handleResize(); // Initial resize to fit the full window
        }

        // Add initial shape
        addShape();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5).normalize();
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, -5, -5).normalize();
        scene.add(directionalLight2);


        // Standard animation loop for non-VR browsing
        const animate = () => {
            requestAnimationFrame(animate);
            shapeMeshesRef.current.forEach(shape => {
                if (!isDragging.current) {
                    shape.rotation.x += 0.005;
                    shape.rotation.y += 0.005;
                }
            });
            currentRendererInstance.render(scene, camera);
        };

        animate();

        // Mouse/Touch interaction listeners for camera control (simplified)
        const onMouseDown = (event) => {
            if (!currentRendererInstance.xr.isPresenting) {
                isDragging.current = true;
                previousMousePosition.current = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
        };

        const onMouseUp = () => {
            if (!currentRendererInstance.xr.isPresenting) {
                isDragging.current = false;
            }
        };

        const onMouseMove = (event) => {
            if (!currentRendererInstance.xr.isPresenting && isDragging.current) {
                const deltaMove = {
                    x: event.clientX - previousMousePosition.current.x,
                    y: event.clientY - previousMousePosition.current.y
                };
                // Rotate the whole scene or camera based on mouse movement
                if (sceneRef.current) {
                    sceneRef.current.rotation.y += deltaMove.x * 0.005; // Rotate scene around Y
                    sceneRef.current.rotation.x += deltaMove.y * 0.005; // Rotate scene around X
                }
                previousMousePosition.current = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
        };

        const onTouchStart = (event) => {
            if (!currentRendererInstance.xr.isPresenting && event.touches.length === 1) {
                isDragging.current = true;
                previousMousePosition.current = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }
        };

        const onTouchEnd = () => {
            if (!currentRendererInstance.xr.isPresenting) {
                isDragging.current = false;
            }
        };

        const onTouchMove = (event) => {
            if (!currentRendererInstance.xr.isPresenting && isDragging.current && event.touches.length === 1) {
                const deltaMove = {
                    x: event.touches[0].clientX - previousMousePosition.current.x,
                    y: event.touches[0].clientY - previousMousePosition.current.y
                };
                if (sceneRef.current) {
                    sceneRef.current.rotation.y += deltaMove.x * 0.005;
                    sceneRef.current.rotation.x += deltaMove.y * 0.005;
                }
                previousMousePosition.current = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }
        };

        canvasElement.addEventListener('mousedown', onMouseDown);
        canvasElement.addEventListener('mouseup', onMouseUp);
        canvasElement.addEventListener('mousemove', onMouseMove);
        canvasElement.addEventListener('touchstart', onTouchStart);
        canvasElement.addEventListener('touchend', onTouchEnd);
        canvasElement.addEventListener('touchmove', onTouchMove);

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            if (initialMountPoint && canvasElement.parentNode === initialMountPoint) {
                initialMountPoint.removeChild(canvasElement);
            }

            canvasElement.removeEventListener('mousedown', onMouseDown);
            canvasElement.removeEventListener('mouseup', onMouseUp);
            canvasElement.removeEventListener('mousemove', onMouseMove);
            canvasElement.removeEventListener('touchstart', onTouchStart);
            canvasElement.removeEventListener('touchend', onTouchEnd);
            canvasElement.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('resize', handleResize);

            // Dispose Three.js objects
            if (sceneRef.current) {
                // Iterate over all actual mesh objects stored in the ref
                shapeMeshesRef.current.forEach(object => {
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach((material) => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                    sceneRef.current.remove(object); // Remove from scene
                });
                shapeMeshesRef.current = []; // Clear the ref
            }

            if (currentRendererInstance) {
                currentRendererInstance.setAnimationLoop(null); // Stop any active animation loop
                currentRendererInstance.dispose();
            }
        };
    }, []); // Empty dependency array means this effect runs once on mount

    // Effect to update positions if shapes change (though addShape already handles positioning)
    // This is more for re-centering if a shape were removed or reordered
    useEffect(() => {
        if (sceneRef.current && shapeMeshesRef.current.length > 0) {
            const spacing = 1.5;
            const totalWidth = (shapeMeshesRef.current.length - 1) * spacing;
            const startX = -totalWidth / 2;

            shapeMeshesRef.current.forEach((shape, index) => {
                shape.position.set(startX + (index * spacing), 0, 0);
            });
        }
    }, [shapes.length]); // Re-run if the number of shapes changes


    return (
        <div className="flex flex-col items-center justify-end w-screen h-screen bg-gray-900 font-inter p-4 overflow-hidden relative">
            {/* The 3D canvas container will now fill the entire screen */}
            <div
                ref={mountRef}
                className="absolute inset-0 z-0" // Position absolutely to fill parent and go behind UI
            >
                {/* Three.js content will be appended here */}
            </div>

            {/* UI elements (buttons) placed on top of the 3D scene */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 mb-4">
                <button
                    onClick={addShape}
                    className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-full hover:bg-teal-700 transition-colors duration-200 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75"
                    style={{
                        background: 'linear-gradient(45deg, #2b8a78, #3de0c2)',
                        border: '2px solid #1a5a4d',
                        boxShadow: '0 5px 15px rgba(0, 204, 153, 0.4)'
                    }}
                >
                    Add Another Shape
                </button>
                <button
                    onClick={enterVR}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors duration-200 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
                    style={{
                        background: 'linear-gradient(45deg, #7c3aed, #a78bfa)',
                        border: '2px solid #5a2e9b',
                        boxShadow: '0 5px 15px rgba(124, 58, 237, 0.4)'
                    }}
                >
                    Enter VR
                </button>
            </div>
        </div>
    );
};

export default App;
