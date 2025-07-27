// src/components/BlogList.jsx
import React, { useState, useEffect } from 'react';
import BlogCard from './BlogCard';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/blogs.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        return response.json();
      })
      .then(data => {
        setBlogs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-xl text-gray-500">Loading blogs...</div>;
  }

  if (error) {
    return <div className="text-center text-xl text-red-500">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {blogs.map(blog => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
};

export default BlogList;
