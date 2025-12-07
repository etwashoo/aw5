import React from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div 
            className="flex-shrink-0 cursor-pointer flex flex-col justify-center" 
            onClick={() => setViewMode(ViewMode.WELCOME)}
          >
            <h1 className="font-serif text-2xl tracking-widest text-stone-900 uppercase">
              Anna Maria <span className="font-light">Wilkemeyer</span>
            </h1>
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mt-1">
              Fine Art Gallery
            </span>
          </div>
          
          <nav className="flex space-x-8">
            <button
              onClick={() => setViewMode(ViewMode.WELCOME)}
              className={`text-xs uppercase tracking-widest font-medium transition-colors ${
                viewMode === ViewMode.WELCOME 
                  ? 'text-stone-900' 
                  : 'text-stone-400 hover:text-stone-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setViewMode(ViewMode.ABOUT)}
              className={`text-xs uppercase tracking-widest font-medium transition-colors ${
                viewMode === ViewMode.ABOUT 
                  ? 'text-stone-900' 
                  : 'text-stone-400 hover:text-stone-900'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setViewMode(ViewMode.GALLERY)}
              className={`text-xs uppercase tracking-widest font-medium transition-colors ${
                viewMode === ViewMode.GALLERY 
                  ? 'text-stone-900' 
                  : 'text-stone-400 hover:text-stone-900'
              }`}
            >
              Paintings
            </button>
            <button
              onClick={() => setViewMode(viewMode === ViewMode.ADMIN ? ViewMode.WELCOME : ViewMode.LOGIN)}
              className={`text-xs uppercase tracking-widest font-medium transition-colors ${
                viewMode === ViewMode.ADMIN || viewMode === ViewMode.LOGIN
                  ? 'text-stone-900' 
                  : 'text-stone-400 hover:text-stone-900'
              }`}
            >
              {viewMode === ViewMode.ADMIN ? 'Admin' : 'Login'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};