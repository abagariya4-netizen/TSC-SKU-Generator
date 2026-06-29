import { AlertCircle } from 'lucide-react'

export function KeepInMind() {
  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 mb-8 shadow-sm">
      <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
        <AlertCircle size={20} />
        <h2 className="text-sm uppercase tracking-wide">Keep in mind</h2>
      </div>
      <ul className="space-y-2 text-sm text-blue-900/80 list-disc pl-5">
        <li>Every SKU must be <strong>≤ 12 characters</strong> — anything longer is flagged as an error.</li>
        <li>Product codes are globally unique across all categories — the tool blocks a duplicate and tells you which product already owns that code.</li>
        <li>Custom dimensions code as <strong>C</strong> (not the actual number) to keep the SKU short.</li>
        <li>Can&apos;t find a product, colour, or variation? Type the name in the field — a <strong>&quot;+ Add&quot;</strong> option will appear. Click it, enter a short code, and hit Save. It will be stored permanently and visible to all team members.</li>
      </ul>
    </div>
  )
}
