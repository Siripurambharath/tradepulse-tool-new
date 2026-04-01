import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Mail, Eye, Send } from 'lucide-react';
import { getTemplates } from '@/data/store';
import { addHistoryEntry } from '@/data/store';
import { EmailTemplate } from '@/data/mockData';
import { toast } from 'sonner';

type Recipient = { name: string; email: string; company: string };

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  recipients: Recipient[];
  product?: string;
}

export function EmailModal({ open, onClose, recipients, product = '' }: EmailModalProps) {
  const templates = getTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const [subject, setSubject] = useState(selectedTemplate?.subject || '');
  const [body, setBody] = useState(selectedTemplate?.body || '');

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const t = templates.find(t => t.id === id);
    if (t) {
      setSubject(t.subject.replace('{{product}}', product));
      setBody(t.body.replace(/\{\{product\}\}/g, product).replace(/\{\{contact_name\}\}/g, recipients[0]?.name || 'Sir/Madam'));
    }
  };

  const handleSend = () => {
    addHistoryEntry({
      id: crypto.randomUUID(),
      product: product || 'General',
      date: new Date().toISOString(),
      companies: recipients.map(r => ({
        companyName: r.company,
        contactName: r.name,
        email: r.email,
        sentAt: new Date().toISOString(),
        status: 'Sent',
        templateUsed: selectedTemplate?.name || 'Custom',
      })),
    });
    toast.success(`Email sent to ${recipients.length} recipient(s)`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Email ({recipients.length} recipients)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email Template</label>
            <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <Tooltip key={t.id}>
                    <TooltipTrigger asChild>
                      <SelectItem value={t.id}>
                        <span className="flex items-center gap-2">
                          {t.name}
                          <Eye className="h-3 w-3 text-muted-foreground" />
                        </span>
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
            <Input value={subject} onChange={e => setSubject(e.target.value)} className="bg-card" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Message</label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className="bg-card" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSend} className="gap-2">
              <Send className="h-4 w-4" /> Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
