import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { motion } from "framer-motion";

const INITIAL_VISIBLE = 4;

const HomepageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [visibleReviews, setVisibleReviews] = useState(INITIAL_VISIBLE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*, user_id")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error && data) setReviews(data);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  const loadMoreReviews = () => {
    setVisibleReviews((prev) => Math.min(prev + 4, reviews.length));
  };
  const loadLessReviews = () => {
    setVisibleReviews((prev) => Math.max(prev - 4, INITIAL_VISIBLE));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) =>
      i < rating ? (
        <span key={i} className="text-yellow-400 text-xl">★</span>
      ) : (
        <span key={i} className="text-yellow-400 text-xl">☆</span>
      )
    );
  };

  if (loading) return null;
  if (!reviews.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="py-16"
    >
      <div className="max-w-5xl mx-auto min-h-[500px] rounded-2xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-8 sm:px-10 lg:px-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real feedback from our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {reviews.slice(0, visibleReviews).map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col h-full"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold text-lg">
                    {review.user_id ? review.user_id.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {review.rating}.0
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative mb-4 flex-grow">
                <span className="text-gray-300 dark:text-gray-600 text-2xl absolute -top-2 -left-1 select-none">“</span>
                <p className="text-gray-700 dark:text-gray-300 pl-6 italic">
                  {review.description}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 space-x-4">
          {visibleReviews < reviews.length && (
            <button
              onClick={loadMoreReviews}
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg font-semibold"
            >
              Load More Reviews
            </button>
          )}
          {visibleReviews > INITIAL_VISIBLE && (
            <button
              onClick={loadLessReviews}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg font-semibold"
            >
              Show Less
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default HomepageReviews; 