import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      process.env[match[1].trim()] = match[2].trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function runChecks() {
  console.log('--- STARTING CATALOGUE CHECKS ---')

  // Check 1: Confirm specific reserved SKUs
  console.log('\nRunning Check 1: Reserved codes loaded...')
  const targetSkus = ['TSCWC1', 'TSCCNRC1', 'TSCB001', 'TSCB011', 'TSCCMLPS009', 'TSCNMOPS55', 'TSCNMOPS18', 'TSCTFSSG06', 'TSCCMLP001']
  const { data: c1Data, error: c1Error } = await supabase.from('reserved_skus').select('sku').in('sku', targetSkus)
  if (c1Error) throw c1Error
  if (c1Data.length !== targetSkus.length) {
    console.error(`Check 1 Failed! Expected ${targetSkus.length} SKUs, found ${c1Data.length}`)
  } else {
    console.log('Check 1 Passed.')
  }

  // Helper to test API
  const testGenerate = async (payload) => {
    const res = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return res.json()
  }

  // Check 2: Single mode blocks reserved code
  console.log('\nRunning Check 2: Single mode blocks reserved code...')
  await supabase.from('reserved_skus').upsert({ sku: 'TSCCSWBL', status: 'Test' }, { onConflict: 'sku' })
  const res2 = await testGenerate({ category: 'Chair', product: 'Swill', var1: 'Black' })
  if (res2.error && res2.error.includes('already exists in the catalogue')) {
    console.log('Check 2 Passed.')
  } else {
    console.error('Check 2 Failed! Expected error for TSCCSWBL, got:', res2)
  }
  await supabase.from('reserved_skus').delete().eq('sku', 'TSCCSWBL')

  // Check 3: CSV bulk mode blocks reserved code
  console.log('\nRunning Check 3: Bulk mode blocks reserved code...')
  await supabase.from('reserved_skus').upsert({ sku: 'TSCMOGK78728', status: 'Test' }, { onConflict: 'sku' })
  const res3 = await testGenerate([{ category: 'Mattress', product: 'Orthogrid', var1: 'King(78*72)', var2: '8' }])
  if (Array.isArray(res3) && res3[0].error && res3[0].error.includes('already exists in the catalogue')) {
    console.log('Check 3 Passed.')
  } else {
    console.error('Check 3 Failed! Expected error for bulk array, got:', res3)
  }
  await supabase.from('reserved_skus').delete().eq('sku', 'TSCMOGK78728')

  // Check 4: Serial auto-bumps
  console.log('\nRunning Check 4: Serial auto-bumps past reserved codes...')
  await supabase.from('reserved_skus').upsert([{ sku: 'TSCCON01', status: 'Test' }, { sku: 'TSCCON02', status: 'Test' }], { onConflict: 'sku' })
  const res4 = await testGenerate({ category: 'Chair', product: 'Onyx', var1: '', var2: '' })
  if (res4.sku === 'TSCCON03') {
    console.log('Check 4 Passed.')
  } else {
    console.error('Check 4 Failed! Expected TSCCON03, got:', res4)
  }
  await supabase.from('reserved_skus').delete().in('sku', ['TSCCON01', 'TSCCON02'])

  // Check 5: Catalogue count is 4190
  console.log('\nRunning Check 5: Catalogue count is correct...')
  const { count, error: c5Error } = await supabase.from('reserved_skus').select('*', { count: 'exact', head: true })
  if (count === 4190) {
    console.log('Check 5 Passed.')
  } else {
    console.error(`Check 5 Failed! Expected 4190, got: ${count}`)
  }

  // Check 6: Catalogue refresh via upload
  console.log('\nRunning Check 6: Catalogue refresh via API...')
  const res6 = await fetch('http://localhost:3000/api/reserved-skus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skus: ['TEST-SKU-REFRESH'] })
  })
  const json6 = await res6.json()
  if (json6.success && json6.count === 1) {
    console.log('Check 6 Passed.')
  } else {
    console.error('Check 6 Failed! Expected success with count 1, got:', json6)
  }
  await supabase.from('reserved_skus').delete().eq('sku', 'TEST-SKU-REFRESH')

  console.log('\n--- CATALOGUE CHECKS COMPLETE ---')
}

runChecks()
