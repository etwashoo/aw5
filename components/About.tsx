import React from 'react';
import { ArtistProfile } from '../types';

interface AboutProps {
    profile: ArtistProfile;
}

export const About: React.FC<AboutProps> = ({ profile }) => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-white min-h-[80vh]">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                
                {/* Image Column */}
                <div className="relative">
                    <div className="aspect-[4/5] bg-stone-100 overflow-hidden rounded-sm shadow-sm">
                        <img 
                            src={profile.aboutImageUrl} 
                            alt="Anna Maria Wilkemeyer" 
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551029506-0807df4e2031?q=80&w=1000&auto=format&fit=crop';
                            }}
                        />
                    </div>
                    <div className="mt-4 text-center md:text-left">
                        <p className="font-serif italic text-stone-400 text-sm">Anna Maria Wilkemeyer im Atelier</p>
                    </div>
                </div>

                {/* Text Column */}
                <div className="space-y-8 pt-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-6">Über die Künstlerin</h2>
                        <div className="w-12 h-px bg-stone-900 mb-8"></div>
                    </div>

                    <div className="prose prose-stone prose-lg text-stone-600 font-light leading-relaxed whitespace-pre-line">
                        {profile.aboutText || "Biografie noch nicht hinzugefügt."}
                    </div>

                    <div className="pt-8 grid grid-cols-2 gap-8 border-t border-stone-100">
                        <div>
                            <h4 className="font-serif text-stone-900 mb-2">Schwerpunkt</h4>
                            <p className="text-sm text-stone-500 uppercase tracking-wider">Öl & Acryl</p>
                            <p className="text-sm text-stone-500 uppercase tracking-wider">Abstrakter Expressionismus</p>
                        </div>
                        <div>
                            <h4 className="font-serif text-stone-900 mb-2">Standort</h4>
                            <p className="text-sm text-stone-500 uppercase tracking-wider">Atelier 4B</p>
                            <p className="text-sm text-stone-500 uppercase tracking-wider">Berlin, Deutschland</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};