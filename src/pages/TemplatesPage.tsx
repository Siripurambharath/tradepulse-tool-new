// // TemplatesPage.tsx
// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent } from '@/components/ui/card';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle
// } from '@/components/ui/dialog';
// import { Plus, FileText, Trash2 } from 'lucide-react';
// import {
//   getTemplates,
//   createTemplate,
//   deleteTemplate
// } from './EmailTemplates';
// import  {AdminSidebar}  from "@/components/AdminSidebar";

// export default function TemplatesPage() {
//   const [templates, setTemplates] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [name, setName] = useState('');
//   const [subject, setSubject] = useState('');
//   const [body, setBody] = useState('');

//   const fetchTemplates = async () => {
//     try {
//       const data = await getTemplates();
//       setTemplates(data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     fetchTemplates();
//   }, []);

//   const handleAdd = async () => {
//     try {
//       if (!name || !subject || !body) {
//         alert("Please fill all fields");
//         return;
//       }
//       await createTemplate({ name, subject, body });
//       setName('');
//       setSubject('');
//       setBody('');
//       setOpen(false);
//       fetchTemplates();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await deleteTemplate(id);
//       fetchTemplates();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//       <div className="flex h-screen w-full">
//         <AdminSidebar />
//           <div className="p-6 max-w-7xl mx-auto">
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//               <h1 className="text-2xl font-bold text-foreground">
//                 Email Templates
//               </h1>
//               <Button onClick={() => setOpen(true)} className="gap-2">
//                 <Plus className="h-4 w-4" />
//                 New Template
//               </Button>
//             </div>

//             {/* Templates Grid */}
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {templates.map((t) => (
//                 <Card key={t.id} className="hover:border-primary/30 transition-colors">
//                   <CardContent className="p-4">
//                     <div className="flex items-start gap-3">
//                       <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
//                         <FileText className="h-4 w-4 text-primary" />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <div className="flex items-start justify-between gap-2">
//                           <div>
//                             <h3 className="font-semibold text-foreground text-sm">
//                               {t.name}
//                             </h3>
//                             <p className="text-xs text-muted-foreground mt-0.5 truncate">
//                               {t.subject}
//                             </p>
//                           </div>
//                           <button
//                             onClick={() => handleDelete(t.id)}
//                             className="text-red-500 hover:text-red-700"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                         <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
//                           {t.body.substring(0, 150)}...
//                         </p>
//                         <p className="text-xs text-muted-foreground mt-2">
//                           Created: {new Date(t.created_at).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {/* Dialog */}
//             <Dialog open={open} onOpenChange={setOpen}>
//               <DialogContent className="bg-card">
//                 <DialogHeader>
//                   <DialogTitle>Create Email Template</DialogTitle>
//                 </DialogHeader>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="text-sm font-medium text-foreground mb-1 block">
//                       Template Name
//                     </label>
//                     <Input
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       placeholder="e.g., Welcome Email"
//                       className="bg-card"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-foreground mb-1 block">
//                       Subject Line
//                     </label>
//                     <Input
//                       value={subject}
//                       onChange={(e) => setSubject(e.target.value)}
//                       placeholder="Use {{Company}}"
//                       className="bg-card"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-foreground mb-1 block">
//                       Body
//                     </label>
//                     <Textarea
//                       value={body}
//                       onChange={(e) => setBody(e.target.value)}
//                       rows={8}
//                       placeholder="Write your email template..."
//                       className="bg-card"
//                     />
//                   </div>
//                   <div className="flex justify-end gap-2">
//                     <Button variant="outline" onClick={() => setOpen(false)}>
//                       Cancel
//                     </Button>
//                     <Button onClick={handleAdd}>
//                       Create Template
//                     </Button>
//                   </div>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           </div>
//       </div>
//   );
// }




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
import { 
  Plus, 
  Trash2, 
  Search, 
  Mail,
  Clock,
  Tag,
  Loader2
} from 'lucide-react';
import { AdminSidebar } from "@/components/AdminSidebar";
import {
  getTemplates,
  createTemplate,
  deleteTemplate
} from './EmailTemplates';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
      setError('');
    } catch (error) {
      setError('Failed to load templates');
      console.log(error);
    } finally {
      setLoading(false);
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
      setDeletingId(id);
      await deleteTemplate(id);
      fetchTemplates();
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorForTemplate = (id) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-pink-100 text-pink-700',
      'bg-orange-100 text-orange-700',
      'bg-teal-100 text-teal-700',
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto pt-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Email Templates
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Manage your email templates for campaigns and automations
                </p>
              </div>
              <Button 
                onClick={() => setOpen(true)} 
                className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/80"
                />
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Templates Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading templates...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="h-10 w-10 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No templates found
                </h3>
                <p className="text-muted-foreground text-center max-w-sm mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first email template to get started'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Template
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((t, index) => (
                <Card 
                  key={t.id} 
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${getColorForTemplate(index)} flex items-center justify-center shrink-0 font-semibold text-lg`}>
                        {getInitials(t.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors">
                              {t.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground truncate">
                                {t.subject}
                              </p>
                            </div>
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={deletingId === t.id}
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 transition-all duration-200 shrink-0 border border-red-200/50 dark:border-red-800/30"
                            title="Delete template"
                          >
                            {deletingId === t.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-600 dark:text-red-400" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </button>
                        </div>
                        
                        <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {t.body.substring(0, 150)}...
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(t.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {t.body.split(' ').length} words
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Statistics Footer */}
          {templates.length > 0 && !loading && (
            <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground border-t border-slate-200/80 dark:border-slate-700/80 pt-4">
              <span>
                Showing {filteredTemplates.length} of {templates.length} templates
              </span>
              <span>
                Last updated: {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}

          {/* Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/80 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Create Email Template
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new email template for your campaigns
                </p>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Template Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Welcome Email"
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Subject Line
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Use {{Company}} for dynamic content"
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Email Body
                  </label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    placeholder="Write your email template... Use {{variables}} for dynamic content"
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                    className="border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAdd}
                    className="shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}