'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { KeepInMind } from '@/components/KeepInMind'
import { Upload, Download, FileText, Check, AlertCircle, Save, Loader2 } from 'lucide-react'
import { SkuRow } from '@/types'

const EXAMPLE_CSV = `Category,Sub-Category,Product,Variation 1,Variation 2
Mattress,,Orthogrid,King(78*72),8
Chair,,Swill,Black,
Accessories,Pillow,Cervical,5,pack 2
Accessories,Cushion,Seat & Back,Ortho Pro,
Desk,,AeroPlus,White & Black,`

const TEMPLATE_CSV = `Category,Sub-Category,Product,Variation 1,Variation 2\n,,,,`

type ResultRow = {
  line: number
  sku?: string
  category: string
  product: string
  details?: string
  status: 'success' | 'error' | 'pending'
  message?: string
}

export default function CsvPage() {
  const [csvText, setCsvText] = useState('')
  const [results, setResults] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const normalizeHeader = (header: string) => {
    const h = header.toLowerCase().replace(/[-_ ]/g, '')
    if (['category', 'cat'].includes(h)) return 'category'
    if (['subcategory', 'subcat', 'sub'].includes(h)) return 'subcategory'
    if (['product', 'productname', 'pdt'].includes(h)) return 'product'
    if (['variation1', 'var1', 'v1'].includes(h)) return 'var1'
    if (['variation2', 'var2', 'v2'].includes(h)) return 'var2'
    return h
  }

  const processCsv = async () => {
    if (!csvText.trim()) return
    setLoading(true)
    setResults([])
    setSaveMessage('')

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: async (parsed) => {
        const rows: SkuRow[] = parsed.data.map((row: any) => ({
          category: row.category || '',
          subcategory: row.subcategory || '',
          product: row.product || '',
          var1: row.var1 || '',
          var2: row.var2 || ''
        }))

        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rows)
          })
          const data = await res.json()
          
          const newResults: ResultRow[] = (Array.isArray(data) ? data : [data]).map((r: any, i: number) => ({
            line: i + 1,
            sku: r.sku,
            category: rows[i].category,
            product: rows[i].product,
            details: r.details,
            status: r.error ? 'error' : 'success',
            message: r.error
          }))
          
          setResults(newResults)
        } catch (err: any) {
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      setCsvText(evt.target?.result as string)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  const handleSaveToHistory = async () => {
    const successful = results.filter(r => r.status === 'success' && r.sku)
    if (successful.length === 0) return
    
    setSaving(true)
    try {
      const payload = successful.map(r => ({
        sku: r.sku,
        category: r.category,
        product: r.product,
        details: r.details
      }))
      
      const res = await fetch('/api/sku-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to save')
      
      setSaveMessage(`Successfully saved ${successful.length} SKUs!`)
    } catch (err: any) {
      setSaveMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const downloadResults = () => {
    const headers = ['Line', 'Status', 'SKU', 'Category', 'Product', 'Details', 'Message']
    const csvContent = [
      headers.join(','),
      ...results.map(row => [
        row.line,
        row.status,
        row.sku || '',
        `"${row.category || ''}"`,
        `"${row.product || ''}"`,
        `"${row.details || ''}"`,
        `"${row.message || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SKU_Results_${new Date().getTime()}.csv`
    a.click()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <KeepInMind />

      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Bulk CSV Upload</h2>
            <p className="text-muted text-sm mt-1">Paste CSV data or upload a file. Header row is required.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCsvText(EXAMPLE_CSV)}
              className="text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <FileText size={16} /> Load Example
            </button>
            <button 
              onClick={() => {
                const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = 'Template.csv'; a.click()
              }}
              className="text-sm font-medium text-muted hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-border"
            >
              <Download size={16} /> Template
            </button>
          </div>
        </div>

        <textarea 
          className="w-full h-48 p-4 bg-navy border border-border rounded-xl font-mono text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
          placeholder="Category,Sub-Category,Product,Variation 1,Variation 2&#10;Mattress,,Orthogrid,King(78*72),8"
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
        />

        <div className="flex justify-between mt-4">
          <div>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-navy hover:bg-navy/80 border border-border text-foreground font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Upload size={18} /> Upload .csv
            </button>
          </div>
          <button 
            onClick={processCsv}
            disabled={!csvText.trim() || loading}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Process CSV'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-navy/50 flex justify-between items-center">
            <h3 className="font-heading font-bold text-foreground">Results ({results.length} rows)</h3>
            <div className="flex gap-2">
              <button 
                onClick={downloadResults}
                className="bg-card border border-border text-muted hover:bg-white/5 text-sm font-medium py-1.5 px-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download size={14} /> Download Results
              </button>
              <button 
                onClick={handleSaveToHistory}
                disabled={saving || results.filter(r => r.status === 'success').length === 0}
                className="bg-success hover:bg-success/90 disabled:opacity-50 text-navy text-sm font-bold py-1.5 px-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save {results.filter(r => r.status === 'success').length} to History
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className={`px-4 py-3 text-sm font-medium text-center ${saveMessage.includes('Successfully') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              {saveMessage}
            </div>
          )}

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-navy/50 text-muted sticky top-0 uppercase text-xs font-heading">
                <tr>
                  <th className="px-4 py-3 font-semibold">Row</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Details / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((r, i) => (
                  <tr key={i} className={r.status === 'error' ? 'bg-error/5 hover:bg-error/10' : 'hover:bg-navy/50'}>
                    <td className="px-4 py-3 text-muted">{r.line}</td>
                    <td className="px-4 py-3">
                      {r.status === 'success' ? (
                        <span className="flex items-center gap-1 text-success bg-success/10 px-2 py-1 rounded text-xs font-bold w-fit"><Check size={12}/> OK</span>
                      ) : (
                        <span className="flex items-center gap-1 text-error bg-error/10 px-2 py-1 rounded text-xs font-bold w-fit"><AlertCircle size={12}/> ERR</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-foreground">{r.sku || '-'}</td>
                    <td className="px-4 py-3">{r.product} <span className="text-xs text-muted block">{r.category}</span></td>
                    <td className={`px-4 py-3 ${r.status === 'error' ? 'text-error' : ''}`}>
                      {r.status === 'error' ? r.message : r.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
