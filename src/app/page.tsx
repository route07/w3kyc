import Link from 'next/link'
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CubeIcon,
  ArrowRightIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <CubeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Web3 KYC System</h1>
                <p className="text-sm text-gray-600">Route07 Blockchain</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Demo Mode
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Web3 KYC
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Demo
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the future of decentralized identity verification with blockchain-powered KYC, 
            AI risk assessment, and reusable credentials on the Route07 blockchain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/userA"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              View Verified User
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              href="/admin"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-all duration-200"
            >
              <CogIcon className="w-5 h-5 mr-2" />
              Admin Dashboard
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Sections */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Demo Sections
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User A - KYC Complete */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">User A - KYC Complete</h4>
                  <p className="text-sm text-green-600">Fully verified user</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Experience a fully KYC&apos;d user with blockchain credentials, risk assessment, 
                and complete Web3 profile.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Blockchain credentials minted
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  AI risk assessment completed
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Documents verified on IPFS
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Web3 reputation built
                </li>
              </ul>
              <Link 
                href="/userA"
                className="inline-flex items-center w-full justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                View User A
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* User B - KYC Not Done */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">User B - KYC Not Done</h4>
                  <p className="text-sm text-orange-600">New user</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                See the onboarding experience for a new user who needs to complete 
                the KYC verification process.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 text-orange-500 mr-2" />
                  Wallet not connected
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 text-orange-500 mr-2" />
                  No documents uploaded
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 text-orange-500 mr-2" />
                  KYC process not started
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 text-orange-500 mr-2" />
                  Web3 profile locked
                </li>
              </ul>
              <Link 
                href="/userB"
                className="inline-flex items-center w-full justify-center px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                View User B
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* Admin Dashboard */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CogIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">Admin Dashboard</h4>
                  <p className="text-sm text-blue-600">Administrative interface</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Comprehensive admin interface for managing KYC submissions, 
                risk assessments, and user verification.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-4 h-4 text-blue-500 mr-2" />
                  KYC submissions management
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <ShieldCheckIcon className="w-4 h-4 text-blue-500 mr-2" />
                  AI risk assessments
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <ChartBarIcon className="w-4 h-4 text-blue-500 mr-2" />
                  Analytics and reporting
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <DocumentTextIcon className="w-4 h-4 text-blue-500 mr-2" />
                  Document verification
                </li>
              </ul>
              <Link 
                href="/admin"
                className="inline-flex items-center w-full justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Admin Dashboard
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Web3 KYC Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CubeIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Blockchain Credentials</h4>
              <p className="text-sm text-gray-600">Verifiable credentials stored on-chain</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShieldCheckIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Risk Assessment</h4>
              <p className="text-sm text-gray-600">Advanced AI-powered risk profiling</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DocumentTextIcon className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">IPFS Storage</h4>
              <p className="text-sm text-gray-600">Decentralized document storage</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChartBarIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Web3 Reputation</h4>
              <p className="text-sm text-gray-600">Build trust in the ecosystem</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <CubeIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Web3 KYC System</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Decentralized identity verification on Route07 blockchain
            </p>
            <p className="text-sm text-gray-500">
              This is a demonstration system with mock data for educational purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
