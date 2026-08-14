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
import { API_URL, ACTIVITY_URL } from '@/components/api';
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
  Users,
  Sparkles,
  FileText,
  MessageSquare,
  AtSign,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';
import { addHistoryEntry } from '@/data/store';
import { toast } from 'sonner';

// ==========================================
// ACTIVITY LOG HELPER FUNCTIONS
// ==========================================

const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
};

const getIPAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return '127.0.0.1';
  }
};

const createActivityLog = async (actionId: number, moduleId: number, description: string, additionalData?: any) => {
  try {
    const seller = JSON.parse(localStorage.getItem("seller") || "{}");
    const ipAddress = await getIPAddress();
    const device = getDeviceInfo();

    const logData = {
      userId: seller.id || 1,
      userName: seller.name || seller.email || 'Unknown',
      role: seller.role || 'seller',
      action_id: actionId,
      module_id: moduleId,
      description: description,
      ipAddress,
      device,
      status: 'SUCCESS',
      ...additionalData
    };

    const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });

    const result = await response.json();
    if (!result.success) {
      console.error('Failed to create activity log:', result.message);
    }
    return result;
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
};

// ==========================================
// TYPES
// ==========================================

type Recipient = {
  name: string;
  email: string;
  company: string;
  buyer_id?: number;
  country?: string;
  product?: string;
  contacts?: string;
  website?: string;
  hsn_code?: string;
  buyer_date?: string;
  [key: string]: any;
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

// ==========================================
// MAIN COMPONENT
// ==========================================

export function EmailModal({
  open,
  onClose,
  recipients,
  product = '',
  multipleProducts = false,
}: EmailModalProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [stage, setStage] = useState<SendStage>('compose');
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [isSending, setIsSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ccEmails, setCcEmails] = useState<string>('');
  const [showCc, setShowCc] = useState<boolean>(false);
  const seller = JSON.parse(localStorage.getItem("seller") || "{}");
  const selectedTemplate = templates.find((t) => t.id.toString() === selectedTemplateId);

  const replacePlaceholders = (text: string, recipient: Recipient, productName: string = product) => {
    if (!text) return text;
    const map: Record<string, string> = {
      '{{product}}': productName || recipient.product || 'General',
      '{{company_name}}': recipient.company || recipient.name || 'Sir/Madam',
      '{{company}}': recipient.company || recipient.name || 'Sir/Madam',
      '{{contact_name}}': recipient.name || recipient.contacts || recipient.company || 'Sir/Madam',
      '{{name}}': recipient.name || recipient.contacts || recipient.company || 'Sir/Madam',
      '{{email}}': recipient.email || '',
      '{{country}}': recipient.country || '',
      '{{buyer_id}}': recipient.buyer_id?.toString() || '',
      '{{hsn_code}}': recipient.hsn_code || '',
      '{{contacts}}': recipient.contacts || '',
      '{{website}}': recipient.website || '',
      '{{buyer_date}}': recipient.buyer_date ? new Date(recipient.buyer_date).toLocaleDateString() : '',
    };
    Object.keys(recipient).forEach(key => {
      if (typeof recipient[key] === 'string' || typeof recipient[key] === 'number') {
        const placeholder = `{{${key}}}`;
        if (!map[placeholder]) map[placeholder] = String(recipient[key]);
      }
    });
    let result = text;
    Object.entries(map).forEach(([placeholder, value]) => {
      result = result.replace(new RegExp(placeholder, 'g'), value || '');
    });
    return result;
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/email-templates`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.data || []);
      if (data.data?.length > 0) {
        const first = data.data[0];
        setSelectedTemplateId(first.id.toString());
        const firstRecipient = recipients[0] || { name: 'Sir/Madam', company: 'Sir/Madam', email: '', country: '', product: product || 'General' };
        setSubject(replacePlaceholders(first.subject, firstRecipient, product));
        setBody(replacePlaceholders(first.body, firstRecipient, product));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    }
  };

  // ✅ MODULE ID: 12 for Open Email Modal
  useEffect(() => {
    if (open) {
      fetchTemplates();
      createActivityLog(6, 12, 'Opened email composition modal', {
        recipient_count: recipients.length,
        product: product,
        multiple_products: multipleProducts
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      if (pollRef.current) clearInterval(pollRef.current);
      setStage('compose');
      setBatchStatus(null);
      setIsSending(false);
    }
  }, [open]);

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const t = templates.find((t) => t.id.toString() === id);
    if (t) {
      const firstRecipient = recipients[0] || { name: 'Sir/Madam', company: 'Sir/Madam', email: '', country: '', product: product || 'General' };
      setSubject(replacePlaceholders(t.subject, firstRecipient, product));
      setBody(replacePlaceholders(t.body, firstRecipient, product));
    }
  };

  const startPolling = (bid: string, jids: string[]) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/batch-status/${bid}?jobIds=${jids.join(',')}`);
        if (!res.ok) throw new Error('Failed to fetch batch status');
        const data: BatchStatus = await res.json();
        setBatchStatus(data);
        if (data.allDone) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStage('done');
          setIsSending(false);
          // ✅ MODULE ID: 12 for Email Batch Complete
          createActivityLog(3, 12, `Email batch completed: ${data.completed} sent, ${data.failed} failed`, {
            batch_id: bid,
            total: data.total,
            completed: data.completed,
            failed: data.failed,
            product: product,
            multiple_products: multipleProducts
          });
          if (data.failed === 0) toast.success(`All ${data.completed} emails sent successfully!`);
          else if (data.completed === 0) toast.error(`All ${data.failed} emails failed`);
          else toast.warning(`${data.completed} sent, ${data.failed} failed`);
        }
      } catch (error) {
        console.error('Error polling batch status:', error);
        if (pollRef.current) clearInterval(pollRef.current);
        setStage('done');
        setIsSending(false);
        toast.error('Error checking email status');
      }
    }, 2000);
  };

  const handleSend = async () => {
    if (recipients.length === 0) { toast.error('No recipients selected'); return; }
    if (!subject.trim()) { toast.error('Subject cannot be empty'); return; }
    if (!body.trim()) { toast.error('Message body cannot be empty'); return; }

    setIsSending(true);
    
    // Process CC emails
    const ccEmailList = showCc && ccEmails.trim() 
      ? ccEmails.split(',').map(email => email.trim()).filter(email => email)
      : [];

    // ✅ MODULE ID: 12 for Send Email Attempt
    await createActivityLog(3, 12, `Attempting to send ${recipients.length} emails`, {
      recipient_count: recipients.length,
      subject: subject,
      product: product,
      template_id: selectedTemplateId,
      template_name: selectedTemplate?.name || 'Custom',
      multiple_products: multipleProducts,
      has_cc: showCc && ccEmailList.length > 0,
      cc_emails: ccEmailList
    });

    const newBatchId = crypto.randomUUID();
    const batchDate = new Date().toISOString();

    const historyPayload = {
      id: newBatchId,
      product: product || 'General',
      date: batchDate,
      companies: recipients.map((r) => ({
        companyName: r.company,
        contactName: r.name || r.contacts || r.company,
        buyer_id: r.buyer_id,
        country: r.country,
        email: r.email,
        product: r.product || product,
        hsn_code: r.hsn_code,
        website: r.website,
        contacts: r.contacts,
        sentAt: batchDate,
        status: 'Pending',
        templateUsed: selectedTemplate?.name || 'Custom',
        templateId: selectedTemplate?.id || null,
        personalizedSubject: replacePlaceholders(subject, r),
        personalizedBody: replacePlaceholders(body, r),
        cc: ccEmailList
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
      const personalizedEmails = recipients.map((recipient) => ({
        ...recipient,
        personalizedSubject: replacePlaceholders(subject, recipient),
        personalizedBody: replacePlaceholders(body, recipient),
      }));

      const response = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: seller.id,
          product: product || 'General',
          subject,
          message: body,
          recipients: personalizedEmails,
          historyPayload,
          multipleProducts: multipleProducts,
          cc: ccEmailList,
          showCc: showCc && ccEmailList.length > 0
        }),
      });

      if (!response.ok) throw new Error('Failed to enqueue jobs');
      const { batchId: bid, jobIds: jids } = await response.json();
      addHistoryEntry(historyPayload as any);
      startPolling(bid, jids);
    } catch (error) {
      console.error('Error sending emails:', error);
      // ✅ MODULE ID: 12 for Email Failed
      await createActivityLog(3, 12, `Failed to send emails: ${error}`, {
        recipient_count: recipients.length,
        subject: subject,
        product: product,
        error: String(error),
        status: 'FAILED'
      });
      setStage('compose');
      setBatchStatus(null);
      setIsSending(false);
      toast.error('Failed to connect to server');
    }
  };

  const handleClose = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStage('compose');
    setBatchStatus(null);
    setSubject('');
    setBody('');
    setSelectedTemplateId('');
    setIsSending(false);
    setCcEmails('');
    setShowCc(false);
    onClose();
  };

  // ✅ NEW: Handle CC checkbox toggle with activity log (Action: 52, Module: 12)
  const handleCcToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShowCc(isChecked);
    
    if (!isChecked) {
      setCcEmails('');
    }
    
    // ✅ Activity Log for CC selection (Action: 52, Module: 12)
    createActivityLog(52, 12, `CC ${isChecked ? 'enabled' : 'disabled'} in email modal`, {
      cc_enabled: isChecked,
      cc_emails: isChecked ? ccEmails : '',
      recipient_count: recipients.length,
      product: product
    });
    
    // Show toast notification
    if (isChecked) {
      toast.info('CC option enabled - enter email addresses');
    }
  };

  // ✅ NEW: Handle CC input change with activity log (Action: 52, Module: 12)
  const handleCcInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCcEmails(value);
    
    // Only log if there are actual emails entered
    if (value.trim()) {
      const emailList = value.split(',').map(email => email.trim()).filter(email => email);
      if (emailList.length > 0) {
        // ✅ Activity Log for CC input (Action: 52, Module: 12)
        createActivityLog(52, 12, `CC emails entered: ${emailList.join(', ')}`, {
          cc_emails: emailList,
          cc_count: emailList.length,
          recipient_count: recipients.length,
          product: product
        });
      }
    }
  };

  const allSuccess = batchStatus && batchStatus.failed === 0;
  const allFailed = batchStatus && batchStatus.completed === 0;
  const partial = batchStatus && batchStatus.failed > 0 && batchStatus.completed > 0;
  const progressPercentage = batchStatus?.total && batchStatus.total > 0
    ? Math.round(((batchStatus.completed + batchStatus.failed) / batchStatus.total) * 100)
    : 0;

  const getAvailablePlaceholders = () => {
    if (!recipients[0]) return [];
    const recipient = recipients[0];
    const common = ['product', 'company_name', 'company', 'contact_name', 'name', 'email', 'country', 'buyer_id'];
    const dynamic = Object.keys(recipient).filter(key => !common.includes(key) && typeof recipient[key] !== 'function');
    return [...common, ...dynamic];
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white dark:bg-gray-900 rounded-2xl border-0 shadow-2xl overflow-hidden">
        {/* Decorative header */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-gray-800/30 dark:to-gray-700/30">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Compose Email
            </span>
            <span className="text-sm font-normal text-muted-foreground">({recipients.length})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 pt-3">
          {stage === 'compose' && (
            <div className="space-y-3">
              {/* Template */}
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-3 w-3 text-blue-500" />
                  Template
                </label>
                <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg h-9 text-sm">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <Tooltip key={t.id}>
                        <TooltipTrigger asChild>
                          <SelectItem value={t.id.toString()}>
                            <span className="flex items-center gap-2 text-sm">
                              <FileText className="h-3 w-3 text-blue-500" />
                              {t.name}
                            </span>
                          </SelectItem>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs p-2 bg-gray-800 text-white border-0 text-xs">
                          <p className="font-medium text-blue-300">{t.subject}</p>
                          <p className="text-gray-300">{t.body.substring(0, 100)}...</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipients */}
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Users className="h-3 w-3 text-blue-500" />
                  Recipients
                </label>
                <div className="flex flex-wrap gap-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 max-h-14 overflow-auto">
                  {recipients.map((r, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      <AtSign className="h-2.5 w-2.5" />
                      {r.email}
                    </span>
                  ))}
                </div>
              </div>

              {/* ===== CC Section with Checkbox ===== */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCc}
                      onChange={handleCcToggle}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-blue-500" />
                      CC
                    </span>
                  </label>
                  {showCc && (
                    <span className="text-xs text-muted-foreground">
                      (comma separated)
                    </span>
                  )}
                </div>
                {showCc && (
                  <Input
                    value={ccEmails}
                    onChange={handleCcInputChange}
                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg h-9 text-sm"
                    placeholder="Enter CC email addresses (e.g., john@example.com, jane@example.com)"
                  />
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="h-3 w-3 text-blue-500" />
                  Subject
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg h-9 text-sm"
                  placeholder="Enter email subject"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="h-3 w-3 text-blue-500" />
                  Message
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm resize-none"
                  placeholder="Enter email message"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <Button variant="outline" onClick={handleClose} size="sm" className="rounded-lg h-8 text-xs">
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={recipients.length === 0 || isSending}
                  className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg h-8 text-xs"
                  size="sm"
                >
                  {isSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Send {showCc && ccEmails.trim() && 'with CC'}
                </Button>
              </div>

              {/* CC Display in compose stage */}
              {showCc && ccEmails.trim() && (
                <div className="flex items-center gap-2 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <span className="text-xs font-medium text-muted-foreground">CC:</span>
                  <span className="text-xs text-blue-600 dark:text-blue-300">{ccEmails}</span>
                </div>
              )}
            </div>
          )}

          {stage === 'processing' && batchStatus && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Sending emails...</p>
                  <p className="text-xs text-muted-foreground">
                    {batchStatus.completed + batchStatus.failed} of {batchStatus.total}
                  </p>
                </div>
              </div>

              {/* Show CC info in processing stage */}
              {showCc && ccEmails.trim() && (
                <div className="flex items-center gap-2 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <span className="text-xs font-medium text-muted-foreground">CC:</span>
                  <span className="text-xs text-blue-600 dark:text-blue-300">{ccEmails}</span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-medium text-blue-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center border border-emerald-200 dark:border-emerald-800">
                  <p className="text-lg font-bold text-emerald-600">{batchStatus.completed}</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Sent</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center border border-amber-200 dark:border-amber-800">
                  <p className="text-lg font-bold text-amber-600">{batchStatus.active + batchStatus.waiting}</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Processing</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center border border-red-200 dark:border-red-800">
                  <p className="text-lg font-bold text-red-600">{batchStatus.failed}</p>
                  <p className="text-[10px] text-red-700 dark:text-red-300 font-medium">Failed</p>
                </div>
              </div>

              {batchStatus.jobs && batchStatus.jobs.length > 0 && (
                <div className="max-h-24 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 p-1.5 space-y-0.5">
                  {batchStatus.jobs.map((job) => (
                    <div key={job.jobId} className="flex items-center gap-1.5 text-xs py-1 px-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      {job.state === 'completed' && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                      {job.state === 'failed' && <XCircle className="h-3 w-3 text-red-600" />}
                      {!['completed', 'failed'].includes(job.state) && <Loader2 className="h-3 w-3 text-amber-600 animate-spin" />}
                      <span className="truncate">{job.email}</span>
                      {job.reason && <span className="text-red-500 text-[10px] ml-auto">{job.reason}</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <Button variant="outline" onClick={handleClose} disabled={!batchStatus.allDone} size="sm" className="rounded-lg h-8 text-xs">
                  {batchStatus.allDone ? 'Close' : 'Cancel'}
                </Button>
              </div>
            </div>
          )}

          {stage === 'done' && batchStatus && (
            <div className="space-y-3">
              <div className="flex flex-col items-center py-3">
                <div className={`p-2 rounded-full ${allSuccess ? 'bg-emerald-500' : allFailed ? 'bg-red-500' : 'bg-amber-500'}`}>
                  {allSuccess && <CheckCircle2 className="h-8 w-8 text-white" />}
                  {allFailed && <XCircle className="h-8 w-8 text-white" />}
                  {partial && <AlertTriangle className="h-8 w-8 text-white" />}
                </div>
                <h3 className="text-base font-bold mt-2">
                  {allSuccess ? 'All sent successfully! 🎉' : allFailed ? 'All failed 😞' : 'Completed with errors ⚠️'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {batchStatus.completed} sent, {batchStatus.failed} failed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xl font-bold text-emerald-600">{batchStatus.completed}</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                    <Check className="h-2.5 w-2.5 inline mr-0.5" />
                    Sent
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center border border-red-200 dark:border-red-800">
                  <p className="text-xl font-bold text-red-600">{batchStatus.failed}</p>
                  <p className="text-[10px] text-red-700 dark:text-red-300 font-medium">
                    <XCircle className="h-2.5 w-2.5 inline mr-0.5" />
                    Failed
                  </p>
                </div>
              </div>

              {batchStatus.failed > 0 && (
                <div className="bg-red-50/50 dark:bg-red-900/20 rounded-lg p-2 border border-red-200 dark:border-red-800">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Failed Emails:
                  </p>
                  <div className="space-y-0.5 max-h-20 overflow-y-auto">
                    {batchStatus.jobs.filter((j) => j.state === 'failed').map((job) => (
                      <div key={job.jobId} className="text-xs">
                        <p className="font-mono text-red-600 dark:text-red-400">{job.email}</p>
                        {job.reason && <p className="text-red-500 text-[10px] ml-2">{job.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <Button variant="outline" onClick={handleClose} size="sm" className="rounded-lg h-8 text-xs">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EmailModal;