import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';

const StarRating = ({ rating, setRating, disabled }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none`}
        onClick={() => !disabled && setRating(star)}
        disabled={disabled}
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
      >
        ★
      </button>
    ))}
  </div>
);

const ReviewPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndReview = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (!error && data) {
        setReview(data);
        setRating(data.rating);
        setDescription(data.description);
      }
      setLoading(false);
    };
    fetchUserAndReview();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating < 1 || rating > 5 || !description.trim()) {
      setError('Please provide a rating (1-5 stars) and a description.');
      return;
    }
    if (review) {
      // Update
      const { error } = await supabase
        .from('reviews')
        .update({ rating, description, updated_at: new Date().toISOString() })
        .eq('id', review.id);
      if (!error) {
        setReview({ ...review, rating, description, updated_at: new Date().toISOString() });
        setEditMode(false);
      } else {
        setError('Failed to update review: ' + error.message);
      }
    } else {
      // Insert
      const { error, data } = await supabase
        .from('reviews')
        .insert([{ rating, description, user_id: user.id }])
        .select()
        .single();
      if (!error) {
        setReview(data);
        setEditMode(false);
      } else {
        setError('Failed to submit review: ' + error.message);
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your review?')) return;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', review.id);
    if (!error) {
      setReview(null);
      setRating(0);
      setDescription('');
      setEditMode(false);
    } else {
      setError('Failed to delete review: ' + error.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Review</h2>
      <p className="mb-4">Please log in to write a review.</p>
      <button
        onClick={() => navigate('/login')}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
      >
        Login
      </button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Review</h2>
      {review && !editMode ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6 border-l-4 border-yellow-400">
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} setRating={() => {}} disabled={true} />
            <span className="text-gray-500 text-sm">{new Date(review.updated_at || review.created_at).toLocaleString()}</span>
          </div>
          <div className="text-gray-800 mb-4 whitespace-pre-line">{review.description}</div>
          <div className="flex gap-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
              onClick={() => setEditMode(true)}
            >
              Edit
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Your Rating</label>
            <StarRating rating={rating} setRating={setRating} disabled={false} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-800 outline-none focus:border-yellow-400 focus:shadow-yellow-100"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
            >
              {review ? 'Update Review' : 'Submit Review'}
            </button>
            {review && (
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md"
                onClick={() => { setEditMode(false); setRating(review.rating); setDescription(review.description); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewPage; 