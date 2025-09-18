import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, DollarSign, CreditCard } from 'lucide-react';

interface PaymentFormData {
  bill_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'online';
  notes?: string;
}

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PaymentFormData>;
  isEditing?: boolean;
  bills: any[];
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  bills,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: {
      bill_id: initialData?.bill_id || '',
      amount: initialData?.amount || 0,
      payment_date: initialData?.payment_date 
        ? new Date(initialData.payment_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      payment_method: initialData?.payment_method || 'card',
      notes: initialData?.notes || '',
    },
  });

  const selectedBillId = watch('bill_id');
  const selectedBill = bills.find(bill => bill.id === selectedBillId);

  const handleFormSubmit = (data: PaymentFormData) => {
    // Convert the datetime-local input to ISO string
    const formattedData = {
      ...data,
      payment_date: new Date(data.payment_date).toISOString(),
    };
    onSubmit(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Payment' : 'Record Payment'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Bill Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bill
            </label>
            <select
              {...register('bill_id', { required: 'Please select a bill' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select a bill</option>
              {bills.map((bill) => (
                <option key={bill.id} value={bill.id}>
                  {bill.title} - ${bill.amount.toFixed(2)}
                </option>
              ))}
            </select>
            {errors.bill_id && (
              <p className="mt-1 text-sm text-red-600">{errors.bill_id.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Paid
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
            {selectedBill && (
              <p className="mt-1 text-sm text-gray-500">
                Bill amount: ${selectedBill.amount.toFixed(2)}
              </p>
            )}
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date & Time
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="datetime-local"
                {...register('payment_date', { required: 'Payment date is required' })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.payment_date && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_date.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                {...register('payment_method', { required: 'Please select a payment method' })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="card">💳 Credit/Debit Card</option>
                <option value="cash">💵 Cash</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="check">📝 Check</option>
                <option value="online">💻 Online Payment</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Any additional notes about this payment..."
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
              {isEditing ? 'Update Payment' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;