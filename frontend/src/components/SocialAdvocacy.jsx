import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  Flame, 
  ShieldCheck, 
  Search, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { TwitterIcon as Twitter, InstagramIcon as Instagram } from './Icons';

import { getSocialAdvocacy } from '../services/api';

export default function SocialAdvocacy({ initialTrackingId = '' }) {
  const [trackingId, setTrackingId] = useState(initialTrackingId || 'AMC-2026-WZ-88412');
  const [advocacy, setAdvocacy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedType, setCopiedType] = useState(null);

  const fetchAdvocacy = async (id) => {
    const idToFetch = id || trackingId;
    if (!idToFetch.trim()) return;

    setLoading(true);
    try {
      const data = await getSocialAdvocacy(idToFetch.trim());
      setAdvocacy(data.advocacy_package);
    } catch (err) {
      alert(`Could not load advocacy package: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingId(initialTrackingId);
      fetchAdvocacy(initialTrackingId);
    } else {
      fetchAdvocacy('AMC-2026-WZ-88412');
    }
  }, [initialTrackingId]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Share2 className="w-3.5 h-3.5" />
          <span>Public Transparency & Social Pressure</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Social Media Advocacy Studio
        </h1>
        <p className="mt-2 text-slate-400 text-sm">
          Hold municipal departments accountable by broadcasting official grievance IDs with direct tags to the municipal corporation, zonal commissioners, and local corporators.
        </p>
      </div>

      {/* Ticket Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl mb-8 max-w-xl mx-auto">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAdvocacy()}
            placeholder="Enter Tracking ID (e.g. AMC-2026-WZ-88412)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 uppercase"
          />
          <button
            onClick={() => fetchAdvocacy()}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Load Drafts</span>
          </button>
        </div>
      </div>

      {advocacy && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: X / Twitter Live Preview Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-black/90 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <Twitter className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">X (Twitter) Official Intent</h3>
                    <span className="text-[11px] text-slate-400">Pre-formatted 280-character public alert</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Ready to Post
                </span>
              </div>

              {/* Twitter Mockup Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 mb-5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                    CP
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-bold text-white">CivicPulse Watch</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <span className="text-xs text-slate-500">@CivicPulseAmdavad • Just now</span>
                  </div>
                </div>

                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {advocacy.twitter_text}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-sky-400">
                  {advocacy.hashtags && advocacy.hashtags.map((h, i) => (
                    <span key={i} className="hover:underline cursor-pointer">{h}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={advocacy.twitter_intent_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 transition-all"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Launch 1-Click Post on X</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
                <button
                  onClick={() => copyToClipboard(advocacy.twitter_text, 'twitter')}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold py-3 px-4 rounded-xl text-xs border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  {copiedType === 'twitter' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedType === 'twitter' ? 'Copied Tweet!' : 'Copy Tweet'}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Community Broadcast */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center border border-emerald-800">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">WhatsApp Resident / RWA Alert</h3>
                    <span className="text-[11px] text-slate-400">Formatted for neighborhood WhatsApp groups</span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(advocacy.whatsapp_message, 'whatsapp')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  {copiedType === 'whatsapp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'whatsapp' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                {advocacy.whatsapp_message}
              </div>

              <div className="mt-3">
                <a
                  href={advocacy.whatsapp_intent_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Instagram Caption & Accountability Meter */}
          <div className="lg:col-span-5 space-y-6">
            {/* Public Accountability Scorecard */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Public Scrutiny Index</span>
                </span>
                <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950/80 px-2.5 py-0.5 rounded-full border border-orange-800">
                  High Urgency
                </span>
              </div>

              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-4xl font-black text-white">88</span>
                <span className="text-slate-400 text-sm font-medium">/ 100 Pressure Score</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aggregated score based on citizen safety hazard, public roadway traffic density, and municipal SLA lapse risk.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Tagged Authority Handles:</span>
                  <span className="font-mono text-cyan-300">{advocacy.tagged_handles ? advocacy.tagged_handles.join(', ') : '@AmdavadAMC'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Audited Tracking ID:</span>
                  <span className="font-mono font-bold text-white">{advocacy.tracking_id}</span>
                </div>
              </div>
            </div>

            {/* Instagram / Facebook Storytelling Caption */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Instagram / Social Caption</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(advocacy.instagram_caption, 'insta')}
                  className="text-xs text-pink-400 hover:text-pink-300 flex items-center space-x-1"
                >
                  {copiedType === 'insta' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'insta' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                {advocacy.instagram_caption}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
