import React from 'react';
import { useBills } from '../hooks/useBills';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertTriangle, Clock, CheckCircle, Plus, Zap, Droplets, Flame, Wifi } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { bills, loading } = useBills();
  const { isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Supabase not configured</p>
          <p className="text-sm text-gray-400">Please connect to Supabase to view your dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate stats
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const overdueBills = bills.filter(bill => 
    bill.status === 'pending' && isBefore(new Date(bill.due_date), today)
  );
  
  const upcomingBills = bills.filter(bill => 
    bill.status === 'pending' && 
    isAfter(new Date(bill.due_date), today) && 
    isBefore(new Date(bill.due_date), nextWeek)
  );
  
  const paidThisMonth = bills.filter(bill => 
    bill.status === 'paid' && 
    format(new Date(bill.created_at), 'yyyy-MM') === format(today, 'yyyy-MM')
  );

  const totalPending = bills
    .filter(bill => bill.status === 'pending')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const totalPaidThisMonth = paidThisMonth.reduce((sum, bill) => sum + bill.amount, 0);

  // Prepare chart data
  const utilityTypeData = bills.reduce((acc: Record<string, number>, bill) => {
    acc[bill.utility_type] = (acc[bill.utility_type] || 0) + bill.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(utilityTypeData).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: getUtilityColor(key),
  }));

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthStr = format(month, 'yyyy-MM');
    const monthBills = bills.filter(bill => 
      bill.status === 'paid' && format(new Date(bill.created_at), 'yyyy-MM') === monthStr
    );
    return {
      month: format(month, 'MMM'),
      amount: monthBills.reduce((sum, bill) => sum + bill.amount, 0),
    };
  }).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your utility bills and payments</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Bill</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Overdue Bills</p>
              <p className="text-2xl font-bold text-red-600">{overdueBills.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Due This Week</p>
              <p className="text-2xl font-bold text-orange-600">{upcomingBills.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Paid This Month</p>
              <p className="text-2xl font-bold text-green-600">{paidThisMonth.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Pending</p>
              <p className="text-2xl font-bold text-blue-600">${totalPending.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-blue-600 text-2xl font-bold">$</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Utility Type */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Utility Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Spending Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Bills</h3>
        </div>
        <div className="p-6">
          {bills.filter(bill => bill.status === 'pending').length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending bills</p>
          ) : (
            <div className="space-y-4">
              {bills
                .filter(bill => bill.status === 'pending')
                .slice(0, 5)
                .map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-2 rounded-lg">
                        {getUtilityIcon(bill.utility_type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{bill.title}</h4>
                        <p className="text-sm text-gray-600">
                          Due: {format(new Date(bill.due_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-gray-900">
                        ${bill.amount.toFixed(2)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isBefore(new Date(bill.due_date), today)
                          ? 'bg-red-100 text-red-700'
                          : isBefore(new Date(bill.due_date), nextWeek)
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isBefore(new Date(bill.due_date), today)
                          ? 'Overdue'
                          : isBefore(new Date(bill.due_date), nextWeek)
                          ? 'Due Soon'
                          : 'Upcoming'
                        }
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getUtilityColor(type: string): string {
  const colors = {
    electricity: '#F59E0B',
    water: '#3B82F6',
    gas: '#EF4444',
    internet: '#10B981',
  };
  return colors[type as keyof typeof colors] || '#6B7280';
}

function getUtilityIcon(type: string) {
  const icons = {
    electricity: <Zap className="text-yellow-600" size={20} />,
    water: <Droplets className="text-blue-600" size={20} />,
    gas: <Flame className="text-red-600" size={20} />,
    internet: <Wifi className="text-green-600" size={20} />,
  };
  return icons[type as keyof typeof icons] || <Zap size={20} />;
}

export default Dashboard;