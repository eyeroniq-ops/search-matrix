import React from 'react';
import { Business } from '../types';

interface BusinessListProps {
  results: Business[][];
  loading: boolean;
  error: string | null;
}

const BusinessCard: React.FC<{ business: Business }> = ({ business }) => (
    <div className="bg-black/60 backdrop-blur-sm border border-[#E4007C]/50 rounded-lg p-4 flex flex-col justify-between transition-all duration-300 hover:border-[#E4007C] hover:shadow-[0_0_15px_rgba(228,0,124,0.6)]">
        <div>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-[#E4007C] mr-2">{business.name}</h3>
                <span className="text-xs bg-[#E4007C]/20 text-[#E4007C] px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">{business.source}</span>
            </div>
            <p className="text-sm text-[#E4007C]/80 mb-2">{business.category}</p>
            <p className="text-[#E4007C] mt-2"><strong className="text-[#E4007C]/80">Services/Products:</strong> {business.servicesOrProducts.join(', ')}</p>
            <p className="text-[#E4007C] mt-1"><strong className="text-[#E4007C]/80">Address:</strong> {business.address}</p>
        </div>
        <div className="mt-4 pt-2 border-t border-[#E4007C]/30">
            <p className="text-[#E4007C]"><strong className="text-[#E4007C]/80">Phone:</strong> {business.phone || 'N/A'}</p>
            <p className="text-[#E4007C]"><strong className="text-[#E4007C]/80">Email:</strong> {business.email || 'N/A'}</p>
            {business.websiteOrSocialMedia && (
              <a href={business.websiteOrSocialMedia} target="_blank" rel="noopener noreferrer" className="text-[#E4007C] hover:text-[#E4007C]/80 transition-colors mt-1 block truncate">
                <strong className="text-[#E4007C]/80">Web:</strong> {business.websiteOrSocialMedia}
              </a>
            )}
            {business.googleMapsUrl && (
                <a href={business.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-[#E4007C] hover:text-[#E4007C]/80 transition-colors mt-2 block font-semibold">
                    View on Google Maps &rarr;
                </a>
            )}
            {business.yelpUrl && (
              <a href={business.yelpUrl} target="_blank" rel="noopener noreferrer" className="text-[#E4007C] hover:text-[#E4007C]/80 transition-colors mt-1 block font-semibold">
                View on Yelp &rarr;
              </a>
            )}
        </div>
    </div>
);

const BusinessList: React.FC<BusinessListProps> = ({ results, loading, error }) => {

    const convertToCSV = (data: Business[]) => {
        if (!data || data.length === 0) return '';
        const headers = ['name', 'category', 'servicesOrProducts', 'phone', 'email', 'address', 'googleMapsUrl', 'websiteOrSocialMedia', 'source', 'yelpUrl'].join(',');
        const rows = data.map(row => 
            [
                row.name,
                row.category,
                Array.isArray(row.servicesOrProducts) ? row.servicesOrProducts.join('; ') : '',
                row.phone,
                row.email,
                row.address,
                row.googleMapsUrl || '',
                row.websiteOrSocialMedia,
                row.source,
                row.yelpUrl || ''
            ].map(value => {
                const strValue = String(value).replace(/"/g, '""');
                return `"${strValue}"`;
            }).join(',')
        );
        return [headers, ...rows].join('\n');
    };

    const downloadCSV = (csvContent: string, filename: string) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPage = (pageIndex: number, pageData: Business[]) => {
        const csv = convertToCSV(pageData);
        downloadCSV(csv, `eyeroniq_businesses_page_${pageIndex + 1}.csv`);
    };

    const handleExportAll = () => {
        const allBusinesses = results.flat();
        const csv = convertToCSV(allBusinesses);
        downloadCSV(csv, 'eyeroniq_businesses_all.csv');
    };

    if (loading && results.length === 0) {
        return <div className="text-center p-10 text-[#E4007C] text-lg">Initializing eyeroniq Search Matrix...</div>;
    }

    if (error && results.length === 0) {
        return <div className="text-center p-10 text-[#E4007C] bg-[#E4007C]/10 border border-[#E4007C] rounded-lg whitespace-pre-wrap">{error}</div>;
    }
    
    if (results.length === 0) {
        return <div className="text-center p-10 text-[#E4007C]">No results yet. Initiate a search to find businesses.</div>;
    }
    
    return (
        <div className="space-y-8">
            {error && (
                <div className="text-center p-4 text-[#E4007C] bg-[#E4007C]/10 border border-[#E4007C] rounded-lg whitespace-pre-wrap">
                    {error}
                </div>
            )}
            {results.length > 0 && (
                <div className="text-center">
                    <button onClick={handleExportAll} className="bg-[#E4007C] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#E4007C]/80 transition-all shadow-[0_0_10px_rgba(228,0,124,0.7)]">
                        Export All Pages ({results.flat().length} results) to CSV
                    </button>
                </div>
            )}
            {results.map((page, pageIndex) => (
                <div key={pageIndex} className="p-4 bg-black/50 backdrop-blur-sm border border-[#E4007C]/50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-[#E4007C]">Page {pageIndex + 1}</h2>
                        <button onClick={() => handleExportPage(pageIndex, page)} className="bg-[#E4007C]/80 text-black py-1 px-3 rounded-md hover:bg-[#E4007C] transition-colors shadow-md">
                            Export Page to CSV
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {page.map((business, index) => (
                            <BusinessCard key={`${pageIndex}-${index}`} business={business} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BusinessList;