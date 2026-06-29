'use client'

import { useState, useEffect, useCallback } from 'react'
import { KeepInMind } from '@/components/KeepInMind'
import { ComboBox } from '@/components/ComboBox'
import { SkuReadout } from '@/components/SkuReadout'
import { SkuResult, SkuRow } from '@/types'
import { Loader2, Save } from 'lucide-react'

export default function SingleEntryPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [product, setProduct] = useState('')
  const [var1, setVar1] = useState('')
  const [var2, setVar2] = useState('')
  
  const [customSize, setCustomSize] = useState(false)
  const [dims, setDims] = useState('')
  
  const [result, setResult] = useState<SkuResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const loadData = async () => {
    try {
      const res = await fetch('/api/mappings')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectedCategory = data?.categories?.find((c: any) => c.name === category)
  const isAccessory = category === 'Accessories'
  const selectedSub = isAccessory ? data?.subCategories?.find((s: any) => s.name === subcategory) : null

  const filteredProducts = data?.products?.filter((p: any) => {
    if (p.category !== category) return false
    if (isAccessory && p.sub !== subcategory) return false
    return true
  }) || []

  const updatePreview = useCallback(async () => {
    if (!category || !product) {
      setResult(null)
      return
    }

    let finalVar1 = var1
    let finalVar2 = var2

    if (selectedCategory?.type === 'dimension') {
      if (customSize) {
        finalVar1 = var1 ? `${var1}(Custom)` : `Custom(${dims})`
      } else {
        finalVar1 = var1 && dims ? `${var1}(${dims})` : var1 || dims
      }
    }

    const row: SkuRow = {
      category,
      subcategory: isAccessory ? subcategory : undefined,
      product,
      var1: finalVar1,
      var2: finalVar2
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row)
      })
      const json = await res.json()
      setResult(json)
    } catch (err: any) {
      setResult({ error: err.message })
    }
  }, [category, subcategory, product, var1, var2, dims, customSize, selectedCategory, isAccessory])

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview()
    }, 300) // debounce
    return () => clearTimeout(timer)
  }, [updatePreview])

  const handleAddMapping = async (table: string, payload: any) => {
    const res = await fetch('/api/mappings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, data: payload })
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    await loadData()
    return true
  }

  const handleSave = async () => {
    if (!result || result.error || !result.sku) return
    setSaving(true)
    setSaveMessage('')
    try {
      const res = await fetch('/api/sku-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: result.sku,
          category,
          product,
          details: result.details
        })
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaveMessage('Saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
      
      // Reset form (optional, let's keep it so they can generate variations quickly)
    } catch (err: any) {
      setSaveMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>

  return (
    <div className="max-w-7xl mx-auto">
      <KeepInMind />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Build a SKU</h2>
          
          <div className="space-y-5">
            <ComboBox 
              label="Category"
              options={data?.categories || []}
              value={category}
              onChange={(val) => {
                setCategory(val)
                setSubcategory('')
                setProduct('')
                setVar1('')
                setVar2('')
              }}
              allowAdd={false}
            />

            {isAccessory && (
              <ComboBox 
                label="Sub-Category"
                options={data?.subCategories || []}
                value={subcategory}
                onChange={(val) => {
                  setSubcategory(val)
                  setProduct('')
                  setVar1('')
                  setVar2('')
                }}
                onAdd={(name, code) => handleAddMapping('subcategories', { name, code })}
              />
            )}

            <ComboBox 
              label="Product"
              options={filteredProducts}
              value={product}
              onChange={setProduct}
              onAdd={(name, code) => handleAddMapping('products', { category, sub: isAccessory ? subcategory : null, name, code })}
              disabled={!category || (isAccessory && !subcategory)}
            />

            <div className="h-px bg-slate-100 my-4" />

            {/* Dimension Category */}
            {selectedCategory?.type === 'dimension' && (
              <div className="space-y-4">
                <ComboBox 
                  label="Size (Optional)"
                  options={data?.sizes || []}
                  value={var1}
                  onChange={setVar1}
                  onAdd={(name, code) => handleAddMapping('sizes', { name, code })}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dimensions (e.g. 78*72)</label>
                    <input 
                      type="text"
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50"
                      value={dims}
                      onChange={e => setDims(e.target.value)}
                      disabled={customSize}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Thickness</label>
                    <input 
                      type="number"
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={var2}
                      onChange={e => setVar2(e.target.value)}
                      placeholder="e.g. 8"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    checked={customSize}
                    onChange={e => {
                      setCustomSize(e.target.checked)
                      if (e.target.checked) setDims('')
                    }}
                  />
                  <span className="text-sm font-medium text-slate-700">Custom Dimensions</span>
                </label>
              </div>
            )}

            {/* Colour Category */}
            {selectedCategory?.type === 'colour' && (
              <div className="space-y-4">
                <ComboBox 
                  label="Variation 1 (Colour)"
                  options={data?.colours || []}
                  value={var1}
                  onChange={setVar1}
                  onAdd={(name, code) => handleAddMapping('colours', { name, code })}
                />
                <ComboBox 
                  label="Variation 2 (Optional)"
                  options={data?.colours || []}
                  value={var2}
                  onChange={setVar2}
                  onAdd={(name, code) => handleAddMapping('colours', { name, code })}
                />
              </div>
            )}

            {/* Accessory Category */}
            {isAccessory && selectedSub?.code === 'P' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thickness</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={var1}
                    onChange={e => setVar1(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pack Size (Optional)</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={var2}
                    onChange={e => setVar2(e.target.value)}
                    placeholder="e.g. 2"
                  />
                </div>
              </div>
            )}

            {isAccessory && selectedSub?.code === 'C' && (
              <ComboBox 
                label="Product Model"
                options={data?.models || []}
                value={var1}
                onChange={setVar1}
                onAdd={(name, code) => handleAddMapping('models', { name, code })}
              />
            )}

            {isAccessory && selectedSub?.code === 'W' && (
              <ComboBox 
                label="Colour"
                options={data?.colours || []}
                value={var1}
                onChange={setVar1}
                onAdd={(name, code) => handleAddMapping('colours', { name, code })}
              />
            )}

            <div className="pt-6">
              <button 
                onClick={handleSave}
                disabled={!result || !!result.error || saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Generate & Save SKU
              </button>
              {saveMessage && (
                <p className={`text-center mt-3 text-sm font-medium ${saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                  {saveMessage}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Right Preview */}
        <div className="sticky top-24 h-[fit-content]">
          <SkuReadout result={result} />
        </div>
      </div>
    </div>
  )
}
