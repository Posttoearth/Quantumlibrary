import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
// Import WebXR-specific Three.js components if needed, though they are often built-in
// For basic WebXR, Three.js handles much of it internally.

const App = () => {
    const mountRef = useRef(null);
    const [message, setMessage] = useState("Drag your mouse to rotate the object! Click 'Enter VR' for immersion.");

    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const cubeRef = useRef(null);

    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });

    const handleResize = useCallback(() => {
        if (cameraRef.current && rendererRef.current && mountRef.current) {
            // For a standard web view, adjust to container size.
            // In VR, the renderer will manage its own size/aspect ratio based on the headset.
            if (!rendererRef.current.xr.isPresenting) { // Only resize if not in VR
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(width, height);
            }
        }
    }, []);

    // Function to enter VR
    const enterVR = useCallback(async () => {
        if (!rendererRef.current) {
            console.error("Renderer not initialized.");
            return;
        }

        if (navigator.xr) {
            try {
                // Request an immersive-vr session
                const session = await navigator.xr.requestSession('immersive-vr', {
                    // Optional: Request features like 'local-floor' for more robust tracking
                    requiredFeatures: ['local-floor', 'viewer']
                });

                // Set the renderer for XR presentation
                rendererRef.current.xr.setSession(session);
                setMessage("Welcome to VR! Look around with your headset.");

                // Set the animation loop for VR. Three.js takes over the rendering.
                // The animate function will now be called by the XR system at the VR headset's refresh rate.
                rendererRef.current.setAnimationLoop(() => {
                    // In VR, the camera position and rotation are handled by the XR device.
                    // We only need to animate our cube if desired.
                    if (cubeRef.current) {
                        cubeRef.current.rotation.x += 0.005;
                        cubeRef.current.rotation.y += 0.005;
                    }
                    rendererRef.current.render(sceneRef.current, cameraRef.current);
                });

                // Listen for session end
                session.addEventListener('end', () => {
                    setMessage("VR session ended. Back to browser view.");
                    // Reset to standard animation loop
                    rendererRef.current.setAnimationLoop(null);
                    // Re-enable browser-based animation loop
                    const animateNonVR = () => {
                        requestAnimationFrame(animateNonVR);
                        if (!isDragging.current) {
                            if (cubeRef.current) {
                                cubeRef.current.rotation.x += 0.005;
                                cubeRef.current.rotation.y += 0.005;
                            }
                        }
                        rendererRef.current.render(sceneRef.current, cameraRef.current);
                    };
                    animateNonVR();
                    handleResize(); // Adjust canvas size back to browser view
                });

            } catch (error) {
                console.error("Failed to enter VR:", error);
                setMessage("VR not supported or session failed. " + error.message);
            }
        } else {
            setMessage("WebXR not supported in this browser or device.");
            console.warn("WebXR not available.");
        }
    }, [handleResize]); // Added handleResize to dependency array

    // Effect for setting up the Three.js scene
    useEffect(() => {
        const initialMountPoint = mountRef.current;
        const currentRendererInstance = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = currentRendererInstance;
        const canvasElement = currentRendererInstance.domElement;

        // --- Enable WebXR in the renderer ---
        currentRendererInstance.xr.enabled = true;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x333366);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current = camera;
        camera.position.z = 5;

        if (initialMountPoint) {
            initialMountPoint.appendChild(canvasElement);
            handleResize();
        }

        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0x00bfff });
        const cube = new THREE.Mesh(geometry, material);
        cubeRef.current = cube;
        scene.add(cube);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5).normalize();
        scene.add(directionalLight);

        // Standard animation loop for non-VR Browse
        const animate = () => {
            requestAnimationFrame(animate);
            if (!isDragging.current) {
                if (cubeRef.current) {
                    cubeRef.current.rotation.x += 0.005;
                    cubeRef.current.rotation.y += 0.005;
                }
            }
            currentRendererInstance.render(scene, camera);
        };

        animate();

        // Mouse/Touch interaction listeners (only active when not in VR)
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
                if (cubeRef.current) {
                    cubeRef.current.rotation.y += deltaMove.x * 0.01;
                    cubeRef.current.rotation.x += deltaMove.y * 0.01;
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
                if (cubeRef.current) {
                    cubeRef.current.rotation.y += deltaMove.x * 0.01;
                    cubeRef.current.rotation.x += deltaMove.y * 0.01;
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

        return () => {
            if (initialMountPoint && canvasElement.parentNode === initialMountPoint) {
                initialMountPoint.removeChild(canvasElement);
            }

            // Remove all event listeners. Make sure to remove the correct functions.
            canvasElement.removeEventListener('mousedown', onMouseDown);
            canvasElement.removeEventListener('mouseup', onMouseUp);
            canvasElement.removeEventListener('mousemove', onMouseMove);
            canvasElement.removeEventListener('touchstart', onTouchStart);
            canvasElement.removeEventListener('touchend', onTouchEnd);
            canvasElement.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('resize', handleResize);

            // Dispose Three.js objects
            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (!object.isMesh) return;
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
                });
            }

            if (currentRendererInstance) {
                // Crucially, stop the XR animation loop if it's active
                currentRendererInstance.setAnimationLoop(null);
                currentRendererInstance.dispose();
            }
        };
    }, [handleResize]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-inter p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center mb-6">
                <h1 className="text-3xl font-bold text-teal-300 mb-2">Welcome to the Meta World Hub!</h1>
                <p className="text-lg text-gray-300">{message}</p>
            </div>
            <div
                ref={mountRef}
                className="w-full max-w-4xl h-96 md:h-[600px] bg-black rounded-lg shadow-2xl overflow-hidden relative"
            >
                {/* Three.js content will be appended here */}
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center mt-6">
                <p className="text-md text-gray-400">
                    This is a basic interactive 3D web experience built with React and Three.js,
                    designed to show how a "Meta World" website could function.
                    It can be viewed in a standard browser or potentially embedded in a VR environment
                    that supports web content.
                </p>
                <button
                    onClick={() => setMessage("Hello, adventurer! What brings you to this digital realm?")}
                    className="mt-4 mr-2 px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 shadow-md"
                >
                    Change Message
                </button>
                <button
                    onClick={enterVR}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 shadow-md"
                >
                    Enter VR
                </button>
            </div>
        </div>
    );
};

export default App;