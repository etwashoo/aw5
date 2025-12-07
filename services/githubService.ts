import { Artwork, RepoConfig, ArtistProfile } from '../types';

const BASE_URL = 'https://api.github.com';

// Helper for Unicode-safe Base64 encoding/decoding using modern TextEncoder/TextDecoder
const utf8_to_b64 = (str: string) => {
  try {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
  } catch (e) {
    console.error("Encoding error", e);
    // Fallback for older browsers if needed, though modern ones support TextEncoder
    return window.btoa(unescape(encodeURIComponent(str)));
  }
};

const b64_to_utf8 = (str: string) => {
  try {
    const binString = atob(str);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error("Decoding error", e);
    return decodeURIComponent(escape(window.atob(str)));
  }
};

export const getRepoDetails = async (config: RepoConfig) => {
  if (!config.token) return null;
  try {
    const response = await fetch(`${BASE_URL}/repos/${config.owner}/${config.repo}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    return null;
  }
};

export const fetchGalleryFromGitHub = async (config: RepoConfig): Promise<Artwork[]> => {
  if (!config.owner || !config.repo) return [];
  
  const branch = config.branch || 'main';

  // OPTION 1: authenticated API fetch
  if (config.token) {
    try {
      const response = await fetch(`${BASE_URL}/repos/${config.owner}/${config.repo}/contents/gallery.json?ref=${branch}`, {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-store'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          const cleanContent = data.content.replace(/\n/g, '');
          const jsonString = b64_to_utf8(cleanContent);
          return JSON.parse(jsonString);
        }
      } else if (response.status === 404) {
        return [];
      }
    } catch (e) {
      console.warn("API fetch failed, attempting fallback to Raw URL", e);
    }
  }

  // OPTION 2: Raw URL fetch
  const url = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}/gallery.json?t=${Date.now()}`;
  
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Error fetching gallery from GitHub:", error);
    return [];
  }
};

export const fetchProfile = async (config: RepoConfig): Promise<ArtistProfile | null> => {
  if (!config.owner || !config.repo) return null;
  const branch = config.branch || 'main';
  
  // Try Raw URL first (public access)
  const url = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}/profile.json?t=${Date.now()}`;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
        return await response.json();
    }
  } catch (e) {
     console.warn("Failed to fetch profile", e);
  }
  return null;
};

export const updateProfile = async (profile: ArtistProfile, config: RepoConfig): Promise<void> => {
    if (!config.token) throw new Error("Authentication required");
    const path = 'profile.json';
    const branch = config.branch || 'main';
    const url = `${BASE_URL}/repos/${config.owner}/${config.repo}/contents/${path}`;

    let sha: string | undefined;

    try {
        const getResponse = await fetch(`${url}?ref=${branch}`, {
            headers: { 
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (getResponse.ok) {
            const data = await getResponse.json();
            sha = data.sha;
        }
    } catch (e) {
        // file doesn't exist, create new
    }

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: `Update artist profile`,
            content: utf8_to_b64(JSON.stringify(profile, null, 2)),
            sha: sha,
            branch: branch
        })
    });

    if (!response.ok) {
        throw new Error("Failed to update profile");
    }
};

export const verifyRepoAccess = async (config: RepoConfig): Promise<boolean> => {
  if (!config.token) return false;
  try {
    const response = await fetch(`${BASE_URL}/repos/${config.owner}/${config.repo}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const uploadImageToGitHub = async (
  file: File, 
  base64Content: string, 
  config: RepoConfig
): Promise<string> => {
  if (!config.token) throw new Error("Authentication required");

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '').toLowerCase();
  const path = `images/${Date.now()}-${cleanName}`;
  const branch = config.branch || 'main';

  const response = await fetch(`${BASE_URL}/repos/${config.owner}/${config.repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload artwork: ${cleanName}`,
      content: base64Content,
      branch: branch
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload image");
  }

  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}/${path}`;
};

export const updateGalleryManifest = async (
  newArtwork: Artwork, 
  config: RepoConfig
): Promise<void> => {
  if (!config.token) throw new Error("Authentication required");
  
  const path = 'gallery.json';
  const branch = config.branch || 'main';
  const url = `${BASE_URL}/repos/${config.owner}/${config.repo}/contents/${path}`;

  let sha: string | undefined;
  let currentArtworks: Artwork[] = [];

  try {
    const getResponse = await fetch(`${url}?ref=${branch}`, {
      headers: { 
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (getResponse.ok) {
      const data = await getResponse.json();
      sha = data.sha;
      if (data.content) {
        const cleanContent = data.content.replace(/\n/g, '');
        const jsonString = b64_to_utf8(cleanContent);
        currentArtworks = JSON.parse(jsonString);
      }
    }
  } catch (e) {
    console.log("Creating new gallery.json");
  }

  const updatedArtworks = [newArtwork, ...currentArtworks];

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add artwork: ${newArtwork.title}`,
      content: utf8_to_b64(JSON.stringify(updatedArtworks, null, 2)),
      sha: sha,
      branch: branch
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update gallery manifest");
  }
};

export const deleteArtworkFromGitHub = async (
  artwork: Artwork, 
  config: RepoConfig
): Promise<void> => {
  if (!config.token) throw new Error("Authentication required");

  const branch = config.branch || 'main';
  const manifestPath = 'gallery.json';
  const manifestUrl = `${BASE_URL}/repos/${config.owner}/${config.repo}/contents/${manifestPath}`;

  const getManifestResponse = await fetch(`${manifestUrl}?ref=${branch}`, {
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!getManifestResponse.ok) {
    throw new Error("Could not fetch gallery manifest to perform deletion");
  }

  const manifestData = await getManifestResponse.json();
  const manifestSha = manifestData.sha;
  const cleanContent = manifestData.content.replace(/\n/g, '');
  const jsonString = b64_to_utf8(cleanContent);
  const currentArtworks: Artwork[] = JSON.parse(jsonString);

  const updatedArtworks = currentArtworks.filter(a => a.id !== artwork.id);

  const updateManifestResponse = await fetch(manifestUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Remove artwork: ${artwork.title}`,
      content: utf8_to_b64(JSON.stringify(updatedArtworks, null, 2)),
      sha: manifestSha,
      branch: branch
    })
  });

  if (!updateManifestResponse.ok) {
     throw new Error("Failed to update gallery list");
  }

  try {
     let imagePath = '';
     const rawPrefix = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}/`;
     
     if (artwork.imageUrl.startsWith(rawPrefix)) {
         imagePath = artwork.imageUrl.substring(rawPrefix.length);
     } else if (artwork.imageUrl.includes('/images/')) {
         const urlObj = new URL(artwork.imageUrl);
         const pathParts = urlObj.pathname.split('/'); 
         const imageIndex = pathParts.indexOf('images');
         if (imageIndex !== -1) {
             imagePath = pathParts.slice(imageIndex).join('/');
         }
     }

     if (imagePath) {
         imagePath = decodeURIComponent(imagePath);
         const imgApiUrl = `${BASE_URL}/repos/${config.owner}/${config.repo}/contents/${imagePath}`;

         const getImgResponse = await fetch(`${imgApiUrl}?ref=${branch}`, {
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
         });

         if (getImgResponse.ok) {
             const imgData = await getImgResponse.json();
             const imgSha = imgData.sha;
             await fetch(imgApiUrl, {
                 method: 'DELETE',
                 headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'application/json',
                 },
                 body: JSON.stringify({
                     message: `Delete image file: ${imagePath}`,
                     sha: imgSha,
                     branch: branch
                 })
             });
         }
     }
  } catch (e) {
      console.warn("Error attempting to delete image file (non-fatal):", e);
  }
};