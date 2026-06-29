'use client'

import { useState, useEffect } from 'react'
import { Loader2, Copy, Download } from 'lucide-react'
import { SkuHistory } from '@/types'

export default function HistoryPage() {
  const [history, setHistory] = useState<SkuHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sku-history')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadCSV = () => {
    const headers = ['SKU', 'Category', 'Product', 'Details', 'Generated At']
    const csvContent = [
      headers.join(','),
      ...history.map(row => [
        row.sku,
        `"${row.category || ''}"`,
        `"${row.product || ''}"`,
        `"${row.details || ''}"`,
        new Date(row.created_at).toLocaleString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `SKU_History_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-900">Generated SKUs History</h2>
        <button 
          onClick={downloadCSV}
          disabled={history.length === 0}
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">SKU</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Details</th>
              <th className="px-6 py-4 font-semibold">Generated</th>
              <th className="px-6 py-4 font-semibold w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No SKUs generated yet</td>
              </tr>
            ) : (
              history.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{row.sku}</td>
                  <td className="px-6 py-4">{row.category}</td>
                  <td className="px-6 py-4">{row.product}</td>
                  <td className="px-6 py-4">{row.details}</td>
                  <td className="px-6 py-4">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleCopy(row.sku)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Copy SKU"
                    >
                      <Copy size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
