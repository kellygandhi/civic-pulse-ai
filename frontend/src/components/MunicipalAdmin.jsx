import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  Filter, 
  Edit3, 
  ShieldCheck, 
  Users, 
  ArrowUpRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { getMunicipalStats, listComplaints, updateComplaintStatus } from '../services/api';

export default function MunicipalAdmin({ onSelectTicket }) {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Status Update Modal State
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [officerName, setOfficerName] = useState('Er. Sunil Varma (Ward 12 Inspector)');
  const [officerNotes, setOfficerNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, cData] = await Promise.all([
        getMunicipalStats(),
        listComplaints(filterStatus ? { status: filterStatus } : {})
      ]);
      setStats(sData);
      setComplaints(cData.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleOpenUpdateModal = (comp) => {
    setActiveComplaint(comp);
    setNewStatus(comp.status === 'Registered' ? 'In Progress' : 'Resolved');
    setOfficerNotes(
      comp.status === 'Registered' 
        ? 'Field inspection verified. Maintenance crew deployed with repair materials.' 
        : 'Work completed on site, inspected and verified.'
    );
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!activeComplaint) return;

    setUpdating(true);
    try {
      await updateComplaintStatus({
        tracking_id: activeComplaint.tracking_id,
        new_status: newStatus,
        officer_name: officerName,
        notes: officerNotes
      });
      setActiveComplaint(null);
      await loadData();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Ahmedabad Municipal Corporation (AMC)</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Municipal Operations Control Room
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time civic telemetry, SLA compliance tracking, and field team dispatch.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-auto bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Grievances</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white">{stats.total_complaints}</span>
              <span className="text-[10px] text-emerald-400 font-medium">Logged</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">In Progress</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-blue-400">{stats.in_progress}</span>
              <span className="text-[10px] text-blue-400 font-medium">Active Crews</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Resolved</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-emerald-400">{stats.resolved}</span>
              <span className="text-[10px] text-emerald-400 font-medium">Validated</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Escalated</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-red-400">{stats.escalated}</span>
              <span className="text-[10px] text-red-400 font-medium">Zonal Desk</span>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-800/60 p-5 rounded-2xl shadow-lg">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">SLA Compliance</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white">{stats.sla_compliance_rate}%</span>
              <span className="text-[10px] text-emerald-400 font-medium">On-Time</span>
            </div>
          </div>
        </div>
      )}

      {/* Complaints Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Municipal Complaint Queue</h3>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
            {['', 'Registered', 'In Progress', 'Resolved', 'Escalated'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterStatus === st
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {st === '' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Tracking ID</th>
                <th className="py-3 px-4 font-semibold">Issue Category</th>
                <th className="py-3 px-4 font-semibold">Ward & Department</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {complaints.map((c) => (
                <tr key={c.tracking_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                    {c.tracking_id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white whitespace-nowrap">
                    {c.issue_category}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{c.ward_name}</div>
                    <div className="text-[10px] text-slate-400">{c.department_name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.severity === 'Critical'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : c.severity === 'High'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : c.status === 'Escalated'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : c.status === 'In Progress'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenUpdateModal(c)}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 inline-flex items-center space-x-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-cyan-400" />
                      <span>Update</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Update Grievance Status</h3>
                <span className="font-mono text-xs text-cyan-400 font-bold">{activeComplaint.tracking_id}</span>
              </div>
              <button
                onClick={() => setActiveComplaint(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Municipal Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Inspected">Inspected (Site verified)</option>
                  <option value="In Progress">In Progress (Repair crew on site)</option>
                  <option value="Resolved">Resolved (Remediation completed)</option>
                  <option value="Closed">Closed (Citizen acknowledged)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Acting Officer Designation
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Log Remark / Remediation Notes
                </label>
                <textarea
                  rows="3"
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveComplaint(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center space-x-1.5"
                >
                  {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  <span>Save Status & Log Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
