// Dynamic import for IPFS client to avoid SSR issues
let IPFSHTTPClient: any;
let create: any;

// Only import IPFS client on client side or when needed
const getIPFSClient = async () => {
  if (typeof window === 'undefined') {
    // Server-side: use dynamic import
    const ipfsModule = await import('ipfs-http-client');
    return ipfsModule.create;
  } else {
    // Client-side: use regular import
    if (!create) {
      const ipfsModule = await import('ipfs-http-client');
      create = ipfsModule.create;
      IPFSHTTPClient = ipfsModule.IPFSHTTPClient;
    }
    return create;
  }
};

export interface IPFSFile {
  path: string;
  content: Buffer | string;
  size?: number;
}

// IPFS configuration
const IPFS_API_URL = process.env.IPFS_API_URL || 'http://localhost:5001';
const IPFS_GATEWAY_URL = process.env.IPFS_GATEWAY_URL || 'http://localhost:8080';

let ipfsClient: any = null;

/**
 * Get IPFS client instance
 */
async function getIPFSClientInstance(): Promise<any> {
  if (!ipfsClient) {
    try {
      const createFn = await getIPFSClient();
      ipfsClient = createFn({ url: IPFS_API_URL });
      console.log('Connected to IPFS node at:', IPFS_API_URL);
    } catch (error) {
      console.error('Failed to connect to IPFS node:', error);
      throw new Error('IPFS node connection failed. Please ensure IPFS is running.');
    }
  }
  return ipfsClient;
}

/**
 * Check if IPFS node is available
 */
export async function isIPFSNodeAvailable(): Promise<boolean> {
  try {
    const client = await getIPFSClientInstance();
    await client.version();
    return true;
  } catch (error) {
    console.error('IPFS node not available:', error);
    return false;
  }
}

/**
 * Upload a file to IPFS
 * @param file - File buffer or content
 * @param fileName - Name of the file
 * @returns IPFS hash of the uploaded file
 */
export async function uploadToIPFS(file: Buffer, fileName: string): Promise<string> {
  try {
    const client = await getIPFSClientInstance();
    const result = await client.add({
      path: fileName,
      content: file,
    });
    
    console.log(`File uploaded to IPFS: ${fileName} -> ${result.cid.toString()}`);
    return result.cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Upload multiple files to IPFS
 * @param files - Array of files to upload
 * @returns Array of IPFS hashes
 */
export async function uploadMultipleToIPFS(files: IPFSFile[]): Promise<string[]> {
  try {
    const client = await getIPFSClientInstance();
    const results = client.addAll(files);
    const hashes: string[] = [];
    
    for await (const result of results) {
      hashes.push(result.cid.toString());
    }
    
    console.log(`Uploaded ${files.length} files to IPFS`);
    return hashes;
  } catch (error) {
    console.error('Error uploading multiple files to IPFS:', error);
    throw new Error('Failed to upload files to IPFS');
  }
}

/**
 * Get file from IPFS
 * @param hash - IPFS hash of the file
 * @returns File content as buffer
 */
export async function getFromIPFS(hash: string): Promise<Buffer> {
  try {
    const client = await getIPFSClientInstance();
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of client.cat(hash)) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error getting file from IPFS:', error);
    throw new Error('Failed to retrieve file from IPFS');
  }
}

/**
 * Check if file exists in IPFS
 * @param hash - IPFS hash to check
 * @returns boolean indicating if file exists
 */
export async function fileExistsInIPFS(hash: string): Promise<boolean> {
  try {
    const client = await getIPFSClientInstance();
    await client.files.stat(`/ipfs/${hash}`);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Pin a file to IPFS (ensure it stays available)
 * @param hash - IPFS hash to pin
 */
export async function pinToIPFS(hash: string): Promise<void> {
  try {
    const client = await getIPFSClientInstance();
    await client.pin.add(hash);
    console.log(`Pinned file to IPFS: ${hash}`);
  } catch (error) {
    console.error('Error pinning file to IPFS:', error);
    throw new Error('Failed to pin file to IPFS');
  }
}

/**
 * Unpin a file from IPFS
 * @param hash - IPFS hash to unpin
 */
export async function unpinFromIPFS(hash: string): Promise<void> {
  try {
    const client = await getIPFSClientInstance();
    await client.pin.rm(hash);
    console.log(`Unpinned file from IPFS: ${hash}`);
  } catch (error) {
    console.error('Error unpinning file from IPFS:', error);
    throw new Error('Failed to unpin file from IPFS');
  }
}

/**
 * Get IPFS gateway URL for a file
 * @param hash - IPFS hash
 * @returns Full URL to access the file
 */
export function getIPFSGatewayURL(hash: string): string {
  return `${IPFS_GATEWAY_URL}/ipfs/${hash}`;
}

export default getIPFSClientInstance; 