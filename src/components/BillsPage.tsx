import React, { useState } from 'react';
import { useBills } from '../hooks/useBills';
import BillForm from './BillForm';
import { format, isBefore } from 'date-fns';
import { Plus, Edit, Trash2, CheckCircle, AlertTriangle, Clock, Search, Filter } from 'lucide-react';

const BillsPage: React.FC = () => {
  const { bills, loading, addBill, updateBill, deleteBill } = useBills();
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const today = new Date();

  // Filter bills
  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.utility_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    const matchesType = filterType === 'all' || bill.utility_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddBill = async (data: any) => {
    const result = await addBill(data);
    if (result.error) {
      alert('Error adding bill: ' + result.error.message);
    } else {
      setShowForm(false);
    }
  };

  const handleEditBill = async (data: any) => {
    if (!editingBill) return;
    const result = await updateBill(editingBill.id, data);
    if (result.error) {
      alert('Error updating bill: ' + result.error.message);
    } else {
      setEditingBill(null);
      setShowForm(false);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      const result = await deleteBill(id);
      if (result.error) {
        alert('Error deleting bill: ' + result.error.message);
      }
    }
  };

  const handleMarkPaid = async (bill: any) => {
    const result = await updateBill(bill.id, { status: 'paid' });
    if (result.error) {
      alert('Error marking bill as paid: ' + result.error.message);
    }
  };

  const getBillStatusInfo = (bill: any) => {
    const dueDate = new Date(bill.due_date);
    
    if (bill.status === 'paid') {
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Paid' };
    } else if (isBefore(dueDate, today)) {
      return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Overdue' };
    } else {
      return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Pending' };
    }
  };

  const getUtilityIcon = (type: string) => {
    const icons = {
      electricity: '⚡',
      water: '💧',
      gas: '🔥',
      internet: '📡',
    };
    return icons[type as keyof typeof icons] || '⚡';
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
          <p className="text-gray-600">Manage all your utility bills</p>
        </div>
        <button
          onClick={() => {
            setEditingBill(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Bill</span>
        </button>
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
              placeholder="Search bills..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="electricity">Electricity</option>
              <option value="water">Water</option>
              <option value="gas">Gas</option>
              <option value="internet">Internet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {filteredBills.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first bill'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Bill
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredBills.map((bill) => {
              const statusInfo = getBillStatusInfo(bill);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={bill.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getUtilityIcon(bill.utility_type)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bill.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {bill.utility_type} • Due: {format(new Date(bill.due_date), 'MMM dd, yyyy')}
                        </p>
                        {bill.is_recurring && (
                          <p className="text-xs text-blue-600 mt-1">
                            Recurring {bill.recurring_period}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${bill.amount.toFixed(2)}
                        </p>
                        <div className={`flex items-center space-x-1 ${statusInfo.bg} ${statusInfo.color} px-2 py-1 rounded-full`}>
                          <StatusIcon size={12} />
                          <span className="text-xs font-medium">{statusInfo.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {bill.status === 'pending' && (
                          <button
                            onClick={() => handleMarkPaid(bill)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Mark as paid"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingBill(bill);
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit bill"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteBill(bill.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete bill"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {bill.notes && (
                    <div className="mt-3 ml-12">
                      <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                        {bill.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bill Form Modal */}
      {showForm && (
        <BillForm
          onSubmit={editingBill ? handleEditBill : handleAddBill}
          onCancel={() => {
            setShowForm(false);
            setEditingBill(null);
          }}
          initialData={editingBill}
          isEditing={!!editingBill}
        />
      )}
    </div>
  );
};

export default BillsPage;