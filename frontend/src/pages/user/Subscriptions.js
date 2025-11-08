import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions/me');
      setSubscriptions(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType, amount) => {
    setPaymentLoading(true);
    try {
      const response = await api.post('/payment/initiate', {
        amount,
        subscriptionType: planType,
      });

      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const plans = [
    { type: 'basic', name: 'Basic', price: 99, duration: '7 days', features: ['Access to basic exams', 'View results'] },
    { type: 'premium', name: 'Premium', price: 299, duration: '30 days', features: ['Access to all exams', 'Detailed analytics', 'Priority support'] },
    { type: 'pro', name: 'Pro', price: 799, duration: '90 days', features: ['Everything in Premium', 'Unlimited attempts', 'Personalized coaching'] },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Subscriptions</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">My Active Subscriptions</h2>
          {subscriptions.filter(sub => sub.status === 'active').length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">No active subscriptions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions
                .filter(sub => sub.status === 'active')
                .map((sub) => (
                  <div key={sub._id} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold capitalize">{sub.planType} Plan</h3>
                        <p className="text-gray-600">
                          Valid until: {new Date(sub.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.type} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  ৳{plan.price}
                </p>
                <p className="text-gray-600 mb-4">{plan.duration}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.type, plan.price)}
                  disabled={paymentLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {paymentLoading ? 'Processing...' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
