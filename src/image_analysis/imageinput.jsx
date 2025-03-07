import React, { useState } from "react";

const LandmarkDetection = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use Vite's environment variable for the backend API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setResult(null);
      setError("");
    }
  };

  // Submit the image to the backend for analysis
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Please select an image.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", image);
      const response = await fetch(`${API_BASE_URL}/api/landmark`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error processing image.");
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Error processing image.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Landmark Detection</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>
      </form>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {result && (
        <div className="mt-6 w-full max-w-md bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-2">{result.landmark}</h2>
          {result.locations && result.locations.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium">Locations:</h3>
              <ul className="list-disc list-inside">
                {result.locations.map((loc, index) => (
                  <li key={index}>
                    Lat: {loc.latitude}, Lon: {loc.longitude}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.wikipedia && (
            <div>
              <h3 className="font-medium mb-1">Wikipedia Summary:</h3>
              <p className="mb-2 text-gray-700">{result.wikipedia.summary}</p>
              {result.wikipedia.page && (
                <a
                  href={result.wikipedia.page}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Read more on Wikipedia
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LandmarkDetection;
