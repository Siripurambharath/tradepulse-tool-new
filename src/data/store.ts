import { create } from 'zustand';
import { EmailTemplate, HistoryEntry, Campaign, Company, defaultTemplates, generateHistory, generateCampaigns } from './mockData';

// Simple store using React context pattern - we'll use a simpler approach with useState in a context
// For now, export mutable arrays that pages can import and modify

let _templates = [...defaultTemplates];
let _history = generateHistory();
let _campaigns = generateCampaigns();
let _listeners: (() => void)[] = [];

function notify() { _listeners.forEach(fn => fn()); }

export function getTemplates() { return _templates; }
export function addTemplate(t: EmailTemplate) { _templates = [..._templates, t]; notify(); }

export function getHistory() { return _history; }
export function addHistoryEntry(e: HistoryEntry) { _history = [e, ..._history]; notify(); }

export function getCampaigns() { return _campaigns; }
export function addCampaign(c: Campaign) { _campaigns = [..._campaigns, c]; notify(); }
export function updateCampaign(id: string, updates: Partial<Campaign>) {
  _campaigns = _campaigns.map(c => c.id === id ? { ...c, ...updates } : c);
  notify();
}

export function subscribe(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

// Hook for re-rendering
import { useSyncExternalStore } from 'react';
export function useStore() {
  const snap = useSyncExternalStore(subscribe, () => ({
    templates: _templates,
    history: _history,
    campaigns: _campaigns,
  }));
  return snap;
}
