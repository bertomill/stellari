import { useState } from 'react'
import { Industry, FormField } from '@/types/persona'
import { generatePersonaInstructions, generateFollowUpQuestions } from '@/lib/claude'

interface DynamicFormProps {
  industry: Industry
  initialData: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>, instructions: string) => void
  onBack: () => void
}

export function DynamicForm({ industry, initialData, onSubmit, onBack }: DynamicFormProps): JSX.Element {
  const [formData, setFormData] = useState<Record<string, unknown>>({
    name: '',
    description: '',
    ...initialData
  })
  const [fields, setFields] = useState<FormField[]>([
    { id: 'name', label: 'Persona Name', type: 'text', placeholder: 'e.g., Real Estate Assistant', required: true },
    { id: 'description', label: 'Brief Description', type: 'textarea', placeholder: 'What should this persona help with?' },
    ...industry.suggestedFields
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)

  const handleChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleGenerateMoreQuestions = async () => {
    setIsLoadingQuestions(true)
    try {
      const newQuestions = await generateFollowUpQuestions(industry.name, formData)
      setFields((prev) => [...prev, ...newQuestions])
    } catch (error) {
      console.error('Failed to generate questions:', error)
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    try {
      const instructions = await generatePersonaInstructions(industry.name, formData)
      onSubmit(formData, instructions)
    } catch (error) {
      console.error('Failed to generate instructions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''

    switch (field.type) {
      case 'select':
        return (
          <select
            id={field.id}
            value={value as string}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value as string}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )
      case 'toggle':
        return (
          <button
            type="button"
            onClick={() => handleChange(field.id, !value)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              value ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                value ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        )
      default:
        return (
          <input
            type="text"
            id={field.id}
            value={value as string}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">{industry.icon}</span>
        <div>
          <h2 className="text-2xl font-semibold">Configure {industry.name} Persona</h2>
          <p className="text-sm text-muted-foreground">
            Fill out the details below to generate your AI persona
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="mb-1.5 block text-sm font-medium">
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
              {field.aiGenerated && (
                <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                  AI Suggested
                </span>
              )}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <button
          type="button"
          onClick={handleGenerateMoreQuestions}
          disabled={isLoadingQuestions}
          className="mb-4 w-full rounded-md border border-dashed py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {isLoadingQuestions ? 'Generating questions...' : '+ Add more questions with AI'}
        </button>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isGenerating || !formData.name}
          className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isGenerating ? 'Generating Persona...' : 'Generate Persona'}
        </button>
      </div>
    </form>
  )
}
