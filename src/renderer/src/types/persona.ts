export interface PersonaVersion {
  id: string
  personaId: string
  version: number
  systemInstructions: string
  formData: Record<string, unknown>
  createdAt: Date
}

export interface KnowledgeSource {
  id: string
  name: string
  type: 'file' | 'url' | 'text'
  content: string
  createdAt: Date
}

export interface Tool {
  id: string
  name: string
  description: string
  schema: Record<string, unknown>
  isBuiltIn: boolean
}

export interface Persona {
  id: string
  name: string
  industry: string
  description: string
  systemInstructions: string
  versions: PersonaVersion[]
  knowledgeSources: KnowledgeSource[]
  tools: Tool[]
  currentVersion: number
  createdAt: Date
  updatedAt: Date
  userId?: string
  shareId?: string
}

export interface Industry {
  id: string
  name: string
  icon: string
  description: string
  suggestedFields: FormField[]
}

export interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'toggle'
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
  aiGenerated?: boolean
}
