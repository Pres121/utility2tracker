import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, DollarSign } from 'lucide-react';

interface BillFormData {
  title: string;
  utility_type: 'electricity' | 'water' | 'gas' | 'internet';
  amount: number;
  due_date: string;
  is_recurring: boolean;
  recurring_period?: 'monthly' | 'quarterly' | 'annually';
  notes?: string;
}

interface BillFormProps {
  onSubmit: (data: BillFormData) => void;
  onCancel: () => void;
  initialData?: Partial<BillFormData>;
  isEditing?: boolean;
}

const BillForm: React.FC<BillFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BillFormData>({
    defaultValues: {
      title: initialData?.title || '',
      utility_type: initialData?.utility_type || 'electricity',
      amount: initialData?.amount || 0,
      due_date: initialData?.due_date || new Date().toISOString().split('T')[0],
      is_recurring: initialData?.is_recurring || false,
      recurring_period: initialData?.recurring_period || 'monthly',
      notes: initialData?.notes || '',
    },
  });

  const watchIsRecurring = watch('is_recurring');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Bill' : 'Add New Bill'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bill Title
            </label>
            <input
              type="text"
              {...register('title', { required: 'Bill title is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Electricity - Main House"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Utility Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utility Type
            </label>
            <select
              {...register('utility_type', { required: 'Please select a utility type' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="electricity">⚡ Electricity</option>
              <option value="water">💧 Water</option>
              <option value="gas">🔥 Gas</option>
              <option value="internet">📡 Internet</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                {...register('due_date', { required: 'Due date is required' })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.due_date && (
              <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
            )}
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('is_recurring')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                This is a recurring bill
              </span>
            </label>
          </div>

          {/* Recurring Period */}
          {watchIsRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurring Period
              </label>
              <select
                {...register('recurring_period')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Any additional notes about this bill..."
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Update Bill' : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillForm;