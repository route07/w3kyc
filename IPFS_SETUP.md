# IPFS Node Setup Guide

This guide will help you set up your own IPFS node for the W3KYC application.

## Option 1: Local IPFS Node (Recommended for Development)

### 1. Install IPFS

**Using Go (Recommended):**
```bash
# Download and install IPFS
wget https://dist.ipfs.io/go-ipfs/v0.24.0/go-ipfs_v0.24.0_linux-amd64.tar.gz
tar -xzf go-ipfs_v0.24.0_linux-amd64.tar.gz
cd go-ipfs
sudo ./install.sh

# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon
```

**Using Docker:**
```bash
# Run IPFS node in Docker
docker run -d --name ipfs-node -p 4001:4001 -p 4001:4001/udp -p 127.0.0.1:8080:8080 -p 127.0.0.1:5001:5001 ipfs/go-ipfs:latest

# Initialize IPFS (first time only)
docker exec ipfs-node ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
docker exec ipfs-node ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
```

### 2. Configure IPFS

```bash
# Allow CORS for web access
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'

# Set API and Gateway addresses
ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
```

### 3. Start IPFS Node

```bash
# Start the IPFS daemon
ipfs daemon
```

The node will be available at:
- **API**: `http://localhost:5001`
- **Gateway**: `http://localhost:8080`

## Option 2: Cloud IPFS Node (Production)

### Using Pinata (Recommended for Production)

1. Sign up at [Pinata](https://pinata.cloud)
2. Get your API keys
3. Use their IPFS gateway

### Using Infura IPFS

1. Sign up at [Infura](https://infura.io)
2. Create an IPFS project
3. Get your project ID and secret

## Environment Variables

Add these to your `.env.local` file:

```env
# IPFS Configuration
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=http://localhost:8080

# For production with Pinata:
# IPFS_API_URL=https://api.pinata.cloud
# IPFS_GATEWAY_URL=https://gateway.pinata.cloud

# For production with Infura:
# IPFS_API_URL=https://ipfs.infura.io:5001
# IPFS_GATEWAY_URL=https://ipfs.infura.io
```

## Testing IPFS Connection

You can test if your IPFS node is working:

```bash
# Check if IPFS is running
curl http://localhost:5001/api/v0/version

# Add a test file
echo "Hello IPFS" | ipfs add

# View file via gateway
curl http://localhost:8080/ipfs/QmYourHashHere
```

## Security Considerations

1. **Firewall**: Only expose necessary ports (5001, 8080)
2. **Authentication**: Consider using IPFS with authentication for production
3. **Backup**: Regularly backup your IPFS data directory
4. **Monitoring**: Monitor disk space and node health

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure CORS is properly configured
2. **Connection Refused**: Ensure IPFS daemon is running
3. **Port Conflicts**: Check if ports 5001/8080 are available
4. **Permission Issues**: Run with appropriate user permissions

### Useful Commands:

```bash
# Check IPFS status
ipfs stats repo

# View connected peers
ipfs swarm peers

# Check configuration
ipfs config show

# Reset IPFS (if needed)
rm -rf ~/.ipfs
ipfs init
```

## Production Deployment

For production, consider:

1. **Dedicated Server**: Run IPFS on a dedicated server
2. **Load Balancing**: Use multiple IPFS nodes
3. **CDN**: Use a CDN in front of your IPFS gateway
4. **Monitoring**: Set up monitoring and alerting
5. **Backup**: Regular backups of IPFS data

## File Storage Details

Once set up, files will be stored as follows:

1. **Upload**: Files are uploaded to your IPFS node
2. **Hash**: IPFS returns a unique hash (CID) for each file
3. **Database**: The hash is stored in MongoDB
4. **Access**: Files are accessed via the IPFS gateway
5. **Pinning**: Files are pinned to prevent garbage collection

The application will automatically:
- Upload files to IPFS
- Store IPFS hashes in the database
- Pin files to keep them available
- Provide gateway URLs for file access