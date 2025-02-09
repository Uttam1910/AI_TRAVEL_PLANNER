// src/hooks/useGoogleMaps.js
import { useState, useEffect } from 'react';

const useGoogleMaps = (apiKey, libraries = []) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // If already loaded, update state
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }

    // Check if a script is already added to avoid duplicate script tags
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => setLoaded(true));
      existingScript.addEventListener('error', () => {
        console.error('Error loading the Google Maps API.');
      });
      return;
    }

    // Create the script tag
    const script = document.createElement('script');
    const librariesParam = libraries.length ? `&libraries=${libraries.join(',')}` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}${librariesParam}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setLoaded(true);
    };

    script.onerror = () => {
      console.error('Error loading the Google Maps API.');
    };

    document.head.appendChild(script);

    // Clean-up (optional): If you want to remove the script on unmount
    return () => {
      // Optionally remove the script if needed:
      // document.head.removeChild(script);
    };
  }, [apiKey, libraries]);

  return loaded;
};

export default useGoogleMaps;
