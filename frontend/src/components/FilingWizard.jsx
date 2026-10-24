import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  MapPin, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Share2, 
  ArrowRight, 
  Sparkles,
  AlertTriangle,
  Layers,
  Building,
  UserCheck,
  ExternalLink,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { TwitterIcon as Twitter } from './Icons';

import { fileComplaint, getSampleDataset } from '../services/api';

export default function FilingWizard({ onSelectTicket, onNavigateToTrack }) {
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState('sample-pothole-1');
  const [imagePreview, setImagePreview] = useState(null);
  const [userLocation, setUserLocation] = useState('Judges Bungalow Road, Bodakdev');
  const [userDesc, setUserDesc] = useState('');
  const [citizenName, setCitizenName] = useState('Ananya Sen');
  const [citizenPhone, setCitizenPhone] = useState('+91 98250 55112');
  const [hasExifGps, setHasExifGps] = useState(true);
  const [exifCoords, setExifCoords] = useState({ lat: 23.0384, lon: 72.5284 });

  const [loading, setLoading] = useState(false);
  const [reasoningTrace, setReasoningTrace] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [resultTicket, setResultTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getSampleDataset()
      .then((data) => {
        setSamples(data.samples || []);
        if (data.samples && data.samples.length > 0) {
          const first = data.samples[0];
          setSelectedSampleId(first.id);
          setImagePreview(first.image_data_url);
          setUserLocation(first.location);
          setExifCoords({ lat: first.latitude, lon: first.longitude });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSampleSelect = (sample) => {
    setSelectedSampleId(sample.id);
    setImagePreview(sample.image_data_url);
    setUserLocation(sample.location);
    setExifCoords({ lat: sample.latitude, lon: sample.longitude });
    setHasExifGps(true);
    setUserDesc(sample.description);
    setResultTicket(null);
    setReasoningTrace([]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedSampleId('');
    setResultTicket(null);
    setReasoningTrace([]);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      // Simulating EXIF GPS reading for custom uploads
      setHasExifGps(true);
      setExifCoords({ lat: 23.0384, lon: 72.5284 });
    };
    reader.readAsDataURL(file);
  };

  const handleRunAgent = async () => {
    if (!imagePreview && !selectedSampleId) return;

    setLoading(true);
    setResultTicket(null);
    setReasoningTrace([]);
    setActiveStepIndex(1);

    try {
      const payload = {
        image_input: selectedSampleId || imagePreview,
        location_query: userLocation,
        description: userDesc || undefined,
        citizen_name: citizenName,
        citizen_phone: citizenPhone,
      };

      const res = await fileComplaint(payload);

      // Play step-by-step reasoning animation for startup demo polish
      const trace = res.reasoning_trace || [];
      for (let i = 0; i < trace.length; i++) {
        setActiveStepIndex(i + 1);
        setReasoningTrace((prev) => [...prev, trace[i]]);
        await new Promise((r) => setTimeout(r, 450));
      }

      setResultTicket(res);
    } catch (err) {
      alert(`Agent processing failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Agentic Civic Resolution</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Turn Any Civic Photo Into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Tracked Ticket</span> in 3 Seconds
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
          The AI identifies potholes, garbage, or waterlogging, extracts EXIF GPS, maps the AMC municipal ward & department, registers the official grievance, and drafts accountability posts for X/Twitter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Input & Geolocation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <span>Step 1: Civic Photo & Evidence</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Input: Image + EXIF</span>
            </div>

            {/* Benchmark Sample Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Curated Indian Civic Benchmarks (1-Click Test)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {samples.map((s) => {
                  const isSelected = selectedSampleId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSampleSelect(s)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/60 text-cyan-200 ring-2 ring-cyan-500/30'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold truncate text-white">{s.issue_category}</div>
                      <div className="text-[10px] text-slate-400 truncate">{s.location.split(',')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Preview Container */}
            <div className="relative border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden bg-slate-950/70 aspect-video flex items-center justify-center group">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Civic hazard preview"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-medium">Drag & drop photo or choose file</p>
                  <p className="text-xs text-slate-500 mt-1">Accepts JPG, PNG with EXIF camera metadata</p>
                </div>
              )}

              {/* Upload Overlay Button */}
              <label className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 shadow-lg cursor-pointer flex items-center space-x-2 transition-all">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Custom Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* EXIF GPS Overlay Badge */}
              {hasExifGps && (
                <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-700 text-slate-200 text-[11px] px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-md">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-emerald-400">EXIF GPS:</span>
                  <span>{exifCoords.lat.toFixed(4)}°N, {exifCoords.lon.toFixed(4)}°E</span>
                </div>
              )}
            </div>

            {/* Location & Details Inputs */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Geographic Location / Landmark</span>
                  <span className="text-[10px] text-cyan-400 normal-case">Mapped to AMC Ward automatically</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="e.g. Judges Bungalow Road, Bodakdev or Vastrapur"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Citizen Notes / Context (Optional)
                </label>
                <textarea
                  rows="2"
                  value={userDesc}
                  onChange={(e) => setUserDesc(e.target.value)}
                  placeholder="e.g. Depth of crater is approx 1 foot, already caused 2 scooter accidents..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Citizen Name</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleRunAgent}
                className="w-full mt-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2.5 transition-all transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>Agent Reasoning in Progress...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-cyan-200" />
                    <span className="text-base tracking-wide">Run Autonomous Civic Agent</span>
                    <ArrowRight className="w-5 h-5 text-cyan-200" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Agent Reasoning Trace & Resulting Ticket */}
        <div className="lg:col-span-6 space-y-6">
          {/* Agent Reasoning Trace Visualization */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <span>Autonomous Agent Reasoning Chain</span>
              </h2>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-blue-950 text-blue-300 border border-blue-800/60">
                4-Stage Tool Flow
              </span>
            </div>

            {reasoningTrace.length === 0 && !loading ? (
              <div className="border border-slate-800/80 rounded-xl p-8 text-center bg-slate-950/40">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-300 font-medium">Ready to Orchestrate Tool Calls</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click "Run Autonomous Civic Agent" to trigger image analysis, ward routing, ticket registration, and social post generation.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {[
                  { step: 1, name: 'analyze_civic_image', title: 'Multimodal Vision & EXIF Extraction' },
                  { step: 2, name: 'resolve_ward_and_department', title: 'AMC Ward & Department Routing' },
                  { step: 3, name: 'file_municipal_complaint', title: 'Municipal Grievance Ticket Generation' },
                  { step: 4, name: 'generate_social_advocacy_post', title: 'Public Advocacy & Social Pressurizer' }
                ].map((item, idx) => {
                  const traceItem = reasoningTrace.find((t) => t.step === item.step);
                  const isRunning = loading && activeStepIndex === item.step;
                  const isDone = Boolean(traceItem);

                  return (
                    <div
                      key={item.step}
                      className={`border rounded-xl p-3.5 transition-all ${
                        isDone
                          ? 'border-emerald-800/60 bg-emerald-950/20'
                          : isRunning
                          ? 'border-cyan-500/80 bg-cyan-950/30 ring-1 ring-cyan-500/30'
                          : 'border-slate-800 bg-slate-950/40 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : isRunning ? (
                            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                              {item.step}
                            </div>
                          )}
                          <span className="text-xs font-bold text-white">Tool {item.step}: <span className="font-mono text-cyan-300">{item.name}</span></span>
                        </div>
                        {traceItem && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {traceItem.duration_ms}ms
                          </span>
                        )}
                      </div>

                      {traceItem && (
                        <div className="mt-2 text-xs text-slate-300 pl-6 space-y-1">
                          <p className="text-slate-400 italic">"{traceItem.thought}"</p>
                          {traceItem.step === 1 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-medium">Issue: {traceItem.output.issue_category}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-medium">Severity: {traceItem.output.severity}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">Conf: {(traceItem.output.confidence * 100).toFixed(0)}%</span>
                            </div>
                          )}
                          {traceItem.step === 2 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-medium">Ward: {traceItem.output.ward_name}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-medium">Dept: {traceItem.output.department_name}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">SLA: {traceItem.output.sla_resolution_hours}h</span>
                            </div>
                          )}
                          {traceItem.step === 3 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono font-bold">ID: {traceItem.output.tracking_id}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Status: {traceItem.output.status}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Generated Official AMC Ticket Card */}
          {resultTicket && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-cyan-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Official AMC Grievance Ticket
                  </span>
                  <h3 className="text-2xl font-black text-white font-mono mt-1 tracking-tight">
                    {resultTicket.ticket.tracking_id}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">SLA Resolution Target</span>
                  <span className="text-sm font-bold text-amber-400 flex items-center space-x-1 justify-end">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{resultTicket.ticket.sla_hours} Hours</span>
                  </span>
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Issue & Risk</span>
                  <span className="font-bold text-white text-sm">{resultTicket.severity} {resultTicket.issue_category}</span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Assigned Department</span>
                  <span className="font-bold text-white text-sm">{resultTicket.department_name}</span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Jurisdiction</span>
                  <span className="font-bold text-slate-200">{resultTicket.ward_name} ({resultTicket.zone})</span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Assigned Field Officer</span>
                  <span className="font-bold text-slate-200">{resultTicket.ticket.assigned_officer}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{resultTicket.ticket.officer_contact}</span>
                </div>
              </div>

              {/* Public Advocacy Action Callout */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Twitter className="w-4 h-4 text-sky-400" />
                    <span>Pre-drafted Public Accountability Post</span>
                  </span>
                  <button
                    onClick={() => handleCopyText(resultTicket.social_advocacy.twitter_text)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                  "{resultTicket.social_advocacy.twitter_text}"
                </p>

                <div className="mt-3 flex items-center space-x-2">
                  <a
                    href={resultTicket.social_advocacy.twitter_intent_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-sky-500/20 transition-all"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>Post on X (Twitter)</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  <button
                    onClick={() => {
                      if (onNavigateToTrack) {
                        onNavigateToTrack(resultTicket.ticket.tracking_id);
                      }
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 border border-slate-700 transition-all"
                  >
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Track Live Status</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
