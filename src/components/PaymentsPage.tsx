import React, { useState } from 'react';
import { usePayments } from '../hooks/usePayments';
import { useBills } from '../hooks/useBills';
import PaymentForm from './PaymentForm';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Search, Filter, DollarSign, Calendar, CreditCard } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const { payments, loading, addPayment, updatePayment, deletePayment } = usePayments();
  const { bills } = useBills();
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const bill = bills.find(b => b.id === payment.bill_id);
    const matchesSearch = bill?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;
    const matchesMonth = filterMonth === 'all' || 
                        format(new Date(payment.payment_date), 'yyyy-MM') === filterMonth;
    
    return matchesSearch && matchesMethod && matchesMonth;
  });

  // Get unique months for filter
  const uniqueMonths = [...new Set(payments.map(payment => 
    format(new Date(payment.payment_date), 'yyyy-MM')
  ))].sort().reverse();

  const handleAddPayment = async (data: any) => {
    const result = await addPayment(data);
    if (result.error) {
      alert('Error adding payment: ' + result.error.message);
    } else {
      setShowForm(false);
    }
  };

  const handleEditPayment = async (data: any) => {
    if (!editingPayment) return;
    const result = await updatePayment(editingPayment.id, data);
    if (result.error) {
      alert('Error updating payment: ' + result.error.message);
    } else {
      setEditingPayment(null);
      setShowForm(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      const result = await deletePayment(id);
      if (result.error) {
        alert('Error deleting payment: ' + result.error.message);
      }
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      cash: '💵',
      card: '💳',
      bank_transfer: '🏦',
      check: '📝',
      online: '💻',
    };
    return icons[method as keyof typeof icons] || '💳';
  };

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Track and manage all your bill payments</p>
        </div>
        <button
          onClick={() => {
            setEditingPayment(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Payment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => 
                  format(new Date(p.payment_date), 'yyyy-MM') === format(new Date(), 'yyyy-MM')
                ).length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search payments..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Payment Method Filter */}
          <div className="sm:w-48">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="online">Online</option>
            </select>
          </div>

          {/* Month Filter */}
          <div className="sm:w-48">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Months</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>
                  {format(new Date(month + '-01'), 'MMMM yyyy')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <CreditCard size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterMethod !== 'all' || filterMonth !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by recording your first payment'
              }
            </p>
            {!searchTerm && filterMethod === 'all' && filterMonth === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Payment
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPayments.map((payment) => {
              const bill = bills.find(b => b.id === payment.bill_id);

              return (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getPaymentMethodIcon(payment.payment_method)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {bill?.title || 'Unknown Bill'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Paid on {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {payment.payment_method.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(payment.payment_date), 'h:mm a')}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingPayment(payment);
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit payment"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete payment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {payment.notes && (
                    <div className="mt-3 ml-12">
                      <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                        {payment.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showForm && (
        <PaymentForm
          onSubmit={editingPayment ? handleEditPayment : handleAddPayment}
          onCancel={() => {
            setShowForm(false);
            setEditingPayment(null);
          }}
          initialData={editingPayment}
          isEditing={!!editingPayment}
          bills={bills.filter(bill => bill.status === 'pending')}
        />
      )}
    </div>
  );
};

export default PaymentsPage;