const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("💾 Saving successfully deployed contracts to .env.local...");
  
  // These are the contracts we successfully deployed in our previous attempts
  const successfulContracts = {
    // From the first successful deployment
    "0x30D79D489b95942Bcbb95429E3a983f246CDaC75": "InputValidator",
    "0x560962Cb5E4E2B5d3b477c5a579523Cdd338cd4e": "BoundsChecker",
    "0x5c2e02Ef27cC0119E2C1A9dCaDC9CC1A30C8E098": "KYCDataStorage",
    "0xb05c6B110afB41Bb5699cA2953bEF2a57b5cA728": "TenantConfigStorage",
    
    // From the second successful deployment
    "0x0fF6030f3300356B35B58e769e71Ee34B2183F4B": "InputValidator_v2",
    "0xA8C49B00E236a4A5A5e0A771c11d159432d7c1C8": "BoundsChecker_v2",
    "0x2DBa2191DC261Edd61b53E5A1Fe7170FC2a21451": "KYCDataStorage_v2",
    "0xE8f2Cd826F8dA1AddC81f89Ce02764Fe8D9565F3": "TenantConfigStorage_v2",
    
    // From the third successful deployment
    "0x8f79FC98406c233029aaaee1542a00A568038767": "InputValidator_v3",
    "0x3D9f60f588E135854116eb74b71488CeEC0D78fC": "BoundsChecker_v3",
    "0x32f048EdD84A80fb20F2A1de395856031E2334e1": "KYCDataStorage_v3",
    "0x974d8541E660594984b87D68Fb8FC93feC023289": "TenantConfigStorage_v3",
    "0xCEd5fAB8c8215DCA0EBfA3e3EF4a2266d4366d92": "AuditLogStorage",
    
    // From the fourth successful deployment
    "0xB5ACD6301C36186bB9b7Ea3CbC149E5d727D56DE": "InputValidator_v4",
    "0xa5621Ad47f07dbaC0E7558a5afbA7D6020EE8a49": "BoundsChecker_v4",
    "0xfb0936C5a3846fe2b6aAb72E1026FA2F7867eCa2": "KYCDataStorage_v4",
    "0x36f8e586BbECa0E8B141b90b839E69F75EEd2DBd": "TenantConfigStorage_v4",
    "0xCca2a19c9eAA69C55E48e5c202a131471C06d19d": "AuditLogStorage_v2"
  };

  // Use the latest versions (v4)
  const latestContracts = {
    "InputValidator": "0xB5ACD6301C36186bB9b7Ea3CbC149E5d727D56DE",
    "BoundsChecker": "0xa5621Ad47f07dbaC0E7558a5afbA7D6020EE8a49",
    "KYCDataStorage": "0xfb0936C5a3846fe2b6aAb72E1026FA2F7867eCa2",
    "TenantConfigStorage": "0x36f8e586BbECa0E8B141b90b839E69F75EEd2DBd",
    "AuditLogStorage": "0xCca2a19c9eAA69C55E48e5c202a131471C06d19d"
  };

  // Read current .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Remove existing contract addresses
  const lines = envContent.split('\n');
  const filteredLines = lines.filter(line => 
    !line.startsWith('NEXT_PUBLIC_') || 
    !line.includes('_ADDRESS=')
  );

  // Add new contract addresses
  const newContractLines = Object.entries(latestContracts).map(([name, address]) => {
    return `NEXT_PUBLIC_${name.toUpperCase()}_ADDRESS=${address}`;
  });

  // Add Tractsafe network configuration
  const networkConfig = [
    '',
    '# Tractsafe Network Configuration',
    'NEXT_PUBLIC_RPC_URL=https://tapi.tractsafe.com',
    'NEXT_PUBLIC_CHAIN_ID=35935',
    'NEXT_PUBLIC_NETWORK_NAME=tractsafe',
    ''
  ];

  // Combine everything
  const updatedEnvContent = [
    ...filteredLines,
    ...networkConfig,
    '# Deployed Contract Addresses on Tractsafe',
    ...newContractLines
  ].join('\n');

  // Write updated .env.local
  fs.writeFileSync(envPath, updatedEnvContent);

  console.log("✅ Successfully updated .env.local with deployed contracts:");
  console.log("=" .repeat(60));
  Object.entries(latestContracts).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });
  console.log("=" .repeat(60));
  console.log(`📁 Updated file: ${envPath}`);
  console.log(`📊 Total contracts: ${Object.keys(latestContracts).length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
