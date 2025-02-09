// src/components/ExploreGlobe.jsx
import React, { useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { OrbitControls, Stars } from "@react-three/drei";

/**
 * Earth Component
 * Renders a rotating Earth with texture, cloud layer, and markers.
 */
const Earth = ({ markers, onMarkerClick }) => {
  const earthRef = useRef();
  const texture = useLoader(TextureLoader, "/globe.jpg"); // Ensure globe.jpg is in your public folder

  // Rotate the Earth slowly for a dynamic effect
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={earthRef}>
      {/* Earth Sphere */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial map={texture} metalness={0.4} roughness={0.7} />
      </mesh>
      {/* Cloud Layer */}
      <Clouds />
      {/* Markers */}
      {markers.map((marker) => (
        <Marker key={marker.id} marker={marker} onClick={onMarkerClick} />
      ))}
    </group>
  );
};

/**
 * Clouds Component
 * Adds a semi-transparent cloud layer over the Earth.
 */
const Clouds = () => {
  const cloudRef = useRef();
  const cloudTexture = useLoader(TextureLoader, "/clouds.png"); // Use the clouds image from three.js examples

  useFrame(() => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <mesh ref={cloudRef}>
      <sphereGeometry args={[2.05, 32, 32]} />
      <meshLambertMaterial
        map={cloudTexture}
        transparent={true}
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  );
};

/**
 * Marker Component
 * Places a clickable marker on the globe with hover effects.
 */
const Marker = ({ marker, onClick }) => {
  const markerRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Convert geographic coordinates (lat, lng) to 3D position on the sphere
  const phi = (90 - marker.lat) * (Math.PI / 180);
  const theta = (marker.lng + 180) * (Math.PI / 180);
  const radius = 2.02; // Slightly above the Earth's surface
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return (
    <mesh
      ref={markerRef}
      position={[x, y, z]}
      scale={hovered ? [1.2, 1.2, 1.2] : [1, 1, 1]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(marker);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color={hovered ? "orange" : "red"} />
    </mesh>
  );
};

/**
 * ExploreGlobe Component
 * The main container that includes the header, the 3D canvas, and the modal.
 * It now provides additional content above the canvas and more detailed modals.
 */
const ExploreGlobe = () => {
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Marker data with additional content (an image URL)
  const markers = [
    {
      id: 1,
      name: "Paris",
      lat: 48.8566,
      lng: 2.3522,
      description: "The City of Light awaits with romance and culture.",
      image: "https://source.unsplash.com/featured/?paris",
    },
    {
      id: 2,
      name: "New York",
      lat: 40.7128,
      lng: -74.0060,
      description: "The Big Apple is buzzing with energy and endless attractions.",
      image: "https://source.unsplash.com/featured/?newyork",
    },
    {
      id: 3,
      name: "Tokyo",
      lat: 35.6895,
      lng: 139.6917,
      description: "Experience the blend of tradition and futuristic technology.",
      image: "https://source.unsplash.com/featured/?tokyo",
    },
    {
      id: 4,
      name: "Sydney",
      lat: -33.8688,
      lng: 151.2093,
      description: "Enjoy vibrant culture and iconic landmarks like the Opera House.",
      image: "https://source.unsplash.com/featured/?sydney",
    },
    {
      id: 5,
      name: "Cairo",
      lat: 30.0444,
      lng: 31.2357,
      description: "Discover rich history and majestic pyramids in Egypt.",
      image: "https://source.unsplash.com/featured/?cairo",
    },
  ];

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleModalClose = () => {
    setSelectedMarker(null);
  };

  return (
    <div style={containerStyles}>
      {/* Header with Title and Introductory Text */}
      <header style={headerStyles}>
        <h1 style={headerTitleStyles}>Travel Explorer</h1>
        <p style={headerSubtitleStyles}>
          Click on a destination marker to learn more about this amazing location.
        </p>
      </header>

      {/* 3D Canvas Container */}
      <div style={canvasContainerStyles}>
        <Canvas>
          {/* Starry Background */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
          />
          {/* Enhanced Lighting */}
          <ambientLight intensity={1.0} />
          <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -5, -5]} intensity={0.5} />
          {/* Earth, Clouds, and Markers */}
          <Earth markers={markers} onMarkerClick={handleMarkerClick} />
          {/* Orbit Controls */}
          <OrbitControls enableZoom={true} enablePan={false} dampingFactor={0.1} />
        </Canvas>
      </div>

      {/* Modal for Destination Details */}
      {selectedMarker && (
        <div style={modalOverlayStyles} onClick={handleModalClose}>
          <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
            {selectedMarker.image && (
              <img
                src={selectedMarker.image}
                alt={selectedMarker.name}
                style={modalImageStyles}
              />
            )}
            <h2 style={modalTitleStyles}>{selectedMarker.name}</h2>
            <p style={modalDescriptionStyles}>{selectedMarker.description}</p>
            <button onClick={handleModalClose} style={buttonStyles}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline Styles

const containerStyles = {
  position: "relative",
  width: "100%",
  height: "100vh",
  overflow: "hidden",
  fontFamily: "'Arial', sans-serif",
  color: "#333",
};

const headerStyles = {
  position: "absolute",
  top: "10px",
  left: "50%",
  transform: "translateX(-50%)",
  textAlign: "center",
  zIndex: 20,
};

const headerTitleStyles = {
  fontSize: "2.5rem",
  margin: "0.2rem 0",
};

const headerSubtitleStyles = {
  fontSize: "1rem",
  margin: "0.2rem 0",
};

const canvasContainerStyles = {
  width: "100%",
  height: "100%",
};

const modalOverlayStyles = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 30,
  transition: "opacity 0.3s ease",
};

const modalContentStyles = {
  background: "#ffffff",
  padding: "2rem",
  borderRadius: "8px",
  maxWidth: "400px",
  width: "90%",
  textAlign: "center",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
};

const modalImageStyles = {
  width: "100%",
  height: "auto",
  borderRadius: "4px",
  marginBottom: "1rem",
};

const modalTitleStyles = {
  marginBottom: "1rem",
  fontSize: "1.8rem",
  color: "#333",
};

const modalDescriptionStyles = {
  marginBottom: "1.5rem",
  fontSize: "1rem",
  color: "#555",
};

const buttonStyles = {
  padding: "0.5rem 1rem",
  background: "#007BFF",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "1rem",
};

export default ExploreGlobe;
