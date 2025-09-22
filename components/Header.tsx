import React from 'react';

interface HeaderProps {
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <button
          onClick={onHomeClick}
          className="flex items-center text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg -m-2 p-2 transition-colors hover:bg-light"
          aria-label="Back to home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c.34 0 .67-.04 1-.09-.53-1.1-1.34-3.13 1.3-4.99.88-.62 1.5-1.59 1.5-2.92 0-1.66-1.34-3-3-3-.35 0-.69.06-1 .18-1.04-.69-2.25-1.18-3.5-1.18z" opacity=".3"/>
            <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm4.5 10.5c-2.64 1.86-3.53-.14-2.5-2.09.82-1.57 0-3.41-1.5-3.41-1.34 0-2.27.88-2.5 2.09-.23 1.21-.05 2.31.28 3.28C9.39 19.33 7 16.64 7 12c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.33-.52 2.55-1.38 3.45-.07.05-.12.11-.12.18v.87z" />
          </svg>
          <h1 className="text-2xl font-bold text-dark">AI Nutrition Assistant</h1>
        </button>
      </div>
    </header>
  );
};

export default Header;
