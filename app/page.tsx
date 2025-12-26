import SampleBrowser from './components/SampleBrowser';
import Navigation from './components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover Samples
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and discover audio samples from GitHub repositories and the community
          </p>
        </div>
        <SampleBrowser />
      </main>
    </div>
  );
}
