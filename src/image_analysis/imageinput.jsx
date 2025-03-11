import React, { useState } from "react";

const LandmarkDetection = () => {
  // Original state and functions remain completely unchanged
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  // All handler functions remain EXACTLY THE SAME
  const handleFileChange = (e) => {
    setResult(null);
    setError("");
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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

      const data = await response.json();

      if (!response.ok) {
        if (
          data.error &&
          data.error.toLowerCase().includes("no landmarks detected")
        ) {
          setResult({
            message: "No landmark detected in the image. Please try another image.",
          });
          setLoading(false);
          return;
        } else {
          throw new Error(data.error || "Error processing image.");
        }
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Error processing image.");
    } finally {
      setLoading(false);
    }
  };

  // Only JSX (visual part) modified below this line
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Landmark Detection
          </h1>
          <p className="text-lg text-gray-600">
            Upload an image to identify famous landmarks
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-shadow hover:shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* File upload area */}
              <label className="block cursor-pointer">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-8 hover:border-blue-400 transition-colors">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-600 font-medium">
                    {image ? image.name : "Click to upload image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </label>

              {/* Image preview */}
              {imagePreview && (
                <div className="relative group overflow-hidden rounded-lg">
                  <img
                    src={imagePreview}
                    alt="Selected preview"
                    className="w-full h-64 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white shadow-md hover:shadow-lg`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  "Detect Landmark"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-8">
            <div className="flex items-center text-red-700">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {result.landmark ? (
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {result.landmark}
                  </h2>
                  <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto mb-4"></div>
                </div>

                {result.locations && result.locations.length > 0 && (
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      Locations
                    </h3>
                    <ul className="space-y-2">
                      {result.locations.map((loc, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center bg-white p-3 rounded-md"
                        >
                          <span className="text-gray-600">
                            Lat: {loc.latitude}
                          </span>
                          <span className="text-gray-600">
                            Lon: {loc.longitude}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.wikipedia && (
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      Wikipedia Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {result.wikipedia.summary}
                    </p>
                    {result.wikipedia.page && (
                      <a
                        href={result.wikipedia.page}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-blue-600 hover:text-blue-800"
                      >
                        Read more →
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-700">{result.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandmarkDetection;