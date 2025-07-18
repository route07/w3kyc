# Web3 KYC System - Route07 Blockchain

A decentralized KYC (Know Your Customer) system built on the Route07 blockchain with AI-powered risk assessment, IPFS document storage, and reusable credentials.

## 🚀 Demo System

This project includes a comprehensive mock demo system with three distinct sections:

### 1. User A - KYC Complete (`/userA`)
- **Status**: Fully verified user with blockchain credentials
- **Features**:
  - ✅ Blockchain credentials minted on Route07
  - ✅ AI risk assessment completed (12/100 risk score)
  - ✅ Documents verified and stored on IPFS
  - ✅ Web3 reputation built (850 score)
  - ✅ Access to DeFi protocols (Uniswap, Aave, Compound, Curve)
  - ✅ NFT holdings and governance participation
  - ✅ Complete activity history with blockchain transactions

### 2. User B - KYC Not Done (`/userB`)
- **Status**: New user who needs to complete verification
- **Features**:
  - ⏳ Wallet not connected
  - ⏳ No documents uploaded
  - ⏳ KYC process not started
  - ⏳ Web3 profile locked
  - 📋 Clear onboarding flow with required actions
  - 💡 Benefits explanation for completing KYC

### 3. Admin Dashboard (`/admin`)
- **Status**: Comprehensive administrative interface
- **Features**:
  - 📊 Overview with statistics and risk distribution
  - 👥 KYC submissions management
  - 🛡️ AI risk assessments and profiles
  - 📈 Analytics and reporting
  - 🔍 Search and filtering capabilities
  - ✅ Approval/rejection workflows

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Route07 (Custom EVM)
- **Storage**: IPFS (InterPlanetary File System)
- **AI/ML**: DeepSeek AI for risk assessment
- **Database**: MongoDB
- **Authentication**: JWT with Web3 wallet support

## 🏗️ Project Structure

```
src/
├── app/
│   ├── userA/           # KYC complete user demo
│   ├── userB/           # KYC not done user demo
│   ├── admin/           # Admin dashboard
│   ├── api/             # Backend API routes
│   └── page.tsx         # Landing page with demo navigation
├── components/
│   └── MockNavigation.tsx  # Navigation between demo sections
├── lib/
│   ├── mock-data/       # Comprehensive mock data
│   ├── blockchain/      # Route07 integration
│   ├── ai/             # AI/ML services
│   └── ipfs/           # IPFS client
└── styles/
    └── globals.css     # Tailwind CSS
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- MongoDB (for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kyc
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your configuration:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ROUTE07_RPC_URL=your_route07_rpc_url
   CONTRACT_ADDRESS=your_deployed_contract_address
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Demo Navigation

The system includes a sticky navigation bar that allows easy switching between demo sections:

- **User A - KYC Complete**: Green badge, shows verified status
- **User B - KYC Not Done**: Orange badge, shows not started status  
- **Admin Dashboard**: Blue badge, shows admin interface

## 📊 Mock Data Features

### User A (Verified)
- **Personal Info**: Alex Chen, alex.chen@web3mail.eth
- **Wallet**: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
- **Risk Score**: 12/100 (Low Risk)
- **Documents**: Passport, Address Proof, Selfie (all verified)
- **Blockchain Credential**: cred-kyc-001 (valid until 2025)
- **Web3 Profile**: 850 reputation, 1,247 transactions, 23 NFTs

### User B (Not Started)
- **Personal Info**: Sarah Johnson, sarah.johnson@web3mail.eth
- **Status**: No wallet connected, no documents uploaded
- **Features**: Onboarding flow with clear next steps

### Admin Dashboard
- **5 Mock Users**: Various statuses (verified, pending, rejected, not started)
- **Risk Profiles**: AI assessments with detailed risk factors
- **Analytics**: Statistics, risk distribution, recent activity

## 🔧 Key Features

### Blockchain Integration
- Smart contract for KYC verification
- Credential minting on Route07
- Transaction history tracking
- Wallet integration

### AI/ML Risk Assessment
- Document authenticity verification
- Identity consistency checking
- Web intelligence gathering
- Risk factor analysis
- Automated recommendations

### IPFS Document Storage
- Decentralized document storage
- Hash-based verification
- Immutable audit trail
- Privacy-preserving architecture

### Web3 Features
- Wallet-based authentication
- Reputation scoring
- DeFi protocol integration
- NFT holdings display
- Governance participation tracking

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/wallet-login` - Web3 wallet login

### KYC Management
- `POST /api/kyc/submit` - Submit KYC application
- `GET /api/kyc/status` - Get KYC status
- `GET /api/user/profile` - Get user profile

### Admin
- `GET /api/admin/kyc-submissions` - Get all KYC submissions
- `POST /api/admin/kyc-approve/[id]` - Approve KYC
- `POST /api/admin/kyc-reject/[id]` - Reject KYC
- `GET /api/admin/ai/risk-profiles` - Get AI risk assessments

### Documents
- `POST /api/documents/upload` - Upload documents with OCR
- `GET /api/documents/[id]` - Get document details

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Color-coded Status**: Green (verified), Orange (pending), Red (rejected)
- **Interactive Elements**: Hover effects, transitions, loading states
- **Accessibility**: Proper contrast, keyboard navigation, screen reader support

## 🔒 Security Features

- JWT-based authentication
- Web3 wallet signature verification
- IPFS content addressing
- Blockchain immutability
- AI-powered fraud detection
- Encrypted document storage

## 🚀 Deployment

### Vercel (Recommended)
```bash
pnpm build
vercel --prod
```

### Docker
```bash
docker build -t web3-kyc .
docker run -p 3000:3000 web3-kyc
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the technical paper: `docs/Web3_KYC_Technical_Paper.md`

---

**Note**: This is a demonstration system with mock data for educational purposes. For production use, ensure proper security measures and compliance with local regulations.
