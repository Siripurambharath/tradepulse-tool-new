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
  FileText,
  Trash2
} from 'lucide-react';

import {
  getTemplates,
  createTemplate,
  deleteTemplate
} from './EmailTemplates'

export default function TemplatesPage() {

  const [templates, setTemplates] = useState([]);

  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  /*
  ====================================
  FETCH TEMPLATES
  ====================================
  */
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

  /*
  ====================================
  CREATE TEMPLATE
  ====================================
  */
  const handleAdd = async () => {
    try {

      if (!name || !subject || !body) {
        alert("Please fill all fields");
        return;
      }

      await createTemplate({
        name,
        subject,
        body
      });

      setName('');
      setSubject('');
      setBody('');

      setOpen(false);

      fetchTemplates();

    } catch (error) {
      console.log(error);
    }
  };

  /*
  ====================================
  DELETE TEMPLATE
  ====================================
  */
  const handleDelete = async (id) => {
    try {

      await deleteTemplate(id);

      fetchTemplates();

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Email Templates
        </h1>

        <Button
          onClick={() => setOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

        {templates.map((t) => (

          <Card
            key={t.id}
            className="hover:border-primary/30 transition-colors"
          >
            <CardContent className="p-4">

              <div className="flex items-start gap-3">

                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-start justify-between gap-2">

                    <div>
                      <h3 className="font-semibold text-foreground text-sm">
                        {t.name}
                      </h3>

                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {t.subject}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                    {t.body.substring(0, 150)}...
                  </p>

                  <p className="text-xs text-muted-foreground mt-2">
                    Created:
                    {" "}
                    {new Date(t.created_at).toLocaleDateString()}
                  </p>

                </div>

              </div>

            </CardContent>
          </Card>

        ))}

      </div>

      <Dialog open={open} onOpenChange={setOpen}>

        <DialogContent className="bg-card">

          <DialogHeader>
            <DialogTitle>
              Create Email Template
            </DialogTitle>
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
                placeholder="Use {{product}}, {{contact_name}}"
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

              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
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
  );
}