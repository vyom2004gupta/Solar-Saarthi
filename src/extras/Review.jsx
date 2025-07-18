import React, { useState } from "react";
import { FaStar, FaRegStar, FaQuoteLeft } from "react-icons/fa";
import Button from "../components/Button";

const Review = () => {
  // State for reviews (will be replaced with backend data)
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      rating: 5,
      comment:
        "This solar advisory platform completely transformed my energy usage. The AR visualization helped me understand exactly how panels would look on my roof!",
      location: "Bangalore, Karnataka",
      date: "2023-10-15",
    },
    {
      id: 2,
      name: "Priya Patel",
      rating: 4,
      comment:
        "The energy predictions were incredibly accurate. I've saved 40% on my electricity bills since installation.",
      location: "Mumbai, Maharashtra",
      date: "2023-09-28",
    },
    {
      id: 3,
      name: "Amit Singh",
      rating: 5,
      comment:
        "The blockchain energy trading feature is revolutionary. I'm now earning from my excess solar production!",
      location: "Delhi",
      date: "2023-11-02",
    },
    {
      id: 4,
      name: "Neha Gupta",
      rating: 5,
      comment:
        "The multi-language support made it so easy for my parents to understand the benefits. Excellent platform!",
      location: "Hyderabad, Telangana",
      date: "2023-10-20",
    },
    {
      id: 5,
      name: "Sanjay Verma",
      rating: 4,
      comment:
        "Great customer service and detailed analysis of my home's solar potential.",
      location: "Chennai, Tamil Nadu",
      date: "2023-11-15",
    },
    {
      id: 6,
      name: "Ananya Desai",
      rating: 5,
      comment:
        "The financial savings calculator was spot on. It helped me make an informed decision.",
      location: "Pune, Maharashtra",
      date: "2023-10-05",
    },
    {
      id: 7,
      name: "Vikram Joshi",
      rating: 5,
      comment:
        "The installation process was seamless and the team was very professional.",
      location: "Ahmedabad, Gujarat",
      date: "2023-09-10",
    },
    {
      id: 8,
      name: "Meera Nair",
      rating: 4,
      comment:
        "The mobile app makes it easy to monitor my solar production in real-time.",
      location: "Kochi, Kerala",
      date: "2023-11-20",
    },
  ]);

  const [visibleReviews, setVisibleReviews] = useState(4);
  const initialVisibleReviews = 4;

  // Function to load more reviews
  const loadMoreReviews = () => {
    // Show all reviews or increment by 4 (whichever is smaller)
    setVisibleReviews((prev) => Math.min(prev + 4, reviews.length));
  };

  // Function to load less reviews
  const loadLessReviews = () => {
    // Show initial number of reviews or decrement by 4 (whichever is larger)
    setVisibleReviews((prev) => Math.max(prev - 4, initialVisibleReviews));
  };

  // Render star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) =>
      i < rating ? (
        <FaStar key={i} className="text-yellow-400 text-xl" />
      ) : (
        <FaRegStar key={i} className="text-yellow-400 text-xl" />
      )
    );
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Trusted by thousands of homeowners across India who have transformed
            their energy usage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {reviews.slice(0, visibleReviews).map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col h-full"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold text-lg">
                    {review.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {review.name}
                  </h3>
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {review.rating}.0
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative mb-4 flex-grow">
                <FaQuoteLeft className="text-gray-300 dark:text-gray-600 text-2xl absolute -top-2 -left-1" />
                <p className="text-gray-700 dark:text-gray-300 pl-6 italic">
                  {review.comment}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {review.location} • {review.date}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 space-x-4">
          {visibleReviews < reviews.length && (
            <Button
              onClick={loadMoreReviews}
              variant="primary"
              size="large"
              className="bg-indigo-600 text-black hover:bg-indigo-700 dark:text-white px-8 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              Load More Reviews
            </Button>
          )}
          {visibleReviews > initialVisibleReviews && (
            <Button
              onClick={loadLessReviews}
              variant="secondary"
              size="large"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              Show Less
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Review;
