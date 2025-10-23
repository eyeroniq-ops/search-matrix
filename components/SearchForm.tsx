import React, { useState, useEffect } from 'react';
import { SearchParams } from '../types';
import { BUSINESS_CATEGORIES } from '../constants';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
  onUseLocation: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading, onUseLocation }) => {
  const [category, setCategory] = useState<string>(Object.keys(BUSINESS_CATEGORIES)[0]);
  const [niche, setNiche] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [radius, setRadius] = useState<number>(5);
  const [price, setPrice] = useState<string>('');
  const [reviews, setReviews] = useState<number>(0);
  const [keywords, setKeywords] = useState<string>('');

  const [niches, setNiches] = useState<string[]>(BUSINESS_CATEGORIES[category]);

  useEffect(() => {
    setNiches(BUSINESS_CATEGORIES[category] || []);
    setNiche('');
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ category, niche, address, radius, price, reviews, keywords });
  };
  
  const handleUseLocationClick = () => {
    onUseLocation();
    setAddress(''); // Clear address field to prioritize geolocation
  };

  const commonInputClass = "bg-black border border-[#E4007C] text-[#E4007C] placeholder-[#E4007C]/70 rounded-lg focus:ring-[#E4007C] focus:border-[#E4007C] block w-full p-2.5 transition-all duration-300 shadow-[0_0_5px_rgba(228,0,124,0.5)] focus:shadow-[0_0_10px_rgba(228,0,124,0.8)]";
  const commonLabelClass = "block mb-2 font-medium text-[#E4007C]";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-black/70 backdrop-blur-sm border border-[#E4007C]/50 rounded-lg shadow-[0_0_25px_rgba(228,0,124,0.5)]">
      <div>
        <label htmlFor="category" className={commonLabelClass}>Business Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={commonInputClass}>
          {Object.keys(BUSINESS_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="niche" className={commonLabelClass}>Niche / Specialty</label>
        <select id="niche" value={niche} onChange={(e) => setNiche(e.target.value)} className={commonInputClass} disabled={!niches.length}>
          <option value="">Any</option>
          {niches.map(nic => <option key={nic} value={nic}>{nic}</option>)}
        </select>
      </div>
      
      <div className="md:col-span-2 lg:col-span-1">
        <label htmlFor="address" className={commonLabelClass}>Address or Area</label>
         <div className="flex gap-2">
            <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className={commonInputClass} placeholder="e.g., San Francisco, CA" />
            <button type="button" onClick={handleUseLocationClick} title="Use my current location" className="p-2.5 bg-[#E4007C] hover:bg-[#E4007C]/80 text-black rounded-lg transition-colors shadow-lg hover:shadow-[#E4007C]/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            </button>
        </div>
      </div>
      
      <div>
        <label htmlFor="radius" className={commonLabelClass}>Radius (miles)</label>
        <input type="number" id="radius" value={radius} onChange={(e) => setRadius(parseInt(e.target.value, 10))} className={commonInputClass} min="1" max="50" />
      </div>

      <div>
        <label htmlFor="price" className={commonLabelClass}>Price Range</label>
        <select id="price" value={price} onChange={(e) => setPrice(e.target.value)} className={commonInputClass}>
          <option value="">Any</option>
          <option value="$">$ (Inexpensive)</option>
          <option value="$$">$$ (Moderate)</option>
          <option value="$$$">$$$ (Pricey)</option>
          <option value="$$$$">$$$$ (Ultra High-End)</option>
        </select>
      </div>

      <div>
        <label htmlFor="reviews" className={commonLabelClass}>Min. Review Stars</label>
        <select id="reviews" value={reviews} onChange={(e) => setReviews(parseInt(e.target.value, 10))} className={commonInputClass}>
          <option value="0">Any</option>
          <option value="1">1 Star+</option>
          <option value="2">2 Stars+</option>
          <option value="3">3 Stars+</option>
          <option value="4">4 Stars+</option>
          <option value="5">5 Stars</option>
        </select>
      </div>

      <div className="md:col-span-2 lg:col-span-3">
        <label htmlFor="keywords" className={commonLabelClass}>Optional Keywords (for specific features)</label>
        <input type="text" id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={commonInputClass} placeholder="e.g., outdoor seating, pet-friendly" />
      </div>

      <div className="md:col-span-2 lg:col-span-3">
        <button type="submit" disabled={loading} className="w-full text-black bg-[#E4007C] hover:bg-[#E4007C]/80 focus:ring-4 focus:outline-none focus:ring-[#E4007C]/50 font-medium rounded-lg px-5 py-3 text-center transition-all duration-300 disabled:bg-[#E4007C]/40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(228,0,124,0.6)] hover:shadow-[0_0_25px_rgba(228,0,124,0.8)] disabled:shadow-none">
          {loading ? 'Searching...' : 'Find Businesses'}
        </button>
      </div>
    </form>
  );
};

export default SearchForm;