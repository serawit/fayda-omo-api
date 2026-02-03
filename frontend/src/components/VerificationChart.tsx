import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Mon', Successful: 40, Pending: 24 },
  { name: 'Tue', Successful: 30, Pending: 13 },
  { name: 'Wed', Successful: 52, Pending: 21 },
  { name: 'Thu', Successful: 27, Pending: 39 },
  { name: 'Fri', Successful: 48, Pending: 18 },
  { name: 'Sat', Successful: 23, Pending: 38 },
  { name: 'Sun', Successful: 34, Pending: 43 },
];

interface VerificationChartProps {
  onBarClick: (data: any) => void;
  activeDay: string | null;
}

export default function VerificationChart({ onBarClick, activeDay }: VerificationChartProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height="85%">
            <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    onBarClick(e.activePayload[0].payload);
                  }
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    }}
                    cursor={{ fill: 'rgba(253, 200, 47, 0.2)' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Successful" radius={[4, 4, 0, 0]}>
                    {data.map((entry) => (
                        <Cell key={`cell-success-${entry.name}`}
                              fill={activeDay === entry.name || !activeDay ? '#3b82f6' : 'rgba(59, 130, 246, 0.5)'}
                        />
                    ))}
                </Bar>
                <Bar dataKey="Pending" radius={[4, 4, 0, 0]}>
                    {data.map((entry) => (
                        <Cell key={`cell-pending-${entry.name}`}
                              fill={activeDay === entry.name || !activeDay ? '#FDC82F' : 'rgba(253, 200, 47, 0.5)'}
                        />
                    ))}
                </Bar>
            </BarChart>
      </ResponsiveContainer>
    </div>
  );
}