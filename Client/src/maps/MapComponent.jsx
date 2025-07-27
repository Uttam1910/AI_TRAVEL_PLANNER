import React, { useState, useEffect } from 'react';
import { 
  GoogleMap, 
  LoadScript, 
  Marker, 
  InfoWindow, 
  Autocomplete 
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const initialCenter = {
  lat: 37.7749, // Default center: San Francisco
  lng: -122.4194
};

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [autocomplete, setAutocomplete] = useState(null);
  const [center, setCenter] = useState(initialCenter);

  // Fetch landmarks from your backend using VITE_BACKEND_URL
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/landmarks`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => setMarkers(data))
      .catch(err => console.error("Error fetching landmarks:", err));
  }, []);

  // Save the map instance when it loads
  const onLoadMap = (mapInstance) => {
    setMap(mapInstance);
  };

  // Save the autocomplete instance when it loads
  const onLoadAutocomplete = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  // When a place is selected from autocomplete, update the map center
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const newCenter = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setCenter(newCenter);
        if (map) map.panTo(newCenter);
      }
    }
  };

  // Use browser geolocation to center the map on the user's position
  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCenter(userPosition);
        if (map) map.panTo(userPosition);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="relative">
      {/* Search Bar and Locate Me Button */}
      <div className="absolute z-10 p-4 flex gap-2">
        <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
          <input 
            type="text" 
            placeholder="Search for places" 
            className="p-2 border rounded shadow"
          />
        </Autocomplete>
        <button 
          onClick={locateUser} 
          className="p-2 bg-blue-500 text-white rounded shadow"
        >
          Locate Me
        </button>
      </div>
      {/* Load Google Maps with the Places library */}
      <LoadScript 
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_API_KEY}
        libraries={["places"]}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={onLoadMap}
        >
          {/* Render markers for each landmark */}
          {markers.map(marker => (
            <Marker
              key={marker.id}
              position={marker.position}
              onClick={() => setSelectedMarker(marker)}
            />
          ))}
          {/* Show an InfoWindow when a marker is selected */}
          {selectedMarker && (
            <InfoWindow
              position={selectedMarker.position}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <h3 className="font-bold">{selectedMarker.name}</h3>
                <p>{selectedMarker.description}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;
