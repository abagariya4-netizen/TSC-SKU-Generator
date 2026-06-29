import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Try to load environment variables from .env.local if present
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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const jsonPath = path.resolve(__dirname, '../../existing-skus.json')
  if (!fs.existsSync(jsonPath)) {
    console.error('existing-skus.json not found at', jsonPath)
    process.exit(1)
  }

  const skus = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  console.log(`Loaded ${skus.length} SKUs from JSON.`)

  const BATCH_SIZE = 500
  let inserted = 0

  for (let i = 0; i < skus.length; i += BATCH_SIZE) {
    const batch = skus.slice(i, i + BATCH_SIZE).map((sku) => ({
      sku,
      status: 'Legacy'
    }))
    
    console.log(`Inserting batch ${i} to ${i + batch.length}...`)
    
    const { error } = await supabase
      .from('reserved_skus')
      .upsert(batch, { onConflict: 'sku', ignoreDuplicates: true })

    if (error) {
      console.error('Error inserting batch:', error)
      process.exit(1)
    }
    
    inserted += batch.length
  }

  console.log(`Successfully seeded ${inserted} reserved SKUs.`)
}

run()
