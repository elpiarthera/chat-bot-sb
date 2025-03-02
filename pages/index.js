import Head from 'next/head';
import DarkModeToggle from '../components/DarkModeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Head>
        <title>Tailwind Theme Test</title>
        <meta name="description" content="Testing Tailwind themes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <DarkModeToggle />
        </div>
        
        <h1 className="text-4xl font-bold mb-6 text-text-900">
          Tailwind Theme Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-background-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-text-800">
              Light/Dark Mode
            </h2>
            <p className="text-text-600 mb-4">
              This card changes appearance based on the current theme.
            </p>
            <button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md transition-colors">
              Accent Button
            </button>
          </div>
          
          <div className="p-6 bg-background-100 dark:bg-background-700 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-text-800">
              Custom Colors
            </h2>
            <div className="space-y-2">
              <div className="p-2 bg-error text-white rounded">Error</div>
              <div className="p-2 bg-success text-white rounded">Success</div>
              <div className="p-2 bg-alert text-white rounded">Alert</div>
              <div className="p-2 bg-accent text-white rounded">Accent</div>
            </div>
          </div>
          
          <div className="p-6 bg-user dark:bg-background-700 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-user-text">
              User Message Bubble
            </h2>
            <p className="text-text-600 mb-4">
              This simulates a user message bubble in a chat interface.
            </p>
          </div>
          
          <div className="p-6 bg-agent dark:bg-agent rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Agent Message Bubble
            </h2>
            <p className="text-white opacity-90 mb-4">
              This simulates an agent message bubble in a chat interface.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 