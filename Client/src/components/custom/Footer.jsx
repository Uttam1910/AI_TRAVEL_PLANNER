import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 border-t border-white/6">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo4.png" alt="Logo" className="h-10 w-auto object-contain" />
            <span className="font-semibold text-white">AI Travel Planner</span>
          </Link>
          <p className="mt-3 text-sm text-gray-400">Plan smarter trips with AI-driven recommendations, maps, and booking tools.</p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Product</h4>
          <ul className="text-sm space-y-2">
            <li><Link to="/create-trip" className="hover:text-white">Create Trip</Link></li>
            <li><Link to="/explore" className="hover:text-white">Explore</Link></li>
            <li><Link to="/recommendations" className="hover:text-white">Recommendations</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Company</h4>
          <ul className="text-sm space-y-2">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Blog</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Follow</h4>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white"><FaTwitter /></a>
            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white"><FaInstagram /></a>
            <a href="#" aria-label="GitHub" className="text-gray-400 hover:text-white"><FaGithub /></a>
          </div>
          <p className="mt-6 text-xs text-gray-500">© {new Date().getFullYear()} AI Travel Planner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
