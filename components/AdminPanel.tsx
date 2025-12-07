import React, { useState, useRef, useEffect } from 'react';
import { Artwork, RepoConfig, ArtistProfile } from '../types';
import { generateArtworkMetadata, fileToGenerativePart } from '../services/geminiService';
import { uploadImageToGitHub, updateGalleryManifest, verifyRepoAccess, getRepoDetails, deleteArtworkFromGitHub, updateProfile } from '../services/githubService';

interface AdminPanelProps {
  artworks: Artwork[];
  repoConfig: RepoConfig;
  currentProfile: ArtistProfile;
  onConfigChange: (config: RepoConfig) => void;
  onRefreshData: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  artworks, 
  repoConfig, 
  currentProfile,
  onConfigChange, 
  onRefreshData,
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'profile' | 'settings'>('upload');
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Profile State
  const [welcomeMsg, setWelcomeMsg] = useState(currentProfile.welcomeMessage);
  const [featuredPreview, setFeaturedPreview] = useState<string>(currentProfile.featuredImageUrl);
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const featuredInputRef = useRef<HTMLInputElement>(null);

  const [aboutMsg, setAboutMsg] = useState(currentProfile.aboutText || '');
  const [aboutPreview, setAboutPreview] = useState<string>(currentProfile.aboutImageUrl || '');
  const [aboutFile, setAboutFile] = useState<File | null>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Settings State
  const [localConfig, setLocalConfig] = useState<RepoConfig>(repoConfig);
  const [isVerifying, setIsVerifying] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);
  const [repoWarning, setRepoWarning] = useState<string | null>(null);

  // Deletion State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!repoConfig.owner || !repoConfig.repo || !repoConfig.token) {
      setActiveTab('settings');
    }
  }, [repoConfig]);

  // --- Handlers for Upload ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setTitle('');
      setDescription('');
      setMedium('');
      setTags([]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !previewUrl) return;
    setIsAnalysing(true);
    setError(null);
    try {
      const base64Data = await fileToGenerativePart(file);
      const metadata = await generateArtworkMetadata(base64Data, file.type);
      setTitle(metadata.title);
      setDescription(metadata.description);
      setMedium(metadata.medium);
      setTags(metadata.tags);
    } catch (err) {
      setError("Failed to analyze image. Ensure API Key is valid.");
      console.error(err);
    } finally {
      setIsAnalysing(false);
    }
  };

  const handlePublish = async () => {
    if (!file || !title) {
      setError("Please select an image and ensure a title is set.");
      return;
    }
    if (!repoConfig.token) {
        setError("GitHub Token is missing. Please check Settings.");
        return;
    }
    setIsUploading(true);
    setUploadStatus('Preparing...');
    try {
        const base64Data = await fileToGenerativePart(file);
        setUploadStatus('Uploading painting to GitHub...');
        const imageUrl = await uploadImageToGitHub(file, base64Data, repoConfig);
        setUploadStatus('Updating gallery manifest...');
        const newArtwork: Artwork = {
            id: crypto.randomUUID(),
            imageUrl,
            title,
            description,
            medium,
            tags,
            createdAt: Date.now()
        };
        await updateGalleryManifest(newArtwork, repoConfig);
        setUploadStatus('Success!');
        onRefreshData();
        resetForm();
        setTimeout(() => { setIsUploading(false); setUploadStatus(''); }, 1500);
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to publish artwork");
        setIsUploading(false);
        setUploadStatus('');
    }
  };

  const handleDelete = async (art: Artwork) => {
      if (!window.confirm(`Are you sure you want to delete "${art.title}"? This cannot be undone.`)) {
          return;
      }
      setDeletingId(art.id);
      try {
          await deleteArtworkFromGitHub(art, repoConfig);
          onRefreshData();
      } catch (err: any) {
          console.error(err);
          alert("Failed to delete artwork: " + (err.message || "Unknown error"));
      } finally {
          setDeletingId(null);
      }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setTitle('');
    setDescription('');
    setMedium('');
    setTags([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Handlers for Profile ---
  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setFeaturedFile(file);
          setFeaturedPreview(URL.createObjectURL(file));
      }
  };

  const handleAboutImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setAboutFile(file);
          setAboutPreview(URL.createObjectURL(file));
      }
  };

  const handleSaveProfile = async () => {
      setIsSavingProfile(true);
      try {
          let featuredUrl = currentProfile.featuredImageUrl;
          let aboutUrl = currentProfile.aboutImageUrl || '';
          
          if (featuredFile) {
              const base64 = await fileToGenerativePart(featuredFile);
              featuredUrl = await uploadImageToGitHub(featuredFile, base64, repoConfig);
          }

          if (aboutFile) {
              const base64 = await fileToGenerativePart(aboutFile);
              aboutUrl = await uploadImageToGitHub(aboutFile, base64, repoConfig);
          }

          const newProfile: ArtistProfile = {
              welcomeMessage: welcomeMsg,
              featuredImageUrl: featuredUrl,
              aboutText: aboutMsg,
              aboutImageUrl: aboutUrl
          };

          await updateProfile(newProfile, repoConfig);
          onRefreshData(); 
          alert("Profile updated successfully!");
      } catch (e: any) {
          alert("Failed to update profile: " + e.message);
      } finally {
          setIsSavingProfile(false);
      }
  };

  // --- Handlers for Settings ---
  const saveSettings = async () => {
      setIsVerifying(true);
      setError(null);
      setRepoWarning(null);
      setConfigSuccess(false);
      try {
          const isValid = await verifyRepoAccess(localConfig);
          if (isValid) {
              const details = await getRepoDetails(localConfig);
              if (details && details.private) {
                setRepoWarning("Warning: This repository is set to PRIVATE. Images will NOT be visible publicly.");
              }
              onConfigChange(localConfig);
              setConfigSuccess(true);
              if (!details?.private) {
                setTimeout(() => setActiveTab('upload'), 1000);
              }
          } else {
              setError("Could not access repository. Check Owner, Repo, and Token.");
          }
      } catch (e) {
          setError("Verification failed.");
      } finally {
          setIsVerifying(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-stone-200 pb-4">
        <div className="mb-4 md:mb-0">
           <h2 className="text-2xl font-serif text-stone-900">Artist Studio</h2>
           <p className="text-stone-500 text-sm mt-1">
               {repoConfig.owner && repoConfig.repo ? `Connected to ${repoConfig.owner}/${repoConfig.repo}` : 'Not connected'}
           </p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
            >
                Upload Painting
            </button>
            <button 
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
            >
                Edit Profile
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
            >
                Settings
            </button>
            <div className="h-6 w-px bg-stone-300 mx-2 self-center"></div>
            <button 
                onClick={onLogout}
                className="text-red-600 hover:text-red-800 text-sm font-medium self-center"
            >
                Log Out
            </button>
        </div>
      </div>

      {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-stone-200">
              <h3 className="text-xl font-medium text-stone-900 mb-6">Repository Configuration</h3>
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">GitHub Username</label>
                        <input type="text" value={localConfig.owner} onChange={(e) => setLocalConfig({...localConfig, owner: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Repository Name</label>
                        <input type="text" value={localConfig.repo} onChange={(e) => setLocalConfig({...localConfig, repo: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded outline-none" />
                      </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Branch</label>
                    <input type="text" value={localConfig.branch} onChange={(e) => setLocalConfig({...localConfig, branch: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded outline-none" placeholder="main"/>
                  </div>
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">GitHub Token (Classic)</label>
                    <input type="password" value={localConfig.token || ''} onChange={(e) => setLocalConfig({...localConfig, token: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded outline-none" placeholder="ghp_..."/>
                  </div>
                  <div className="pt-4 mt-4 border-t border-stone-100">
                      <button onClick={saveSettings} disabled={isVerifying} className={`w-full py-2 rounded font-medium text-white transition-colors ${configSuccess ? 'bg-green-600' : 'bg-stone-900 hover:bg-stone-800'}`}>
                          {isVerifying ? 'Verifying...' : configSuccess ? 'Connected!' : 'Save Configuration'}
                      </button>
                      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                      {repoWarning && <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">{repoWarning}</div>}
                  </div>
                  {configSuccess && (
                     <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">Don't forget to update PUBLIC_REPO_CONFIG in App.tsx for public access!</p>
                     </div>
                  )}
                  <div className="mt-4 p-4 bg-stone-100 border border-stone-200 rounded text-stone-600 text-xs font-mono">
                      <p className="font-bold mb-2">Make Site Public:</p>
                      <p>const PUBLIC_REPO_CONFIG = {'{'}</p>
                      <p className="pl-4">owner: '{localConfig.owner}',</p>
                      <p className="pl-4">repo: '{localConfig.repo}',</p>
                      <p className="pl-4">branch: '{localConfig.branch || 'main'}'</p>
                      <p>{'};'}</p>
                      <p className="mt-2 italic text-stone-500">Copy this into App.tsx</p>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-8">
              {/* Homepage Section */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
                  <h3 className="text-xl font-serif text-stone-900 mb-6 pb-2 border-b border-stone-100">Homepage Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Featured Painting</label>
                          <div 
                              className="border-2 border-dashed border-stone-300 rounded-lg p-4 cursor-pointer hover:bg-stone-50 transition-colors text-center bg-stone-50/50"
                              onClick={() => featuredInputRef.current?.click()}
                          >
                              <img src={featuredPreview} alt="Featured" className="h-48 w-full object-contain mb-2" />
                              <span className="text-xs text-stone-500">Click to change</span>
                              <input type="file" ref={featuredInputRef} className="hidden" accept="image/*" onChange={handleFeaturedImageChange} />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Welcome Message</label>
                          <textarea 
                              value={welcomeMsg}
                              onChange={(e) => setWelcomeMsg(e.target.value)}
                              rows={8}
                              className="w-full px-4 py-2 border border-stone-300 rounded outline-none focus:border-stone-500"
                          />
                      </div>
                  </div>
              </div>

              {/* About Page Section */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
                  <h3 className="text-xl font-serif text-stone-900 mb-6 pb-2 border-b border-stone-100">About Page Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Artist Portrait</label>
                          <div 
                              className="border-2 border-dashed border-stone-300 rounded-lg p-4 cursor-pointer hover:bg-stone-50 transition-colors text-center bg-stone-50/50"
                              onClick={() => aboutInputRef.current?.click()}
                          >
                              {aboutPreview ? (
                                <img src={aboutPreview} alt="Artist" className="h-64 w-full object-cover mb-2 grayscale" />
                              ) : (
                                <div className="h-64 flex items-center justify-center text-stone-400">No Image</div>
                              )}
                              <span className="text-xs text-stone-500">Click to upload portrait</span>
                              <input type="file" ref={aboutInputRef} className="hidden" accept="image/*" onChange={handleAboutImageChange} />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Artist Biography</label>
                          <textarea 
                              value={aboutMsg}
                              onChange={(e) => setAboutMsg(e.target.value)}
                              rows={12}
                              className="w-full px-4 py-2 border border-stone-300 rounded outline-none focus:border-stone-500"
                              placeholder="Write your biography here..."
                          />
                      </div>
                  </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="px-8 py-3 bg-stone-900 text-white font-medium rounded hover:bg-stone-800 disabled:opacity-50"
                >
                    {isSavingProfile ? 'Saving Changes...' : 'Save All Profile Changes'}
                </button>
              </div>
          </div>
      )}

      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
            <div 
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors min-h-[300px] ${
                    previewUrl ? 'border-stone-200 bg-stone-50' : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50 cursor-pointer'
                }`}
                onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <div className="relative w-full h-full">
                        <img src={previewUrl} alt="Preview" className="max-h-[400px] mx-auto object-contain shadow-lg" />
                        <button onClick={(e) => { e.stopPropagation(); resetForm(); }} className="absolute top-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white text-stone-600 shadow-sm">✕</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                             <span className="text-2xl">🎨</span>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-stone-900">Upload Painting</p>
                            <p className="text-sm text-stone-500">JPG, PNG up to 5MB</p>
                        </div>
                    </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            {previewUrl && (
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalysing || isUploading}
                    className="w-full py-3 bg-stone-100 text-stone-900 border border-stone-200 font-medium rounded shadow-sm hover:bg-stone-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isAnalysing ? 'Analyzing with Gemini...' : '✨ Auto-Generate Metadata'}
                </button>
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200 relative overflow-hidden">
                {isUploading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                         <p className="text-stone-900 font-medium">{uploadStatus}</p>
                    </div>
                )}
                <h3 className="text-lg font-medium text-stone-900 mb-6">Painting Details</h3>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded outline-none" placeholder="Untitled" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Medium</label>
                        <input type="text" value={medium} onChange={(e) => setMedium(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded outline-none" placeholder="e.g. Oil on Canvas" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="w-full px-4 py-2 border border-stone-300 rounded outline-none" placeholder="Generated description will appear here..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="bg-stone-100 text-stone-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                                    {tag} <button onClick={() => setTags(tags.filter((_, i) => i !== idx))} className="hover:text-red-500">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 border-t border-stone-100">
                        <button onClick={handlePublish} disabled={isUploading || !title} className="w-full py-3 bg-stone-900 text-white font-serif tracking-wide rounded hover:bg-stone-800 disabled:opacity-50">
                            Add to Gallery
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Existing Artworks List (only show on upload tab) */}
      {activeTab === 'upload' && (
      <div className="mt-16">
          <h3 className="text-xl font-serif text-stone-900 mb-6">Collection ({artworks.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {artworks.map(art => (
                  <div key={art.id} className="group relative border border-stone-200 rounded overflow-hidden">
                      <div className="aspect-square bg-stone-100 relative">
                          <img src={art.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" alt={art.title} />
                          <button
                              onClick={() => handleDelete(art)}
                              disabled={!!deletingId}
                              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md disabled:bg-stone-400"
                              title="Delete Artwork"
                          >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          {deletingId === art.id && (
                             <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20">
                                 <span className="text-red-600 font-bold text-xs">DELETING...</span>
                             </div>
                          )}
                      </div>
                      <div className="p-3 bg-white">
                          <p className="font-medium text-stone-900 truncate">{art.title}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
      )}
    </div>
  );
};