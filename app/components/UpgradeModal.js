'use client';
import { useState } from 'react';

export default function UpgradeModal({ isOpen, onClose, plan, user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleConfirmUpgrade = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/upgrade-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: plan.name }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✓ Successfully upgraded to ${plan.name}!`);
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        setMessage(data.message || 'Upgrade failed. Please try again.');
      }
    } catch (error) {
      setMessage('Error upgrading plan. Please try again.');
      console.error('Upgrade error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const colorMap = {
    Free: 'sky',
    Premium: 'amber',
    Pro: 'purple',
  };

  const color = colorMap[plan.name] || 'sky';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-gray-900">Upgrade Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Upgrading to</p>
          <p className={`text-3xl font-light ${
            color === 'amber' ? 'text-amber-600' :
            color === 'purple' ? 'text-purple-600' :
            'text-sky-600'
          }`}>
            {plan.name}
          </p>
          <p className="text-lg font-light text-gray-700 mt-2">
            {plan.price}<span className="text-sm text-gray-600">{plan.period}</span>
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            What You'll Get
          </h3>
          <ul className="space-y-2">
            {plan.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                <svg className={`w-4 h-4 ${
                  color === 'amber' ? 'text-amber-500' :
                  color === 'purple' ? 'text-purple-500' :
                  'text-sky-500'
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${
            message.includes('✓') 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 font-light transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmUpgrade}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-full text-white font-light transition-all disabled:opacity-50 ${
              color === 'amber' ? 'bg-amber-500 hover:bg-amber-600' :
              color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' :
              'bg-sky-500 hover:bg-sky-600'
            }`}
          >
            {isLoading ? 'Processing...' : 'Confirm Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
}
