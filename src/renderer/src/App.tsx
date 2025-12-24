import { useState, useEffect } from 'react'
import { PersonaBuilder } from '@/components/PersonaBuilder'
import { PersonaList } from '@/components/PersonaList'
import { Persona } from '@/types/persona'
import { fetchPersonas, savePersona, deletePersona } from '@/lib/supabase'

function App(): JSX.Element {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [view, setView] = useState<'list' | 'builder'>('list')
  const [isLoading, setIsLoading] = useState(true)

  // Load personas from Supabase on mount
  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    setIsLoading(true)
    const data = await fetchPersonas()
    setPersonas(data)
    setIsLoading(false)
  }

  const handleCreateNew = () => {
    setSelectedPersona(null)
    setView('builder')
  }

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona)
    setView('builder')
  }

  const handleSavePersona = async (persona: Persona) => {
    const saved = await savePersona(persona)
    if (saved) {
      setPersonas((prev) => {
        const exists = prev.find((p) => p.id === saved.id)
        if (exists) {
          return prev.map((p) => (p.id === saved.id ? saved : p))
        }
        return [...prev, saved]
      })
    }
    setView('list')
  }

  const handleDeletePersona = async (persona: Persona) => {
    const confirmed = window.confirm(`Delete "${persona.name}"? This cannot be undone.`)
    if (confirmed) {
      const success = await deletePersona(persona.id)
      if (success) {
        setPersonas((prev) => prev.filter((p) => p.id !== persona.id))
      }
    }
  }

  const handleBack = () => {
    setView('list')
    setSelectedPersona(null)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Stellari</h1>
          {view === 'list' && (
            <button
              onClick={handleCreateNew}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create New Persona
            </button>
          )}
          {view === 'builder' && (
            <button
              onClick={handleBack}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Back to List
            </button>
          )}
        </div>
      </header>

      <main className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">Loading personas...</div>
          </div>
        ) : view === 'list' ? (
          <PersonaList
            personas={personas}
            onSelect={handleSelectPersona}
            onDelete={handleDeletePersona}
          />
        ) : (
          <PersonaBuilder
            persona={selectedPersona}
            onSave={handleSavePersona}
            onCancel={handleBack}
          />
        )}
      </main>
    </div>
  )
}

export default App
