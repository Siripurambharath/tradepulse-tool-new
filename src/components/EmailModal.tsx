import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Mail, Eye, Send, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { getTemplates, addHistoryEntry } from '@/data/store';
import { toast } from 'sonner';

type Recipient = { name: string; email: string; company: string };

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  recipients: Recipient[];
  product?: string;
}

type SendStage = 'compose' | 'processing' | 'done';

interface BatchStatus {
  total: number;
  completed: number;
  failed: number;
  active: number;
  waiting: number;
  allDone: boolean;
  overallProgress: number;
  jobs: Array<{
    jobId: string;
    email: string;
    companyName: string;
    state: string;
    reason?: string;
  }>;
}

export function EmailModal({ open, onClose, recipients, product = '' }: EmailModalProps) {
  const templates = getTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const [subject, setSubject] = useState(selectedTemplate?.subject || '');
  const [body, setBody] = useState(selectedTemplate?.body || '');

  const [stage, setStage] = useState<SendStage>('compose');
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [batchId, setBatchId] = useState('');
  const [jobIds, setJobIds] = useState<string[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      stopPolling();
      setStage('compose');
      setBatchStatus(null);
    }
  }, [open]);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const t = templates.find((t) => t.id === id);
    if (t) {
      setSubject(t.subject.replace('{{product}}', product));
      setBody(
        t.body
          .replace(/\{\{product\}\}/g, product)
          .replace(/\{\{contact_name\}\}/g, recipients[0]?.name || 'Sir/Madam')
      );
    }
  };

  function startPolling(bid: string, jids: string[]) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/batch-status/${bid}?jobIds=${jids.join(',')}`
        );
        const data: BatchStatus = await res.json();
        setBatchStatus(data);

        if (data.allDone) {
          stopPolling();
          setStage('done');

          if (data.failed === 0) {
            toast.success(`All ${data.completed} emails sent successfully!`);
          } else if (data.completed === 0) {
            toast.error(`All ${data.failed} emails failed. Check Bull Board.`);
          } else {
            toast.warning(`${data.completed} sent, ${data.failed} failed.`);
          }
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 2000);
  }

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error('No recipients selected');
      return;
    }

    const newBatchId = crypto.randomUUID();
    const batchDate = new Date().toISOString();

    const historyPayload = {
      id: newBatchId,
      product: product || 'General',
      date: batchDate,
      companies: recipients.map((r) => ({
        companyName: r.company,
        contactName: r.name,
        email: r.email,
        sentAt: batchDate,
        status: 'Pending',
        templateUsed: selectedTemplate?.name || 'Custom',
      })),
    };

    setStage('processing');
    setBatchStatus({
      total: recipients.length,
      completed: 0,
      failed: 0,
      active: 0,
      waiting: recipients.length,
      allDone: false,
      overallProgress: 0,
      jobs: [],
    });

    try {
      const response = await fetch('http://localhost:5000/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: product || 'General',
          subject,
          message: body,
          historyPayload,
        }),
      });

      if (!response.ok) throw new Error('Failed to enqueue jobs');

      const { batchId: bid, jobIds: jids, total } = await response.json();
      setBatchId(bid);
      setJobIds(jids);

      // Add to local store (status will update as jobs complete)
      addHistoryEntry(historyPayload as any);

      console.log(`Batch ${bid}: ${total} jobs enqueued`);
      startPolling(bid, jids);

    } catch (err) {
      console.error(err);
      setStage('compose');
      toast.error('Failed to connect to server.');
    }
  };

  const handleClose = () => {
    stopPolling();
    setStage('compose');
    setBatchStatus(null);
    setBatchId('');
    setJobIds([]);
    setSubject('');
    setBody('');
    setSelectedTemplateId(templates[0]?.id || '');
    onClose();
  };

  // Determine overall result for done stage
  const allSuccess = batchStatus && batchStatus.failed === 0;
  const allFailed = batchStatus && batchStatus.completed === 0;
  const partial = batchStatus && batchStatus.failed > 0 && batchStatus.completed > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Email ({recipients.length} recipients)
          </DialogTitle>
        </DialogHeader>

        {/* ── COMPOSE ── */}
        {stage === 'compose' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email Template</label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <Tooltip key={t.id}>
                      <TooltipTrigger asChild>
                        <SelectItem value={t.id}>
                          <span className="flex items-center gap-2">{t.name}<Eye className="h-3 w-3 text-muted-foreground" /></span>
                        </SelectItem>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium text-xs mb-1">{t.subject}</p>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{t.body.substring(0, 200)}...</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">To</label>
              <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/50 max-h-20 overflow-auto">
                {recipients.map((r, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{r.email}</span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Subject</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-card" placeholder="Enter email subject" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Message</label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="bg-card font-mono text-sm" placeholder="Write your email message here..." />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSend} className="gap-2">
                <Send className="h-4 w-4" /> Send Email
              </Button>
            </div>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {stage === 'processing' && batchStatus && (
          <div className="space-y-5 py-4">

            {/* Overall progress ring + counts */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/30" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="5"
                    strokeLinecap="round" className="text-primary transition-all duration-700"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - batchStatus.overallProgress / 100)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-foreground">{batchStatus.overallProgress}%</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <p className="font-medium text-foreground">Processing {batchStatus.total} emails</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Waiting</span>
                  <span className="font-medium text-foreground">{batchStatus.waiting}</span>
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-medium text-primary">{batchStatus.active}</span>
                  <span className="text-muted-foreground">Sent</span>
                  <span className="font-medium text-emerald-600">{batchStatus.completed}</span>
                  <span className="text-muted-foreground">Failed</span>
                  <span className="font-medium text-red-500">{batchStatus.failed}</span>
                </div>
              </div>
            </div>

            {/* Per-job live list (last 8 visible) */}
            {batchStatus.jobs.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
                  Live job status — {batchStatus.jobs.length} of {batchStatus.total} tracked
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-border">
                  {batchStatus.jobs.slice(-8).reverse().map((j) => (
                    <div key={j.jobId} className="flex items-center gap-3 px-3 py-2 text-xs">
                      {j.state === 'completed' && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                      {j.state === 'failed'    && <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                      {j.state === 'active'    && <Loader2 className="w-3 h-3 text-primary animate-spin shrink-0" />}
                      {(j.state === 'waiting' || j.state === 'delayed') && <div className="w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0" />}
                      <span className="text-muted-foreground truncate flex-1">{j.email}</span>
                      <span className={`font-medium capitalize ${
                        j.state === 'completed' ? 'text-emerald-600' :
                        j.state === 'failed'    ? 'text-red-500' :
                        j.state === 'active'    ? 'text-primary' : 'text-muted-foreground'
                      }`}>{j.state}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Track all jobs at{' '}
              <a href="http://localhost:5000/admin/queues" target="_blank" rel="noopener noreferrer"
                className="text-primary underline underline-offset-2">
                Bull Board →
              </a>
            </p>
          </div>
        )}

        {/* ── DONE ── */}
        {stage === 'done' && batchStatus && (
          <div className="flex flex-col items-center py-8 gap-5">

            {/* Icon based on result */}
            {allSuccess && (
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </div>
            )}
            {allFailed && (
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-9 w-9 text-red-500" />
              </div>
            )}
            {partial && (
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-9 w-9 text-amber-500" />
              </div>
            )}

            {/* Accurate counts */}
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground text-lg">
                {allSuccess ? 'All emails sent!' : allFailed ? 'All emails failed' : 'Partially sent'}
              </p>
              <div className="flex gap-6 justify-center text-sm mt-2">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-emerald-600">{batchStatus.completed}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-red-500">{batchStatus.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">{batchStatus.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              {batchStatus.failed > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Failed jobs can be retried individually from{' '}
                  <a href="http://localhost:5000/admin/queues" target="_blank" rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2">
                    Bull Board
                  </a>
                </p>
              )}
            </div>

            <Button onClick={handleClose} className="px-10 mt-2">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}