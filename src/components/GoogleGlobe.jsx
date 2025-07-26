// src/components/GoogleGlobe.jsx
import React, { useEffect, useRef, useState } from 'react';
import useGoogleMaps from '../hooks/useGoogleMaps';

const GoogleGlobe = () => {
  // Refs for map and layers
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const transitLayerRef = useRef(null);
  const bicyclingLayerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);

  // Refs for storing markers from place searches and for Autocomplete inputs
  const searchMarkersRef = useRef([]);
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);

  // Sidebar and controls state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showTransit, setShowTransit] = useState(false);
  const [showBicycling, setShowBicycling] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState('hybrid');

  // Get the API key from your environment variables.
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  // IMPORTANT: load the "places" library for Places API functionality.
  const googleMapsLoaded = useGoogleMaps(apiKey, ['places']);

  // Marker data for some travel destinations (for demonstration)
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
      lng: -74.006,
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

  // Updated "Silver" style that preserves labels and icons
  const mapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  ];

  // Initialize the map, markers, layers, directions, etc.
  useEffect(() => {
    if (!googleMapsLoaded) {
      console.log('Google Maps API not loaded yet.');
      return;
    }

    const mapOptions = {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      mapTypeId: mapType, // use current map type state
      tilt: 45,
      heading: 0,
      styles: mapStyle,
      fullscreenControl: true,
      mapTypeControl: true,
      streetViewControl: true,
      rotateControl: true,
      zoomControl: true,
    };

    // Create the map
    googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
    googleMapRef.current.addListener('idle', () => {
      googleMapRef.current.setTilt(45);
    });

    // Add preset markers with info windows
    markersData.forEach((markerData) => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: googleMapRef.current,
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
        infoWindow.open(googleMapRef.current, marker);
      });
    });

    // Initialize Directions Service and Renderer
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: { strokeColor: '#2E8B57', strokeWeight: 5 },
    });
    directionsRendererRef.current.setMap(googleMapRef.current);

    // Initialize additional layers
    trafficLayerRef.current = new window.google.maps.TrafficLayer();
    transitLayerRef.current = new window.google.maps.TransitLayer();
    bicyclingLayerRef.current = new window.google.maps.BicyclingLayer();
  }, [googleMapsLoaded, mapType]);

  // Attach Autocomplete to directions inputs once the API is loaded
  useEffect(() => {
    if (!googleMapsLoaded) return;
    if (window.google && window.google.maps.places) {
      const originAutocomplete = new window.google.maps.places.Autocomplete(originInputRef.current);
      originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        if (place.formatted_address) {
          setOrigin(place.formatted_address);
        } else {
          setOrigin(originInputRef.current.value);
        }
      });

      const destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationInputRef.current);
      destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        if (place.formatted_address) {
          setDestination(place.formatted_address);
        } else {
          setDestination(destinationInputRef.current.value);
        }
      });
    }
  }, [googleMapsLoaded]);

  // Update Traffic layer
  useEffect(() => {
    if (!googleMapRef.current) return;
    trafficLayerRef.current.setMap(showTraffic ? googleMapRef.current : null);
  }, [showTraffic]);

  // Update Transit layer
  useEffect(() => {
    if (!googleMapRef.current) return;
    transitLayerRef.current.setMap(showTransit ? googleMapRef.current : null);
  }, [showTransit]);

  // Update Bicycling layer
  useEffect(() => {
    if (!googleMapRef.current) return;
    bicyclingLayerRef.current.setMap(showBicycling ? googleMapRef.current : null);
  }, [showBicycling]);

  // Handle directions form submission
  const handleGetDirections = (e) => {
    e.preventDefault();
    if (!origin || !destination) return;
    directionsServiceRef.current.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
        } else {
          alert('Directions request failed due to ' + status);
        }
      }
    );
  };

  // Handle a separate Place text search
  const handlePlaceSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !googleMapRef.current) return;

    // Clear any previous search markers
    searchMarkersRef.current.forEach((marker) => marker.setMap(null));
    searchMarkersRef.current = [];

    const service = new window.google.maps.places.PlacesService(googleMapRef.current);
    const request = {
      query: searchQuery,
      location: googleMapRef.current.getCenter(),
      radius: 50000, // Search within 50km radius (adjust as needed)
    };

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        // Center the map on the first result
        googleMapRef.current.setCenter(results[0].geometry.location);
        results.forEach((place) => {
          if (place.geometry && place.geometry.location) {
            const marker = new window.google.maps.Marker({
              position: place.geometry.location,
              map: googleMapRef.current,
              title: place.name,
            });
            searchMarkersRef.current.push(marker);
            marker.addListener('click', () => {
              const infoWindow = new window.google.maps.InfoWindow({
                content: `<div><h3>${place.name}</h3><p>${place.formatted_address}</p></div>`,
              });
              infoWindow.open(googleMapRef.current, marker);
            });
          }
        });
      } else {
        alert('Place search failed: ' + status);
      }
    });
  };

  // Geolocation: Center map on user's current location
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          googleMapRef.current.setCenter(pos);
          googleMapRef.current.setZoom(12);
          new window.google.maps.Marker({
            position: pos,
            map: googleMapRef.current,
            title: 'You are here',
            icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
          });
        },
        () => {
          alert('Error: The Geolocation service failed.');
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
    }
  };

  // Handle map type changes from the dropdown
  const handleMapTypeChange = (e) => {
    const selectedType = e.target.value;
    setMapType(selectedType);
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(selectedType);
    }
  };

  if (!googleMapsLoaded) return <div>Loading Map...</div>;

  // Style objects (sidebar, buttons, etc.)
  const sidebarStyle = {
    position: 'absolute',
    top: '0',
    left: sidebarOpen ? '0' : '-320px',
    width: '300px',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
    transition: 'left 0.3s ease',
    padding: '20px',
    zIndex: 3,
    overflowY: 'auto',
  };

  const toggleButtonStyle = {
    position: 'absolute',
    top: '20px',
    left: sidebarOpen ? '320px' : '20px',
    zIndex: 4,
    padding: '10px 15px',
    background: '#2E8B57',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'left 0.3s ease',
  };

  const controlButtonStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    background: '#2E8B57',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const submitButtonStyle = {
    width: '100%',
    padding: '10px',
    background: '#17A2B8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const mapViewsSectionStyle = {
    marginTop: '20px',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '4px',
  };

  const mapViewsHeaderStyle = {
    borderBottom: '1px solid #ccc',
    paddingBottom: '10px',
    fontSize: '1.1rem',
    marginBottom: '10px',
    color: '#333',
  };

  const mapViewsSelectStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    color: '#333',
    backgroundColor: '#fff',
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ marginTop: '0', borderBottom: '1px solid #ccc', paddingBottom: '10px', paddingTop: '80px' }}>Map Controls</h2>
        <div style={{ marginBottom: '15px' }}>
          <button onClick={handleLocateMe} style={controlButtonStyle}>Locate Me</button>
          <button onClick={() => setShowTraffic(!showTraffic)} style={controlButtonStyle}>
            {showTraffic ? 'Hide Traffic' : 'Show Traffic'}
          </button>
          <button onClick={() => setShowTransit(!showTransit)} style={controlButtonStyle}>
            {showTransit ? 'Hide Transit' : 'Show Transit'}
          </button>
          <button onClick={() => setShowBicycling(!showBicycling)} style={controlButtonStyle}>
            {showBicycling ? 'Hide Bicycling' : 'Show Bicycling'}
          </button>
        </div>

        {/* Directions Form with Autocomplete Inputs */}
        <div style={{ marginBottom: '15px' }}>
          <form onSubmit={handleGetDirections}>
            <input
              type="text"
              placeholder="Origin"
              ref={originInputRef}
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Destination"
              ref={destinationInputRef}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" style={submitButtonStyle}>Get Directions</button>
          </form>
        </div>

        {/* Places Text Search Form */}
        <div style={{ marginBottom: '15px' }}>
          <form onSubmit={handlePlaceSearch}>
            <input
              type="text"
              placeholder="Search Places"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" style={submitButtonStyle}>Search Places</button>
          </form>
        </div>

        {/* Map Views Section */}
        <div style={mapViewsSectionStyle}>
          <h3 style={mapViewsHeaderStyle}>Map Views</h3>
          <select onChange={handleMapTypeChange} value={mapType} style={mapViewsSelectStyle}>
            <option value="roadmap">Roadmap</option>
            <option value="satellite">Satellite</option>
            <option value="hybrid">Hybrid</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={toggleButtonStyle}>
        {sidebarOpen ? 'Close Controls' : 'Open Controls'}
      </button>

      {/* Google Map Container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default GoogleGlobe;
