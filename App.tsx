import React, { useState, useEffect, useRef } from 'react';
import { findBusinesses as findBusinessesOnGoogle } from './services/geminiService';
import { findBusinessesOnYelp } from './services/yelpService';
import { Business, SearchParams } from './types';
import SearchForm from './components/SearchForm';
import BusinessList from './components/BusinessList';
import MatrixBackground from './components/MatrixBackground';

const App: React.FC = () => {
  const [searchResults, setSearchResults] = useState<Business[][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const lastSearchParams = useRef<SearchParams | null>(null);

  useEffect(() => {
    // Attempt to get user location on initial load
    handleUseLocation();
  }, []);

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err: GeolocationPositionError) => {
          console.error("Error getting geolocation: ", err.message);
          setError(`Could not get your location: ${err.message}. Please enter an address manually.`);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const mergeAndDeduplicateResults = (googleResults: Business[], yelpResults: Business[]): Business[] => {
      const businessMap = new Map<string, Business>();

      // Add Google results first, as they are generally richer
      for (const business of googleResults) {
          const key = normalizeString(business.name) + normalizeString(business.address.split(',')[0]);
          businessMap.set(key, business);
      }

      // Add Yelp results, merging if a duplicate is found
      for (const business of yelpResults) {
          const key = normalizeString(business.name) + normalizeString(business.address.split(',')[0]);
          if (businessMap.has(key)) {
              const existing = businessMap.get(key)!;
              existing.source = 'Google & Yelp';
              existing.yelpUrl = business.yelpUrl;
              if (!existing.websiteOrSocialMedia && business.websiteOrSocialMedia) {
                  existing.websiteOrSocialMedia = business.websiteOrSocialMedia;
              }
          } else {
              businessMap.set(key, business);
          }
      }

      return Array.from(businessMap.values());
  }
  
  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    
    const isNewSearch = JSON.stringify(params) !== JSON.stringify(lastSearchParams.current);
    if (isNewSearch) {
        setSearchResults([]);
    }
    
    lastSearchParams.current = params;
    
    const businessesToExclude = isNewSearch ? [] : searchResults.flat().map(b => b.name);
    
    try {
        const [googleResults, yelpResults] = await Promise.all([
            findBusinessesOnGoogle(params, userLocation, businessesToExclude).catch(e => {
                console.error("Google Search Error:", e.message);
                setError(prev => prev ? `${prev}\nGoogle Search failed: ${e.message}` : `Google Search failed: ${e.message}`);
                return [];
            }),
            findBusinessesOnYelp(params, userLocation).catch(e => {
                console.error("Yelp Search Error:", e.message);
                setError(prev => prev ? `${prev}\nYelp Search failed: ${e.message}` : `Yelp Search failed: ${e.message}`);
                return [];
            })
        ]);

        const newBusinesses = mergeAndDeduplicateResults(googleResults, yelpResults);
        const existingBusinessNames = new Set(searchResults.flat().map(b => b.name));
        const uniqueNewBusinesses = newBusinesses.filter(b => !existingBusinessNames.has(b.name));

        if (uniqueNewBusinesses.length > 0) {
             if (isNewSearch) {
                 setSearchResults([uniqueNewBusinesses]);
             } else {
                 setSearchResults(prevResults => [...prevResults, uniqueNewBusinesses]);
             }
        } else {
             if(isNewSearch) {
                 setError("No businesses found for your criteria from Google or Yelp. Try expanding your search.");
             } else {
                 setError("No more unique businesses found for this search.");
             }
        }
    } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setSearchResults([]);
    setError(null);
    lastSearchParams.current = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <>
      <MatrixBackground />
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center p-8 border border-[#E4007C] rounded-lg shadow-[0_0_25px_rgba(228,0,124,0.8)] bg-black">
            <h2 className="text-3xl font-bold text-[#E4007C] animate-pulse">
              Accessing Search Matrix...
            </h2>
            <p className="text-[#E4007C]/80 mt-2">Scanning local network nodes...</p>
          </div>
        </div>
      )}
      <div className="relative min-h-screen text-[#E4007C] p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <header className="text-center my-8">
            <h1 className="text-4xl md:text-6xl font-bold text-[#E4007C] drop-shadow-[0_0_10px_#E4007C]">
              search matrix
            </h1>
            <p className="text-lg text-[#E4007C]/80 mt-2">by eyeroniq</p>
          </header>

          <main>
            <section className="mb-10">
              <SearchForm onSearch={handleSearch} loading={loading} onUseLocation={handleUseLocation} />
            </section>
            
            <section>
              {searchResults.length > 0 && !loading && (
                  <div className="text-center mb-6">
                      <button 
                          onClick={handleNewSearch} 
                          className="text-black bg-[#E4007C] hover:bg-[#E4007C]/80 focus:ring-4 focus:outline-none focus:ring-[#E4007C]/50 font-medium rounded-lg px-5 py-3 text-center transition-all duration-300 shadow-[0_0_15px_rgba(228,0,124,0.6)] hover:shadow-[0_0_25px_rgba(228,0,124,0.8)]">
                          New Search
                      </button>
                  </div>
              )}
              <BusinessList results={searchResults} loading={loading} error={error} />
            </section>
          </main>
        </div>
      </div>
    </>
  );
};

export default App;