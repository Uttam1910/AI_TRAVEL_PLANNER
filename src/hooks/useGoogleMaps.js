// src/hooks/useGoogleMaps.js
import { useState, useEffect } from 'react';

const useGoogleMaps = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // If the API is already loaded, set loaded to true
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }

    // Otherwise, poll for the API every 100ms
    const interval = setInterval(() => {
      if (window.google && window.google.maps) {
        setLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return loaded;
};

export default useGoogleMaps;
