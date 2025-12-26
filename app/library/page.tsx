import LibraryManager from '../components/LibraryManager';
import Navigation from '../components/Navigation';

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your favorite samples and collections
          </p>
        </div>
        <LibraryManager />
      </main>
    </div>
  );
}

