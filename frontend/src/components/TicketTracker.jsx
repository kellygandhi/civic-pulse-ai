import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  User, 
  ArrowUpRight, 
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { TwitterIcon as Twitter } from './Icons';

import { getComplaintStatus, escalateComplaint } from '../services/api';

export default function TicketTracker({ initialTrackingId = '', onNavigateToSocial }) {
  const [trackingId, setTrackingId] = useState(initialTrackingId || 'AMC-2026-WZ-88412');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [error, setError] = useState(null);

  const fetchTicket = async (idToFetch) => {
    const id = idToFetch || trackingId;
    if (!id.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getComplaintStatus(id.trim());
      setTicket(data);
    } catch (err) {
      setError(err.message || 'Ticket not found');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingId(initialTrackingId);
      fetchTicket(initialTrackingId);
    } else {
      fetchTicket('AMC-2026-WZ-88412');
    }
  }, [initialTrackingId]);

  const handleEscalate = async () => {
    if (!ticket) return;
    setEscalating(true);
    try {
      await escalateComplaint(ticket.tracking_id);
      await fetchTicket(ticket.tracking_id);
      alert(`Ticket #${ticket.tracking_id} successfully escalated to Deputy Municipal Commissioner.`);
    } catch (err) {
      alert(`Escalation failed: ${err.message}`);
    } finally {
      setEscalating(false);
    }
  };

  const sampleTickets = [
    { id: 'AMC-2026-WZ-88412', label: 'Registered (Pothole)' },
    { id: 'AMC-2026-WZ-73910', label: 'In Progress (Garbage)' },
    { id: 'AMC-2026-WZ-51204', label: 'Resolved (Drainage)' },
    { id: 'AMC-2026-NW-39185', label: 'Breached (Streetlight)' },
  ];

  const stages = [
    { key: 'Registered', label: 'Registered & Triaged' },
    { key: 'Inspected', label: 'Field Inspected' },
    { key: 'In Progress', label: 'Work In Progress' },
    { key: 'Resolved', label: 'Resolved & Closed' }
  ];

  const getStageIndex = (status) => {
    if (status === 'Registered') return 0;
    if (status === 'Inspected') return 1;
    if (status === 'In Progress') return 2;
    if (status === 'Resolved' || status === 'Closed') return 3;
    if (status === 'Escalated') return 2; // ongoing escalated
    return 0;
  };

  const currentStageIdx = ticket ? getStageIndex(ticket.current_status) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Municipal Grievance Status & SLA Audit
        </h1>
        <p className="mt-2 text-slate-400 text-sm">
          Track real-time inspection updates, SLA countdown, and trigger administrative escalation if resolutions are delayed.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTicket()}
              placeholder="Enter AMC Tracking ID (e.g. AMC-2026-WZ-88412)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchTicket()}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-600/25 flex items-center justify-center space-x-2 transition-all shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Track Grievance</span>
          </button>
        </div>

        {/* Quick Sample Chips */}
        <div className="mt-3 flex items-center space-x-2 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Sample Records:</span>
          {sampleTickets.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setTrackingId(st.id);
                fetchTicket(st.id);
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition-colors"
            >
              <span className="font-mono font-bold text-cyan-400">{st.id}</span>
              <span className="text-slate-400 ml-1.5">({st.label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-6 text-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">Record Not Found</h3>
          <p className="text-xs text-red-300 mt-1">{error}</p>
        </div>
      )}

      {/* Ticket Details Body */}
      {ticket && (
        <div className="space-y-6 animate-fadeIn">
          {/* Status & SLA Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-2xl font-black text-white tracking-tight">
                    {ticket.tracking_id}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                      ticket.current_status === 'Resolved'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : ticket.current_status === 'Escalated' || ticket.is_sla_breached
                        ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                        : ticket.current_status === 'In Progress'
                        ? 'bg-blue-950 text-blue-400 border-blue-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}
                  >
                    {ticket.current_status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Filed on {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'Recent'} • {ticket.address}
                </p>
              </div>

              {/* SLA Clock Box */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${ticket.is_sla_breached ? 'bg-red-950 text-red-400' : 'bg-cyan-950 text-cyan-400'}`}>
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    SLA Resolution Clock
                  </span>
                  {ticket.is_sla_breached ? (
                    <span className="text-sm font-black text-red-400 flex items-center space-x-1">
                      <span>BREACHED by {Math.abs(ticket.sla_hours_remaining)}h</span>
                    </span>
                  ) : ticket.current_status === 'Resolved' ? (
                    <span className="text-sm font-black text-emerald-400">
                      Resolved within SLA
                    </span>
                  ) : (
                    <span className="text-sm font-black text-amber-400">
                      {ticket.sla_hours_remaining} Hours Remaining
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SLA Breach Escalation Alert */}
            {ticket.is_sla_breached && (
              <div className="mt-4 bg-gradient-to-r from-red-950/80 to-amber-950/80 border border-red-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">SLA Resolution Window Breached!</h4>
                    <p className="text-xs text-slate-300">
                      This grievance was not resolved within the guaranteed AMC timeframe ({ticket.sla_hours_total}h).
                    </p>
                  </div>
                </div>
                {!ticket.is_escalated ? (
                  <button
                    onClick={handleEscalate}
                    disabled={escalating}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-lg shadow-red-600/30 shrink-0 transition-all flex items-center space-x-1.5"
                  >
                    <span>Escalate to Zonal Commissioner</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-amber-400 px-3 py-1 bg-black/40 rounded-lg border border-amber-800">
                    Officially Escalated
                  </span>
                )}
              </div>
            )}

            {/* Visual Lifecycle Progress Bar */}
            <div className="mt-8">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 z-0"></div>
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 z-0 transition-all duration-500"
                  style={{ width: `${(currentStageIdx / (stages.length - 1)) * 100}%` }}
                ></div>

                {stages.map((stage, idx) => {
                  const isDone = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  return (
                    <div key={stage.key} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 ring-4 ring-slate-900'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] mt-2 font-medium whitespace-nowrap ${
                          isCurrent ? 'text-cyan-300 font-bold' : isDone ? 'text-slate-200' : 'text-slate-500'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details & Officer Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Grievance Summary */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>Jurisdiction & Routing</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Municipal Ward</span>
                  <span className="font-bold text-white text-sm">{ticket.ward_name}</span>
                  <span className="text-slate-400 block">{ticket.zone}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Responsible Dept</span>
                  <span className="font-bold text-white text-sm">{ticket.department_name}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Reported Issue</span>
                  <span className="font-bold text-white text-sm">{ticket.severity} {ticket.issue_category}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Guaranteed SLA</span>
                  <span className="font-bold text-white text-sm">{ticket.sla_hours_total} Hours Window</span>
                </div>
              </div>

              {ticket.resolution_notes && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Official Resolution Note</span>
                  <p className="text-xs text-slate-200 mt-1 font-medium">{ticket.resolution_notes}</p>
                </div>
              )}
            </div>

            {/* Designated Ward Officer */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Designated Field Officer</span>
                </h3>

                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center font-bold text-indigo-300 text-lg">
                    {ticket.assigned_officer ? ticket.assigned_officer[0] : 'O'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{ticket.assigned_officer}</h4>
                    <span className="text-xs text-slate-400">Ward Field Inspector</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{ticket.officer_contact || '+91 98250 11201'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>ward.helpdesk@amc.gov.in</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (onNavigateToSocial) {
                      onNavigateToSocial(ticket.tracking_id);
                    }
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>Draft Public Advocacy Post</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audit Timeline Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>AMC Grievance Audit Trail ({ticket.timeline_events ? ticket.timeline_events.length : 0} Events)</span>
            </h3>

            <div className="space-y-6 relative pl-4 border-l-2 border-slate-800 ml-2">
              {ticket.timeline_events && ticket.timeline_events.map((evt, idx) => (
                <div key={idx} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-cyan-500 ring-4 ring-slate-900"></div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-white flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-mono">{evt.status}</span>
                        <span>{evt.action}</span>
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono mt-1 sm:mt-0">
                        {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{evt.notes}</p>
                    <span className="text-[10px] text-slate-500 mt-2 block font-medium">Logged by: {evt.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
