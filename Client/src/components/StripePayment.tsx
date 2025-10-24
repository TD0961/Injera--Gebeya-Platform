import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useUser } from '../contexts/UserContext';

// Initialize Stripe with publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentProps {
  amount: number;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

// Payment form component
function PaymentForm({ amount, onSuccess, onError }: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            description: `Injera Order - ${user?.name || 'Customer'}`,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create payment intent');
        }

        setClientSecret(result.data.client_secret);
        console.log('✅ Stripe payment intent created:', result);
      } catch (err: any) {
        console.error('❌ Failed to create payment intent:', err);
        onError(err.message || 'Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [amount, user, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      onError('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    onError(''); // Clear previous errors

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.name || 'Customer',
            email: user?.email || 'customer@example.com',
          },
        },
      });

      if (error) {
        console.error('❌ Stripe payment error:', error);
        onError(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ Stripe payment succeeded:', paymentIntent);
        onSuccess({
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: amount,
          currency: 'usd',
          payment_method: 'stripe',
        });
      }
    } catch (err: any) {
      console.error('❌ Payment processing error:', err);
      onError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <CardElement options={cardElementOptions} />
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || !clientSecret || isProcessing}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${amount.toFixed(2)} with Stripe`
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        Secure payment powered by Stripe
      </div>
    </form>
  );
}

// Main Stripe payment component
export default function StripePayment({ amount, onSuccess, onError }: StripePaymentProps) {
  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">💳</div>
        <div>
          <h4 className="font-semibold text-gray-800">Pay with Stripe</h4>
          <p className="text-sm text-gray-600">
            Pay securely with your credit or debit card
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-blue-800">Stripe Test Mode</span>
        </div>
        <p className="text-xs text-blue-700">
          Using Stripe test environment. No real money will be charged.
        </p>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-semibold">${amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span className="font-semibold">Stripe</span>
        </div>
      </div>

      <Elements stripe={stripePromise}>
        <PaymentForm
          amount={amount}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </div>
  );
}
