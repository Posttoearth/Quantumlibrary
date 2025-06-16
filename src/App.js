import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

const App = () => {
    // Reference to the canvas element where the 3D scene will be rendered
    const mountRef = useRef(null);

    // State for scene elements to be accessed across re-renders
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    // Ref to hold actual Three.js mesh objects for direct manipulation and cleanup
    const shapeMeshesRef = useRef([]);

    // State for calculator input values
    const [number1, setNumber1] = useState(7); // Default value for first number
    const [number2, setNumber2] = useState(9); // Default value for second number

    // Ref to hold the loaded texture
    const textureRef = useRef(null);
    const [textureLoaded, setTextureLoaded] = useState(false); // State to track texture loading

    // Mouse interaction variables for camera rotation (only active outside VR)
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
    }, []); // This useCallback is stable because its dependencies (refs, xr.isPresenting) do not change its identity.

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

                // Set the animation loop for VR. Three.js takes over the rendering loop.
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
                    // Reset to standard animation loop when VR session ends
                    rendererRef.current.setAnimationLoop(null);
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
                // Using alert for now, can replace with custom modal as alerts are discouraged.
                alert("VR not supported or session failed: " + error.message);
            }
        } else {
            console.warn("WebXR not available.");
            alert("WebXR not supported in this browser or device.");
        }
    }, [handleResize]);

    // Function to clear all existing shapes from the scene
    const clearShapes = useCallback(() => {
        if (!sceneRef.current) return;
        shapeMeshesRef.current.forEach(shape => {
            sceneRef.current.remove(shape);
            if (shape.geometry) shape.geometry.dispose();
            if (shape.material) {
                // Dispose material(s) properly
                if (Array.isArray(shape.material)) {
                    shape.material.forEach(mat => mat.dispose());
                } else {
                    shape.material.dispose();
                }
            }
        });
        shapeMeshesRef.current = []; // Clear the ref
    }, []);

    // Function to add a set of shapes based on number inputs and colors in a matrix
    const addShapesForEquation = useCallback((num1, num2) => {
        clearShapes(); // Clear existing shapes before adding new ones for a fresh equation visualization

        if (!sceneRef.current || !textureLoaded || !textureRef.current) {
            console.warn("Scene, texture, or texture loading not ready for adding shapes.");
            return;
        }

        const orangeColor = new THREE.Color(0xffa500); // Orange color
        const blueColor = new THREE.Color(0x0000ff);   // Blue color
        const boxSize = 1;            // Size of each cube
        const spacing = 1.2;          // Space between cubes (slightly more than boxSize for gaps)

        // Matrix dimensions (5x5x5 for each block)
        const gridX_dim = 5;
        const gridY_dim = 5;
        const gridZ_dim = 5;
        const maxShapesPerBlock = gridX_dim * gridY_dim * gridZ_dim; // 125 shapes per block

        const totalShapes = num1 + num2;
        const numBlocks = Math.ceil(totalShapes / maxShapesPerBlock);
        const blockSpacingX = (gridX_dim * spacing) + 3; // Space between blocks along X, 3 units extra

        // Calculate the total width of all blocks combined for centering
        let totalSceneWidth = 0;
        if (numBlocks > 0) {
            // Calculate width considering how many columns are occupied in the last block
            const lastBlockShapes = totalShapes % maxShapesPerBlock;
            const columnsInLastBlock = lastBlockShapes === 0 && totalShapes > 0 ? gridX_dim : (lastBlockShapes > 0 ? (lastBlockShapes -1)%gridX_dim + 1 : 0);
            
            totalSceneWidth = (numBlocks - 1) * blockSpacingX;
            if (columnsInLastBlock > 0) {
                 totalSceneWidth += (columnsInLastBlock - 1) * spacing + boxSize;
            }
        }

        const overallStartX = -totalSceneWidth / 2; // Overall starting X to center the entire scene

        // Loop through all shapes (orange first, then blue)
        for (let i = 0; i < totalShapes; i++) {
            const color = i < num1 ? orangeColor : blueColor;

            // Calculate current block index and index within that block
            const currentBlockIndex = Math.floor(i / maxShapesPerBlock);
            const indexInBlock = i % maxShapesPerBlock;

            // Calculate local coordinates within the 5x5x5 block
            const xInBlock = (indexInBlock % gridX_dim);
            const yInBlock = (Math.floor(indexInBlock / gridX_dim) % gridY_dim);
            const zInBlock = Math.floor(indexInBlock / (gridX_dim * gridY_dim));

            // Calculate offsets to center the *individual block* around its origin
            const blockCenterOffsetX = (gridX_dim - 1) * spacing / 2;
            const blockCenterOffsetY = (gridY_dim - 1) * spacing / 2;
            const blockCenterOffsetZ = (gridZ_dim - 1) * spacing / 2;

            // Calculate final global position
            const finalX = overallStartX +
                           (currentBlockIndex * blockSpacingX) +
                           (xInBlock * spacing) - blockCenterOffsetX;
            const finalY = (yInBlock * spacing) - blockCenterOffsetY;
            const finalZ = (zInBlock * spacing) - blockCenterOffsetZ;

            const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

            // Using MeshBasicMaterial with map for image texture, tinted by color
            const material = new THREE.MeshBasicMaterial({
                map: textureRef.current, // Apply the loaded texture
                color: color // Apply the tint color (orange or blue)
            });

            // Alternatively, for lighting effects on the texture:
            // const material = new THREE.MeshStandardMaterial({
            //     map: textureRef.current,
            //     color: color, // This color will tint the texture
            //     roughness: 0.5,
            //     metalness: 0.5
            // });

            const newShape = new THREE.Mesh(geometry, material);
            newShape.position.set(finalX, finalY, finalZ);
            sceneRef.current.add(newShape);
            shapeMeshesRef.current.push(newShape);
        }
    }, [clearShapes, textureLoaded]); // Added textureLoaded to dependencies

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
        camera.position.z = 25; // ZOOOMED OUT MORE: Increased camera Z position to move it further back

        if (initialMountPoint) {
            initialMountPoint.appendChild(canvasElement);
            handleResize(); // Initial resize to fit the full window
        }

        // Load the texture first
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            '/NEWPIC.jpg', // Path to your image in the public folder
            (texture) => {
                textureRef.current = texture;
                setTextureLoaded(true); // Set state to true when texture is loaded
                // After texture is loaded, add initial shapes
                addShapesForEquation(number1, number2);
            },
            undefined, // onProgress callback - not needed here
            (err) => {
                console.error('An error occurred loading the texture:', err);
                setTextureLoaded(false); // Indicate texture loading failed
                alert("Failed to load image: NEWPIC.jpg. Please ensure it's in the 'public' folder.");
            }
        );

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
            clearShapes(); // Use the dedicated clear function for cleanup
            shapeMeshesRef.current = []; // Ensure the ref is empty after cleanup

            // Dispose the texture
            if (textureRef.current) {
                textureRef.current.dispose();
            }

            if (currentRendererInstance) {
                currentRendererInstance.setAnimationLoop(null); // Stop any active animation loop
                currentRendererInstance.dispose();
            }
        };
    }, [handleResize, addShapesForEquation, clearShapes, number1, number2]); // Dependencies now correctly include handleResize, addShapesForEquation, clearShapes, and the initial numbers.
    // Also removed `textureLoaded` from dependencies here to prevent re-initialization of scene,
    // as `addShapesForEquation` will be called once `textureLoaded` is true.


    // Handle button click to visualize the equation
    const handleVisualizeClick = () => {
        const num1 = parseInt(number1);
        const num2 = parseInt(number2);

        if (isNaN(num1) || isNaN(num2) || num1 < 0 || num2 < 0) {
            alert("Please enter valid non-negative numbers.");
            return;
        }
        // Only attempt to add shapes if texture is loaded
        if (textureLoaded) {
            addShapesForEquation(num1, num2);
        } else {
            alert("Image texture is still loading or failed to load. Please wait or check console for errors.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-end w-screen h-screen bg-gray-900 font-inter p-4 overflow-hidden relative">
            {/* The 3D canvas container will now fill the entire screen */}
            <div
                ref={mountRef}
                className="absolute inset-0 z-0" // Position absolutely to fill parent and go behind UI
            >
                {/* Three.js content will be appended here */}
            </div>

            {/* UI elements (calculator inputs and buttons) placed on top of the 3D scene */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 mb-4 items-center bg-gray-800 p-4 rounded-lg shadow-xl">
                <input
                    type="number"
                    value={number1}
                    onChange={(e) => setNumber1(e.target.value)}
                    placeholder="Number 1"
                    className="w-28 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                />
                <span className="text-white text-2xl font-bold">+</span>
                <input
                    type="number"
                    value={number2}
                    onChange={(e) => setNumber2(e.target.value)}
                    placeholder="Number 2"
                    className="w-28 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                />
                <button
                    onClick={handleVisualizeClick}
                    // Disable button if texture is not yet loaded
                    disabled={!textureLoaded}
                    className={`px-6 py-3 font-semibold rounded-full transition-colors duration-200 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                        textureLoaded
                            ? 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500'
                            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                    style={{
                        background: textureLoaded ? 'linear-gradient(45deg, #2b8a78, #3de0c2)' : '',
                        border: textureLoaded ? '2px solid #1a5a4d' : 'none',
                        boxShadow: textureLoaded ? '0 5px 15px rgba(0, 204, 153, 0.4)' : 'none'
                    }}
                >
                    {textureLoaded ? 'Visualize Sum' : 'Loading Image...'}
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
