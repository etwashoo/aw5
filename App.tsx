import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Gallery } from './components/Gallery';
import { AdminPanel } from './components/AdminPanel';
import { Welcome } from './components/Welcome';
import { About } from './components/About';
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
  welcomeMessage: "Welcome to my studio. Here I explore the interplay of light, shadow, and color through oil and acrylic mediums.\n\nMy work is an invitation to pause and reflect on the quiet moments of existence.",
  featuredImageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?q=80&w=1000&auto=format&fit=crop",
  aboutText: "Anna Maria Wilkemeyer is a contemporary painter known for her evocative use of texture and light. Born in Berlin and educated in Florence, her work bridges the gap between classical technique and abstract expressionism.\n\nWith a focus on large-scale oil paintings, she investigates themes of memory, nature, and the passage of time.",
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
      setLoginError('Incorrect password');
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

        {viewMode === ViewMode.GALLERY && (
          <>
             {!isConfigured ? (
                 <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl">
                        <h2 className="text-xl font-serif text-yellow-800 mb-2">Setup Required</h2>
                        <p className="text-yellow-700 mb-4">Gallery configuration is missing.</p>
                        <button 
                            onClick={() => setViewMode(ViewMode.LOGIN)}
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 px-4 py-2 rounded transition-colors text-sm font-medium"
                        >
                            Artist Login
                        </button>
                    </div>
                 </div>
             ) : (
                 <>
                    {isLoadingData && artworks.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-pulse text-stone-400 font-serif">Loading Collection...</div>
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
              <h2 className="text-2xl font-serif text-center mb-2 text-stone-900">Artist Access</h2>
              <p className="text-center text-stone-500 text-sm mb-6">Enter the studio password to manage your paintings.</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-stone-900 border border-stone-300 rounded focus:ring-1 focus:ring-stone-500 focus:border-stone-500 outline-none placeholder-stone-400"
                    placeholder="Enter password..."
                    autoFocus
                  />
                </div>
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button 
                  type="submit"
                  className="w-full py-2 bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
                >
                  Enter Studio
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

      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-serif italic text-lg mb-4 text-stone-300">"Painting is poetry that is seen rather than felt."</p>
          <p className="text-sm tracking-wide">© {new Date().getFullYear()} Anna Maria Wilkemeyer. Powered by Gemini AI & GitHub.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;