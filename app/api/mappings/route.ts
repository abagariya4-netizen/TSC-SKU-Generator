import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const [
      { data: categories, error: e1 },
      { data: subCategories, error: e2 },
      { data: products, error: e3 },
      { data: models, error: e4 },
      { data: colours, error: e5 },
      { data: sizes, error: e6 }
    ] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('subcategories').select('*').order('name'),
      supabase.from('products').select('*').order('name'),
      supabase.from('models').select('*').order('name'),
      supabase.from('colours').select('*').order('name'),
      supabase.from('sizes').select('*').order('name')
    ])

    if (e1 || e2 || e3 || e4 || e5 || e6) {
      console.error(e1 || e2 || e3 || e4 || e5 || e6)
      return NextResponse.json({ error: 'Failed to load mappings' }, { status: 500 })
    }

    return NextResponse.json({
      categories,
      subCategories,
      products,
      models,
      colours,
      sizes
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { table, data } = body
    
    if (!table || !data) {
      return NextResponse.json({ error: 'Missing table or data' }, { status: 400 })
    }

    // Validation Rules
    if (table === 'products') {
      const { data: existing, error } = await supabase
        .from('products')
        .select('*')
        .ilike('code', data.code)
      
      if (error) throw error
      
      if (existing && existing.length > 0) {
        const conflict = existing[0]
        return NextResponse.json({ 
          error: `Code '${data.code}' is already taken by '${conflict.name}' (${conflict.category}). Pick a different code.` 
        }, { status: 400 })
      }
    } else if (table === 'colours' || table === 'models' || table === 'subcategories') {
      const { data: existing, error } = await supabase
        .from(table)
        .select('*')
        .or(`code.ilike.${data.code},name.ilike.${data.name}`)
      
      if (error) throw error
      
      if (existing && existing.length > 0) {
        return NextResponse.json({ 
          error: `A record with this name or code already exists in ${table}.` 
        }, { status: 400 })
      }
    }

    const { data: inserted, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(inserted)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Error inserting record' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const id = searchParams.get('id')
    
    if (!table || !id) return NextResponse.json({ error: 'Missing table or id' }, { status: 400 })
    
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { table, id, data } = body
    if (!table || !id || !data) return NextResponse.json({ error: 'Missing table, id, or data' }, { status: 400 })
    
    const { data: updated, error } = await supabase.from(table).update(data).eq('id', id).select().single()
    if (error) throw error
    
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
