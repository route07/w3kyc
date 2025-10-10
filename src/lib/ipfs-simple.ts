// IPFS client for private IPFS nodes
// Uses your private IPFS nodes with failover support

export interface IPFSResult {
  hash: string
  url: string
  size: number
  node: string
}

// Your private IPFS nodes
const IPFS_NODES = [
  'http://65.109.136.54:5001',
  'http://65.109.136.54:5002'
]

// Helper function to upload to a specific IPFS node
async function uploadToNode(
  nodeUrl: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<IPFSResult> {
  console.log(`[IPFS] Creating FormData for upload to ${nodeUrl}`)
  console.log(`[IPFS] File details: ${fileName}, ${fileBuffer.length} bytes`)
  
  const formData = new FormData()
  const blob = new Blob([fileBuffer])
  formData.append('file', blob, fileName)
  
  console.log(`[IPFS] FormData created, blob size: ${blob.size}`)
  console.log(`[IPFS] Making request to: ${nodeUrl}/api/v0/add`)

  const response = await fetch(`${nodeUrl}/api/v0/add`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })

  console.log(`[IPFS] Response status: ${response.status}`)
  console.log(`[IPFS] Response headers:`, Object.fromEntries(response.headers.entries()))

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[IPFS] Error response body:`, errorText)
    throw new Error(`IPFS node ${nodeUrl} returned ${response.status}: ${response.statusText} - ${errorText}`)
  }

  const result = await response.json()
  console.log(`[IPFS] Upload result:`, result)
  
  // Use gateway URL if available, otherwise fallback to API URL
  const gatewayUrl = nodeUrl.includes(':5001') 
    ? `http://65.109.136.54:8080/ipfs/${result.Hash}`
    : `http://65.109.136.54:8081/ipfs/${result.Hash}`
  
  return {
    hash: result.Hash,
    url: gatewayUrl,
    size: result.Size,
    node: nodeUrl
  }
}

export async function uploadToIPFS(
  fileBuffer: Buffer,
  fileName: string
): Promise<IPFSResult> {
  console.log(`[IPFS] Uploading ${fileName} (${fileBuffer.length} bytes) to private nodes`)
  
  // Try each node in order
  for (let i = 0; i < IPFS_NODES.length; i++) {
    const nodeUrl = IPFS_NODES[i]
    try {
      console.log(`[IPFS] Attempting upload to node ${i + 1}: ${nodeUrl}`)
      const result = await uploadToNode(nodeUrl, fileBuffer, fileName)
      console.log(`[IPFS] ✅ Upload successful to node ${i + 1}: ${result.hash}`)
      return result
    } catch (error) {
      console.error(`[IPFS] ❌ Upload failed to node ${i + 1} (${nodeUrl}):`, error)
      
      // If this is the last node, throw the error
      if (i === IPFS_NODES.length - 1) {
        throw new Error(`Failed to upload to all IPFS nodes. Last error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      // Otherwise, try the next node
      console.log(`[IPFS] Trying next node...`)
    }
  }
  
  throw new Error('No IPFS nodes available')
}

// Helper function to get file from a specific IPFS node
async function getFromNode(nodeUrl: string, hash: string): Promise<Buffer> {
  const response = await fetch(`${nodeUrl}/api/v0/cat?arg=${hash}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/octet-stream'
    }
  })

  if (!response.ok) {
    throw new Error(`IPFS node ${nodeUrl} returned ${response.status}: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function getFromIPFS(hash: string): Promise<Buffer> {
  console.log(`[IPFS] Retrieving file with hash: ${hash}`)
  
  // Try each node in order
  for (let i = 0; i < IPFS_NODES.length; i++) {
    const nodeUrl = IPFS_NODES[i]
    try {
      console.log(`[IPFS] Attempting retrieval from node ${i + 1}: ${nodeUrl}`)
      const result = await getFromNode(nodeUrl, hash)
      console.log(`[IPFS] ✅ Retrieval successful from node ${i + 1}`)
      return result
    } catch (error) {
      console.error(`[IPFS] ❌ Retrieval failed from node ${i + 1} (${nodeUrl}):`, error)
      
      // If this is the last node, throw the error
      if (i === IPFS_NODES.length - 1) {
        throw new Error(`Failed to retrieve from all IPFS nodes. Last error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      // Otherwise, try the next node
      console.log(`[IPFS] Trying next node...`)
    }
  }
  
  throw new Error('No IPFS nodes available')
}

// Helper function to pin file on a specific IPFS node
async function pinOnNode(nodeUrl: string, hash: string): Promise<boolean> {
  const response = await fetch(`${nodeUrl}/api/v0/pin/add?arg=${hash}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`IPFS node ${nodeUrl} returned ${response.status}: ${response.statusText}`)
  }

  return true
}

export async function pinToIPFS(hash: string): Promise<boolean> {
  console.log(`[IPFS] Pinning file with hash: ${hash}`)
  
  let successCount = 0
  
  // Try to pin on all nodes
  for (let i = 0; i < IPFS_NODES.length; i++) {
    const nodeUrl = IPFS_NODES[i]
    try {
      console.log(`[IPFS] Attempting to pin on node ${i + 1}: ${nodeUrl}`)
      await pinOnNode(nodeUrl, hash)
      console.log(`[IPFS] ✅ Pin successful on node ${i + 1}`)
      successCount++
    } catch (error) {
      console.error(`[IPFS] ❌ Pin failed on node ${i + 1} (${nodeUrl}):`, error)
    }
  }
  
  return successCount > 0
}

// Helper function to unpin file from a specific IPFS node
async function unpinFromNode(nodeUrl: string, hash: string): Promise<boolean> {
  const response = await fetch(`${nodeUrl}/api/v0/pin/rm?arg=${hash}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`IPFS node ${nodeUrl} returned ${response.status}: ${response.statusText}`)
  }

  return true
}

export async function deleteFromIPFS(hash: string): Promise<boolean> {
  console.log(`[IPFS] Unpinning file with hash: ${hash}`)
  
  let successCount = 0
  
  // Try to unpin from all nodes
  for (let i = 0; i < IPFS_NODES.length; i++) {
    const nodeUrl = IPFS_NODES[i]
    try {
      console.log(`[IPFS] Attempting to unpin from node ${i + 1}: ${nodeUrl}`)
      await unpinFromNode(nodeUrl, hash)
      console.log(`[IPFS] ✅ Unpin successful from node ${i + 1}`)
      successCount++
    } catch (error) {
      console.error(`[IPFS] ❌ Unpin failed from node ${i + 1} (${nodeUrl}):`, error)
    }
  }
  
  return successCount > 0
}

// Helper function to check if a file exists on a specific IPFS node
async function existsOnNode(nodeUrl: string, hash: string): Promise<boolean> {
  try {
    const response = await fetch(`${nodeUrl}/api/v0/object/stat?arg=${hash}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    })
    return response.ok
  } catch {
    return false
  }
}

export async function existsOnIPFS(hash: string): Promise<{ exists: boolean; nodes: string[] }> {
  console.log(`[IPFS] Checking if file exists with hash: ${hash}`)
  
  const existingNodes: string[] = []
  
  // Check each node
  for (let i = 0; i < IPFS_NODES.length; i++) {
    const nodeUrl = IPFS_NODES[i]
    try {
      console.log(`[IPFS] Checking existence on node ${i + 1}: ${nodeUrl}`)
      const exists = await existsOnNode(nodeUrl, hash)
      if (exists) {
        console.log(`[IPFS] ✅ File exists on node ${i + 1}`)
        existingNodes.push(nodeUrl)
      } else {
        console.log(`[IPFS] ❌ File not found on node ${i + 1}`)
      }
    } catch (error) {
      console.error(`[IPFS] ❌ Check failed on node ${i + 1} (${nodeUrl}):`, error)
    }
  }
  
  return {
    exists: existingNodes.length > 0,
    nodes: existingNodes
  }
} 