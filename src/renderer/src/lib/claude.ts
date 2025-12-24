import Anthropic from '@anthropic-ai/sdk'
import { FormField } from '@/types/persona'

// Will be configured via environment or settings
let anthropicClient: Anthropic | null = null

export function initializeAnthropic(apiKey: string): void {
  anthropicClient = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true // For Electron renderer process
  })
}

export async function generatePersonaInstructions(
  industry: string,
  formData: Record<string, unknown>
): Promise<string> {
  if (!anthropicClient) {
    // Return a placeholder if API not configured
    return generatePlaceholderInstructions(industry, formData)
  }

  const prompt = `You are an expert at creating AI persona system instructions. Based on the following information, generate comprehensive system instructions for an AI assistant.

Industry: ${industry}

Configuration:
${Object.entries(formData)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

Generate detailed system instructions that:
1. Define the persona's role and expertise
2. Set the appropriate tone and communication style
3. Establish boundaries and limitations
4. Include industry-specific knowledge and best practices
5. Define how to handle common scenarios

Output ONLY the system instructions, no additional commentary.`

  const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  })

  const textContent = response.content.find((c) => c.type === 'text')
  return textContent?.text || ''
}

export async function generateFollowUpQuestions(
  industry: string,
  currentData: Record<string, unknown>
): Promise<FormField[]> {
  if (!anthropicClient) {
    // Return placeholder questions if API not configured
    return generatePlaceholderQuestions(industry)
  }

  const prompt = `You are helping configure an AI persona for the ${industry} industry.

Current configuration:
${Object.entries(currentData)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

Generate 2-3 additional relevant questions that would help create a more tailored AI persona. These should be questions not already covered by the current configuration.

Respond in JSON format:
[
  {
    "id": "unique_id",
    "label": "Question label",
    "type": "text|textarea|select",
    "placeholder": "Optional placeholder",
    "options": [{"value": "val", "label": "Label"}] // Only for select type
  }
]`

  const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })

  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent?.text) return []

  try {
    const questions = JSON.parse(textContent.text)
    return questions.map((q: FormField) => ({ ...q, aiGenerated: true }))
  } catch {
    return []
  }
}

function generatePlaceholderInstructions(
  industry: string,
  formData: Record<string, unknown>
): string {
  return `You are an AI assistant specialized in the ${industry} industry.

## Role
${formData.description || `You help users with ${industry}-related questions and tasks.`}

## Communication Style
- Tone: ${formData.tone || 'Professional and helpful'}
- Target Audience: ${formData.targetAudience || 'General users'}

## Expertise
- Specialty: ${formData.specialty || industry}
${Object.entries(formData)
  .filter(([key]) => !['name', 'description', 'tone', 'targetAudience', 'specialty'].includes(key))
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

## Guidelines
1. Always be helpful and informative
2. Stay within your area of expertise
3. Ask clarifying questions when needed
4. Provide actionable advice when possible

Note: Connect your Anthropic API key to generate more detailed, customized instructions.`
}

function generatePlaceholderQuestions(industry: string): FormField[] {
  return [
    {
      id: `${industry}-additional-1`,
      label: 'What topics should this persona avoid discussing?',
      type: 'textarea',
      placeholder: 'e.g., Competitor products, pricing negotiations',
      aiGenerated: true
    },
    {
      id: `${industry}-additional-2`,
      label: 'Should the persona proactively suggest related services?',
      type: 'toggle',
      aiGenerated: true
    }
  ]
}
