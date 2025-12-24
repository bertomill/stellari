import { Persona } from '@/types/persona'

interface PersonaListProps {
  personas: Persona[]
  onSelect: (persona: Persona) => void
  onDelete: (persona: Persona) => void
}

export function PersonaList({ personas, onSelect, onDelete }: PersonaListProps): JSX.Element {
  if (personas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-6xl">✨</div>
        <h2 className="mb-2 text-xl font-semibold">No personas yet</h2>
        <p className="text-muted-foreground">
          Create your first AI persona to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {personas.map((persona) => (
        <div
          key={persona.id}
          className="group relative rounded-lg border bg-card p-4 transition-colors hover:bg-muted"
        >
          <button
            onClick={() => onSelect(persona)}
            className="w-full text-left"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded bg-secondary px-2 py-1 text-xs font-medium">
                {persona.industry}
              </span>
              <span className="text-xs text-muted-foreground">
                v{persona.currentVersion}
              </span>
            </div>
            <h3 className="mb-1 font-semibold">{persona.name}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {persona.description}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{persona.knowledgeSources.length} sources</span>
              <span>•</span>
              <span>{persona.tools.length} tools</span>
            </div>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(persona)
            }}
            className="absolute right-2 top-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
            title="Delete persona"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
