'use client'

import { SkuResult } from '@/types'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function SkuReadout({ result }: { result: SkuResult | null }) {
  const [copied, setCopied] = useState(false)

  if (!result) {
    return (
      <div className="bg-slate-900 rounded-2xl p-8 h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 border border-slate-800">
        <p>Your generated SKU will appear here</p>
      </div>
    )
  }

  const handleCopy = () => {
    if (result.sku) {
      navigator.clipboard.writeText(result.sku)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 h-full border border-slate-800 flex flex-col relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></div>
      
      <div className="flex justify-between items-start mb-8">
        <h3 className="text-slate-400 font-medium text-sm tracking-widest uppercase">Live Preview</h3>
        {result.sku && (
          <button 
            onClick={handleCopy}
            className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg hover:bg-slate-700"
            title="Copy SKU"
          >
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center mb-8">
        {result.error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
            {result.error}
          </div>
        ) : (
          <div className="text-center space-y-8">
            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] break-all">
              {result.sku}
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {result.parts?.brand && <Part color="bg-purple-500/20 text-purple-300 border-purple-500/30" label="Brand" value={result.parts.brand} />}
              {result.parts?.category && <Part color="bg-green-500/20 text-green-300 border-green-500/30" label="Category" value={result.parts.category} />}
              {result.parts?.subcat && <Part color="bg-cyan-500/20 text-cyan-300 border-cyan-500/30" label="Sub-cat" value={result.parts.subcat} />}
              {result.parts?.product && <Part color="bg-blue-500/20 text-blue-300 border-blue-500/30" label="Product" value={result.parts.product} />}
              {result.parts?.var1 && <Part color="bg-pink-500/20 text-pink-300 border-pink-500/30" label="Var1" value={result.parts.var1} />}
              {result.parts?.var2 && <Part color="bg-yellow-500/20 text-yellow-300 border-yellow-500/30" label="Var2" value={result.parts.var2} />}
              {result.parts?.dims && <Part color="bg-orange-500/20 text-orange-300 border-orange-500/30" label="Dims" value={result.parts.dims} />}
              {result.parts?.serial && <Part color="bg-indigo-500/20 text-indigo-300 border-indigo-500/30" label="Serial" value={result.parts.serial} />}
            </div>
          </div>
        )}
      </div>
      
      {result.details && !result.error && (
        <div className="mt-auto pt-6 border-t border-slate-800">
          <p className="text-slate-400 text-sm text-center">
            {result.details}
          </p>
        </div>
      )}
    </div>
  )
}

function Part({ color, label, value }: { color: string, label: string, value: string }) {
  return (
    <div className={`px-3 py-1.5 rounded-lg border flex flex-col items-center ${color}`}>
      <span className="text-[10px] uppercase opacity-70 mb-0.5">{label}</span>
      <span className="font-mono font-bold text-base">{value}</span>
    </div>
  )
}
