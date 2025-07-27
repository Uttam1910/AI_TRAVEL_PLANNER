// src/components/BlogCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

const BlogCard = ({ blog }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="h-48 w-full overflow-hidden">
        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-gray-800">{blog.title}</h2>
        <p className="text-gray-600 mt-2">{blog.summary}</p>
        <p className="text-gray-500 text-sm text-right mt-4">
          {new Date(blog.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

BlogCard.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
    content: PropTypes.string,
    image: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  }).isRequired,
};

export default BlogCard;
