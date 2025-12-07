import React from 'react';
import { ArtistProfile } from '../types';

interface WelcomeProps {
    profile: ArtistProfile;
}

export const Welcome: React.FC<WelcomeProps> = ({ profile }) => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 min-h-[80vh] flex flex-col items-center justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                {/* Image Section */}
                <div className="order-2 lg:order-1 relative">
                    <div className="absolute inset-0 bg-stone-50 transform translate-x-4 translate-y-4 -z-10"></div>
                    <img 
                        src={profile.featuredImageUrl} 
                        alt="Featured Painting" 
                        className="w-full h-auto object-cover shadow-sm max-h-[70vh]"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?q=80&w=1000&auto=format&fit=crop';
                        }}
                    />
                </div>

                {/* Text Section */}
                <div className="order-1 lg:order-2 text-center lg:text-left space-y-8">
                    <div className="space-y-2">
                        <span className="text-xs tracking-[0.3em] uppercase text-stone-400">Contemporary Fine Art</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-stone-900 leading-tight">
                            Capturing the <br/>
                            <span className="italic font-light text-stone-600">Soul</span> of Color
                        </h2>
                    </div>
                    
                    <div className="w-16 h-px bg-stone-200 mx-auto lg:mx-0"></div>
                    
                    <p className="text-lg text-stone-600 font-light leading-relaxed whitespace-pre-line">
                        {profile.welcomeMessage}
                    </p>
                    
                    <div className="pt-4">
                        <p className="font-serif italic text-stone-400 text-lg">Anna Maria Wilkemeyer</p>
                    </div>
                </div>
            </div>
        </div>
    );
};