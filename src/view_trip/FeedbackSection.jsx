import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { saveFeedback } from "../service/firebaseConfig"; // Adjust the path as necessary

const FeedbackSection = ({ tripId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveFeedback({ tripId, rating, comment });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  if (submitted) {
    return (
      <div className="mt-12 text-center">
        <p className="text-green-600 font-semibold">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mt-12">
      <h3 className="text-2xl font-semibold text-blue-700 mb-4">Your Feedback</h3>
      <div className="flex items-center mb-4">
        <span className="mr-2">Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`cursor-pointer text-2xl ${
              star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
      </div>
      <textarea
        className="w-full border border-gray-300 p-3 rounded-lg mb-4"
        rows="4"
        placeholder="Tell us about your experience or suggestions..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
      <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackSection;
