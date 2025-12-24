import { Industry } from '@/types/persona'

interface IndustrySelectorProps {
  industries: Industry[]
  onSelect: (industry: Industry) => void
}

export function IndustrySelector({ industries, onSelect }: IndustrySelectorProps): JSX.Element {
  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold">Choose Your Industry</h2>
      <p className="mb-6 text-muted-foreground">
        Select an industry to get started with tailored questions and suggestions
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => (
          <button
            key={industry.id}
            onClick={() => onSelect(industry)}
            className="group rounded-lg border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-md"
          >
            <div className="mb-3 text-4xl">{industry.icon}</div>
            <h3 className="mb-1 font-semibold group-hover:text-primary">
              {industry.name}
            </h3>
            <p className="text-sm text-muted-foreground">{industry.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
