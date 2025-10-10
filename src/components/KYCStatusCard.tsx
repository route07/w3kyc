'use client';

import React from 'react';
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

interface KYCStatusCardProps {
  status: string | null | undefined;
  kycStatus?: string | null | undefined;
  blockchainTxHash?: string | null;
  submittedAt?: Date | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
}

const statusConfig = {
  'not_started': {
    title: 'Not Started',
    description: 'KYC verification has not been initiated',
    icon: DocumentTextIcon,
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    iconColor: 'text-gray-500',
    dotColor: 'bg-gray-400'
  },
  'draft': {
    title: 'Draft',
    description: 'KYC form is being filled out',
    icon: DocumentTextIcon,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    dotColor: 'bg-blue-400'
  },
  'in_progress': {
    title: 'In Progress',
    description: 'KYC verification is currently being completed',
    icon: ClockIcon,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    dotColor: 'bg-blue-400'
  },
  'submitted': {
    title: 'Submitted',
    description: 'KYC application has been submitted for review',
    icon: ClockIcon,
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    dotColor: 'bg-yellow-400'
  },
  'under_review': {
    title: 'Under Review',
    description: 'KYC application is being reviewed by administrators',
    icon: ClockIcon,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-500',
    dotColor: 'bg-orange-400'
  },
  'pending_review': {
    title: 'Pending Review',
    description: 'KYC application is awaiting administrative review',
    icon: ClockIcon,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-500',
    dotColor: 'bg-orange-400'
  },
  'approved': {
    title: 'Approved',
    description: 'KYC verification has been approved',
    icon: CheckCircleIcon,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
    dotColor: 'bg-green-400'
  },
  'verified': {
    title: 'Verified',
    description: 'KYC verification is complete and verified',
    icon: ShieldCheckIcon,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    dotColor: 'bg-emerald-400'
  },
  'rejected': {
    title: 'Rejected',
    description: 'KYC verification has been rejected',
    icon: XCircleIcon,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    dotColor: 'bg-red-400'
  },
  'blockchain_submitted': {
    title: 'Blockchain Submitted',
    description: 'KYC verification has been submitted to the blockchain',
    icon: WalletIcon,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-500',
    dotColor: 'bg-purple-400'
  }
};

export default function KYCStatusCard({ 
  status, 
  kycStatus, 
  blockchainTxHash, 
  submittedAt, 
  reviewedAt, 
  rejectionReason 
}: KYCStatusCardProps) {
  // Determine the primary status to display
  const primaryStatus = status || kycStatus || 'not_started';
  const config = statusConfig[primaryStatus as keyof typeof statusConfig] || statusConfig['not_started'];
  const Icon = config.icon;

  // Format dates
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 ${config.bgColor} rounded-xl shadow-md`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${config.textColor}`}>
              {config.title}
            </h3>
            <p className={`text-sm ${config.textColor} opacity-80`}>
              {config.description}
            </p>
          </div>
        </div>
        <div className={`w-3 h-3 ${config.dotColor} rounded-full animate-pulse`}></div>
      </div>

      {/* Status Details */}
      <div className="space-y-3">
        {/* Primary Status */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${config.textColor}`}>
            Status:
          </span>
          <span className={`text-sm font-semibold ${config.textColor}`}>
            {config.title}
          </span>
        </div>

        {/* Submission Date */}
        {submittedAt && (
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${config.textColor}`}>
              Submitted:
            </span>
            <span className={`text-sm ${config.textColor} opacity-80`}>
              {formatDate(submittedAt)}
            </span>
          </div>
        )}

        {/* Review Date */}
        {reviewedAt && (
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${config.textColor}`}>
              Reviewed:
            </span>
            <span className={`text-sm ${config.textColor} opacity-80`}>
              {formatDate(reviewedAt)}
            </span>
          </div>
        )}

        {/* Blockchain Transaction */}
        {blockchainTxHash && (
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${config.textColor}`}>
              Blockchain:
            </span>
            <span className={`text-xs ${config.textColor} opacity-80 font-mono`}>
              {blockchainTxHash.substring(0, 8)}...{blockchainTxHash.substring(blockchainTxHash.length - 8)}
            </span>
          </div>
        )}

        {/* Rejection Reason */}
        {rejectionReason && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                <p className="text-sm text-red-700 mt-1">{rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Required Indicator */}
      {primaryStatus === 'rejected' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Action Required:</strong> Please review the rejection reason and resubmit your KYC application.
          </p>
        </div>
      )}

      {primaryStatus === 'approved' && !blockchainTxHash && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Next Step:</strong> Submit your approved KYC to the blockchain for permanent verification.
          </p>
        </div>
      )}

      {primaryStatus === 'blockchain_submitted' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>Complete:</strong> Your KYC is now permanently recorded on the blockchain.
          </p>
        </div>
      )}
    </div>
  );
}