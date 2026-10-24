import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  ShieldAlert, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { getSampleDataset } from '../services/api';

export default function DatasetGallery({ onRunSample }) {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSampleDataset()
      .then((data) => setSamples(data.samples || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>Research & Academic Datasets</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Indian Urban Civic Issue Benchmarks
        </h1>
        <p className="mt-2 text-slate-400 text-sm leading-relaxed">
          Curated civic hazard test cases derived from Mendeley Indian Street Photos and Roboflow Road Pothole Object Detection datasets with synthetic EXIF metadata.
        </p>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {samples.map((s) => (
          <div
            key={s.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-cyan-500/50 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image Preview Container */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={s.image_data_url}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-mono text-emerald-400 flex items-center space-x-1 shadow-md">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{s.latitude.toFixed(4)}°N, {s.longitude.toFixed(4)}°E</span>
                </div>

                <div className="absolute top-3 right-3 bg-red-950/90 border border-red-800 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase text-red-300 shadow-md">
                  {s.severity} Severity
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-6">
                <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                  <span>{s.dataset_source}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{s.description}</p>

                {/* Ward & Department Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Mapped AMC Ward</span>
                    <span className="font-bold text-cyan-300">{s.ward_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Target Department</span>
                    <span className="font-bold text-indigo-300">{s.department_name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Run Action CTA */}
            <div className="p-6 pt-0">
              <button
                onClick={() => onRunSample(s)}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/25 transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Test with Autonomous Civic Agent</span>
                <ArrowRight className="w-4 h-4 text-cyan-200" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
