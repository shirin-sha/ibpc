import { memo, useMemo, useState, useRef, useEffect } from 'react';

// Memoized industry sector select component with virtual scrolling
const IndustrySectorSelect = memo(({ name, value, onChange, id, label, required = false, placeholder = "Select Industry Sector" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  
  // Lazy load industry sectors only when needed
  const industrySectors = useMemo(() => [
    'Asset Management & Investments',
    'Auditing & Financial Advisory',
    'Auto Spare Parts Distributors',
    'Auto Spare Parts Trading',
    'Automotive Dealerships',
    'Automotive Services & Maintenance',
    'Banking & Financial Services',
    'Building Materials Trading',
    'CCTV & Alarm Systems',
    'Cash Transfer Services',
    'Civil Construction',
    'Cleaning Equipment Supply',
    'Communication & IT Systems',
    'Conglomerate (Multi-sector)',
    'Construction Materials',
    'Consulting Services',
    'Digital Production & Printers',
    'Drain & Sewage Cleaning',
    'EPC (Engineering, Procurement & Construction)',
    'Educational Institutions',
    'Electrical Supplies',
    'Electro Mechanical Contracting',
    'F&B – Distribution & Services',
    'Finance & Accounting Services',
    'Food & Beverage Manufacturing',
    'Food Distribution',
    'Foodstuff Trading',
    'Garments & Footwear',
    'General Contracting',
    'General Trading',
    'Gift Items',
    'Guarding & Patrolling Services',
    'HVAC Supplies',
    'Heavy Equipment Leasing & Rental',
    'Hypermarket / Department Stores',
    'IT Infrastructure',
    'Insurance & Investment Services',
    'Interior Designing & Turnkey Works',
    'Investment Banking & Brokerage',
    'Investment Holding Companies',
    'Janitorial & Housekeeping',
    'Legal Services',
    'Life Insurance & Health Services',
    'Light Manufacturing',
    'Management Consulting / Advisory',
    'Marble & Granite',
    'Media & Digital Marketing',
    'Medical & Scientific Equipment Trading',
    'Medical Equipment Supply',
    'Money Exchange Services',
    'Oil & Gas',
    'Online Learning Platforms',
    'Power Transmission & Distribution',
    'Printing & Packaging',
    'Real Estate Advisory',
    'Restaurants & Catering Services',
    'Retail – Clothing, Shoes, Accessories',
    'Road Sweeping & Refuse Collection',
    'Scientific Equipment',
    'Security & Surveillance Systems',
    'Shipping & Logistics',
    'Software & App Development',
    'Software Engineering',
    'Steel & Building Materials',
    'Sunrise Restaurant & Catering',
    'Tax Compliance Services',
    'Tea Boy & Messenger Services',
    'Technology Solutions Provider',
    'Telecommunications',
    'Textile Manufacturing',
    'Trademark & Patent Services',
    'Transport Services',
    'Travel & Tourism',
    'Tyres & Automotive Accessories',
    'Tyres & Spare Parts Trading',
    'Uniforms & Clothing Accessories',
    'Utility Contracting',
    'Vocational Training Centers',
    'Warehousing Solutions',
    'Waste Removal Services',
    'Woodwork Joinery',
    'Others',
  ], []);

  // Filter sectors based on search term
  const filteredSectors = useMemo(() => {
    if (!searchTerm) return industrySectors;
    return industrySectors.filter(sector => 
      sector.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [industrySectors, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 text-gray-900 peer pt-6 placeholder-transparent";

  const handleSelect = (sector) => {
    onChange({ target: { name, value: sector } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={selectRef}>
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : (industrySectors.find(s => s === value) || '')}
          onChange={(e) => {
            if (isOpen) {
              setSearchTerm(e.target.value);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className={inputClass}
          placeholder={placeholder}
          required={required}
          readOnly={!isOpen}
        />
        <label 
          htmlFor={id} 
          className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none"
        >
          {label} {required && <span style={{ color: '#061E3E' }}>*</span>}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSectors.length > 0 ? (
            filteredSectors.map((sector) => (
              <div
                key={sector}
                onClick={() => handleSelect(sector)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {sector}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">No sectors found</div>
          )}
        </div>
      )}
    </div>
  );
});

IndustrySectorSelect.displayName = 'IndustrySectorSelect';

export default IndustrySectorSelect;
