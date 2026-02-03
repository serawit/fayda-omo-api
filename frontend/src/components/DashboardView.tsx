import VerificationChart from './VerificationChart';
import VerificationTable from './VerificationTable';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';


export interface DashboardStats {
  total: string;
  pending: number;
  successRate: string;
}

export interface DashboardViewProps {
  startDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  endDate: Date | null;
  onEndDateChange: (date: Date | null) => void;
  activeDay: string | null;
  onBarClick: (data: any) => void;
  tableData: any[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

// Presentational Component (View)
export default function DashboardView({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  activeDay,
  onBarClick,
  tableData,
  stats,
  loading,
  error,
  onRetry,
}: DashboardViewProps) {
  if (loading) {
    return <div>Loading dashboard data...</div>; // Replace with a fancier loader if desired
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load data</h3>
        <p className="text-gray-500 mb-6 text-center">{error}</p>
        <button onClick={onRetry} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor real-time verification metrics and performance.</p>
        </div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="flex gap-3">
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={onStartDateChange}
              slotProps={{ textField: { size: 'small', className: 'bg-white' } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={onEndDateChange}
              slotProps={{ textField: { size: 'small', className: 'bg-white' } }}
            />
          </div>
        </LocalizationProvider>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Verifications</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <span className="text-xs text-green-600 mt-2 font-medium">↑ 12% from last week</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Pending Requests</h3>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          <span className="text-xs text-gray-400 mt-2">Requires attention</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Success Rate</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.successRate}</p>
          <span className="text-xs text-gray-400 mt-2">Target: 99.0%</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Verification Trends</h2>
          <p className="text-sm text-gray-500">Click on a bar to view detailed logs for that day.</p>
        </div>
        <VerificationChart onBarClick={onBarClick} activeDay={activeDay} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeDay ? `Logs for ${activeDay}` : 'Recent Verification Logs'}
          </h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
            {tableData.length} Records
          </span>
        </div>
        <VerificationTable data={tableData} day={activeDay} />
      </div>
    </div>
  );
}