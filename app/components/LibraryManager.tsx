'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SamplePlayer from './SamplePlayer';
import CodeGenerator from './CodeGenerator';

interface Sample {
  id: string;
  name: string;
  description?: string;
  sourceUrl: string;
  source: string;
  bpm?: number;
  key?: string;
  tags?: string[];
  category?: string;
  duration?: number;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  items: Array<{
    id: string;
    sample: Sample;
    order: number;
  }>;
}

export default function LibraryManager() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'favorites' | 'collections'>('favorites');
  const [favorites, setFavorites] = useState<Sample[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  useEffect(() => {
    if (session) {
      loadFavorites();
      loadCollections();
    }
  }, [session]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/library/favorites');
      const data = await response.json();
      setFavorites(data.favorites?.map((f: any) => f.sample) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await fetch('/api/library/collections');
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const removeFavorite = async (sampleId: string) => {
    try {
      await fetch(`/api/library/favorites?sampleId=${sampleId}`, {
        method: 'DELETE',
      });
      setFavorites((prev) => prev.filter((s) => s.id !== sampleId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const response = await fetch('/api/library/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDesc,
          isPublic: false,
        }),
      });
      const data = await response.json();
      setCollections((prev) => [data.collection, ...prev]);
      setNewCollectionName('');
      setNewCollectionDesc('');
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    try {
      await fetch(`/api/library/collections?id=${collectionId}`, {
        method: 'DELETE',
      });
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const addSampleToCollection = async (collectionId: string, sampleId: string) => {
    try {
      await fetch(`/api/library/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId }),
      });
      loadCollections();
    } catch (error) {
      console.error('Error adding sample to collection:', error);
    }
  };

  const removeSampleFromCollection = async (collectionId: string, sampleId: string) => {
    try {
      await fetch(`/api/library/collections/${collectionId}/items?sampleId=${sampleId}`, {
        method: 'DELETE',
      });
      loadCollections();
    } catch (error) {
      console.error('Error removing sample from collection:', error);
    }
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please sign in to access your library</p>
      </div>
    );
  }

  const displaySamples = activeTab === 'favorites' 
    ? favorites 
    : selectedCollection?.items.map(item => item.sample) || [];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            setActiveTab('favorites');
            setSelectedCollection(null);
          }}
          className={`px-4 py-2 font-medium ${
            activeTab === 'favorites'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Favorites ({favorites.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('collections');
            setSelectedCollection(null);
          }}
          className={`px-4 py-2 font-medium ${
            activeTab === 'collections'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Collections ({collections.length})
        </button>
      </div>

      {/* Collections Sidebar */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="font-semibold mb-3">Create Collection</h3>
              <input
                type="text"
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
              />
              <textarea
                placeholder="Description (optional)"
                value={newCollectionDesc}
                onChange={(e) => setNewCollectionDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                rows={3}
              />
              <button
                onClick={createCollection}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Create
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold px-2">Your Collections</h3>
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`p-3 rounded cursor-pointer ${
                    selectedCollection?.id === collection.id
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedCollection(collection)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{collection.name}</p>
                      <p className="text-sm text-gray-500">
                        {collection.items.length} samples
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCollection(collection.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Samples */}
          <div className="md:col-span-2">
            {selectedCollection ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">{selectedCollection.name}</h2>
                {selectedCollection.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedCollection.description}
                  </p>
                )}
                {selectedCollection.items.length > 0 && (
                  <CodeGenerator samples={selectedCollection.items.map(item => item.sample)} />
                )}
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {selectedCollection.items.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{item.sample.name}</h3>
                        <button
                          onClick={() => removeSampleFromCollection(selectedCollection.id, item.sample.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <SamplePlayer url={item.sample.sourceUrl} name={item.sample.name} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Select a collection to view samples</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Favorites View */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length > 0 && (
            <CodeGenerator samples={favorites} />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {favorites.map((sample) => (
              <div key={sample.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{sample.name}</h3>
                  <button
                    onClick={() => removeFavorite(sample.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <SamplePlayer url={sample.sourceUrl} name={sample.name} />
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      )}
    </div>
  );
}


