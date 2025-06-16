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
        // Capture the mount point and renderer/canvas instance at the time the effect runs.
        // This is crucial for cleanup to reference stable values and prevent ESLint warnings
        // about mutable refs in cleanup closures, ensuring safe DOM manipulation.
        const initialMountPoint = mountRef.current;
        const currentRendererInstance = new THREE.WebGLRenderer({ antialias: true }); // Create renderer here
        rendererRef.current = currentRendererInstance; // Assign to ref for general access
        const canvasElement = currentRendererInstance.domElement; // Get the canvas element

        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x333366); // Dark blue background

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current = camera;
        camera.position.z = 5;

        // Append renderer's DOM element to the initial mount point
        if (initialMountPoint) {
            initialMountPoint.appendChild(canvasElement);
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
            // Use requestAnimationFrame to create a smooth animation loop
            requestAnimationFrame(animate);

            // If the user is not dragging the cube, make it rotate slowly on its own
            if (!isDragging.current) {
                if (cubeRef.current) {
                    cubeRef.current.rotation.x += 0.005;
                    cubeRef.current.rotation.y += 0.005;
                }
            }

            // Render the scene from the camera's perspective
            currentRendererInstance.render(scene, camera);
        };

        // Start the animation loop
        animate();

        // Mouse interaction event listeners for rotating the cube
        const onMouseDown = (event) => {
            isDragging.current = true; // Set dragging state to true
            previousMousePosition.current = {
                x: event.clientX,
                y: event.clientY
            };
        };

        const onMouseUp = () => {
            isDragging.current = false; // Set dragging state to false
        };

        const onMouseMove = (event) => {
            if (!isDragging.current) return; // Only rotate if currently dragging

            // Calculate movement delta
            const deltaMove = {
                x: event.clientX - previousMousePosition.current.x,
                y: event.clientY - previousMousePosition.current.y
            };

            // Rotate the cube based on mouse movement
            if (cubeRef.current) {
                cubeRef.current.rotation.y += deltaMove.x * 0.01; // Rotate around Y-axis for horizontal movement
                cubeRef.current.rotation.x += deltaMove.y * 0.01; // Rotate around X-axis for vertical movement
            }

            // Update previous mouse position for the next movement calculation
            previousMousePosition.current = {
                x: event.clientX,
                y: event.clientY
            };
        };

        // Add mouse event listeners to the canvas element
        canvasElement.addEventListener('mousedown', onMouseDown);
        canvasElement.addEventListener('mouseup', onMouseUp);
        canvasElement.addEventListener('mousemove', onMouseMove);

        // Handle touch events for mobile/tablet devices
        const onTouchStart = (event) => {
            // Only start dragging if a single touch is detected
            if (event.touches.length === 1) {
                isDragging.current = true;
                previousMousePosition.current = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }
        };

        const onTouchEnd = () => {
            isDragging.current = false; // End dragging on touch release
        };

        const onTouchMove = (event) => {
            // Only rotate if currently dragging and a single touch is maintained
            if (!isDragging.current || event.touches.length !== 1) return;

            // Calculate movement delta for touch
            const deltaMove = {
                x: event.touches[0].clientX - previousMousePosition.current.x,
                y: event.touches[0].clientY - previousMousePosition.current.y
            };

            // Rotate the cube based on touch movement
            if (cubeRef.current) {
                cubeRef.current.rotation.y += deltaMove.x * 0.01;
                cubeRef.current.rotation.x += deltaMove.y * 0.01;
            }

            // Update previous touch position
            previousMousePosition.current = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        };

        // Add touch event listeners to the canvas element
        canvasElement.addEventListener('touchstart', onTouchStart);
        canvasElement.addEventListener('touchend', onTouchEnd);
        canvasElement.addEventListener('touchmove', onTouchMove);

        // Add event listener for window resize to maintain responsiveness
        window.addEventListener('resize', handleResize);

        // Cleanup function for useEffect: This runs when the component unmounts or dependencies change.
        // It's crucial for releasing resources and preventing memory leaks.
        return () => {
            // Remove the canvas element from the DOM to clean up its presence.
            // Use the captured 'initialMountPoint' for cleanup to ensure stability.
            if (initialMountPoint && canvasElement.parentNode === initialMountPoint) {
                initialMountPoint.removeChild(canvasElement);
            }

            // Remove all event listeners to prevent memory leaks and unexpected behavior.
            canvasElement.removeEventListener('mousedown', onMouseDown);
            canvasElement.removeEventListener('mouseup', onMouseUp);
            canvasElement.removeEventListener('mousemove', onMouseMove);
            canvasElement.removeEventListener('touchstart', onTouchStart);
            canvasElement.removeEventListener('touchend', onTouchEnd);
            canvasElement.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('resize', handleResize);

            // Dispose of Three.js objects to free up GPU memory.
            // Scene objects are traversed to dispose of geometries and materials attached to meshes.
            if (sceneRef.current) { // Use sceneRef.current for scene traversal and dispose of actual objects
                sceneRef.current.traverse((object) => {
                    // Only dispose if the object is a mesh (has geometry and material)
                    if (!object.isMesh) return;

                    // Dispose geometry if it exists
                    if (object.geometry) {
                        object.geometry.dispose();
                    }

                    // Dispose material(s). Handle both single material and array of materials.
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach((material) => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }

            // Dispose the WebGLRenderer to release its WebGL context and resources.
            if (currentRendererInstance) {
                currentRendererInstance.dispose();
            }
            // Note: THREE.Scene and THREE.Camera objects themselves do not have a .dispose() method.
            // Resource disposal in Three.js focuses on geometries, materials, textures, and the renderer.
        };
    }, [handleResize]); // Re-run effect if handleResize changes (unlikely with useCallback, but good practice)

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-inter p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center mb-6">
                <h1 className="text-3xl font-bold text-teal-300 mb-2">Welcome to the Meta World Hub!</h1>
                <p className="text-lg text-gray-300">{message}</p>
            </div>
            {/* The 3D canvas container where the Three.js scene will be rendered */}
            <div
                ref={mountRef}
                className="w-full max-w-4xl h-96 md:h-[600px] bg-black rounded-lg shadow-2xl overflow-hidden relative"
            >
                {/* Three.js content will be appended here by the useEffect hook */}
            </div>
            {/* Additional UI elements for interaction */}
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
