import { useState } from 'react';
import { useUser } from '../contexts/UserContext';

interface ChapaPaymentProps {
  amount: number;
  phoneNumber: string;
  shippingData?: {
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_zip: string;
    shipping_phone: string;
    notes: string;
  };
  cartItems?: Array<{
    product_id: number;
    quantity: number;
  }>;
  // onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

export default function ChapaPayment({ amount, phoneNumber, shippingData, cartItems, onError }: ChapaPaymentProps) {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChapaPayment = async () => {
    setIsProcessing(true);
    onError(''); // Clear previous errors

    try {
      // Validate phone number
      if (!phoneNumber || phoneNumber.trim() === '') {
        onError('Phone number is required for Chapa payment');
        setIsProcessing(false);
        return;
      }

      // Validate email format
      if (!user?.email || !user.email.includes('@')) {
        onError('Please log in with a valid email address to make payments');
        setIsProcessing(false);
        return;
      }

      // First, store the pending order
      let txRef = `injera_${Date.now()}`;
      
      if (shippingData && cartItems) {
        const pendingOrderData = {
          ...shippingData,
          payment_method: 'chapa',
          items: cartItems,
          total_amount: amount,
        };

        console.log('📦 Storing pending order:', pendingOrderData);

        const pendingResponse = await fetch('http://localhost:3000/api/store-pending-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(pendingOrderData),
        });

        if (!pendingResponse.ok) {
          const errorData = await pendingResponse.json();
          throw new Error(errorData.error || 'Failed to store pending order');
        }

        const pendingResult = await pendingResponse.json();
        txRef = pendingResult.tx_ref;
        console.log('✅ Pending order stored with tx_ref:', txRef);
      }

      // Prepare payment data
      const paymentData = {
        amount: amount,
        currency: 'ETB',
        email: user.email,
        first_name: user?.name?.split(' ')[0] || 'Customer',
        last_name: user?.name?.split(' ').slice(1).join(' ') || 'User',
        phone_number: phoneNumber.trim(),
        tx_ref: txRef,
      };

      console.log('🚀 Initiating Chapa payment:', paymentData);

      // Call backend to create Chapa payment
      const response = await fetch('http://localhost:3000/api/create-chapa-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create Chapa payment');
      }

      console.log('✅ Chapa payment created:', result);

      if (result.data.checkout_url) {
        // Redirect to real Chapa checkout page
        console.log('🔗 Redirecting to REAL Chapa checkout:', result.data.checkout_url);
        window.location.href = result.data.checkout_url;
      } else {
        throw new Error('No checkout URL received from Chapa');
      }
    } catch (err: any) {
      console.error('❌ Chapa payment error:', err);
      onError(err.message || 'Failed to initiate Chapa payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">🇪🇹</div>
        <div>
          <h4 className="font-semibold text-gray-800">Pay with Chapa</h4>
          <p className="text-sm text-gray-600">
            Pay securely with Ethiopian banks or mobile money
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">Chapa Payment</span>
        </div>
        <p className="text-xs text-green-700">
          Secure payment through Chapa. You will be redirected to complete your payment.
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Phone: {phoneNumber}
        </p>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-semibold">ETB {amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span>Chapa</span>
        </div>
      </div>

      <button
        onClick={handleChapaPayment}
        disabled={isProcessing}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processing...</span>
          </div>
        ) : (
          `Pay ETB ${amount.toFixed(2)} with Chapa`
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        You will be redirected to Chapa's secure payment page
      </div>
    </div>
  );
}
