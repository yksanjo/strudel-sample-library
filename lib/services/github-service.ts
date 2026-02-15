import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Optional, but recommended for higher rate limits
});

export interface StrudelSample {
  name: string;
  description?: string;
  filePath: string;
  sourceUrl: string;
  source: string;
  bpm?: number;
  key?: string;
  tags?: string[];
  author?: string;
  category?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface StrudelJson {
  samples?: Record<string, string | {
    src: string;
    bpm?: number;
    key?: string;
    tags?: string[];
    category?: string;
    description?: string;
  }>;
  [key: string]: any;
}

/**
 * Search GitHub for repositories containing strudel.json files
 */
export async function searchStrudelRepositories(query: string = 'strudel.json', maxResults: number = 10) {
  try {
    const response = await octokit.search.code({
      q: `filename:strudel.json ${query}`,
      per_page: maxResults,
    });

    return response.data.items.map(item => ({
      repository: item.repository.full_name,
      path: item.path,
      url: item.html_url,
      rawUrl: `https://raw.githubusercontent.com/${item.repository.full_name}/${item.repository.default_branch}/${item.path}`,
    }));
  } catch (error) {
    console.error('Error searching GitHub:', error);
    throw error;
  }
}

/**
 * Fetch and parse a strudel.json file from GitHub
 */
export async function fetchStrudelJson(rawUrl: string): Promise<StrudelJson | null> {
  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
      return null;
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching strudel.json:', error);
    return null;
  }
}

/**
 * Extract samples from a strudel.json file
 */
export function extractSamplesFromJson(
  strudelJson: StrudelJson,
  baseUrl: string,
  repository: string
): StrudelSample[] {
  const samples: StrudelSample[] = [];

  if (!strudelJson.samples) {
    return samples;
  }

  const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  
  Object.entries(strudelJson.samples).forEach(([name, sampleData]) => {
    let src: string;
    let metadata: any = {};

    if (typeof sampleData === 'string') {
      src = sampleData;
    } else {
      src = sampleData.src;
      metadata = {
        bpm: sampleData.bpm,
        key: sampleData.key,
        tags: sampleData.tags || [],
        category: sampleData.category,
        description: sampleData.description,
      };
    }

    // Resolve relative paths
    const filePath = src.startsWith('http') ? src : `${basePath}/${src}`;

    samples.push({
      name,
      description: metadata.description,
      filePath,
      sourceUrl: filePath,
      source: `github:${repository}`,
      bpm: metadata.bpm,
      key: metadata.key,
      tags: metadata.tags || [],
      author: repository.split('/')[0],
      category: metadata.category,
      metadata,
    });
  });

  return samples;
}

/**
 * Get audio duration from a URL (requires CORS-enabled server)
 */
export async function getAudioDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });

    audio.addEventListener('error', () => {
      resolve(null);
    });

    audio.src = url;
  });
}

/**
 * Search and extract all samples from GitHub repositories
 */
export async function discoverSamplesFromGitHub(
  query: string = '',
  maxRepos: number = 10
): Promise<StrudelSample[]> {
  const repositories = await searchStrudelRepositories(query, maxRepos);
  const allSamples: StrudelSample[] = [];

  for (const repo of repositories) {
    try {
      const strudelJson = await fetchStrudelJson(repo.rawUrl);
      if (strudelJson) {
        const samples = extractSamplesFromJson(strudelJson, repo.rawUrl, repo.repository);
        allSamples.push(...samples);
      }
    } catch (error) {
      console.error(`Error processing ${repo.repository}:`, error);
    }
  }

  return allSamples;
}


