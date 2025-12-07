export interface Artwork {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  medium: string;
  tags: string[];
  createdAt: number;
}

export enum ViewMode {
  WELCOME = 'WELCOME',
  GALLERY = 'GALLERY',
  ABOUT = 'ABOUT',
  ADMIN = 'ADMIN',
  LOGIN = 'LOGIN'
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  medium: string;
  tags: string[];
}

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  token?: string;
}

export interface ArtistProfile {
  welcomeMessage: string;
  featuredImageUrl: string;
  aboutText: string;
  aboutImageUrl: string;
}