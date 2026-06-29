'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Plus, Download, Upload } from 'lucide-react'

const TABS = [
  { id: 'categories', label: 'Categories' },
  { id: 'subcategories', label: 'Sub-Categories' },
  { id: 'products', label: 'Products' },
  { id: 'models', label: 'Cushion Models' },
  { id: 'colours', label: 'Colours' },
  { id: 'sizes', label: 'Sizes' },
  { id: 'reserved', label: 'Catalogue (Blocklist)' }
]

export default function MappingsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('categories')
  const [reservedCount, setReservedCount] = useState(0)
  const [uploadingBlocklist, setUploadingBlocklist] = useState(false)

  const loadData = async () => {
    try {
      const res = await fetch('/api/mappings')
      const json = await res.json()
      setData(json)
      
      const resCount = await fetch('/api/reserved-skus')
      if (resCount.ok) {
        const countJson = await resCount.json()
        setReservedCount(countJson.count || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdate = async (table: string, id: string, payload: any) => {
    try {
      await fetch('/api/mappings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id, data: payload })
      })
      // Optimistic update locally
      const updated = data[table].map((item: any) => item.id === id ? { ...item, ...payload } : item)
      setData({ ...data, [table]: updated })
    } catch (err) {
      console.error(err)
      loadData() // Revert
    }
  }

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to delete this row?')) return
    try {
      await fetch(`/api/mappings?table=${table}&id=${id}`, { method: 'DELETE' })
      setData({ ...data, [table]: data[table].filter((item: any) => item.id !== id) })
    } catch (err) {
      console.error(err)
    }
  }

  const handleAdd = async (table: string) => {
    const payload: any = { name: 'New Item', code: 'NEW' }
    if (table === 'categories') payload.type = 'colour'
    if (table === 'products') payload.category = 'Mattress'
    
    try {
      const res = await fetch('/api/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, data: payload })
      })
      if (res.ok) {
        await loadData() // Refresh to get the ID
      } else {
        const error = await res.json()
        alert(error.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const exportJSON = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tsc-mappings.json'
    a.click()
  }

  const handleUploadBlocklist = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingBlocklist(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string
        const lines = text.split(/\r?\n/)
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
        const skuIdx = headers.findIndex(h => h.includes('variantsku') || h === 'sku')
        
        if (skuIdx === -1) {
          alert('Could not find a "Variant SKU" or "SKU" column in the CSV.')
          setUploadingBlocklist(false)
          return
        }
        
        const skus = lines.slice(1).map(line => {
          const cols = line.split(',')
          return cols[skuIdx]?.trim()
        }).filter(Boolean)
        
        const res = await fetch('/api/reserved-skus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skus })
        })
        
        const resultData = await res.json()
        if (resultData.success) {
          alert(`Successfully imported ${resultData.count} SKUs to the blocklist.`)
          const resCount = await fetch('/api/reserved-skus')
          const countJson = await resCount.json()
          setReservedCount(countJson.count || 0)
        } else {
          alert(resultData.error)
        }
      } catch (err) {
        console.error(err)
        alert('Failed to process CSV')
      } finally {
        setUploadingBlocklist(false)
        if (e.target) e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>

  const currentData = data ? data[activeTab === 'models' ? 'models' : activeTab] || [] : []
  const dbTable = activeTab === 'models' ? 'models' : activeTab

  // Determine columns based on table
  let columns = ['name', 'code']
  if (activeTab === 'categories') columns = ['name', 'code', 'type']
  if (activeTab === 'products') columns = ['category', 'sub', 'name', 'code']

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={exportJSON} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border rounded hover:bg-slate-50 text-slate-700">
            <Download size={14} /> Export JSON
          </button>
          {/* Note: Import JSON skipped for simplicity, typically requires more complex validation */}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 capitalize text-lg">{TABS.find(t => t.id === activeTab)?.label}</h3>
          {activeTab !== 'reserved' && (
            <button 
              onClick={() => handleAdd(dbTable)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors"
            >
              <Plus size={16} /> Add Row
            </button>
          )}
        </div>

        {activeTab === 'reserved' ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-200 rounded-xl bg-slate-50/50">
            <div className="bg-blue-100 text-blue-800 text-4xl font-bold px-6 py-4 rounded-2xl mb-4 shadow-sm">
              {reservedCount.toLocaleString()}
            </div>
            <h4 className="text-lg font-semibold text-slate-800 mb-2">Reserved SKUs</h4>
            <p className="text-slate-500 max-w-md mb-8">
              These SKUs exist in your active/draft catalogue and will never be generated by the tool to prevent duplicates.
            </p>
            
            <label className={`cursor-pointer flex items-center gap-2 px-6 py-3 bg-slate-800 text-white hover:bg-slate-700 rounded-lg font-medium transition-colors ${uploadingBlocklist ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadingBlocklist ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {uploadingBlocklist ? 'Uploading...' : 'Upload Shopify CSV'}
              <input type="file" accept=".csv" className="hidden" onChange={handleUploadBlocklist} />
            </label>
            <p className="text-xs text-slate-400 mt-3">CSV must contain a "Variant SKU" column.</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-4 py-3 capitalize">{col}</th>
                ))}
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-400">No data found</td></tr>
              ) : (
                currentData.map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    {columns.map(col => (
                      <td key={col} className="p-0">
                        <input 
                          type="text"
                          defaultValue={row[col] || ''}
                          className="w-full px-4 py-3 bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                          onBlur={(e) => {
                            if (e.target.value !== (row[col] || '')) {
                              handleUpdate(dbTable, row.id, { [col]: e.target.value })
                            }
                          }}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleDelete(dbTable, row.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}
