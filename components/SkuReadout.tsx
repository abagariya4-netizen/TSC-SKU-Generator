'use client'

import { SkuResult } from '@/types'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function SkuReadout({ result }: { result: SkuResult | null }) {
  const [copied, setCopied] = useState(false)

  if (!result) {
    return (
      <div className="bg-card rounded-2xl p-8 h-full min-h-[300px] flex flex-col items-center justify-center text-muted border border-border shadow-xl">
        <p className="font-medium">Your generated SKU will appear here</p>
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
    <div className="bg-card rounded-2xl p-6 h-full border border-border flex flex-col relative overflow-hidden shadow-2xl card-gradient-border">
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <h3 className="text-muted font-heading font-medium text-sm tracking-widest uppercase">Live Preview</h3>
        {result.sku && (
          <button 
            onClick={handleCopy}
            className="text-muted hover:text-white transition-colors bg-navy p-2 rounded-lg hover:bg-white/10 border border-border"
            title="Copy SKU"
          >
            {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center mb-8 relative z-10">
        {result.error ? (
          <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl text-center shadow-[0_0_20px_rgba(255,71,87,0.1)]">
            {result.error}
          </div>
        ) : (
          <div className="text-center space-y-8">
            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white glow-effect break-all">
              {result.sku}
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {result.parts?.brand && <Part color="bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]/30" label="Brand" value={result.parts.brand} />}
              {result.parts?.category && <Part color="bg-[#00D4AA]/20 text-[#00D4AA] border-[#00D4AA]/30" label="Category" value={result.parts.category} />}
              {result.parts?.subcat && <Part color="bg-[#00C896]/20 text-[#00C896] border-[#00C896]/30" label="Sub-cat" value={result.parts.subcat} />}
              {result.parts?.product && <Part color="bg-blue-500/20 text-blue-400 border-blue-500/30" label="Product" value={result.parts.product} />}
              {result.parts?.var1 && <Part color="bg-pink-500/20 text-pink-400 border-pink-500/30" label="Var1" value={result.parts.var1} />}
              {result.parts?.var2 && <Part color="bg-yellow-500/20 text-yellow-400 border-yellow-500/30" label="Var2" value={result.parts.var2} />}
              {result.parts?.dims && <Part color="bg-orange-500/20 text-orange-400 border-orange-500/30" label="Dims" value={result.parts.dims} />}
              {result.parts?.serial && <Part color="bg-indigo-500/20 text-indigo-400 border-indigo-500/30" label="Serial" value={result.parts.serial} />}
            </div>
          </div>
        )}
      </div>
      
      {result.details && !result.error && (
        <div className="mt-auto pt-6 border-t border-border relative z-10">
          <p className="text-muted text-sm text-center font-medium">
            {result.details}
          </p>
        </div>
      )}
    </div>
  )
}

function Part({ color, label, value }: { color: string, label: string, value: string }) {
  return (
    <div className={`px-3 py-1.5 rounded-lg border flex flex-col items-center backdrop-blur-md shadow-sm ${color}`}>
      <span className="text-[10px] uppercase font-bold opacity-80 mb-0.5 tracking-wider">{label}</span>
      <span className="font-mono font-bold text-base">{value}</span>
    </div>
  )
}
