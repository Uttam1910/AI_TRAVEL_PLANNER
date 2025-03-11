import React, { useState } from "react";

const LandmarkDetection = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  // Preserved original handlers
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Landmark Explorer
          </h1>
          <p className="text-lg text-gray-600">
            Discover the world's iconic landmarks through AI analysis
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <label className="block group cursor-pointer">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50">
                <svg
                  className="w-16 h-16 text-gray-400 mb-4 group-hover:text-blue-500 transition-colors"
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
                <span className="text-gray-600 font-medium text-center">
                  {image ? (
                    <>
                      <span className="block text-blue-600">{image.name}</span>
                      <span className="text-sm text-gray-500">Click to change</span>
                    </>
                  ) : (
                    "Click or drag to upload image"
                  )}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative group overflow-hidden rounded-xl shadow-lg">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl" />
              </div>
            )}

            {/* Analyze Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              } shadow-lg hover:shadow-xl`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                  <span>Analyzing Image...</span>
                </div>
              ) : (
                "Discover Landmark"
              )}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-8 animate-fade-in">
            <div className="flex items-center text-red-700">
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
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


        {/* Results Display */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-fade-in">
            {result.name ? (
              <>
                {/* Landmark Header */}
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900">{result.name}</h2>
                  {result.description && (
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                      {result.description}
                    </p>
                  )}
                  <div className="w-20 h-1 bg-blue-600 rounded-full mx-auto" />
                </div>

                {/* Historical Context */}
                {(result.historical_context.inception_date || result.historical_context.architectural_styles) && (
                  <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                    <div className="flex items-center mb-4 space-x-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-xl font-semibold">Historical Context</h3>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      {result.historical_context.inception_date && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <div className="text-sm text-gray-500 mb-1">Established</div>
                          <div className="font-medium text-gray-900">
                            {new Date(result.historical_context.inception_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {result.historical_context.architectural_styles?.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <div className="text-sm text-gray-500 mb-1">Architectural Style(s)</div>
                          <div className="font-medium text-gray-900">
                            {result.historical_context.architectural_styles.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location Section */}
                {result.location && (
                  <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                    <div className="flex items-center mb-4 space-x-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="text-xl font-semibold">Location Details</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Coordinates</div>
                        <div className="font-medium text-gray-900">
                          {result.location.coordinates.latitude.toFixed(4)}, 
                          {result.location.coordinates.longitude.toFixed(4)}
                        </div>
                      </div>

                      {result.location.country && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <div className="text-sm text-gray-500 mb-1">Country</div>
                          <div className="font-medium text-gray-900">
                            {result.location.country}
                            {result.location.city && `, ${result.location.city}`}
                          </div>
                        </div>
                      )}
                    </div>

                    {result.location.maps_link && (
                      <a
                        href={result.location.maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4"
                      >
                        View on Google Maps
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}

                {/* Additional Information */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Official Website */}
                  {result.official_website && (
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="flex items-center mb-2 space-x-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="font-medium">Official Website</span>
                      </div>
                      <a
                        href={result.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm truncate"
                      >
                        {result.official_website}
                      </a>
                    </div>
                  )}

                  {/* References */}
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <h4 className="font-medium text-gray-900 mb-2">References</h4>
                    <div className="space-y-2">
                      {result.references.wikipedia && (
                        <a
                          href={result.references.wikipedia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Wikipedia Article
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      {result.references.wikidata && (
                        <a
                          href={result.references.wikidata}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Wikidata Entry
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // No Landmark Detected
              <div className="text-center py-8 space-y-4">
                <div className="text-6xl">🌐</div>
                <p className="text-xl text-gray-700">{result.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandmarkDetection;

      