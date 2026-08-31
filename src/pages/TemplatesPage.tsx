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
import { Plus, FileText, Trash2, Mail, Sparkles, Calendar, Zap } from 'lucide-react';

import {
  getTemplates,
  createTemplate,
  deleteTemplate
} from './EmailTemplates';
import './TemplatePage.css';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      await createTemplate({ name, subject, body });
      setName('');
      setSubject('');
      setBody('');
      setOpen(false);
      await fetchTemplates();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplate(id);
      await fetchTemplates();
    } catch (error) {
      console.log(error);
    }
  };

  const placeholders = [
    'company_name',
    'contact',
    'country',
    'email_revealed',
    'emails',
    'hsn_code',
    'phone_revealed',
    'products',
    'website'
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      <div className="w-full px-0 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">        {/* Header with glass-morphism effect - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm border border-white/50">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/20">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate">
                Email Templates
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 mt-0 truncate hidden xs:block">
                Manage your email templates for consistent communication
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setOpen(true)} 
            className="gap-1.5 sm:gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9 md:h-10"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">New Template</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>

        {/* Templates Grid - Mobile Responsive */}
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 md:py-20 px-4 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-dashed border-slate-200">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-3 sm:mb-4 shadow-inner">
              <Mail className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-500" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              No templates yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 max-w-sm px-2">
              Create your first email template to start sending consistent, branded messages to your customers.
            </p>
            <Button 
              onClick={() => setOpen(true)} 
              size="lg" 
              className="gap-2 mt-4 sm:mt-5 md:mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              Create Your First Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {templates.map((t, index) => (
              <Card
                key={t.id}
                className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Gradient accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                
                {/* Decorative blur circle */}
                <div className="absolute -top-20 -right-20 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-2xl pointer-events-none" />

                <CardContent className="p-4 sm:p-5 md:p-6 relative">
                  <div className="flex items-start gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center shrink-0 ring-1 ring-blue-500/10 group-hover:ring-blue-500/20 transition-all group-hover:scale-105">
                      <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-800 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">
                            {t.name}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
                            {t.subject}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="shrink-0 h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-all duration-200 hover:scale-110"
                          aria-label="Delete template"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-slate-200/50 via-slate-200 to-slate-200/50 my-2.5 sm:my-3" />

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 min-h-[3.5rem] sm:min-h-[4.5rem]">
                    {t.body.substring(0, 120)}...
                  </p>

                  <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100/50">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                    <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-slate-400 truncate">
                      Created {new Date(t.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

  {/* Dialog with reduced height - Mobile Responsive - CENTERED */}
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl sm:rounded-2xl p-0 max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
    <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
    
    <DialogHeader className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-0">
      <div className="flex items-center gap-2 sm:gap-3 mb-1">
        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
        </div>
        <DialogTitle className="text-base sm:text-lg md:text-xl font-bold text-slate-800">
          Create Email Template
        </DialogTitle>
      </div>
      <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 mt-0.5 sm:mt-1">
        Design a professional email template with dynamic placeholders
      </p>
    </DialogHeader>

    <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
      <div className="space-y-1 sm:space-y-1.5">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
          Template Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Welcome Email"
          className="bg-slate-50/80 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all h-8 sm:h-9 text-xs sm:text-sm"
        />
      </div>

      <div className="space-y-1 sm:space-y-1.5">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
          Subject Line
        </label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Use {{Company}} for dynamic content"
          className="bg-slate-50/80 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all h-8 sm:h-9 text-xs sm:text-sm"
        />
      </div>

      <div className="space-y-1 sm:space-y-1.5">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
          Email Body
        </label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Write your email template... Use {{Company}}, {{Name}}, {{Link}} placeholders"
          className="bg-slate-50/80 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-mono text-xs sm:text-sm min-h-[100px] sm:min-h-[120px]"
        />
        
        {/* Placeholders Display - Compact Version */}
        <div className="mt-1.5 p-2 sm:p-2.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-lg border border-blue-100/50">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
            <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-slate-700">Placeholders:</span>
          </div>
          <div className="flex flex-wrap gap-0.5 sm:gap-1">
            {placeholders.map((p) => (
              <span 
                key={p} 
                className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 bg-white rounded text-[8px] sm:text-[9px] md:text-[10px] font-mono text-slate-700 border border-blue-100/50 shadow-sm"
              >
                <span className="text-blue-400 text-[7px] sm:text-[8px]">{'{'}{'{'}</span>
                {p}
                <span className="text-blue-400 text-[7px] sm:text-[8px]">{'}'}{'}'}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-1">
        <Button 
          variant="outline" 
          onClick={() => setOpen(false)}
          className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 h-8 sm:h-9 w-full sm:w-auto text-xs sm:text-sm"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleAdd}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed h-8 sm:h-9 w-full sm:w-auto text-xs sm:text-sm"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            'Create Template'
          )}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
      </div>

      {/* Custom keyframe animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 