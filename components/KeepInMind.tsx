import { AlertCircle } from 'lucide-react'

export function KeepInMind() {
  return (
    <div className="bg-card border-l-4 border-l-amber-500 border-y border-r border-border rounded-r-xl rounded-l-sm p-5 mb-8 shadow-sm">
      <div className="flex items-center gap-2 text-amber-500 font-semibold mb-3">
        <AlertCircle size={20} />
        <h2 className="text-sm uppercase tracking-wide font-heading">Keep in mind</h2>
      </div>
      <ul className="space-y-2 text-sm text-muted list-disc pl-5">
        <li>Every SKU must be <strong className="text-foreground">≤ 12 characters</strong> — anything longer is flagged as an error.</li>
        <li>Product codes are globally unique across all categories — the tool blocks a duplicate and tells you which product already owns that code.</li>
        <li>Custom dimensions code as <strong className="text-foreground">C</strong> (not the actual number) to keep the SKU short.</li>
        <li>Can&apos;t find a product, colour, or variation? Type the name in the field — a <strong className="text-primary">&quot;+ Add&quot;</strong> option will appear. Click it, enter a short code, and hit Save. It will be stored permanently and visible to all team members.</li>
      </ul>
    </div>
  )
}
