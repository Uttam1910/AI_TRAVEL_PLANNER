// src/components/GoogleGlobe.jsx
import React, { useEffect, useRef } from 'react';
import useGoogleMaps from '../hooks/useGoogleMaps';

const GoogleGlobe = () => {
  const mapRef = useRef(null);
  // Get the API key from your Vite environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  // Pass the API key to your custom hook (add libraries if needed)
  const googleMapsLoaded = useGoogleMaps(apiKey, []);

  // Marker data for your travel destinations
  const markersData = [
    {
      id: 1,
      name: 'Paris',
      lat: 48.8566,
      lng: 2.3522,
      description: 'The City of Light awaits with romance and culture.',
    },
    {
      id: 2,
      name: 'New York',
      lat: 40.7128,
      lng: -74.0060,
      description: 'The Big Apple is buzzing with energy and endless attractions.',
    },
    {
      id: 3,
      name: 'Tokyo',
      lat: 35.6895,
      lng: 139.6917,
      description: 'Experience the blend of tradition and futuristic technology.',
    },
    {
      id: 4,
      name: 'Sydney',
      lat: -33.8688,
      lng: 151.2093,
      description: 'Enjoy vibrant culture and iconic landmarks like the Opera House.',
    },
    {
      id: 5,
      name: 'Cairo',
      lat: 30.0444,
      lng: 31.2357,
      description: 'Discover rich history and majestic pyramids in Egypt.',
    },
  ];

  useEffect(() => {
    // Only initialize the map when the API is loaded
    if (!googleMapsLoaded) {
      console.log('Google Maps API not loaded yet.');
      return;
    }

    // Map options for a satellite (3D-like) view
    const mapOptions = {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      mapTypeId: 'satellite',
      tilt: 45,
      heading: 0,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      rotateControl: true,
    };

    // Initialize the Google Map
    const googleMap = new window.google.maps.Map(mapRef.current, mapOptions);

    // Maintain the 3D tilt once the map is loaded
    googleMap.addListener('idle', () => {
      googleMap.setTilt(45);
    });

    // Add markers and info windows to the map
    markersData.forEach((markerData) => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: googleMap,
        title: markerData.name,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="min-width:200px">
            <h3>${markerData.name}</h3>
            <p>${markerData.description}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMap, marker);
      });
    });
  }, [googleMapsLoaded]);

  // Show a loading message until the API is loaded
  if (!googleMapsLoaded) return <div>Loading Map...</div>;

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Header Section */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '10px 20px',
          borderRadius: '8px',
        }}
      >
        <h1>Travel Explorer - Google Globe View</h1>
        <p>Zoom in, rotate, and click on markers to explore destinations!</p>
      </div>

      {/* Google Map Container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default GoogleGlobe;
