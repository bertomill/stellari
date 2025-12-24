import { useState } from 'react'
import { Persona, Industry } from '@/types/persona'
import { IndustrySelector } from './IndustrySelector'
import { DynamicForm } from './DynamicForm'
import { PersonaPreview } from './PersonaPreview'

const INDUSTRIES: Industry[] = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: '🏠',
    description: 'Property sales, rentals, and real estate services',
    suggestedFields: [
      { id: 'specialty', label: 'Specialty', type: 'select', options: [
        { value: 'residential', label: 'Residential' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'luxury', label: 'Luxury' },
        { value: 'rentals', label: 'Rentals' }
      ]},
      { id: 'tone', label: 'Communication Tone', type: 'select', options: [
        { value: 'professional', label: 'Professional' },
        { value: 'friendly', label: 'Friendly & Approachable' },
        { value: 'luxury', label: 'Luxury & Exclusive' }
      ]},
      { id: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., First-time homebuyers, investors' }
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: '💪',
    description: 'Personal training, wellness, and fitness coaching',
    suggestedFields: [
      { id: 'specialty', label: 'Specialty', type: 'select', options: [
        { value: 'personal-training', label: 'Personal Training' },
        { value: 'nutrition', label: 'Nutrition Coaching' },
        { value: 'yoga', label: 'Yoga & Mindfulness' },
        { value: 'sports', label: 'Sports Performance' }
      ]},
      { id: 'tone', label: 'Coaching Style', type: 'select', options: [
        { value: 'motivational', label: 'Motivational & Energetic' },
        { value: 'supportive', label: 'Supportive & Understanding' },
        { value: 'strict', label: 'Disciplined & Direct' }
      ]},
      { id: 'targetAudience', label: 'Target Clients', type: 'text', placeholder: 'e.g., Beginners, athletes, seniors' }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    description: 'Medical practices, clinics, and health services',
    suggestedFields: [
      { id: 'specialty', label: 'Medical Specialty', type: 'text', placeholder: 'e.g., General Practice, Dermatology' },
      { id: 'tone', label: 'Communication Style', type: 'select', options: [
        { value: 'empathetic', label: 'Empathetic & Caring' },
        { value: 'informative', label: 'Informative & Educational' },
        { value: 'professional', label: 'Clinical & Professional' }
      ]},
      { id: 'compliance', label: 'Compliance Notes', type: 'textarea', placeholder: 'Any specific compliance requirements...' }
    ]
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: '⚖️',
    description: 'Law firms and legal services',
    suggestedFields: [
      { id: 'specialty', label: 'Practice Area', type: 'text', placeholder: 'e.g., Family Law, Corporate Law' },
      { id: 'tone', label: 'Communication Style', type: 'select', options: [
        { value: 'formal', label: 'Formal & Authoritative' },
        { value: 'accessible', label: 'Accessible & Clear' }
      ]},
      { id: 'jurisdiction', label: 'Jurisdiction', type: 'text', placeholder: 'e.g., California, Federal' }
    ]
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '✨',
    description: 'Build a custom persona from scratch',
    suggestedFields: []
  }
]

interface PersonaBuilderProps {
  persona: Persona | null
  onSave: (persona: Persona) => void
  onCancel: () => void
}

export function PersonaBuilder({ persona, onSave, onCancel }: PersonaBuilderProps): JSX.Element {
  const [step, setStep] = useState<'industry' | 'form' | 'preview'>(
    persona ? 'form' : 'industry'
  )
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(
    persona ? INDUSTRIES.find((i) => i.id === persona.industry) || null : null
  )
  const [formData, setFormData] = useState<Record<string, unknown>>(
    persona?.versions[persona.currentVersion - 1]?.formData || {}
  )
  const [generatedInstructions, setGeneratedInstructions] = useState<string>(
    persona?.systemInstructions || ''
  )

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry)
    setStep('form')
  }

  const handleFormSubmit = (data: Record<string, unknown>, instructions: string) => {
    setFormData(data)
    setGeneratedInstructions(instructions)
    setStep('preview')
  }

  const handleSave = () => {
    if (!selectedIndustry) return

    const now = new Date()
    const newVersion = persona ? persona.currentVersion + 1 : 1

    const newPersona: Persona = {
      id: persona?.id || crypto.randomUUID(),
      name: (formData.name as string) || `${selectedIndustry.name} Persona`,
      industry: selectedIndustry.id,
      description: (formData.description as string) || '',
      systemInstructions: generatedInstructions,
      versions: [
        ...(persona?.versions || []),
        {
          id: crypto.randomUUID(),
          personaId: persona?.id || '',
          version: newVersion,
          systemInstructions: generatedInstructions,
          formData,
          createdAt: now
        }
      ],
      knowledgeSources: persona?.knowledgeSources || [],
      tools: persona?.tools || [],
      currentVersion: newVersion,
      createdAt: persona?.createdAt || now,
      updatedAt: now
    }

    onSave(newPersona)
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {['industry', 'form', 'preview'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : i < ['industry', 'form', 'preview'].indexOf(step)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div
                className={`mx-2 h-0.5 w-12 ${
                  i < ['industry', 'form', 'preview'].indexOf(step)
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 'industry' && (
        <IndustrySelector
          industries={INDUSTRIES}
          onSelect={handleIndustrySelect}
        />
      )}

      {step === 'form' && selectedIndustry && (
        <DynamicForm
          industry={selectedIndustry}
          initialData={formData}
          onSubmit={handleFormSubmit}
          onBack={() => setStep('industry')}
        />
      )}

      {step === 'preview' && (
        <PersonaPreview
          instructions={generatedInstructions}
          formData={formData}
          onSave={handleSave}
          onBack={() => setStep('form')}
          onEdit={setGeneratedInstructions}
        />
      )}
    </div>
  )
}
