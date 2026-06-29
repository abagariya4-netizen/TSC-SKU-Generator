'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Plus, Loader2 } from 'lucide-react'

export interface ComboBoxOption {
  id?: string
  name: string
  code?: string
  [key: string]: any
}

interface ComboBoxProps {
  label?: string
  options: ComboBoxOption[]
  value: string
  onChange: (value: string) => void
  onAdd?: (name: string, code: string) => Promise<boolean>
  placeholder?: string
  disabled?: boolean
  showCode?: boolean
  allowAdd?: boolean
}

export function ComboBox({
  label,
  options,
  value,
  onChange,
  onAdd,
  placeholder = 'Select option...',
  disabled = false,
  showCode = true,
  allowAdd = true
}: ComboBoxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setAdding(false)
        setError('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase()) || 
    (opt.code && opt.code.toLowerCase().includes(search.toLowerCase()))
  )

  const exactMatch = options.find(opt => opt.name.toLowerCase() === search.toLowerCase())
  const showAddOption = allowAdd && search.trim() !== '' && !exactMatch && onAdd

  const selectedOption = options.find(opt => opt.name === value)

  const handleSelect = (val: string) => {
    onChange(val)
    setSearch('')
    setOpen(false)
  }

  const handleSaveNew = async () => {
    if (!onAdd || !search.trim()) return
    if (showCode && !newCode.trim()) {
      setError('Code is required')
      return
    }

    setLoading(true)
    setError('')
    try {
      const success = await onAdd(search.trim(), newCode.trim().toUpperCase())
      if (success) {
        onChange(search.trim())
        setOpen(false)
        setAdding(false)
        setSearch('')
        setNewCode('')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      
      <div 
        className={`flex items-center justify-between w-full p-3 bg-white border rounded-xl shadow-sm cursor-pointer transition-colors ${disabled ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'hover:border-slate-400'} ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300'}`}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className={selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <div className="flex items-center gap-2 text-slate-400">
          {selectedOption && showCode && selectedOption.code && (
            <span className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">{selectedOption.code}</span>
          )}
          <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto flex flex-col overflow-hidden">
          <div className="p-2 border-b sticky top-0 bg-white z-10">
            <input
              type="text"
              className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setAdding(false)
                setError('')
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="p-1">
            {filteredOptions.length === 0 && !showAddOption && (
              <div className="p-4 text-center text-sm text-slate-500">No results found</div>
            )}

            {filteredOptions.map((opt, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                onClick={() => handleSelect(opt.name)}
              >
                <span className={`text-sm ${value === opt.name ? 'font-semibold text-blue-600' : 'text-slate-700'}`}>
                  {opt.name}
                </span>
                <div className="flex items-center gap-2">
                  {showCode && opt.code && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{opt.code}</span>
                  )}
                  {value === opt.name && <Check size={16} className="text-blue-500" />}
                </div>
              </div>
            ))}

            {showAddOption && (
              <div className="mt-1 border-t p-2">
                {!adding ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setAdding(true)
                    }}
                    className="flex items-center w-full gap-2 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    <Plus size={16} />
                    Add &quot;{search}&quot;
                  </button>
                ) : (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Adding new item</p>
                    {showCode && (
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Short Code (Max 3 chars recommended)</label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 uppercase font-mono"
                          placeholder="e.g. BL"
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                          maxLength={5}
                          autoFocus
                        />
                      </div>
                    )}
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex gap-2 pt-1">
                      <button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                        onClick={handleSaveNew}
                        disabled={loading}
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save & Select'}
                      </button>
                      <button
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border text-sm font-medium py-2 rounded-lg transition-colors"
                        onClick={() => setAdding(false)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
