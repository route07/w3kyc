'use client'

import { useState } from 'react'
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  WalletIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function TestKYCPage() {
  const [currentStep, setCurrentStep] = useState(2) // Show step 3 as current

  const steps = [
    {
      id: 'personal',
      title: 'Personal Info',
      description: 'Basic details',
      icon: UserIcon,
      status: 'completed' as const
    },
    {
      id: 'wallet',
      title: 'Wallet Connect',
      description: 'Link wallet',
      icon: WalletIcon,
      status: 'completed' as const
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Upload files',
      icon: DocumentTextIcon,
      status: 'current' as const
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'AI processing',
      icon: ShieldCheckIcon,
      status: 'pending' as const
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Final review',
      icon: CheckCircleIcon,
      status: 'pending' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-blue-50 shadow-lg border-b border-blue-100">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Web3 KYC
                </h1>
                <p className="text-sm text-gray-600 font-medium">Identity Verification Process</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-16">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 rounded-full"
                style={{ 
                  width: `${((currentStep) / (steps.length - 1)) * 100}%` 
                }}
              />
            </div>
            
            {/* Steps */}
            <div className="relative flex justify-between px-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center group flex-1">
                  {/* Step Circle */}
                  <div className={`relative flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300 ${
                    step.status === 'completed' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white shadow-xl shadow-green-200' 
                    : step.status === 'current' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white shadow-xl shadow-blue-200 animate-pulse' 
                    : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400 hover:shadow-lg'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircleIcon className="w-8 h-8" />
                    ) : (
                      <step.icon className={`w-8 h-8 ${
                        step.status === 'current' ? 'text-white' : 'text-gray-400'
                      }`} />
                    )}
                    
                    {/* Step Number */}
                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'bg-green-600 text-white' 
                        : step.status === 'current' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Step Content */}
                  <div className="mt-6 text-center max-w-40">
                    <p className={`text-base font-bold transition-colors duration-300 ${
                      step.status === 'current' 
                        ? 'text-blue-600' 
                        : step.status === 'completed' 
                        ? 'text-green-600' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-sm mt-2 transition-colors duration-300 ${
                      step.status === 'current' 
                        ? 'text-blue-500' 
                        : step.status === 'completed' 
                        ? 'text-green-500' 
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -translate-y-20 translate-x-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-50 to-blue-50 rounded-full translate-y-16 -translate-x-16 opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Document Upload</h2>
              <p className="text-lg text-gray-600 mb-12">Please upload your identity documents for verification</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-16 hover:border-blue-400 transition-colors">
                <DocumentTextIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <p className="text-lg text-gray-500 mb-6">Drag and drop your documents here</p>
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                  Choose Files
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-16 px-4">
          <button
            className="flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <ArrowLeftIcon className="w-6 h-6 mr-3" />
            Previous Step
          </button>
          
          <button className="flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
            Next Step
            <ArrowRightIcon className="w-6 h-6 ml-3" />
          </button>
        </div>
      </div>
    </div>
  )
}