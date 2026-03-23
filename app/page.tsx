"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [citation, setCitation] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateCitation = async () => {
    if (!url) return;
    setLoading(true);
    let pageTitle = "Page Title";
    const currentYear = new Date().getFullYear();

    try {
      // Basic fetch using an open CORS proxy to get the title
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        const html = data.contents;
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
        if (titleMatch && titleMatch[1]) {
           pageTitle = titleMatch[1].trim();
        }
      }
    } catch (e) {
      console.warn("Could not fetch page title automatically.");
    }
    
    // Website format according to ASME: Author(s), Year, "Title," Website/Publisher, accessed Date, URL.
    // Simplifying when author is missing: Year, "Title," URL.
    const newCitation = `${currentYear}, "${pageTitle}," ${url}`;
    
    setCitation(newCitation);
    setCopied(false);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans text-zinc-900">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 max-w-2xl w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Free ASME Citation Generator</h1>
        <p className="text-zinc-500 mb-8">Accurate generation with full customization.</p>
        
        <div className="space-y-5 mb-8">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Website URL</label>
            <input 
              type="url" 
              className="w-full border border-zinc-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateCitation()}
            />
          </div>
          
          <button 
            onClick={generateCitation}
            disabled={loading || !url}
            className="w-full bg-zinc-900 text-white font-medium py-3 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate ASME Citation"}
          </button>
        </div>

        {citation && (
          <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-lg relative group flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Your Citation (Edit if needed):</h3>
            <textarea 
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              className="w-full bg-transparent text-zinc-800 font-mono text-sm resize-none outline-none border border-zinc-200 focus:border-zinc-400 rounded-md p-3 transition-colors min-h-[80px]"
            />
            <div className="flex justify-end">
              <button 
                onClick={handleCopy}
                className="text-xs bg-white border border-zinc-200 px-4 py-2 rounded-md hover:bg-zinc-50 font-medium transition-colors cursor-pointer shadow-sm"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
