'use client';

import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

// Status Table Component
export function StatusTable() {
  const statuses = [
    { status: 'Not Started', description: 'Haven\'t begun KYC process', action: 'Start KYC verification', color: 'text-gray-600' },
    { status: 'Draft', description: 'Partially completed', action: 'Resume KYC process', color: 'text-yellow-600' },
    { status: 'In Progress', description: 'Currently being processed', action: 'Wait for completion', color: 'text-blue-600' },
    { status: 'Submitted', description: 'Application submitted', action: 'Wait for review', color: 'text-purple-600' },
    { status: 'Under Review', description: 'Admin review', action: 'Wait for decision', color: 'text-orange-600' },
    { status: 'Approved', description: 'KYC approved', action: 'Access Web3 services', color: 'text-green-600' },
    { status: 'Verified', description: 'Verification complete', action: 'Use verified identity', color: 'text-emerald-600' },
    { status: 'Blockchain Submitted', description: 'On-chain verification', action: 'Verification complete', color: 'text-indigo-600' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Required</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {statuses.map((item, index) => (
            <tr key={index}>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.status}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Quick Start Steps Component
export function QuickStartSteps() {
  const steps = [
    { number: 1, title: 'Create Account', description: 'Sign up with your email and password', icon: UserIcon },
    { number: 2, title: 'Connect Wallet', description: 'Link your Web3 wallet to the platform', icon: WalletIcon },
    { number: 3, title: 'Start KYC', description: 'Begin the verification process', icon: ShieldCheckIcon },
    { number: 4, title: 'Upload Documents', description: 'Submit required identification documents', icon: DocumentTextIcon },
    { number: 5, title: 'Submit for Review', description: 'Submit your application for verification', icon: CheckCircleIcon },
    { number: 6, title: 'Track Progress', description: 'Monitor your verification status', icon: ClockIcon }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {steps.map((step) => (
        <div key={step.number} className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 font-bold text-lg">{step.number}</span>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <step.icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
          <p className="text-gray-600 text-sm">{step.description}</p>
        </div>
      ))}
    </div>
  );
}

// Prerequisites Component
export function Prerequisites() {
  const prerequisites = [
    'A compatible Web3 wallet (MetaMask, WalletConnect, etc.)',
    'Valid government-issued identification documents',
    'A stable internet connection',
    'Basic understanding of cryptocurrency wallets'
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
        <InformationCircleIcon className="h-5 w-5 mr-2" />
        Prerequisites
      </h3>
      <ul className="space-y-2">
        {prerequisites.map((item, index) => (
          <li key={index} className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-blue-800">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Document Requirements Component
export function DocumentRequirements() {
  const requirements = [
    { category: 'Identity Documents', items: ['Passport', 'Driver\'s License', 'National ID', 'Military ID'] },
    { category: 'Proof of Address', items: ['Utility Bills', 'Bank Statements', 'Government Letters', 'Insurance Documents'] }
  ];

  const fileRequirements = [
    { requirement: 'Format', value: 'PDF, JPG, or PNG' },
    { requirement: 'Size', value: 'Maximum 10MB per file' },
    { requirement: 'Quality', value: 'Clear, readable, and well-lit' },
    { requirement: 'Validity', value: 'Current and not expired' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Document Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirements.map((category, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{category.category}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Requirements</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <ul className="space-y-2">
            {fileRequirements.map((req, index) => (
              <li key={index} className="flex justify-between">
                <span className="font-medium text-gray-900">{req.requirement}:</span>
                <span className="text-gray-600">{req.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Processing Times Component
export function ProcessingTimes() {
  const times = [
    { process: 'Document Upload', time: 'Immediate' },
    { process: 'AI Verification', time: '2-5 minutes' },
    { process: 'Admin Review', time: '1-3 business days' },
    { process: 'Blockchain Storage', time: '5-10 minutes' },
    { process: 'Total Process', time: '1-5 business days' }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Processing Times</h3>
      <div className="space-y-3">
        {times.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
            <span className="text-gray-700">{item.process}</span>
            <span className="font-medium text-gray-900">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// FAQ Component
export function FAQ() {
  const faqs = [
    {
      category: 'General Questions',
      questions: [
        {
          question: 'Is my personal data safe?',
          answer: 'Yes, your data is encrypted and stored securely on the blockchain. Only you can access it with your wallet.'
        },
        {
          question: 'How long does verification take?',
          answer: 'The entire process typically takes 1-5 business days, depending on document quality and admin review time.'
        },
        {
          question: 'Can I use my verified identity on other platforms?',
          answer: 'Yes, your blockchain-stored identity is portable and can be used across compatible Web3 applications.'
        }
      ]
    },
    {
      category: 'Technical Questions',
      questions: [
        {
          question: 'Which wallets are supported?',
          answer: 'We support MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, and other standard Web3 wallets.'
        },
        {
          question: 'Are there any fees?',
          answer: 'There are minimal gas fees for blockchain transactions, but no platform fees for KYC verification.'
        }
      ]
    },
    {
      category: 'Document Questions',
      questions: [
        {
          question: 'What documents do I need?',
          answer: 'You need a government-issued ID and proof of address. Additional documents may be required based on your investor classification.'
        },
        {
          question: 'Can I use expired documents?',
          answer: 'No, all documents must be current and not expired.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {faqs.map((category, categoryIndex) => (
        <div key={categoryIndex}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{category.category}</h3>
          <div className="space-y-4">
            {category.questions.map((faq, faqIndex) => (
              <div key={faqIndex} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Troubleshooting Issues Component
export function TroubleshootingIssues() {
  const issues = [
    {
      title: 'Wallet Won\'t Connect',
      color: 'red',
      solutions: [
        'Ensure wallet is unlocked',
        'Check network connection',
        'Try refreshing the page',
        'Clear browser cache',
        'Try different wallet'
      ]
    },
    {
      title: 'Documents Won\'t Upload',
      color: 'orange',
      solutions: [
        'Check file size (max 10MB)',
        'Use PDF, JPG, or PNG format',
        'Ensure stable internet',
        'Try different browser'
      ]
    },
    {
      title: 'Status Not Updating',
      color: 'yellow',
      solutions: [
        'Refresh the page',
        'Clear browser cache',
        'Check internet connection',
        'Log out and log back in'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-50 border-red-200 text-red-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900'
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  return (
    <div className="space-y-4">
      {issues.map((issue, index) => (
        <div key={index} className={`border rounded-lg p-4 ${getColorClasses(issue.color)}`}>
          <h4 className="font-semibold mb-2">{issue.title}</h4>
          <ul className="text-sm space-y-1">
            {issue.solutions.map((solution, solutionIndex) => (
              <li key={solutionIndex}>• {solution}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Security Features Component
export function SecurityFeatures() {
  const features = [
    {
      category: 'Data Protection',
      items: [
        'AES-256 Encryption for all stored data',
        'TLS 1.3 for secure data transmission',
        'End-to-End Encryption before leaving your device',
        'Secure key storage and rotation'
      ]
    },
    {
      category: 'Blockchain Security',
      items: [
        'Immutable data storage on blockchain',
        'Cryptographic security for data authenticity',
        'User-controlled private keys',
        'Smart contract security audits'
      ]
    },
    {
      category: 'Access Controls',
      items: [
        'Role-based access for administrators',
        'Multi-factor authentication required',
        'Complete audit trail of all access',
        'Regular access permission reviews'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {features.map((feature, index) => (
        <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{feature.category}</h3>
          <ul className="space-y-2">
            {feature.items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Contact Information Component
export function ContactInfo() {
  const contactMethods = [
    {
      method: 'Email Support',
      contact: 'support@web3kyc.com',
      description: 'General questions and technical issues',
      responseTime: '2-4 hours'
    },
    {
      method: 'Live Chat',
      contact: 'Available on platform',
      description: 'Real-time assistance during business hours',
      responseTime: 'Immediate'
    },
    {
      method: 'Emergency Support',
      contact: '+1-800-SECURITY',
      description: '24/7 emergency line for critical issues',
      responseTime: 'Within 1 hour'
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactMethods.map((method, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">{method.method}</h4>
            <p className="text-blue-600 font-medium mb-2">{method.contact}</p>
            <p className="text-gray-600 text-sm mb-2">{method.description}</p>
            <p className="text-xs text-gray-500">Response time: {method.responseTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
}