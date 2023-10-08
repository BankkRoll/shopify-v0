import Playground from '@/components/Playground';
import React, { useState } from 'react';
import { CornerDownLeft } from 'lucide-react';

export default function Home() {
  const [task, setTask] = useState('');

  function sendRequest() {
    fetch('http://localhost:3002', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ task }),
    });
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-white">
      <div className="w-full max-w-screen-xl p-6 rounded-lg bg-black bg-opacity-30 backdrop-blur-md space-y-6">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-center">Shopify Liquid Section Generator</h1>

        <div className="flex justify-between items-center gap-4">
          <input
            type="text"
            className="flex-grow p-2 bg-black bg-opacity-60 text-white rounded focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
            placeholder="A section to display 4 products from a collection.."
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <button
            className="p-2 rounded bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 focus:from-indigo-600 focus:to-blue-600 focus:ring focus:ring-offset-2 focus:ring-offset-black focus:ring-indigo-200"
            onClick={sendRequest}
          >
            <CornerDownLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="w-full h-[600px] bg-black bg-opacity-60 rounded-md backdrop-blur-md">
          <Playground />
        </div>
      </div>
    </main>
  );
}
