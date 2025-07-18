// Mock IPFS client for demo purposes
// In production, this would use a real IPFS client

export interface IPFSFile {
  path: string;
  content: Buffer | string;
  size?: number;
}

/**
 * Mock IPFS client for demo purposes
 */
class MockIPFSClient {
  private files = new Map<string, Buffer>();

  async add(file: { path: string; content: Buffer }): Promise<{ cid: { toString: () => string } }> {
    const hash = this.generateMockHash(file.path);
    this.files.set(hash, file.content);
    return {
      cid: {
        toString: () => hash
      }
    };
  }

  async addAll(files: IPFSFile[]): Promise<AsyncIterable<{ cid: { toString: () => string } }>> {
    const results: { cid: { toString: () => string } }[] = [];
    
    for (const file of files) {
      const hash = this.generateMockHash(file.path);
      this.files.set(hash, Buffer.from(file.content));
      results.push({
        cid: {
          toString: () => hash
        }
      });
    }
    
    return results as any;
  }

  async cat(hash: string): Promise<AsyncIterable<Uint8Array>> {
    const file = this.files.get(hash);
    if (!file) {
      throw new Error('File not found');
    }
    return [file] as any;
  }

  files = {
    stat: async (path: string) => {
      const hash = path.replace('/ipfs/', '');
      if (this.files.has(hash)) {
        return { size: this.files.get(hash)?.length || 0 };
      }
      throw new Error('File not found');
    }
  };

  pin = {
    add: async (hash: string) => {
      // Mock pin operation
      console.log(`Mock pinning file: ${hash}`);
    },
    rm: async (hash: string) => {
      // Mock unpin operation
      console.log(`Mock unpinning file: ${hash}`);
    }
  };

  private generateMockHash(path: string): string {
    // Generate a mock IPFS hash based on the file path and timestamp
    const timestamp = Date.now();
    const hash = `Qm${Buffer.from(`${path}-${timestamp}`).toString('base64').slice(0, 44)}`;
    return hash;
  }
}

const ipfs = new MockIPFSClient();

/**
 * Upload a file to IPFS
 * @param file - File buffer or content
 * @param fileName - Name of the file
 * @returns IPFS hash of the uploaded file
 */
export async function uploadToIPFS(file: Buffer, fileName: string): Promise<string> {
  try {
    const result = await ipfs.add({
      path: fileName,
      content: file,
    });
    
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
    const results = await ipfs.addAll(files);
    const hashes: string[] = [];
    
    for await (const result of results) {
      hashes.push(result.cid.toString());
    }
    
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
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of ipfs.cat(hash)) {
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
    await ipfs.files.stat(`/ipfs/${hash}`);
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
    await ipfs.pin.add(hash);
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
    await ipfs.pin.rm(hash);
  } catch (error) {
    console.error('Error unpinning file from IPFS:', error);
    throw new Error('Failed to unpin file from IPFS');
  }
}

export default ipfs; 