
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Gallery } from './components/Gallery';
import { AdminPanel } from './components/AdminPanel';
import { Welcome } from './components/Welcome';
import { About } from './components/About';
import { Impressum } from './components/Impressum';
import { Datenschutz } from './components/Datenschutz';
import { ViewMode, Artwork, RepoConfig, ArtistProfile } from './types';
import { fetchGalleryFromGitHub, fetchProfile } from './services/githubService';

const CONFIG_KEY = 'museai_github_config';
const ARTIST_PASSWORD = 'muse';

const PUBLIC_REPO_CONFIG: RepoConfig = {
  owner: 'etwashoo',
  repo: 'aw3',
  branch: 'main',
};

const DEFAULT_PROFILE: ArtistProfile = {
  welcomeMessage: "Willkommen in meinem Atelier. Hier erforsche ich das Zusammenspiel von Licht, Schatten und Farbe durch Öl- und Acrylmalerei.\n\nMeine Arbeit ist eine Einladung, innezuhalten und über die stillen Momente des Daseins nachzudenken.",
  featuredImageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?q=80&w=1000&auto=format&fit=crop",
  aboutText: "Anna Maria Wilkemeyer ist eine zeitgenössische Malerin, bekannt für ihren evokativen Einsatz von Textur und Licht. Geboren in Berlin und ausgebildet in Florenz, schlägt ihr Werk eine Brücke zwischen klassischer Technik und abstraktem Expressionismus.\n\nMit einem Schwerpunkt auf großformatigen Ölgemälden untersucht sie Themen wie Erinnerung, Natur und das Verstreichen der Zeit.",
  aboutImageUrl: "https://images.unsplash.com/photo-1551029506-0807df4e2031?q=80&w=1000&auto=format&fit=crop"
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.WELCOME);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile>(DEFAULT_PROFILE);
  
  const [repoConfig, setRepoConfig] = useState<RepoConfig>(PUBLIC_REPO_CONFIG);
  
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setRepoConfig(prev => ({
            ...prev,
            owner: parsed.owner || PUBLIC_REPO_CONFIG.owner,
            repo: parsed.repo || PUBLIC_REPO_CONFIG.repo,
            branch: parsed.branch || PUBLIC_REPO_CONFIG.branch,
            token: parsed.token || '' 
        }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [repoConfig.owner, repoConfig.repo]);

  const loadData = async () => {
    if (repoConfig.owner && repoConfig.repo) {
        setIsLoadingData(true);
        const [galleryData, profileData] = await Promise.all([
            fetchGalleryFromGitHub(repoConfig),
            fetchProfile(repoConfig)
        ]);

        if (galleryData.length > 0) {
            setArtworks(galleryData);
        }
        if (profileData) {
            // Check for old default English welcome text and replace it with German default if found
            const oldEnglishWelcome = "Welcome to my studio. Here I explore the interplay of light, shadow, and color through oil and acrylic mediums.\n\nMy work is an invitation to pause and reflect on the quiet moments of existence.";
            
            if (profileData.welcomeMessage && profileData.welcomeMessage.replace(/\s+/g, ' ').trim() === oldEnglishWelcome.replace(/\s+/g, ' ').trim()) {
                profileData.welcomeMessage = DEFAULT_PROFILE.welcomeMessage;
            }

            // Check for old default English about text and replace it with German default if found
            const oldEnglishAbout = "Anna Maria Wilkemeyer is a contemporary painter known for her evocative use of texture and light. Born in Berlin and educated in Florence, her work bridges the gap between classical technique and abstract expressionism.\n\nWith a focus on large-scale oil paintings, she investigates themes of memory, nature, and the passage of time.";

            if (profileData.aboutText && profileData.aboutText.replace(/\s+/g, ' ').trim() === oldEnglishAbout.replace(/\s+/g, ' ').trim()) {
                profileData.aboutText = DEFAULT_PROFILE.aboutText;
            }

            // Merge with default to ensure new fields like 'aboutText' exist if loading old JSON
            setArtistProfile({ ...DEFAULT_PROFILE, ...profileData });
        }
        setIsLoadingData(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ARTIST_PASSWORD) {
      setViewMode(ViewMode.ADMIN);
      setPasswordInput('');
      setLoginError(null);
    } else {
      setLoginError('Falsches Passwort');
    }
  };

  const handleConfigUpdate = (newConfig: RepoConfig) => {
    setRepoConfig(newConfig);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
  };

  const isConfigured = repoConfig.owner && repoConfig.repo;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header viewMode={viewMode} setViewMode={setViewMode} />
      
      <main className="flex-grow">
        {viewMode === ViewMode.WELCOME && (
             <Welcome profile={artistProfile} />
        )}

        {viewMode === ViewMode.ABOUT && (
             <About profile={artistProfile} />
        )}

        {viewMode === ViewMode.IMPRESSUM && (
             <Impressum />
        )}

        {viewMode === ViewMode.DATENSCHUTZ && (
             <Datenschutz />
        )}

        {viewMode === ViewMode.GALLERY && (
          <>
             {!isConfigured ? (
                 <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl">
                        <h2 className="text-xl font-serif text-yellow-800 mb-2">Einrichtung erforderlich</h2>
                        <p className="text-yellow-700 mb-4">Galerie-Konfiguration fehlt.</p>
                        <button 
                            onClick={() => setViewMode(ViewMode.LOGIN)}
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 px-4 py-2 rounded transition-colors text-sm font-medium"
                        >
                            Künstler-Login
                        </button>
                    </div>
                 </div>
             ) : (
                 <>
                    {isLoadingData && artworks.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-pulse text-stone-400 font-serif">Sammlung wird geladen...</div>
                        </div>
                    ) : (
                        <Gallery artworks={artworks} />
                    )}
                 </>
             )}
          </>
        )}

        {viewMode === ViewMode.LOGIN && (
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-stone-100">
              <h2 className="text-2xl font-serif text-center mb-2 text-stone-900">Künstler-Login</h2>
              <p className="text-center text-stone-500 text-sm mb-6">Geben Sie das Atelier-Passwort ein, um Ihre Werke zu verwalten.</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Passwort</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-stone-900 border border-stone-300 rounded focus:ring-1 focus:ring-stone-500 focus:border-stone-500 outline-none placeholder-stone-400"
                    placeholder="Passwort eingeben..."
                    autoFocus
                  />
                </div>
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button 
                  type="submit"
                  className="w-full py-2 bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
                >
                  Atelier betreten
                </button>
              </form>
            </div>
          </div>
        )}

        {viewMode === ViewMode.ADMIN && (
          <AdminPanel 
            artworks={artworks} 
            repoConfig={repoConfig}
            currentProfile={artistProfile}
            onConfigChange={handleConfigUpdate}
            onRefreshData={loadData}
            onLogout={() => {
                setViewMode(ViewMode.WELCOME);
            }}
          />
        )}
      </main>

      <footer className="bg-stone-100 text-stone-600 py-12 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm tracking-wide">© {new Date().getFullYear()} Anna Maria Wilkemeyer</p>
          <div className="mt-8 space-x-6 flex justify-center items-center">
             <button onClick={() => setViewMode(ViewMode.IMPRESSUM)} className="text-xs text-stone-500 hover:text-stone-900 uppercase tracking-widest transition-colors">
               Impressum
             </button>
             <span className="text-stone-300">|</span>
             <button onClick={() => setViewMode(ViewMode.DATENSCHUTZ)} className="text-xs text-stone-500 hover:text-stone-900 uppercase tracking-widest transition-colors">
               Datenschutz
             </button>
             <span className="text-stone-300">|</span>
             <button onClick={() => setViewMode(ViewMode.LOGIN)} className="text-xs text-stone-500 hover:text-stone-900 uppercase tracking-widest transition-colors">
               Künstler-Login
             </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
