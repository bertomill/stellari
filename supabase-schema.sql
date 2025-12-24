-- Stellari Database Schema
-- Run this in Supabase SQL Editor

-- Personas table
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT DEFAULT '',
  system_instructions TEXT NOT NULL,
  current_version INTEGER DEFAULT 1,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Persona versions table (for version history)
CREATE TABLE persona_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  system_instructions TEXT NOT NULL,
  form_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, version)
);

-- Knowledge sources table
CREATE TABLE knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('file', 'url', 'text')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tools table
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  schema JSONB DEFAULT '{}',
  is_built_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_personas_user_id ON personas(user_id);
CREATE INDEX idx_personas_share_id ON personas(share_id);
CREATE INDEX idx_persona_versions_persona_id ON persona_versions(persona_id);
CREATE INDEX idx_knowledge_sources_persona_id ON knowledge_sources(persona_id);
CREATE INDEX idx_tools_persona_id ON tools(persona_id);

-- Enable Row Level Security (RLS)
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Personas: Users can see their own personas + shared personas
CREATE POLICY "Users can view own personas" ON personas
  FOR SELECT USING (
    user_id IS NULL OR
    auth.uid() = user_id OR
    share_id IS NOT NULL
  );

CREATE POLICY "Users can insert own personas" ON personas
  FOR INSERT WITH CHECK (
    user_id IS NULL OR auth.uid() = user_id
  );

CREATE POLICY "Users can update own personas" ON personas
  FOR UPDATE USING (
    user_id IS NULL OR auth.uid() = user_id
  );

CREATE POLICY "Users can delete own personas" ON personas
  FOR DELETE USING (
    user_id IS NULL OR auth.uid() = user_id
  );

-- Persona versions: Follow parent persona permissions
CREATE POLICY "Users can view persona versions" ON persona_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = persona_versions.persona_id
      AND (personas.user_id IS NULL OR auth.uid() = personas.user_id OR personas.share_id IS NOT NULL)
    )
  );

CREATE POLICY "Users can insert persona versions" ON persona_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = persona_versions.persona_id
      AND (personas.user_id IS NULL OR auth.uid() = personas.user_id)
    )
  );

CREATE POLICY "Users can delete persona versions" ON persona_versions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = persona_versions.persona_id
      AND (personas.user_id IS NULL OR auth.uid() = personas.user_id)
    )
  );

-- Knowledge sources: Follow parent persona permissions
CREATE POLICY "Users can view knowledge sources" ON knowledge_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = knowledge_sources.persona_id
      AND (personas.user_id IS NULL OR auth.uid() = personas.user_id OR personas.share_id IS NOT NULL)
    )
  );

CREATE POLICY "Users can manage knowledge sources" ON knowledge_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = knowledge_sources.persona_id
      AND (personas.user_id IS NULL OR auth.uid() = personas.user_id)
    )
  );

-- Tools: Follow parent persona permissions
CREATE POLICY "Users can view tools" ON tools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = tools.persona_id
      AND (personas.user_id IS NULL OR auth.uid() = personas.user_id OR personas.share_id IS NOT NULL)
    )
  );

CREATE POLICY "Users can manage tools" ON tools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM personas
      WHERE personas.id = tools.persona_id
      AND (personas.user_id IS NULL OR auth.uid() = personas.user_id)
    )
  );
