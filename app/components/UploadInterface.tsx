'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useDropzone } from 'react-dropzone';
import { isValidAudioFile } from '@/lib/audio-utils';

interface UploadedSample {
  id: string;
  name: string;
  sourceUrl: string;
}

export default function UploadInterface() {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [uploadedSamples, setUploadedSamples] = useState<UploadedSample[]>([]);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    bpm: '',
    key: '',
    isPublic: 'true',
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!session) {
      alert('Please sign in to upload samples');
      return;
    }

    for (const file of acceptedFiles) {
      if (!isValidAudioFile(file)) {
        alert(`${file.name} is not a valid audio file`);
        continue;
      }

      await uploadFile(file);
    }
  }, [session, metadata]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.wav', '.mp3', '.ogg', '.webm'],
    },
    multiple: true,
  });

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', metadata.name || file.name);
      formData.append('description', metadata.description);
      formData.append('category', metadata.category);
      formData.append('tags', metadata.tags);
      formData.append('bpm', metadata.bpm);
      formData.append('key', metadata.key);
      formData.append('isPublic', metadata.isPublic);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedSamples((prev) => [...prev, data.sample]);
      
      // Reset metadata for next upload
      setMetadata({
        name: '',
        description: '',
        category: '',
        tags: '',
        bpm: '',
        key: '',
        isPublic: 'true',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please sign in to upload samples</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Upload Sample</h2>

        {/* Metadata Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name (optional - defaults to filename)
            </label>
            <input
              type="text"
              value={metadata.name}
              onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Sample name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={metadata.category}
              onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              <option value="drums">Drums</option>
              <option value="bass">Bass</option>
              <option value="synth">Synth</option>
              <option value="ambient">Ambient</option>
              <option value="percussion">Percussion</option>
              <option value="vocal">Vocal</option>
              <option value="fx">FX</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              BPM
            </label>
            <input
              type="number"
              value={metadata.bpm}
              onChange={(e) => setMetadata({ ...metadata, bpm: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key
            </label>
            <input
              type="text"
              value={metadata.key}
              onChange={(e) => setMetadata({ ...metadata, key: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="C major"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Sample description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={metadata.tags}
              onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visibility
            </label>
            <select
              value={metadata.isPublic}
              onChange={(e) => setMetadata({ ...metadata, isPublic: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Public</option>
              <option value="false">Private</option>
            </select>
          </div>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-600">Drop the audio files here...</p>
          ) : (
            <div>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-4h4m-4-4v12m0 0l-4-4m4 4l4-4"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop audio files here, or click to select
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supports WAV, MP3, OGG, WebM
              </p>
            </div>
          )}
        </div>

        {uploading && (
          <div className="mt-4 text-center">
            <p className="text-gray-500">Uploading...</p>
          </div>
        )}
      </div>

      {/* Uploaded Samples */}
      {uploadedSamples.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-xl font-bold mb-4">Recently Uploaded</h3>
          <div className="space-y-4">
            {uploadedSamples.map((sample) => (
              <div key={sample.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="font-medium">{sample.name}</p>
                <p className="text-sm text-gray-500">Uploaded successfully!</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

