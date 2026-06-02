'use client';
import { useState } from 'react';

export default function PlanStatusBadge({ user }) {
  const [showDetails, setShowDetails] = useState(false);

  const planName =
    user?.planName ||
    user?.plan?.name ||
    user?.subscription?.plan ||
    'Free';

  const planStatus =
    user?.planStatus ||
    user?.plan?.status ||
    user?.subscription?.status ||
    'active';

  const usesLeft = 
    user?.usesLeft ||
    user?.plan?.usesLeft ||
    user?.subscription?.usesLeft ||
    null;

  const resetFrequency =
    user?.resetFrequency ||
    user?.plan?.resetFrequency ||
    user?.subscription?.resetFrequency ||
    null;

  const label = planName.toLowerCase() === 'free' ? 'Free plan' : planName;
  
  // Softer, more elegant color coding
  let bgColor = 'bg-gradient-to-br from-sky-50 to-cyan-50';
  let textColor = 'text-sky-700';
  let badgeBg = 'bg-gradient-to-r from-sky-100 to-cyan-100';
  let borderColor = 'border-sky-200';
  
  if (planName.toLowerCase().includes('premium')) {
    bgColor = 'bg-gradient-to-br from-amber-50 to-orange-50';
    textColor = 'text-amber-700';
    badgeBg = 'bg-gradient-to-r from-amber-100 to-orange-100';
    borderColor = 'border-amber-200';
  } else if (planName.toLowerCase().includes('expert') || planName.toLowerCase().includes('pro')) {
    bgColor = 'bg-gradient-to-br from-purple-50 to-pink-50';
    textColor = 'text-purple-700';
    badgeBg = 'bg-gradient-to-r from-purple-100 to-pink-100';
    borderColor = 'border-purple-200';
  }

  const statusColor = 
    planStatus === 'active' ? 'text-emerald-600' :
    planStatus === 'trial' ? 'text-blue-600' :
    planStatus === 'expired' ? 'text-red-600' :
    'text-gray-600';

  const statusBgColor = 
    planStatus === 'active' ? 'bg-emerald-100' :
    planStatus === 'trial' ? 'bg-blue-100' :
    planStatus === 'expired' ? 'bg-red-100' :
    'bg-gray-100';

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`px-4 py-2 ${badgeBg} ${textColor} rounded-full text-sm font-light hover:shadow-md transition-all duration-200 cursor-pointer border ${borderColor} flex items-center gap-2`}
      >
        <span>{label}</span>
        <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${
          planStatus === 'active' ? 'bg-emerald-500' : 
          planStatus === 'trial' ? 'bg-blue-500' : 
          'bg-red-500'
        }`}></span>
      </button>

      {showDetails && (
        <div className={`absolute right-0 mt-2 w-80 ${bgColor} border ${borderColor} rounded-2xl shadow-xl p-6 z-50 backdrop-blur-sm`}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-light mb-1">Current Plan</p>
              <p className={`text-2xl font-light ${textColor}`}>{label}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-light">Status</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 ${statusBgColor} rounded-full`}>
                <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                <p className={`text-sm font-light ${statusColor} capitalize`}>{planStatus}</p>
              </span>
            </div>

            {usesLeft !== null && (
              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-light mb-1">Uses Remaining</p>
                <p className="text-2xl font-light text-gray-800">{usesLeft}</p>
              </div>
            )}

            {resetFrequency && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-light mb-1">Resets</p>
                <p className="font-light text-gray-700 capitalize">{resetFrequency}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 border-opacity-50">
              <a 
                href="/pricing" 
                className={`block w-full text-center px-4 py-2.5 ${badgeBg} ${textColor} rounded-lg font-light text-sm hover:opacity-80 transition-opacity border ${borderColor}`}
              >
                View All Plans
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
