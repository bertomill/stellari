import { useState } from 'react'

interface PersonaPreviewProps {
  instructions: string
  formData: Record<string, unknown>
  onSave: () => void
  onBack: () => void
  onEdit: (instructions: string) => void
}

export function PersonaPreview({
  instructions,
  formData,
  onSave,
  onBack,
  onEdit
}: PersonaPreviewProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [editedInstructions, setEditedInstructions] = useState(instructions)

  const handleSaveEdit = () => {
    onEdit(editedInstructions)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedInstructions(instructions)
    setIsEditing(false)
  }

  const handleExportMarkdown = () => {
    const markdown = `# ${formData.name || 'AI Persona'}

## Description
${formData.description || 'No description provided'}

## System Instructions

\`\`\`
${instructions}
\`\`\`

## Configuration

${Object.entries(formData)
  .filter(([key]) => !['name', 'description'].includes(key))
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n')}
`

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(formData.name as string) || 'persona'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold">Review Your Persona</h2>
      <p className="mb-6 text-muted-foreground">
        Review and edit the generated system instructions before saving
      </p>

      <div className="mb-6 rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-medium">System Instructions</h3>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="rounded px-3 py-1 text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded px-3 py-1 text-sm hover:bg-muted"
              >
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          {isEditing ? (
            <textarea
              value={editedInstructions}
              onChange={(e) => setEditedInstructions(e.target.value)}
              className="min-h-[300px] w-full rounded-md border bg-background p-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : (
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 font-mono text-sm">
              {instructions}
            </pre>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-medium">Configuration Summary</h3>
        <dl className="grid gap-2 text-sm">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <dt className="font-medium text-muted-foreground">{key}:</dt>
              <dd>{String(value) || '-'}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Back
        </button>
        <button
          onClick={handleExportMarkdown}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Export as Markdown
        </button>
        <button
          onClick={onSave}
          className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Save Persona
        </button>
      </div>
    </div>
  )
}
