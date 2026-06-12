import { useState, useEffect, useRef } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';
import API_URL from '@/components/api';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Mail,
  Eye,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

import { addHistoryEntry } from '@/data/store';

import { toast } from 'sonner';

type Recipient = {
  name: string;
  email: string;
  company: string;
   buyer_id?: number;
    country?: string;  
};

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  recipients: Recipient[];
   multipleProducts?: boolean; 
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

export function EmailModal({
  open,
  onClose,
  recipients,
  product = '',
    multipleProducts = false,  
}: EmailModalProps) {
  /*
  ==========================================
  TEMPLATE STATES
  ==========================================
  */

  const [templates, setTemplates] = useState<any[]>([]);

  const [selectedTemplateId, setSelectedTemplateId] =
    useState('');

  const [subject, setSubject] = useState('');

  const [body, setBody] = useState('');

  const selectedTemplate = templates.find(
    (t) => t.id.toString() === selectedTemplateId
  );

  /*
  ==========================================
  EMAIL STATUS STATES
  ==========================================
  */

  const [stage, setStage] = useState<SendStage>('compose');

  const [batchStatus, setBatchStatus] =
    useState<BatchStatus | null>(null);

  const [batchId, setBatchId] = useState('');

  const [jobIds, setJobIds] = useState<string[]>([]);

  const pollRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  /*
  ==========================================
  FETCH TEMPLATES
  ==========================================
  */

  const fetchTemplates = async () => {
    try {
      const response = await fetch(
        `${API_URL}/email-templates`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();

      setTemplates(data.data || []);

      if (data.data?.length > 0) {
        const first = data.data[0];

        setSelectedTemplateId(first.id.toString());

        setSubject(
          first.subject.replace(/\{\{product\}\}/g, product)
        );

        setBody(
          first.body
            .replace(/\{\{product\}\}/g, product)
            .replace(
              /\{\{contact_name\}\}/g,
              recipients[0]?.name || 'Sir/Madam'
            )
        );
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    }
  };

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  /*
  ==========================================
  RESET WHEN MODAL CLOSES
  ==========================================
  */

  useEffect(() => {
    if (!open) {
      stopPolling();
      setStage('compose');
      setBatchStatus(null);
    }
  }, [open]);

  /*
  ==========================================
  STOP POLLING
  ==========================================
  */

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  /*
  ==========================================
  TEMPLATE CHANGE
  ==========================================
  */

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);

    const t = templates.find((t) => t.id.toString() === id);

    if (t) {
      setSubject(t.subject.replace(/\{\{product\}\}/g, product));

      setBody(
        t.body
          .replace(/\{\{product\}\}/g, product)
          .replace(
            /\{\{contact_name\}\}/g,
            recipients[0]?.name || 'Sir/Madam'
          )
      );
    }
  };

  /*
  ==========================================
  POLLING
  ==========================================
  */

  function startPolling(bid: string, jids: string[]) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_URL}/batch-status/${bid}?jobIds=${jids.join(',')}`
        );

        if (!res.ok) {
          throw new Error('Failed to fetch batch status');
        }

        const data: BatchStatus = await res.json();

        setBatchStatus(data);

        if (data.allDone) {
          stopPolling();
          setStage('done');

          if (data.failed === 0) {
            toast.success(
              `All ${data.completed} emails sent successfully!`
            );
          } else if (data.completed === 0) {
            toast.error(`All ${data.failed} emails failed`);
          } else {
            toast.warning(
              `${data.completed} sent, ${data.failed} failed`
            );
          }
        }
      } catch (error) {
        console.error('Error polling batch status:', error);
        stopPolling();
        setStage('done');
        toast.error('Error checking email status');
      }
    }, 2000);
  }

  /*
  ==========================================
  SEND EMAIL
  ==========================================
  */

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error('No recipients selected');
      return;
    }

    if (!subject.trim()) {
      toast.error('Subject cannot be empty');
      return;
    }

    if (!body.trim()) {
      toast.error('Message body cannot be empty');
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
    buyer_id: r.buyer_id,  
    country: (r as any).country, 
    email: r.email,
    product: (r as any).product,  
    sentAt: batchDate,
    status: 'Pending',
    templateUsed: selectedTemplate?.name || 'Custom',
     templateId: selectedTemplate?.id || null,  
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
      const response = await fetch(
        `${API_URL}/send-email`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            product: product || 'General',
            subject,
            message: body,
            historyPayload,
             multipleProducts: multipleProducts,  
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to enqueue jobs');
      }

      const { batchId: bid, jobIds: jids } = await response.json();

      setBatchId(bid);

      setJobIds(jids);

      addHistoryEntry(historyPayload as any);

      startPolling(bid, jids);
    } catch (error) {
      console.error('Error sending emails:', error);

      setStage('compose');

      setBatchStatus(null);

      toast.error('Failed to connect to server');
    }
  };

  /*
  ==========================================
  CLOSE MODAL
  ==========================================
  */

  const handleClose = () => {
    stopPolling();

    setStage('compose');

    setBatchStatus(null);

    setBatchId('');

    setJobIds([]);

    setSubject('');

    setBody('');

    setSelectedTemplateId('');

    onClose();
  };

  /*
  ==========================================
  RESULTS
  ==========================================
  */

  const allSuccess =
    batchStatus && batchStatus.failed === 0;

  const allFailed =
    batchStatus && batchStatus.completed === 0;

  const partial =
    batchStatus &&
    batchStatus.failed > 0 &&
    batchStatus.completed > 0;

  const progressPercentage =
    batchStatus?.total && batchStatus.total > 0
      ? Math.round(
          ((batchStatus.completed + batchStatus.failed) /
            batchStatus.total) *
            100
        )
      : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && handleClose()}
    >
      <DialogContent className="sm:max-w-[600px] bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Email ({recipients.length} recipients)
          </DialogTitle>
        </DialogHeader>

        {/* ======================================
            COMPOSE STAGE
        ====================================== */}

        {stage === 'compose' && (
          <div className="space-y-4">
            {/* TEMPLATE */}

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Email Template
              </label>

              <Select
                value={selectedTemplateId}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>

                <SelectContent>
                  {templates.map((t) => (
                    <Tooltip key={t.id}>
                      <TooltipTrigger asChild>
                        <SelectItem value={t.id.toString()}>
                          <span className="flex items-center gap-2">
                            {t.name}
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          </span>
                        </SelectItem>
                      </TooltipTrigger>

                      <TooltipContent
                        side="right"
                        className="max-w-xs"
                      >
                        <p className="font-medium text-xs mb-1">
                          {t.subject}
                        </p>

                        <p className="text-xs text-muted-foreground whitespace-pre-line">
                          {t.body.substring(0, 200)}...
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RECIPIENTS */}

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                To
              </label>

              <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/50 max-h-20 overflow-auto">
                {recipients.map((r, i) => (
                  <span
                    key={i}
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    {r.email}
                  </span>
                ))}
              </div>
            </div>

            {/* SUBJECT */}

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Subject
              </label>

              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-card"
                placeholder="Enter email subject"
              />
            </div>

            {/* BODY */}

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Message
              </label>

              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="bg-card font-mono text-sm"
                placeholder="Enter email message"
              />
            </div>

            {/* ACTIONS */}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>

              <Button
                onClick={handleSend}
                className="gap-2"
                disabled={recipients.length === 0}
              >
                <Send className="h-4 w-4" />
                Send Email
              </Button>
            </div>
          </div>
        )}

        {/* ======================================
            PROCESSING STAGE
        ====================================== */}

        {stage === 'processing' && batchStatus && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">Sending emails...</p>
                <p className="text-sm text-muted-foreground">
                  {batchStatus.completed + batchStatus.failed} of{' '}
                  {batchStatus.total} completed
                </p>
              </div>
            </div>

            {/* PROGRESS BAR */}

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>

              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* STATUS BREAKDOWN */}

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {batchStatus.completed}
                </p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {batchStatus.active + batchStatus.waiting}
                </p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {batchStatus.failed}
                </p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>

            {/* JOB STATUS LIST */}

            {batchStatus.jobs && batchStatus.jobs.length > 0 && (
              <div className="max-h-32 overflow-y-auto border rounded-lg bg-muted/30 p-2">
                {batchStatus.jobs.map((job) => (
                  <div
                    key={job.jobId}
                    className="text-xs py-1 px-2 flex items-center gap-2 border-b last:border-b-0"
                  >
                    {job.state === 'completed' && (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                    )}
                    {job.state === 'failed' && (
                      <XCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                    )}
                    {!['completed', 'failed'].includes(job.state) && (
                      <Loader2 className="h-3 w-3 text-amber-600 animate-spin flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{job.email}</p>
                      {job.reason && (
                        <p className="text-xs text-muted-foreground">
                          {job.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={!batchStatus.allDone}
              >
                {batchStatus.allDone ? 'Close' : 'Cancel'}
              </Button>
            </div>
          </div>
        )}

        {/* ======================================
            DONE STAGE
        ====================================== */}

        {stage === 'done' && batchStatus && (
          <div className="space-y-4">
            {/* RESULT ICON & HEADER */}

            <div className="flex flex-col items-center justify-center py-6">
              {allSuccess && (
                <>
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-3" />
                  <h3 className="text-lg font-semibold text-center">
                    All emails sent successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    {batchStatus.completed} emails delivered
                  </p>
                </>
              )}

              {allFailed && (
                <>
                  <XCircle className="h-12 w-12 text-red-600 mb-3" />
                  <h3 className="text-lg font-semibold text-center">
                    All emails failed
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    {batchStatus.failed} emails could not be sent
                  </p>
                </>
              )}

              {partial && (
                <>
                  <AlertTriangle className="h-12 w-12 text-amber-600 mb-3" />
                  <h3 className="text-lg font-semibold text-center">
                    Completed with errors
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    {batchStatus.completed} sent, {batchStatus.failed} failed
                  </p>
                </>
              )}
            </div>

            {/* SUMMARY */}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-900">
                <p className="text-2xl font-bold text-emerald-600">
                  {batchStatus.completed}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Successfully Sent
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border border-red-200 dark:border-red-900">
                <p className="text-2xl font-bold text-red-600">
                  {batchStatus.failed}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  Failed
                </p>
              </div>
            </div>

            {/* FAILED JOBS */}

            {batchStatus.failed > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Failed Emails:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {batchStatus.jobs
                    .filter((j) => j.state === 'failed')
                    .map((job) => (
                      <div key={job.jobId} className="text-xs text-muted-foreground">
                        <p className="font-mono">{job.email}</p>
                        {job.reason && (
                          <p className="text-red-600 dark:text-red-400">
                            {job.reason}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ACTIONS */}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EmailModal;