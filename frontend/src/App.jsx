import React, { useState } from 'react';
import Navbar from './components/Navbar';
import FilingWizard from './components/FilingWizard';
import AgentChat from './components/AgentChat';
import TicketTracker from './components/TicketTracker';
import SocialAdvocacy from './components/SocialAdvocacy';
import MunicipalAdmin from './components/MunicipalAdmin';
import DatasetGallery from './components/DatasetGallery';
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('wizard');
  const [activeTrackingId, setActiveTrackingId] = useState('AMC-2026-WZ-88412');
  const [chatInitialQuery, setChatInitialQuery] = useState('');

  const navigateToTrack = (trackingId) => {
    setActiveTrackingId(trackingId);
    setActiveTab('tracker');
  };

  const navigateToSocial = (trackingId) => {
    setActiveTrackingId(trackingId);
    setActiveTab('social');
  };

  const runSampleInWizard = (sample) => {
    setActiveTab('wizard');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'wizard' && (
          <FilingWizard 
            onSelectTicket={setActiveTrackingId}
            onNavigateToTrack={navigateToTrack}
          />
        )}
        {activeTab === 'chat' && (
          <AgentChat 
            initialQuery={chatInitialQuery}
            onSelectTicket={setActiveTrackingId}
          />
        )}
        {activeTab === 'tracker' && (
          <TicketTracker 
            initialTrackingId={activeTrackingId}
            onNavigateToSocial={navigateToSocial}
          />
        )}
        {activeTab === 'social' && (
          <SocialAdvocacy 
            initialTrackingId={activeTrackingId}
          />
        )}
        {activeTab === 'admin' && (
          <MunicipalAdmin 
            onSelectTicket={navigateToTrack}
          />
        )}
        {activeTab === 'dataset' && (
          <DatasetGallery 
            onRunSample={runSampleInWizard}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">CivicPulse AI</span>
            <span>•</span>
            <span>Autonomous Civic Intelligence System</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Mock AMC Jurisdiction: 48 Wards • 7 Zones</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">FastAPI + React 19</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
