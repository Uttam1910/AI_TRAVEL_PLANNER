// src/components/Explore.jsx
import React from 'react';
import BlogList from './BlogList';

const Explore = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Explore Travel Blogs</h1>
        <p className="text-lg text-gray-600 mt-2">
          Discover inspiring travel stories, tips, and guides to fuel your wanderlust.
        </p>
      </header>
      <section>
        <BlogList />
      </section>
    </div>
  );
};

export default Explore;
