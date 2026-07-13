// TemplatesPage.tsx
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Plus, FileText, Trash2, Mail } from 'lucide-react';
import {
  getTemplates,
  createTemplate,
  deleteTemplate
} from './EmailTemplates';
import  {AdminSidebar}  from "@/components/AdminSidebar";
import './TemplatePage.css';


export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAdd = async () => {
    try {
      if (!name || !subject || !body) {
        alert("Please fill all fields");
        return;
      }
      await createTemplate({ name, subject, body });
      setName('');
      setSubject('');
      setBody('');
      setOpen(false);
      fetchTemplates();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTemplate(id);
      fetchTemplates();
    } catch (error) {
      console.log(error);
    }
  };

  return (
      <div className="flex h-screen w-full">
        <AdminSidebar />
          <div className="p-6 max-w-7xl mx-auto content-space">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 space-content">
              <h1 className="text-2xl font-bold text-foreground">
                Email Templates
              </h1>
              <Button onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>

            {/* Templates Grid */}
            {templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed rounded-xl bg-muted/20">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  No templates yet
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Create your first email template to start sending consistent, branded messages.
                </p>
                <Button onClick={() => setOpen(true)} size="sm" className="gap-2 mt-4">
                  <Plus className="h-4 w-4" />
                  New Template
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map((t) => (
                  <Card
                    key={t.id}
                    className="group relative overflow-hidden border-border/60 shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Accent top bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/40" />

                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/15 group-hover:bg-primary/15 transition-colors">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground text-sm truncate">
                                {t.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {t.subject}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/70 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              aria-label="Delete template"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-border/60 my-3" />

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 min-h-[3rem]">
                        {t.body.substring(0, 150)}...
                      </p>

                      <p className="text-[11px] font-medium text-muted-foreground/70 mt-3 uppercase tracking-wide">
                        Created {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Template Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Welcome Email"
                      className="bg-card"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Subject Line
                    </label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Use {{Company}}"
                      className="bg-card"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Body
                    </label>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={8}
                      placeholder="Write your email template..."
                      className="bg-card"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdd}>
                      Create Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
      </div>
  );
}