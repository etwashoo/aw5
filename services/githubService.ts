import { Artwork, RepoConfig } from '../types';

const BASE_URL = 'https://api.github.com';

// Helper for Unicode-safe Base64 encoding/decoding
const utf8_to_b64 = (str: string) => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

const b64_to_utf8 = (str: string) => {
  return decodeURIComponent(escape(window.atob(str)));
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

  // OPTION 1: authenticated API fetch (Immediate consistency, bypasses CDN cache)
  // We use this if a token is available so the artist sees their updates instantly.
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
        // GitHub API returns content in base64
        if (data.content) {
          const cleanContent = data.content.replace(/\n/g, '');
          const jsonString = b64_to_utf8(cleanContent);
          return JSON.parse(jsonString);
        }
      } else if (response.status === 404) {
        // File doesn't exist yet, return empty array
        return [];
      }
    } catch (e) {
      console.warn("API fetch failed, attempting fallback to Raw URL", e);
    }
  }

  // OPTION 2: Raw URL fetch (Public access, subject to caching)
  // This is what regular visitors use.
  // We use 'no-store' to try and force the browser to check for fresh content,
  // although GitHub's CDN has its own TTL.
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

  // Clean filename to be URL safe
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

  // Return the Raw URL
  // Note: For private repos, this URL is not publicly accessible
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

  // 1. Get current file (to get SHA and current list)
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

  // 2. Prepend new artwork
  const updatedArtworks = [newArtwork, ...currentArtworks];

  // 3. Update file
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

  // 1. Remove from gallery.json
  const manifestPath = 'gallery.json';
  const manifestUrl = `${BASE_URL}/repos/${config.owner}/${config.repo}/contents/${manifestPath}`;

  // Get current manifest
  // IMPORTANT: Explicitly use ?ref=branch to ensure we get the latest SHA for the correct branch
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

  // Filter out the item
  const updatedArtworks = currentArtworks.filter(a => a.id !== artwork.id);

  // Update manifest
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

  // 2. Attempt to delete the image file
  // We perform this after the manifest update so the UI is consistent even if file deletion fails
  try {
     let imagePath = '';
     
     // Strategy 1: Remove Raw URL prefix
     // This assumes the URL matches the standard GitHub Raw format for the configured repo
     const rawPrefix = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}/`;
     
     if (artwork.imageUrl.startsWith(rawPrefix)) {
         imagePath = artwork.imageUrl.substring(rawPrefix.length);
     } 
     // Strategy 2: Look for 'images/' directory pattern as fallback
     else if (artwork.imageUrl.includes('/images/')) {
         const urlObj = new URL(artwork.imageUrl);
         const pathParts = urlObj.pathname.split('/'); 
         const imageIndex = pathParts.indexOf('images');
         if (imageIndex !== -1) {
             imagePath = pathParts.slice(imageIndex).join('/');
         }
     }

     if (imagePath) {
         imagePath = decodeURIComponent(imagePath); // Ensure spaces/special chars are handled
         
         const imgApiUrl = `${BASE_URL}/repos/${config.owner}/${config.repo}/contents/${imagePath}`;

         // Get SHA of image file
         const getImgResponse = await fetch(`${imgApiUrl}?ref=${branch}`, {
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
         });

         if (getImgResponse.ok) {
             const imgData = await getImgResponse.json();
             const imgSha = imgData.sha;

             // Delete image file
             // NOTE: Do NOT include ?ref= parameter in the URL for DELETE.
             // Params go in the body.
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
         } else {
             console.warn("Image file not found (404), likely already deleted.");
         }
     }
  } catch (e) {
      console.warn("Error attempting to delete image file (non-fatal):", e);
  }
};