'use client';

import { useState, useEffect } from 'react';
import SamplePlayer from './SamplePlayer';
import CodeGenerator from './CodeGenerator';
import { useSession } from 'next-auth/react';

interface Sample {
  id?: string;
  name: string;
  description?: string;
  sourceUrl: string;
  source: string;
  bpm?: number;
  key?: string;
  tags?: string[];
  author?: string;
  category?: string;
  duration?: number;
}

export default function SampleBrowser() {
  const { data: session } = useSession();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('all');
  const [selectedSamples, setSelectedSamples] = useState<Sample[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSamples();
    if (session) {
      loadFavorites();
    }
  }, [searchQuery, category, source, session]);

  const loadSamples = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (category) params.append('category', category);
      if (source) params.append('source', source);

      const response = await fetch(`/api/samples/search?${params}`);
      const data = await response.json();
      setSamples(data.samples || []);
    } catch (error) {
      console.error('Error loading samples:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/library/favorites');
      const data = await response.json();
      const favoriteIds = new Set<string>(
        data.favorites?.map((f: any) => f.sampleId as string) || []
      );
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (sample: Sample) => {
    if (!session) return;

    const sampleId = sample.id || sample.sourceUrl;
    const isFavorite = favorites.has(sampleId);

    try {
      if (isFavorite) {
        await fetch(`/api/library/favorites?sampleId=${sampleId}`, {
          method: 'DELETE',
        });
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(sampleId);
          return next;
        });
      } else {
        // For GitHub samples, we'd need to create a sample record first
        // For now, just handle uploaded samples
        if (sample.id) {
          await fetch('/api/library/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sampleId: sample.id }),
          });
          setFavorites((prev) => new Set(prev).add(sampleId));
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleSelection = (sample: Sample) => {
    setSelectedSamples((prev) => {
      const isSelected = prev.some((s) => 
        (s.id && s.id === sample.id) || s.sourceUrl === sample.sourceUrl
      );
      if (isSelected) {
        return prev.filter((s) => 
          !((s.id && s.id === sample.id) || s.sourceUrl === sample.sourceUrl)
        );
      } else {
        return [...prev, sample];
      }
    });
  };

  const categories = Array.from(new Set(samples.map(s => s.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search samples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="github">GitHub</option>
            <option value="upload">Uploaded</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Selected Samples Code Generator */}
      {selectedSamples.length > 0 && (
        <CodeGenerator samples={selectedSamples} />
      )}

      {/* Samples Grid/List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading samples...</p>
        </div>
      ) : samples.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No samples found</p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {samples.map((sample, index) => {
            const sampleId = sample.id || sample.sourceUrl;
            const isFavorite = favorites.has(sampleId);
            const isSelected = selectedSamples.some((s) => 
              (s.id && s.id === sample.id) || s.sourceUrl === sample.sourceUrl
            );

            return (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition-shadow ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {sample.name}
                    </h3>
                    {sample.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {sample.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {session && (
                      <button
                        onClick={() => toggleFavorite(sample)}
                        className={`p-2 rounded ${
                          isFavorite
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill={isFavorite ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => toggleSelection(sample)}
                      className={`p-2 rounded ${
                        isSelected
                          ? 'text-blue-500'
                          : 'text-gray-400 hover:text-blue-500'
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                  {sample.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {sample.category}
                    </span>
                  )}
                  {sample.bpm && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      {sample.bpm} BPM
                    </span>
                  )}
                  {sample.key && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                      {sample.key}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                    {sample.source}
                  </span>
                </div>

                <SamplePlayer url={sample.sourceUrl} name={sample.name} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

