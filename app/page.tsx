"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, Hash, Type, Clock, CheckCircle2, RefreshCw, Database } from "lucide-react";
import { toast } from "sonner";
import { getTickets, addTicket, removeTicket, Ticket } from "./actions";

export default function HiveTicketTracker() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState({ id: "", title: "", date: "", timeTaken: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true); // Flag to check if .env is set

  // Load from Google Sheets on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTickets();
        setTickets(data);
        toast.success("Tickets fetched successfully!");
      } catch (err) {
        toast.error("Failed to fetch tickets!");
        // If credentials are missing, it will return empty safely but we can flag it
        console.warn(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    
    // Set date only on client to avoid Server/Client hydration mismatch
    setNewTicket(prev => ({ ...prev, date: new Date().toISOString().split("T")[0] }));
  }, []);

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.id.trim() || !newTicket.title.trim() || !newTicket.date) return;
    
    const formattedTicket = { ...newTicket };
    
    // Optimistically update UI (but wait for server to confirm order)
    setIsSaving(true);
    const toastId = toast.loading("Saving ticket to cloud...");
    const result = await addTicket(formattedTicket);
    
    if (result.success) {
      // Re-fetch to ensure sync with Google Sheets (since appending goes to the bottom)
      const data = await getTickets();
      setTickets(data);
      setNewTicket({ id: "", title: "", date: new Date().toISOString().split("T")[0], timeTaken: "" });
      toast.success("Ticket added successfully!", { id: toastId });
    } else {
      toast.error("Failed to save to Google Sheets! Check .env credentials.", { id: toastId });
      setIsConfigured(false);
    }
    
    setIsSaving(false);
  };

  const handleRemoveTicket = async (indexToRemove: number) => {
    setIsSaving(true);
    const toastId = toast.loading("Deleting ticket...");
    
    const result = await removeTicket(indexToRemove);
    if (result.success) {
      const data = await getTickets();
      setTickets(data);
      toast.success("Ticket deleted successfully!", { id: toastId });
    } else {
      toast.error("Failed to delete from Google Sheets!", { id: toastId });
    }
    
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
                <Database className="w-8 h-8 text-white" />
              </div>
              Google Sheets Tracker
            </h1>
            <p className="text-neutral-400 mt-2 text-lg">
              Synchronizing continuously with your Cloud Database ☁️
            </p>
          </div>
          
          <div className="flex gap-3 items-center">
            {isSaving && (
              <span className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Syncing...
              </span>
            )}
            <div className="px-5 py-2.5 rounded-xl font-medium bg-neutral-800 text-white flex items-center gap-2 border border-neutral-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Live Sync
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-1 border border-neutral-800 bg-neutral-900/50 rounded-3xl p-6 shadow-xl backdrop-blur-sm h-fit sticky top-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Log New Ticket
            </h2>
            
            <form onSubmit={handleAddTicket} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-neutral-500" /> Ticket ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HIVE-1234"
                  value={newTicket.id}
                  onChange={(e) => setNewTicket({...newTicket, id: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-neutral-500" /> Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement authentication"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neutral-500" /> Date
                </label>
                <input
                  type="date"
                  required
                  value={newTicket.date}
                  onChange={(e) => setNewTicket({...newTicket, date: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all scheme-dark"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neutral-500" /> Time Taken
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 hours"
                  value={newTicket.timeTaken}
                  onChange={(e) => setNewTicket({...newTicket, timeTaken: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-4 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 font-bold py-3 px-4 flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer"
              >
                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {isSaving ? "Syncing..." : "Add & Sync to Cloud"}
              </button>
            </form>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2 border border-neutral-800 bg-neutral-900/50 rounded-3xl shadow-xl backdrop-blur-sm min-h-[500px] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Live Data Feed
              </h2>
              <span className="bg-neutral-800 text-neutral-300 text-xs py-1 px-3 rounded-full font-medium">
                {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
              </span>
            </div>

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 m-6">
                 <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                 <p className="text-neutral-400">Pinging Google Sheets API...</p>
              </div>
            ) : !isConfigured ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 m-6 border-2 border-dashed border-red-900/50 rounded-2xl bg-red-900/10">
                <Database className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-red-400">Setup Required</h3>
                <p className="text-neutral-400 mt-2 max-w-sm">
                  Please link your Google Service Account in your <code className="bg-black px-1 py-0.5 rounded text-red-300">.env.local</code> file to begin syncing data.
                </p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 m-6 border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
                <Database className="w-16 h-16 text-neutral-700 mb-4" />
                <h3 className="text-lg font-bold text-neutral-300">Your Cloud Sheet is Empty</h3>
                <p className="text-neutral-500 mt-2 max-w-sm">
                  Add a ticket using the form on the left. It will magically appear right inside your connected Google Spreadsheet instantly!
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto p-6 pt-0 mt-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 text-sm font-semibold uppercase tracking-wider">
                      <th className="pb-4 px-4 w-1/5">Ticket ID</th>
                      <th className="pb-4 px-4 w-2/5">Task Title</th>
                      <th className="pb-4 px-4 w-1/5">Date</th>
                      <th className="pb-4 px-4 w-1/5">Time Taken</th>
                      <th className="pb-4 px-4 text-right w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {tickets.map((ticket, idx) => (
                      <tr key={idx} className="group hover:bg-neutral-800/30 transition-colors">
                        <td className="py-4 px-4 text-neutral-200 font-mono text-sm">
                          <span className="bg-neutral-800 px-2 py-1.5 rounded-md border border-neutral-700 inline-block shadow-sm">
                            {ticket.id}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-white font-medium">
                          {ticket.title}
                        </td>
                        <td className="py-4 px-4 text-neutral-400 text-sm">
                          {ticket.date}
                        </td>
                        <td className="py-4 px-4 text-neutral-300 text-sm">
                          {ticket.timeTaken || '-'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleRemoveTicket(idx)}
                            className="text-neutral-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer disabled:opacity-0"
                            title="Remove ticket"
                            disabled={isSaving}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
