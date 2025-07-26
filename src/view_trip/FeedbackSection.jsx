import { useState, useEffect } from 'react';
import { Star, Send, Save, AlertCircle } from 'react-feather';
import { saveFeedback } from '../service/firebaseConfig'; // Add this import

const FeedbackSection = ({ trip, currentUser }) => { // Add currentUser prop
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [emoji, setEmoji] = useState('😐');
  const [selectedTags, setSelectedTags] = useState([]);

  const emojiOptions = ['😍', '😊', '😐', '😕', '😠'];
  const tags = ['Scenic', 'Crowded', 'Family-Friendly', 'Affordable', 'Adventurous'];

  useEffect(() => {
    const localFeedback = localStorage.getItem(`feedback-${trip.id}`);
    if (localFeedback) {
      const { rating: savedRating, comment: savedComment } = JSON.parse(localFeedback);
      setRating(savedRating);
      setComment(savedComment);
    }
  }, [trip.id]);

  const handleSaveFeedback = async () => {
    setIsSaving(true);
    setSaveStatus('');

    try {
      const result = await saveFeedback({
        tripId: trip.id,
        userId: currentUser?.uid, // Use currentUser prop
        rating,
        comment,
        emoji,
        tags: selectedTags,
        timestamp: new Date().toISOString()
      });

      if (result.local) {
        setSaveStatus('local');
      } else {
        localStorage.removeItem(`feedback-${trip.id}`);
        setSaveStatus('success');
      }
    } catch (err) {
      localStorage.setItem(`feedback-${trip.id}`, JSON.stringify({
        tripId: trip.id,
        rating,
        comment,
        emoji,
        tags: selectedTags,
        timestamp: new Date().toISOString()
      }));
      setSaveStatus('local');
    }
    
    setIsSaving(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleTagClick = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Share Your Experience</h3>
      
      <div className="flex gap-4 mb-6">
        {emojiOptions.map((em, index) => (
          <button
            key={index}
            className={`text-3xl transition-transform duration-200 hover:scale-125 ${
              emoji === em ? 'scale-150' : ''
            }`}
            onClick={() => setEmoji(em)}
          >
            {em}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-8 h-8 stroke-1 cursor-pointer transition-colors duration-150 ${
              star <= (hoverRating || rating) 
                ? 'fill-yellow-400 stroke-yellow-400' 
                : 'fill-gray-300 stroke-gray-300'
            }`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
              selectedTags.includes(tag)
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleTagClick(tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      <textarea
        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 mb-6"
        placeholder="Share details about your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows="3"
      />

      <div className="flex items-center gap-4">
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
            isSaving 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
          onClick={handleSaveFeedback}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Save className="w-5 h-5" />
              Saving...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Feedback
            </>
          )}
        </button>

        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
            <span>✓ Saved successfully!</span>
          </div>
        )}
        {saveStatus === 'local' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>Saved feedback</span>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Your Feedback Preview:</h4>
        <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg">
          <span className="text-3xl">{emoji}</span>
          <div className="flex gap-1">
            {Array(rating).fill().map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 stroke-yellow-400" />
            ))}
          </div>
          <p className="text-gray-600">{comment || 'No comments yet'}</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;