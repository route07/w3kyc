# PoC Demo Guide - AI/ML Integration

## Overview

This guide explains how to demonstrate the Web3 KYC platform's AI/ML capabilities using comprehensive mock data. The system automatically falls back to mock data when no DeepSeek API key is provided or when running in development mode.

## Demo Setup

### 1. Environment Configuration

The system automatically detects when to use mock data:

```env
# No DeepSeek API key needed for PoC
# DEEPSEEK_API_KEY=your_api_key_here  # Comment out for PoC

# Development mode also uses mock data
NODE_ENV=development
```

### 2. Mock Data Profiles

The system includes 4 different risk profiles for demonstration:

#### Low Risk Profile
- **User**: John Smith (john.smith@email.com)
- **Company**: TechCorp Ltd
- **Risk Score**: 10 (Low)
- **Features**: Clean background, legitimate business, no issues

#### Medium Risk Profile
- **User**: Maria Garcia (maria.garcia@email.com)
- **Company**: Global Trading Co
- **Risk Score**: 34 (Medium)
- **Features**: Some regulatory inquiries, minor data breaches

#### High Risk Profile
- **User**: David Cohen (david.cohen@email.com)
- **Company**: Offshore Holdings Ltd
- **Risk Score**: 68 (High)
- **Features**: Offshore company, active investigations, multiple breaches

#### Critical Risk Profile
- **User**: Vladimir Petrov (vladimir.petrov@email.com)
- **Company**: Eastern Ventures LLC
- **Risk Score**: 90 (Critical)
- **Features**: Sanctions violations, criminal associations, blacklist matches

## Demo Scenarios

### Scenario 1: User Registration and KYC Submission

1. **Register a new user** with one of the demo email addresses:
   - `john.smith@email.com` (Low Risk)
   - `maria.garcia@email.com` (Medium Risk)
   - `david.cohen@email.com` (High Risk)
   - `vladimir.petrov@email.com` (Critical Risk)

2. **Submit KYC documents** - The system will automatically trigger AI assessment

3. **View risk assessment results** - Each user will get different risk scores and factors

### Scenario 2: Admin Risk Monitoring

1. **Access admin dashboard** and view high-risk users
2. **Review risk factors** for each user
3. **Trigger bulk assessment** to process multiple users
4. **Analyze risk trends** across different user profiles

### Scenario 3: Document Analysis

1. **Upload different document types**:
   - Passport (clean verification)
   - Utility bill (standard verification)
   - Suspicious document (fraud detection)

2. **View AI analysis results** for each document
3. **See fraud indicators** and verification status

## API Endpoints for Demo

### 1. Demo Risk Profiles

```http
GET /api/demo/risk-profiles?profile=lowRisk
GET /api/demo/risk-profiles?profile=mediumRisk
GET /api/demo/risk-profiles?profile=highRisk
GET /api/demo/risk-profiles?profile=criticalRisk
```

**Response Example (Low Risk):**
```json
{
  "success": true,
  "data": {
    "profile": "lowRisk",
    "user": {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@email.com",
      "nationality": "British",
      "company": "TechCorp Ltd"
    },
    "riskAssessment": {
      "overallRisk": {
        "score": 10,
        "level": "low",
        "factors": ["Low-risk profile across all dimensions"],
        "reasoning": "Comprehensive assessment indicates low risk profile"
      },
      "identityRisk": {
        "score": 15,
        "level": "low",
        "factors": ["Valid passport", "Consistent address history"]
      }
      // ... other risk dimensions
    },
    "webIntelligence": {
      "riskScore": 8,
      "riskLevel": "low",
      "confidence": 95,
      "sources": ["web_search", "company_registry", "news_search"]
    }
  }
}
```

### 2. AI Risk Assessment

```http
POST /api/ai/risk-assessment/{userId}
```

**Features:**
- Automatically uses mock data based on user email
- Returns comprehensive risk assessment
- Updates database and blockchain
- Creates audit logs

### 3. Admin High-Risk Users

```http
GET /api/admin/ai/high-risk-users?limit=10&riskLevel=critical
```

**Features:**
- Returns mock high-risk users for demo
- Filterable by risk level
- Includes risk factors and scores

### 4. Bulk Assessment

```http
POST /api/admin/ai/bulk-assessment
```

**Features:**
- Processes multiple users in batch
- Returns success/failure statistics
- Shows processing results

## Demo Data Features

### 1. Realistic Risk Scenarios

Each mock profile includes:
- **Identity Risk**: Document authenticity, verification issues
- **Industry Risk**: Business associations, company reputation
- **Network Risk**: Connections to high-risk entities
- **Security Risk**: Data breaches, security threats

### 2. Web Intelligence Data

Comprehensive web scraping simulation:
- **LinkedIn Profiles**: Professional information
- **Company Registries**: Business details and status
- **News Mentions**: Media coverage and sentiment
- **Legal Records**: Court cases and investigations
- **Sanctions Lists**: OFAC, UK, EU, UN checks
- **Data Breaches**: Have I Been Pwned integration

### 3. Document Analysis

AI-powered document verification:
- **Authenticity Checks**: Security features, formatting
- **Data Consistency**: Cross-reference with user data
- **Fraud Indicators**: Suspicious patterns and inconsistencies
- **OCR Accuracy**: Extracted data confidence scores

### 4. Risk Factors

Detailed risk indicators:
- **Source Tracking**: Where each risk factor originated
- **Severity Levels**: Low, Medium, High, Critical
- **Timestamps**: When each factor was identified
- **Descriptions**: Detailed explanations of risks

## Demo Workflow

### Step 1: User Registration
```bash
# Register users with demo emails
curl -X POST /api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.smith@email.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Smith"
  }'
```

### Step 2: KYC Submission
```bash
# Submit KYC with documents
curl -X POST /api/kyc/submit \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [...],
    "sourceOfFunds": "Employment"
  }'
```

### Step 3: AI Assessment
```bash
# Trigger AI risk assessment
curl -X POST /api/ai/risk-assessment/{userId} \
  -H "Authorization: Bearer <jwt_token>"
```

### Step 4: View Results
```bash
# Get risk summary
curl -X GET /api/ai/risk-summary/{userId} \
  -H "Authorization: Bearer <jwt_token>"
```

### Step 5: Admin Review
```bash
# Get high-risk users
curl -X GET /api/admin/ai/high-risk-users \
  -H "Authorization: Bearer <admin_jwt_token>"
```

## Demo Customization

### 1. Adding New Mock Profiles

To add new demo profiles, edit `src/lib/ai/mock-data.ts`:

```typescript
export const MOCK_USERS = {
  // ... existing profiles
  newProfile: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@email.com',
    nationality: 'American',
    company: 'New Company Inc',
    riskProfile: 'medium',
  },
};
```

### 2. Customizing Risk Scores

Modify risk assessment data:

```typescript
export const MOCK_RISK_ASSESSMENTS = {
  newProfile: {
    overallRisk: {
      score: 45,
      level: RiskLevel.MEDIUM,
      factors: ['Custom risk factors'],
      reasoning: 'Custom reasoning',
    },
    // ... other dimensions
  },
};
```

### 3. Adding Document Types

Extend document analysis:

```typescript
export const MOCK_DOCUMENT_ANALYSES = {
  newDocumentType: {
    authenticity: { score: 80, indicators: [], concerns: [] },
    // ... other checks
  },
};
```

## Demo Best Practices

### 1. Progressive Disclosure
- Start with low-risk profiles
- Gradually introduce higher-risk scenarios
- Explain risk factors as they appear

### 2. Real-time Updates
- Show how risk scores change over time
- Demonstrate audit trail functionality
- Highlight blockchain integration

### 3. Error Handling
- Show graceful degradation when AI fails
- Demonstrate fallback mechanisms
- Explain error recovery processes

### 4. Compliance Features
- Highlight audit trail completeness
- Show regulatory compliance features
- Demonstrate data protection measures

## Troubleshooting

### Common Issues

1. **Mock data not loading**
   - Check environment variables
   - Verify file imports
   - Check console for errors

2. **API endpoints not responding**
   - Verify server is running
   - Check authentication tokens
   - Review API route configuration

3. **Risk scores not updating**
   - Check database connection
   - Verify user authentication
   - Review assessment triggers

### Debug Mode

Enable detailed logging:

```typescript
// In development, mock data usage is logged
console.log('Using mock data for risk assessment');
console.log('Using mock data for web intelligence');
console.log('Using mock data for document analysis');
```

## Next Steps

After the PoC demonstration:

1. **Production Setup**: Configure real DeepSeek API key
2. **Custom Models**: Train domain-specific AI models
3. **Enhanced Data Sources**: Integrate real APIs
4. **Advanced Analytics**: Add predictive modeling
5. **Compliance**: Implement regulatory requirements

This PoC demo system provides a comprehensive showcase of the AI/ML integration while maintaining the flexibility to switch to real APIs when needed. 