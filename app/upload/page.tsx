import UploadInterface from '../components/UploadInterface';
import Navigation from '../components/Navigation';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Sample
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your audio samples with the Strudel community
          </p>
        </div>
        <UploadInterface />
      </main>
    </div>
  );
}


