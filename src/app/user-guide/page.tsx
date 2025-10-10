'use client';

import { useState } from 'react';
import { 
  BookOpenIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  HomeIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  StatusTable, 
  QuickStartSteps, 
  Prerequisites, 
  DocumentRequirements, 
  ProcessingTimes, 
  FAQ, 
  TroubleshootingIssues, 
  SecurityFeatures, 
  ContactInfo 
} from '@/components/UserGuideContent';

const guideSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: HomeIcon,
    description: 'Learn the basics and get up and running quickly',
    content: 'getting-started'
  },
  {
    id: 'account-registration',
    title: 'Account Registration',
    icon: DocumentTextIcon,
    description: 'Create your account and verify your email',
    content: 'account-registration'
  },
  {
    id: 'wallet-connection',
    title: 'Wallet Connection',
    icon: ShieldCheckIcon,
    description: 'Connect your Web3 wallet to the platform',
    content: 'wallet-connection'
  },
  {
    id: 'kyc-process',
    title: 'KYC Verification Process',
    icon: CheckCircleIcon,
    description: 'Complete your identity verification step by step',
    content: 'kyc-process'
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    icon: BookOpenIcon,
    description: 'Navigate and understand your dashboard',
    content: 'dashboard'
  },
  {
    id: 'document-upload',
    title: 'Document Upload',
    icon: DocumentTextIcon,
    description: 'Upload and manage your verification documents',
    content: 'document-upload'
  },
  {
    id: 'status-tracking',
    title: 'Status Tracking',
    icon: ClockIcon,
    description: 'Track your verification progress and status',
    content: 'status-tracking'
  },
  {
    id: 'blockchain',
    title: 'Blockchain Integration',
    icon: ShieldCheckIcon,
    description: 'Understand Web3 and blockchain features',
    content: 'blockchain'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: WrenchScrewdriverIcon,
    description: 'Solve common issues and problems',
    content: 'troubleshooting'
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: QuestionMarkCircleIcon,
    description: 'Frequently asked questions and answers',
    content: 'faq'
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: ShieldCheckIcon,
    description: 'Security features and privacy controls',
    content: 'security'
  }
];

const quickLinks = [
  {
    title: 'Quick Start Guide',
    description: 'Get started in 5 minutes',
    href: '#quick-start',
    icon: ClockIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Common Issues',
    description: 'Solve problems quickly',
    href: '#troubleshooting',
    icon: WrenchScrewdriverIcon,
    color: 'bg-orange-500'
  },
  {
    title: 'Security Guide',
    description: 'Keep your data safe',
    href: '#security',
    icon: ShieldCheckIcon,
    color: 'bg-green-500'
  },
  {
    title: 'Contact Support',
    description: 'Get help when you need it',
    href: '#support',
    icon: QuestionMarkCircleIcon,
    color: 'bg-purple-500'
  }
];

export default function UserGuidePortal() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = guideSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              User Guide Portal
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to know about using the Web3 KYC Platform
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search guides, topics, or issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Links */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link) => (
                  <a
                    key={link.title}
                    href={link.href}
                    className="group bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${link.color} text-white mr-4`}>
                        <link.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                          {link.title}
                        </h3>
                        <p className="text-gray-600">{link.description}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Guide Sections */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Guide</h2>
              <div className="space-y-4">
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-lg shadow-md border border-gray-200"
                  >
                    <button
                      onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-4">
                          <section.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {section.title}
                          </h3>
                          <p className="text-gray-600">{section.description}</p>
                        </div>
                      </div>
                      {expandedSection === section.id ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedSection === section.id && (
                      <div className="px-6 pb-4 border-t border-gray-200">
                        <div className="pt-4">
                          {/* Content will be dynamically loaded based on section.id */}
                          <div className="prose max-w-none">
                            {section.content === 'getting-started' && <GettingStartedContent />}
                            {section.content === 'account-registration' && <AccountRegistrationContent />}
                            {section.content === 'wallet-connection' && <WalletConnectionContent />}
                            {section.content === 'kyc-process' && <KYCProcessContent />}
                            {section.content === 'dashboard' && <DashboardContent />}
                            {section.content === 'document-upload' && <DocumentUploadContent />}
                            {section.content === 'status-tracking' && <StatusTrackingContent />}
                            {section.content === 'blockchain' && <BlockchainContent />}
                            {section.content === 'troubleshooting' && <TroubleshootingContent />}
                            {section.content === 'faq' && <FAQContent />}
                            {section.content === 'security' && <SecurityContent />}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
              <nav className="space-y-2">
                {guideSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Need Help?</h4>
                <div className="space-y-2">
                  <a
                    href="#support"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Contact Support
                  </a>
                  <a
                    href="#troubleshooting"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Troubleshooting
                  </a>
                  <a
                    href="#security"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Security Guide
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Content Components
function GettingStartedContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
      <p className="text-gray-600 mb-6">
        Welcome to the Web3 KYC Platform! This guide will help you get started with identity verification on the blockchain.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">What is Web3 KYC?</h4>
        <p className="text-blue-800">
          Web3 KYC combines traditional identity verification with blockchain technology to provide decentralized, secure, and portable identity verification.
        </p>
      </div>

      <Prerequisites />

      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Quick Start Steps</h4>
        <QuickStartSteps />
      </div>
    </div>
  );
}

function AccountRegistrationContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Registration</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Step 1: Create Your Account</h4>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>Visit the platform homepage</li>
            <li>Click "Sign Up" in the top navigation</li>
            <li>Fill in your basic information:
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>First Name</li>
                <li>Last Name</li>
                <li>Email Address</li>
                <li>Password (minimum 8 characters)</li>
              </ul>
            </li>
            <li>Click "Create Account"</li>
          </ol>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Step 2: Email Verification</h4>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>Check your email for a verification link</li>
            <li>Click the verification link to activate your account</li>
            <li>You'll be redirected to the login page</li>
          </ol>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Step 3: Initial Login</h4>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>Enter your email and password</li>
            <li>Click "Login"</li>
            <li>You'll be redirected to the dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function WalletConnectionContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Wallet Connection</h3>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-yellow-900 mb-2">Why Connect a Wallet?</h4>
        <p className="text-yellow-800 text-sm">
          Connecting your Web3 wallet is essential for storing your KYC data on the blockchain, enabling decentralized identity verification, and ensuring data ownership.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">How to Connect Your Wallet</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">Option 1: From Dashboard</h5>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Log into your account</li>
                <li>Locate "Wallet Address" section</li>
                <li>Click "Connect Wallet"</li>
                <li>Select your wallet provider</li>
                <li>Approve the connection</li>
              </ol>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">Option 2: During KYC</h5>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Navigate to "KYC" in top navigation</li>
                <li>System will prompt for wallet connection</li>
                <li>Follow wallet connection prompts</li>
              </ol>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Supported Wallets</h4>
          <ul className="grid grid-cols-2 gap-2 text-gray-600">
            <li>• MetaMask</li>
            <li>• WalletConnect</li>
            <li>• Coinbase Wallet</li>
            <li>• Trust Wallet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function KYCProcessContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">KYC Verification Process</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Step 1: Personal Information</h4>
          <p className="text-gray-600 mb-3">Fill in your personal details:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Full Name (as it appears on your ID)</li>
            <li>Email Address</li>
            <li>Phone Number</li>
            <li>Date of Birth</li>
            <li>Nationality</li>
            <li>Residential Address</li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Step 2: Investor Classification</h4>
          <p className="text-gray-600 mb-3">Select your investor type:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Individual - Personal investor</li>
            <li>Institutional - Company or organization</li>
            <li>Retail - Small-scale investor</li>
            <li>Accredited - High-net-worth individual</li>
            <li>Qualified - Professional investor</li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Step 3: Document Upload</h4>
          <p className="text-gray-600 mb-3">Upload required documents:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Government ID (Passport, Driver's License, National ID)</li>
            <li>Proof of Address (Utility bill, bank statement)</li>
            <li>Additional documents (if required)</li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Step 4: Review and Submit</h4>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>Review all your information for accuracy</li>
            <li>Confirm that all documents are uploaded correctly</li>
            <li>Read and accept the terms and conditions</li>
            <li>Click "Submit for Verification"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Overview</h3>
      
      <p className="text-gray-600 mb-6">
        The dashboard is your central hub for managing your KYC verification process.
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Sections</h4>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Application Status Card</h5>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Current Status - Shows your verification progress</li>
                <li>• Progress Bar - Visual indicator of completion percentage</li>
                <li>• Next Steps - Guidance on what to do next</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">Account Information</h5>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Personal Details - Your registered information</li>
                <li>• Wallet Address - Connected Web3 wallet</li>
                <li>• Account Creation Date - When you joined</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 mb-2">Application Progress Timeline</h5>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Step-by-Step Progress - Visual timeline</li>
                <li>• Status Updates - Real-time updates</li>
                <li>• Completion Dates - When each step was completed</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Status Indicators</h4>
          <StatusTable />
        </div>
      </div>
    </div>
  );
}

function DocumentUploadContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Document Upload</h3>
      
      <div className="space-y-6">
        <DocumentRequirements />

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Upload Process</h4>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>Select Document Type - Choose from the dropdown menu</li>
            <li>Choose File - Click "Choose File" and select your document</li>
            <li>Preview - Review the document before uploading</li>
            <li>Upload - Click "Upload Document"</li>
            <li>Confirmation - Wait for upload confirmation</li>
          </ol>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Document Quality Tips</h4>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Lighting:</strong> Ensure good lighting when photographing documents</li>
            <li><strong>Focus:</strong> Keep the document in focus and flat</li>
            <li><strong>Completeness:</strong> Include all corners and edges of the document</li>
            <li><strong>Legibility:</strong> Ensure all text is clearly readable</li>
            <li><strong>Orientation:</strong> Keep documents right-side up</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusTrackingContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Status Tracking</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Real-Time Updates</h4>
          <p className="text-gray-600 mb-4">
            Your application status is updated in real-time as it progresses through the verification process.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Status Notifications</h4>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Email Notifications:</strong> Receive updates via email</li>
            <li><strong>Dashboard Updates:</strong> Check your dashboard for status changes</li>
            <li><strong>Push Notifications:</strong> Browser notifications for important updates</li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Timeline Tracking</h4>
          <p className="text-gray-600 mb-3">The application timeline shows:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Start Date - When you began the process</li>
            <li>Submission Date - When you submitted your application</li>
            <li>Review Start - When admin review began</li>
            <li>Completion Date - When verification was completed</li>
          </ul>
        </div>

        <ProcessingTimes />
      </div>
    </div>
  );
}

function BlockchainContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Integration</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">What Happens on the Blockchain?</h4>
          <p className="text-gray-600 mb-4">
            Once your KYC verification is complete, your data is stored on the blockchain:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li><strong>Data Encryption:</strong> Your personal information is encrypted</li>
            <li><strong>Smart Contract Storage:</strong> Data is stored in a smart contract</li>
            <li><strong>Immutable Record:</strong> Once stored, data cannot be modified</li>
            <li><strong>Access Control:</strong> Only you can access your data with your wallet</li>
          </ol>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Benefits of Blockchain Storage</h4>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Data Ownership:</strong> You own your identity data</li>
            <li><strong>Portability:</strong> Use your verified identity across platforms</li>
            <li><strong>Security:</strong> Cryptographic security protects your data</li>
            <li><strong>Transparency:</strong> Public verification of your KYC status</li>
            <li><strong>Interoperability:</strong> Compatible with other Web3 applications</li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Transaction Details</h4>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Gas Fees:</strong> Minimal fees for blockchain transactions</li>
            <li><strong>Network:</strong> Ethereum-compatible networks</li>
            <li><strong>Transaction Hash:</strong> Unique identifier for your verification</li>
            <li><strong>Block Confirmation:</strong> Your data is confirmed on the blockchain</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TroubleshootingContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Troubleshooting</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Common Issues and Solutions</h4>
          <TroubleshootingIssues />
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Getting Help</h4>
          <p className="text-gray-600 mb-4">If you need additional assistance:</p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li><strong>Check FAQ:</strong> Review frequently asked questions</li>
            <li><strong>Contact Support:</strong> Use the support form</li>
            <li><strong>Email Support:</strong> Send detailed description of your issue</li>
            <li><strong>Live Chat:</strong> Available during business hours</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function FAQContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
      <FAQ />
    </div>
  );
}

function SecurityContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Privacy</h3>
      
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-900 mb-2">Our Security Commitment</h4>
          <p className="text-green-800">
            The Web3 KYC Platform is built with security and privacy as core principles. We employ multiple layers of protection to safeguard your personal information and ensure the integrity of the verification process.
          </p>
        </div>

        <SecurityFeatures />
        <ContactInfo />
      </div>
    </div>
  );
}