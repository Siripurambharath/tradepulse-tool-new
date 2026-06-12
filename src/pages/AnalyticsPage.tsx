import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Mail, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Building } from 'lucide-react';

const COLORS = ['hsl(217,91%,60%)', 'hsl(142,71%,45%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)', 'hsl(199,89%,48%)'];

export default function AnalyticsPage() {
  const [trackingData, setTrackingData] = useState({
    sent: 0,
    replied: 0,
    interested: 0,
    not_interested: 0,
    not_contacted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/tracking/counts')
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

  // Calculate metrics from the API response
  const totalSent = trackingData.sent;
  const totalReplied = trackingData.replied;
  const totalInterested = trackingData.interested;
  const totalNotInterested = trackingData.not_interested;
  const totalNotContacted = trackingData.not_contacted;
  const totalCompanies = totalSent + totalNotContacted;
  
  // Email Sent without response
  const emailSentNoResponse = totalSent - totalReplied;

  // Status distribution pie data
  const statusData = useMemo(() => {
    const counts = {
      'Not Contacted': totalNotContacted,
      'Email Sent': emailSentNoResponse,
      'Replied': totalReplied,
      'Interested': totalInterested,
      'Not Interested': totalNotInterested,
    };
    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [trackingData]);

  // Funnel data
  const funnelData = [
    { stage: 'Total Companies', count: totalCompanies },
    { stage: 'Emails Sent', count: totalSent },
    { stage: 'Replied', count: totalReplied },
    { stage: 'Interested', count: totalInterested },
  ];

  const weeklyData = [
    { 
      week: 'Current Week', 
      sent: totalSent, 
      replied: totalReplied, 
      interested: totalInterested, 
      notInterested: totalNotInterested 
    }
  ];

  // Stats cards - Removed Not Contacted
  const stats = [
    { label: 'Total Companies', value: totalCompanies, icon: Building, color: 'text-primary' },
    { label: 'Emails Sent', value: totalSent, icon: Mail, color: 'text-primary' },
    { label: 'Replied', value: totalReplied, icon: MessageSquare, color: 'text-green-500' },
    { label: 'Response Rate', value: `${totalSent ? Math.round((totalReplied / totalSent) * 100) : 0}%`, icon: TrendingUp, color: 'text-warning' },
    { label: 'Interested', value: totalInterested, icon: ThumbsUp, color: 'text-green-500' },
    { label: 'Not Interested', value: totalNotInterested, icon: ThumbsDown, color: 'text-red-500' },
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

      {/* Stats Cards - One Row with 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map(s => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Conversion Funnel */}
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
                        entry.stage === 'Interested' ? 'hsl(142,71%,45%)' :
                        entry.stage === 'Not Interested' ? 'hsl(0,84%,60%)' :
                        'hsl(217,91%,60%)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie */}
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

      {/* Weekly Outreach Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Outreach Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData.length ? weeklyData : [{ week: 'No Data', sent: 0, replied: 0, interested: 0, notInterested: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="hsl(217,91%,60%)" strokeWidth={2} name="Sent" />
              <Line type="monotone" dataKey="replied" stroke="hsl(38,92%,50%)" strokeWidth={2} name="Replied" />
              <Line type="monotone" dataKey="interested" stroke="hsl(142,71%,45%)" strokeWidth={2} name="Interested" />
              <Line type="monotone" dataKey="notInterested" stroke="hsl(0,84%,60%)" strokeWidth={2} name="Not Interested" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}