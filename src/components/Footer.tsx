'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Web3 KYC System</h3>
                <p className="text-sm text-gray-400">Tractsafe Blockchain</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Decentralized identity verification system with AI-powered risk assessment 
              and reusable credentials on the Tractsafe blockchain.
            </p>
            <div className="flex space-x-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                ✅ Live on Tractsafe
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                5 Contracts Deployed
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors">
                  KYC Process
                </Link>
              </li>
              <li>
                <Link href="/blockchain-status" className="text-gray-400 hover:text-white transition-colors">
                  Blockchain Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Authentication</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/make-admin" className="text-gray-400 hover:text-white transition-colors">
                  Make Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Web3 KYC System. Built on Tractsafe blockchain.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">London EVM</span>
              <span className="text-gray-400 text-sm">100% Success Rate</span>
              <span className="text-gray-400 text-sm">Production Ready</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}