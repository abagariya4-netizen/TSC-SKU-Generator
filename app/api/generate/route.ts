import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { buildSku } from '@/lib/skuBuilder'
import { SkuRow } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rows: SkuRow[] = Array.isArray(body) ? body : [body]

    // Fetch all lookup data from Supabase once
    const [
      { data: categories, error: e1 },
      { data: subCategories, error: e2 },
      { data: products, error: e3 },
      { data: models, error: e4 },
      { data: colours, error: e5 },
      { data: sizes, error: e6 }
    ] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('subcategories').select('*'),
      supabase.from('products').select('*'),
      supabase.from('models').select('*'),
      supabase.from('colours').select('*'),
      supabase.from('sizes').select('*')
    ])

    if (e1 || e2 || e3 || e4 || e5 || e6) {
      throw new Error('Database fetch error in generate API')
    }

    const results = []
    
    // We need to keep track of newly generated SKUs in this batch
    // to increment serials properly if there are multiple of the same product in the batch.
    const batchSkus: string[] = []

    for (const row of rows) {
      let nextSerial = '01'
      
      const category = (categories || []).find(c => c.name.toLowerCase() === row.category?.trim().toLowerCase())
      
      if (category && category.type === 'colour') {
        const var1 = (row.var1 || '').trim()
        const var2 = (row.var2 || '').trim()
        
        if (!var1 && !var2) {
          const product = (products || []).find(p => p.name.toLowerCase() === row.product?.trim().toLowerCase() && p.category.toLowerCase() === row.category?.trim().toLowerCase())
          
          if (product) {
            const prefix = `TSC${category.code}${product.code}`
            
            // Query Supabase specifically for this prefix to bypass 1000 row limits
            const [historyMatch, reservedMatch] = await Promise.all([
              supabase.from('sku_history').select('sku').like('sku', `${prefix}%`),
              supabase.from('reserved_skus').select('sku').like('sku', `${prefix}%`)
            ])
            
            const dbSkus = [
              ...(historyMatch.data || []).map(r => r.sku),
              ...(reservedMatch.data || []).map(r => r.sku)
            ]
            
            // Find all SKUs in dbSkus AND batchSkus that start with this prefix and have 2 digits at the end
            const existingSerials = [...dbSkus, ...batchSkus]
              .filter(sku => sku.startsWith(prefix) && sku.length === prefix.length + 2)
              .map(sku => parseInt(sku.slice(prefix.length), 10))
              .filter(n => !isNaN(n))
            
            if (existingSerials.length > 0) {
              const max = Math.max(...existingSerials)
              nextSerial = (max + 1).toString().padStart(2, '0')
            }
          }
        }
      }

      const result = buildSku(
        row,
        categories || [],
        subCategories || [],
        products || [],
        models || [],
        colours || [],
        sizes || [],
        nextSerial
      )
      
      if (result.sku) {
        // Query DB for exact match to bypass 1000 row limits
        const { data: exactMatch } = await supabase
          .from('reserved_skus')
          .select('sku')
          .eq('sku', result.sku)
          
        if (exactMatch && exactMatch.length > 0) {
          results.push({ error: `SKU "${result.sku}" already exists in the catalogue (Active/Draft). Change the product or variation to get a new code.` })
          continue
        }
        
        batchSkus.push(result.sku)
      }
      
      results.push(result)
    }

    return NextResponse.json(results.length === 1 && !Array.isArray(body) ? results[0] : results)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
