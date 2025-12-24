import { createClient } from '@supabase/supabase-js'
import { Persona, PersonaVersion, KnowledgeSource, Tool } from '@/types/persona'

const supabaseUrl = 'https://jjbqnpauxihobrtkfgql.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqYnFucGF1eGlob2JydGtmZ3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1ODYzOTcsImV4cCI6MjA4MjE2MjM5N30.C5hwZkP822kEEZ_VMpboXqMNdtsBAhmHmxJAJfJSON0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types matching our schema
export interface DbPersona {
  id: string
  name: string
  industry: string
  description: string
  system_instructions: string
  current_version: number
  user_id: string | null
  share_id: string | null
  created_at: string
  updated_at: string
}

export interface DbPersonaVersion {
  id: string
  persona_id: string
  version: number
  system_instructions: string
  form_data: Record<string, unknown>
  created_at: string
}

export interface DbKnowledgeSource {
  id: string
  persona_id: string
  name: string
  type: 'file' | 'url' | 'text'
  content: string
  created_at: string
}

export interface DbTool {
  id: string
  persona_id: string
  name: string
  description: string
  schema: Record<string, unknown>
  is_built_in: boolean
  created_at: string
}

// Convert database row to app type
function dbToPersona(
  db: DbPersona,
  versions: DbPersonaVersion[],
  knowledgeSources: DbKnowledgeSource[],
  tools: DbTool[]
): Persona {
  return {
    id: db.id,
    name: db.name,
    industry: db.industry,
    description: db.description,
    systemInstructions: db.system_instructions,
    currentVersion: db.current_version,
    userId: db.user_id || undefined,
    shareId: db.share_id || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
    versions: versions.map((v) => ({
      id: v.id,
      personaId: v.persona_id,
      version: v.version,
      systemInstructions: v.system_instructions,
      formData: v.form_data,
      createdAt: new Date(v.created_at)
    })),
    knowledgeSources: knowledgeSources.map((ks) => ({
      id: ks.id,
      name: ks.name,
      type: ks.type,
      content: ks.content,
      createdAt: new Date(ks.created_at)
    })),
    tools: tools.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      schema: t.schema,
      isBuiltIn: t.is_built_in
    }))
  }
}

// Fetch all personas for the current user (or anonymous)
export async function fetchPersonas(): Promise<Persona[]> {
  const { data: personas, error } = await supabase
    .from('personas')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching personas:', error)
    return []
  }

  // Fetch related data for each persona
  const results: Persona[] = []
  for (const p of personas || []) {
    const [versionsRes, sourcesRes, toolsRes] = await Promise.all([
      supabase.from('persona_versions').select('*').eq('persona_id', p.id).order('version', { ascending: false }),
      supabase.from('knowledge_sources').select('*').eq('persona_id', p.id),
      supabase.from('tools').select('*').eq('persona_id', p.id)
    ])

    results.push(
      dbToPersona(
        p,
        versionsRes.data || [],
        sourcesRes.data || [],
        toolsRes.data || []
      )
    )
  }

  return results
}

// Fetch a single persona by ID
export async function fetchPersonaById(id: string): Promise<Persona | null> {
  const { data: persona, error } = await supabase
    .from('personas')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !persona) {
    console.error('Error fetching persona:', error)
    return null
  }

  const [versionsRes, sourcesRes, toolsRes] = await Promise.all([
    supabase.from('persona_versions').select('*').eq('persona_id', id).order('version', { ascending: false }),
    supabase.from('knowledge_sources').select('*').eq('persona_id', id),
    supabase.from('tools').select('*').eq('persona_id', id)
  ])

  return dbToPersona(
    persona,
    versionsRes.data || [],
    sourcesRes.data || [],
    toolsRes.data || []
  )
}

// Fetch a persona by share ID (for public sharing)
export async function fetchPersonaByShareId(shareId: string): Promise<Persona | null> {
  const { data: persona, error } = await supabase
    .from('personas')
    .select('*')
    .eq('share_id', shareId)
    .single()

  if (error || !persona) {
    return null
  }

  const [versionsRes, sourcesRes, toolsRes] = await Promise.all([
    supabase.from('persona_versions').select('*').eq('persona_id', persona.id).order('version', { ascending: false }),
    supabase.from('knowledge_sources').select('*').eq('persona_id', persona.id),
    supabase.from('tools').select('*').eq('persona_id', persona.id)
  ])

  return dbToPersona(
    persona,
    versionsRes.data || [],
    sourcesRes.data || [],
    toolsRes.data || []
  )
}

// Save a persona (create or update)
export async function savePersona(persona: Persona): Promise<Persona | null> {
  const now = new Date().toISOString()

  // Upsert the persona
  const { error: personaError } = await supabase.from('personas').upsert({
    id: persona.id,
    name: persona.name,
    industry: persona.industry,
    description: persona.description,
    system_instructions: persona.systemInstructions,
    current_version: persona.currentVersion,
    user_id: persona.userId || null,
    share_id: persona.shareId || null,
    created_at: persona.createdAt.toISOString(),
    updated_at: now
  })

  if (personaError) {
    console.error('Error saving persona:', personaError)
    return null
  }

  // Save the latest version
  const latestVersion = persona.versions[persona.versions.length - 1]
  if (latestVersion) {
    const { error: versionError } = await supabase.from('persona_versions').upsert({
      id: latestVersion.id,
      persona_id: persona.id,
      version: latestVersion.version,
      system_instructions: latestVersion.systemInstructions,
      form_data: latestVersion.formData,
      created_at: latestVersion.createdAt.toISOString()
    })

    if (versionError) {
      console.error('Error saving version:', versionError)
    }
  }

  return fetchPersonaById(persona.id)
}

// Delete a persona
export async function deletePersona(id: string): Promise<boolean> {
  // Delete related data first (cascade should handle this, but being explicit)
  await Promise.all([
    supabase.from('persona_versions').delete().eq('persona_id', id),
    supabase.from('knowledge_sources').delete().eq('persona_id', id),
    supabase.from('tools').delete().eq('persona_id', id)
  ])

  const { error } = await supabase.from('personas').delete().eq('id', id)

  if (error) {
    console.error('Error deleting persona:', error)
    return false
  }

  return true
}

// Generate a share link for a persona
export async function generateShareLink(personaId: string): Promise<string | null> {
  const shareId = crypto.randomUUID().slice(0, 8)

  const { error } = await supabase
    .from('personas')
    .update({ share_id: shareId })
    .eq('id', personaId)

  if (error) {
    console.error('Error generating share link:', error)
    return null
  }

  return shareId
}

// Rollback to a specific version
export async function rollbackToVersion(personaId: string, version: number): Promise<Persona | null> {
  // Get the version to rollback to
  const { data: targetVersion, error: versionError } = await supabase
    .from('persona_versions')
    .select('*')
    .eq('persona_id', personaId)
    .eq('version', version)
    .single()

  if (versionError || !targetVersion) {
    console.error('Error finding version:', versionError)
    return null
  }

  // Get current persona to determine new version number
  const { data: persona } = await supabase
    .from('personas')
    .select('current_version')
    .eq('id', personaId)
    .single()

  const newVersion = (persona?.current_version || 0) + 1

  // Create a new version with the old content
  const { error: insertError } = await supabase.from('persona_versions').insert({
    id: crypto.randomUUID(),
    persona_id: personaId,
    version: newVersion,
    system_instructions: targetVersion.system_instructions,
    form_data: targetVersion.form_data,
    created_at: new Date().toISOString()
  })

  if (insertError) {
    console.error('Error creating rollback version:', insertError)
    return null
  }

  // Update persona with new version
  await supabase
    .from('personas')
    .update({
      system_instructions: targetVersion.system_instructions,
      current_version: newVersion,
      updated_at: new Date().toISOString()
    })
    .eq('id', personaId)

  return fetchPersonaById(personaId)
}
