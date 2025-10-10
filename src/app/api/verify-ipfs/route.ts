import { NextRequest, NextResponse } from 'next/server'

const IPFS_NODES = [
  'http://65.109.136.54:5001',
  'http://65.109.136.54:5002'
]

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verifying IPFS nodes and checking for uploaded files...')
    
    const results = []
    
    for (let i = 0; i < IPFS_NODES.length; i++) {
      const nodeUrl = IPFS_NODES[i]
      console.log(`Checking node ${i + 1}: ${nodeUrl}`)
      
      try {
        // Check node status
        const versionResponse = await fetch(`${nodeUrl}/api/v0/version`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' }
        })
        
        if (!versionResponse.ok) {
          throw new Error(`Node ${i + 1} not responding: ${versionResponse.status}`)
        }
        
        const versionData = await versionResponse.json()
        console.log(`Node ${i + 1} version:`, versionData.Version)
        
        // Check pinned files
        const pinnedResponse = await fetch(`${nodeUrl}/api/v0/pin/ls`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' }
        })
        
        if (!pinnedResponse.ok) {
          throw new Error(`Failed to get pinned files from node ${i + 1}: ${pinnedResponse.status}`)
        }
        
        const pinnedData = await pinnedResponse.json()
        const pinnedHashes = Object.keys(pinnedData.Keys || {})
        console.log(`Node ${i + 1} pinned files:`, pinnedHashes.length)
        
        // Check repo stats
        const repoResponse = await fetch(`${nodeUrl}/api/v0/repo/stat`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' }
        })
        
        if (!repoResponse.ok) {
          throw new Error(`Failed to get repo stats from node ${i + 1}: ${repoResponse.status}`)
        }
        
        const repoData = await repoResponse.json()
        console.log(`Node ${i + 1} repo stats:`, repoData)
        
        results.push({
          node: i + 1,
          url: nodeUrl,
          status: 'online',
          version: versionData.Version,
          pinnedFiles: pinnedHashes.length,
          repoSize: repoData.RepoSize,
          storageMax: repoData.StorageMax,
          pinnedHashes: pinnedHashes.slice(0, 10) // Show first 10 hashes
        })
        
      } catch (error) {
        console.error(`Node ${i + 1} error:`, error)
        results.push({
          node: i + 1,
          url: nodeUrl,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'IPFS verification complete',
      results
    })
    
  } catch (error) {
    console.error('❌ IPFS verification failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}