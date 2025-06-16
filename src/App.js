import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

const App = () => {
    // Reference to the canvas element where the 3D scene will be rendered
    const mountRef = useRef(null);

    // State for user messages/feedback
    const [message, setMessage] = useState("Drag your mouse to rotate the object!");

    // State for scene elements to be accessed across re-renders
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const cubeRef = useRef(null); // Reference to the specific cube mesh

    // Variables for mouse interaction
    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });

    // Function to handle window resizing for responsiveness
    const handleResize = useCallback(() => {
        if (cameraRef.current && rendererRef.current && mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
        }
    }, []);

    // Effect for setting up the Three.js scene
    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x333366); // Dark blue background

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current = camera;
        camera.position.z = 5;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
        renderer.setPixelRatio(window.devicePixelRatio); // Optimize for high-DPI screens
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
            // Initial resize to fit the container
            handleResize();
        }

        // Object (Cube) setup
        const geometry = new THREE.BoxGeometry(2, 2, 2); // A simple box
        const material = new THREE.MeshStandardMaterial({ color: 0x00bfff }); // Cyan color with standard material for lighting
        const cube = new THREE.Mesh(geometry, material);
        cubeRef.current = cube; // Store reference to the cube
        scene.add(cube);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Directional light for shadows
        directionalLight.position.set(5, 5, 5).normalize();
        scene.add(directionalLight);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // If not dragging, slowly rotate the cube
            if (!isDragging.current) {
                if (cubeRef.current) {
                    cubeRef.current.rotation.x += 0.005;
                    cubeRef.current.rotation.y += 0.005;
                }
            }

            renderer.render(scene, camera);
        };

        animate();

        // Mouse interaction event listeners
        const onMouseDown = (event) => {
            isDragging.current = true;
            previousMousePosition.current = {
                x: event.clientX,
                y: event.clientY
            };
        };

        const onMouseUp = () => {
            isDragging.current = false;
        };

        const onMouseMove = (event) => {
            if (!isDragging.current) return;

            const deltaMove = {
                x: event.clientX - previousMousePosition.current.x,
                y: event.clientY - previousMousePosition.current.y
            };

            // Rotate based on mouse movement
            if (cubeRef.current) {
                cubeRef.current.rotation.y += deltaMove.x * 0.01;
                cubeRef.current.rotation.x += deltaMove.y * 0.01;
            }

            previousMousePosition.current = {
                x: event.clientX,
                y: event.clientY
            };
        };

        // Add event listeners to the canvas element
        const canvas = renderer.domElement;
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mousemove', onMouseMove);

        // Handle touch events for mobile/tablet
        const onTouchStart = (event) => {
            if (event.touches.length === 1) {
                isDragging.current = true;
                previousMousePosition.current = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }
        };

        const onTouchEnd = () => {
            isDragging.current = false;
        };

        const onTouchMove = (event) => {
            if (!isDragging.current || event.touches.length !== 1) return;

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
        };

        canvas.addEventListener('touchstart', onTouchStart);
        canvas.addEventListener('touchend', onTouchEnd);
        canvas.addEventListener('touchmove', onTouchMove);

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup function for useEffect
        return () => {
            // Remove canvas from DOM
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }

            // Remove all event listeners
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchend', onTouchEnd);
            canvas.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('resize', handleResize);

            // Dispose of Three.js objects to free up GPU memory
            // Iterate over children to dispose geometries and materials
            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (!object.isMesh) return;
                    // Dispose geometry
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    // Dispose material(s)
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach((material) => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }

            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
            // Note: Scene and Camera objects themselves don't typically have a .dispose() method.
            // Disposal focuses on the WebGL resources managed by geometries, materials, and the renderer.
        };
    }, [handleResize]); // Re-run effect if handleResize changes (unlikely with useCallback)

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-inter p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center mb-6">
                <h1 className="text-3xl font-bold text-teal-300 mb-2">Welcome to the Meta World Hub!</h1>
                <p className="text-lg text-gray-300">{message}</p>
            </div>
            {/* The 3D canvas container */}
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
                    className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 shadow-md"
                >
                    Change Message
                </button>
            </div>
        </div>
    );
};

export default App;
