'use client';

import { useState } from 'react';
import { generateStrudelCodeForSamples } from '@/lib/strudel-codegen';

interface Sample {
  id?: string;
  name: string;
  sourceUrl: string;
  filePath?: string;
  source?: string;
  [key: string]: any;
}

interface CodeGeneratorProps {
  samples: Sample[];
}

export default function CodeGenerator({ samples }: CodeGeneratorProps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    const strudelCode = generateStrudelCodeForSamples(samples);
    setCode(strudelCode);
  };

  const copyToClipboard = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Strudel Code Generator
        </h3>
        <button
          onClick={generateCode}
          disabled={samples.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Code
        </button>
      </div>
      {code && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Generated Code:
            </label>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
            <code>{code}</code>
          </pre>
        </div>
      )}
      {samples.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Select samples to generate Strudel code
        </p>
      )}
    </div>
  );
}

