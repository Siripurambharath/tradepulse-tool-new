import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { allCompanies } from '@/data/mockData';
import { useStore } from '@/data/store';
import { Mail, Eye, MessageSquare, TrendingUp } from 'lucide-react';

const COLORS = ['hsl(217,91%,60%)', 'hsl(142,71%,45%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)', 'hsl(199,89%,48%)', 'hsl(280,60%,50%)'];

export default function AnalyticsPage() {
  const { history } = useStore();

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    allCompanies.slice(0, 500).forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const totalSent = history.reduce((sum, h) => sum + h.companies.length, 0);
  const totalOpened = history.reduce((sum, h) => sum + h.companies.filter(c => c.status === 'Opened' || c.status === 'Replied').length, 0);
  const totalReplied = history.reduce((sum, h) => sum + h.companies.filter(c => c.status === 'Replied').length, 0);

  const funnelData = [
    { stage: 'Sent', count: totalSent || 150 },
    { stage: 'Opened', count: totalOpened || 89 },
    { stage: 'Replied', count: totalReplied || 34 },
    { stage: 'Interested', count: Math.floor((totalReplied || 34) * 0.6) },
    { stage: 'Converted', count: Math.floor((totalReplied || 34) * 0.3) },
  ];

  const weeklyData = [
    { week: 'Week 1', sent: 42, opened: 28, replied: 12 },
    { week: 'Week 2', sent: 35, opened: 22, replied: 8 },
    { week: 'Week 3', sent: 51, opened: 38, replied: 15 },
    { week: 'Week 4', sent: 28, opened: 19, replied: 11 },
  ];

  const stats = [
    { label: 'Emails Sent', value: totalSent || 150, icon: Mail, color: 'text-primary' },
    { label: 'Opened', value: totalOpened || 89, icon: Eye, color: 'text-info' },
    { label: 'Replied', value: totalReplied || 34, icon: MessageSquare, color: 'text-success' },
    { label: 'Response Rate', value: `${totalSent ? Math.round((totalReplied / totalSent) * 100) : 23}%`, icon: TrendingUp, color: 'text-warning' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Weekly Outreach</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="hsl(217,91%,60%)" strokeWidth={2} />
              <Line type="monotone" dataKey="opened" stroke="hsl(38,92%,50%)" strokeWidth={2} />
              <Line type="monotone" dataKey="replied" stroke="hsl(142,71%,45%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
