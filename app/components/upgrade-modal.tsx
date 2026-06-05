'use client';
import { useState } from 'react';
import { ApiRoutes } from '@/lib/urls';
import { Modal, Button, Alert } from '@/components/ui';
import { getPlanColorClasses, CONTAINERS } from '@/styles';

export default function UpgradeModal({ isOpen, onClose, plan, user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleConfirmUpgrade = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(ApiRoutes.user.upgradePlan, {
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

  if (!isOpen) return null;

  const colors = getPlanColorClasses(plan.name);
  const colorValue = plan.name === 'Premium' ? 'amber' : plan.name === 'Pro' ? 'purple' : 'sky';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Upgrade Plan</h2>

          <div className={CONTAINERS.card}>
            <p className="text-sm text-gray-600 mb-2">Upgrading to</p>
            <p className={`text-3xl font-light ${colors.text}`}>
              {plan.name}
            </p>
            <p className="text-lg font-light text-gray-700 mt-2">
              {plan.price}<span className="text-sm text-gray-600">{plan.period}</span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            What You'll Get
          </h3>
          <ul className="space-y-2">
            {plan.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                <svg className={`w-4 h-4 ${colors.icon}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {message && (
          <Alert
            message={message}
            type={message.includes('✓') ? 'success' : 'error'}
          />
        )}

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="secondary"
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmUpgrade}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? 'Processing...' : 'Confirm Upgrade'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
