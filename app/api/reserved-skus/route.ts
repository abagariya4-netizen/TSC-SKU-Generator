import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('reserved_skus')
      .select('*', { count: 'exact', head: true })
      
    if (error) throw error
    
    return NextResponse.json({ count: count || 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { skus } = body // Array of strings
    
    if (!skus || !Array.isArray(skus)) {
      return NextResponse.json({ error: 'Missing skus array' }, { status: 400 })
    }
    
    // Clean and deduplicate
    const uniqueSkus = Array.from(new Set(
      skus
        .map((s: string) => s?.trim())
        .filter(Boolean)
    ))
    
    if (uniqueSkus.length === 0) {
      return NextResponse.json({ error: 'No valid SKUs found' }, { status: 400 })
    }
    
    // Batch upsert to avoid payload limits
    const BATCH_SIZE = 500
    let inserted = 0
    
    for (let i = 0; i < uniqueSkus.length; i += BATCH_SIZE) {
      const batch = uniqueSkus.slice(i, i + BATCH_SIZE).map(sku => ({ sku, status: 'Active' }))
      
      const { error } = await supabase
        .from('reserved_skus')
        .upsert(batch, { onConflict: 'sku', ignoreDuplicates: true })
        
      if (error) throw error
      
      inserted += batch.length
    }
    
    return NextResponse.json({ success: true, count: inserted })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
