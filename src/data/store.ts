import { useSyncExternalStore } from 'react';
import { EmailTemplate, HistoryEntry, Campaign, defaultTemplates, generateHistory, generateCampaigns } from './mockData';

let _templates = [...defaultTemplates];
let _history = generateHistory();
let _campaigns = generateCampaigns();
let _listeners: (() => void)[] = [];
let _snapshot = { templates: _templates, history: _history, campaigns: _campaigns };

function notify() {
  _snapshot = { templates: _templates, history: _history, campaigns: _campaigns };
  _listeners.forEach(fn => fn());
}

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

function subscribe(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function getSnapshot() { return _snapshot; }

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
