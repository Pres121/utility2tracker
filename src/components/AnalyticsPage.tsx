import React from 'react';
import { useBills } from '../hooks/useBills';
import { usePayments } from '../hooks/usePayments';
import { format, startOfMonth, endOfMonth, subMonths, isSameMonth } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Zap, Droplets, Flame, Wifi } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const { bills } = useBills();
  const { payments } = usePayments();

  // Calculate monthly spending trends
  const monthlySpending = Array.from({ length: 12 }, (_, i) => {
    const month = subMonths(new Date(), i);
    const monthPayments = payments.filter(payment => 
      isSameMonth(new Date(payment.payment_date), month)
    );
    return {
      month: format(month, 'MMM yyyy'),
      amount: monthPayments.reduce((sum, payment) => sum + payment.amount, 0),
      count: monthPayments.length,
    };
  }).reverse();

  // Calculate utility type breakdown
  const utilityBreakdown = bills.reduce((acc: Record<string, { amount: number; count: number }>, bill) => {
    if (!acc[bill.utility_type]) {
      acc[bill.utility_type] = { amount: 0, count: 0 };
    }
    acc[bill.utility_type].amount += bill.amount;
    acc[bill.utility_type].count += 1;
    return acc;
  }, {});

  const pieData = Object.entries(utilityBreakdown).map(([type, data]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: data.amount,
    count: data.count,
    color: getUtilityColor(type),
  }));

  // Calculate payment method breakdown
  const paymentMethodBreakdown = payments.reduce((acc: Record<string, number>, payment) => {
    acc[payment.payment_method] = (acc[payment.payment_method] || 0) + payment.amount;
    return acc;
  }, {});

  const paymentMethodData = Object.entries(paymentMethodBreakdown).map(([method, amount]) => ({
    method: method.charAt(0).toUpperCase() + method.slice(1),
    amount,
  }));

  // Calculate key metrics
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);
  
  const currentMonthPayments = payments.filter(payment => 
    isSameMonth(new Date(payment.payment_date), currentMonth)
  );
  const lastMonthPayments = payments.filter(payment => 
    isSameMonth(new Date(payment.payment_date), lastMonth)
  );

  const currentMonthTotal = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const monthlyChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  const averageMonthlySpending = monthlySpending.reduce((sum, month) => sum + month.amount, 0) / monthlySpending.length;
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = bills.filter(bill => bill.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Insights into your utility spending patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${currentMonthTotal.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                {monthlyChange >= 0 ? (
                  <TrendingUp className="text-red-500 mr-1" size={16} />
                ) : (
                  <TrendingDown className="text-green-500 mr-1" size={16} />
                )}
                <span className={`text-sm font-medium ${monthlyChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.abs(monthlyChange).toFixed(1)}% vs last month
                </span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Monthly</p>
              <p className="text-2xl font-bold text-gray-900">${averageMonthlySpending.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">Based on 12 months</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">${totalPaid.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">{payments.length} payments</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Bills</p>
              <p className="text-2xl font-bold text-gray-900">${totalPending.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">{bills.filter(b => b.status === 'pending').length} bills</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Area type="monotone" dataKey="amount" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Utility Type Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Utility Type</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bill Count by Month */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bills Paid by Month</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [value, 'Bills Paid']} />
                <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Utility Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Utility Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(utilityBreakdown).map(([type, data]) => (
              <div key={type} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  {getUtilityIcon(type)}
                  <h4 className="font-medium text-gray-900 capitalize">{type}</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">${data.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{data.count} bills</p>
                <p className="text-sm text-gray-600">
                  Avg: ${(data.amount / data.count).toFixed(2)} per bill
                </p>
              </div>
            ))}
          </div>
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

export default AnalyticsPage;