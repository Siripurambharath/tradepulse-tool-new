import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Mail, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';

const COLORS = ['hsl(217,91%,60%)', 'hsl(142,71%,45%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)', 'hsl(199,89%,48%)', 'hsl(280,60%,50%)'];

export default function AnalyticsPage() {
  const [trackingData, setTrackingData] = useState<any>({
    sent: [],
    replied: [],
    notContacted: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/tracking/all')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrackingData(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching analytics data:', err);
        setLoading(false);
      });
  }, []);

  // ✅ Derive interested / not interested from response column
  const totalSent          = trackingData.sent?.length || 0;
  const totalReplied       = trackingData.replied?.length || 0;
  const totalNotContacted  = trackingData.notContacted?.length || 0;
  const totalInterested    = trackingData.sent?.filter((s: any) => s.response === 'interested').length || 0;
  const totalNotInterested = trackingData.sent?.filter((s: any) => s.response === 'not_interested').length || 0;

  // ✅ Status distribution pie
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      'Not Contacted': totalNotContacted,
      'Email Sent':    totalSent - totalInterested - totalNotInterested,
      'Replied':       totalReplied,
      'Interested':    totalInterested,
      'Not Interested':totalNotInterested,
    };
    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [trackingData]);

  // ✅ Funnel with interested / not interested stages
  const funnelData = [
    { stage: 'Not Contacted', count: totalNotContacted },
    { stage: 'Sent',          count: totalSent },
    { stage: 'Replied',       count: totalReplied },
    { stage: 'Interested',    count: totalInterested },
    { stage: 'Not Interested',count: totalNotInterested },
  ];

  // ✅ Weekly trend including interested / not interested
  const weeklyData = useMemo(() => {
    const weeks: Record<string, { sent: number; replied: number; interested: number; not_interested: number }> = {};

    trackingData.sent?.forEach((email: any) => {
      const date = new Date(email.sent_at);
      const weekKey = `Week ${Math.ceil(date.getDate() / 7)}`;
      if (!weeks[weekKey]) weeks[weekKey] = { sent: 0, replied: 0, interested: 0, not_interested: 0 };
      weeks[weekKey].sent++;
      if (email.response === 'interested')     weeks[weekKey].interested++;
      if (email.response === 'not_interested') weeks[weekKey].not_interested++;
    });

    trackingData.replied?.forEach((reply: any) => {
      const date = new Date(reply.replied_at);
      const weekKey = `Week ${Math.ceil(date.getDate() / 7)}`;
      if (weeks[weekKey]) weeks[weekKey].replied++;
    });

    return Object.entries(weeks).map(([week, data]) => ({
      week,
      sent:         data.sent,
      replied:      data.replied,
      interested:   data.interested,
      notInterested:data.not_interested,
    }));
  }, [trackingData]);

  // ✅ Stats cards
  const stats = [
    { label: 'Total Companies', value: totalNotContacted + totalSent + totalReplied, icon: Mail,         color: 'text-primary' },
    { label: 'Emails Sent',     value: totalSent,                                    icon: Mail,         color: 'text-primary' },
    { label: 'Replied',         value: totalReplied,                                 icon: MessageSquare,color: 'text-success' },
    { label: 'Response Rate',   value: `${totalSent ? Math.round((totalReplied / totalSent) * 100) : 0}%`, icon: TrendingUp, color: 'text-warning' },
    { label: 'Interested',      value: totalInterested,                              icon: ThumbsUp,     color: 'text-green-500' },
    { label: 'Not Interested',  value: totalNotInterested,                           icon: ThumbsDown,   color: 'text-red-500' },
    { label: 'Not Contacted',   value: totalNotContacted,                            icon: Mail,         color: 'text-muted-foreground' },
  ];

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading analytics data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>

      {/* ✅ Stats Cards */}
      <div className="flex flex-wrap gap-4 mb-6 w-full justify-between">
        {stats.map(s => (
          <Card key={s.label} className="flex-1 min-w-[140px]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <s.icon className={`h-7 w-7 shrink-0 ${s.color}`} />
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* ✅ Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.stage === 'Interested'     ? 'hsl(142,71%,45%)' :
                        entry.stage === 'Not Interested' ? 'hsl(0,84%,60%)'   :
                        'hsl(217,91%,60%)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ✅ Status Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Weekly Outreach Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Outreach Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData.length ? weeklyData : [
              { week: 'No Data', sent: 0, replied: 0, interested: 0, notInterested: 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent"         stroke="hsl(217,91%,60%)" strokeWidth={2} />
              <Line type="monotone" dataKey="replied"      stroke="hsl(38,92%,50%)"  strokeWidth={2} />
              <Line type="monotone" dataKey="interested"   stroke="hsl(142,71%,45%)" strokeWidth={2} />
              <Line type="monotone" dataKey="notInterested"stroke="hsl(0,84%,60%)"   strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}