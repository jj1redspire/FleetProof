import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface ConditionItem {
  location: string // 'front' | 'back' | 'left' | 'right'
  condition: 'clean' | 'minor_wear' | 'damage' | 'missing'
  description: string
}

export interface ConditionReport {
  overall_condition: 'good' | 'minor_damage' | 'needs_repair'
  summary: string
  condition_items: ConditionItem[]
  damage_visible: string[]
  notes: string
}

export interface DamageItem {
  location: string
  description: string
  severity: 'minor' | 'moderate' | 'major'
  checkout_condition: string
  return_condition: string
}

export interface ComparisonResult {
  damage_detected: boolean
  new_damage: DamageItem[]
  unchanged: string[]
  summary: string
  attribution_statement: string
}

function buildImageContent(photos: string[]): Anthropic.ImageBlockParam[] {
  return photos.map(photo => {
    // photo is base64 data URL or raw base64
    const base64 = photo.startsWith('data:') ? photo.split(',')[1] : photo
    const mediaType = photo.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
    return {
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: mediaType as 'image/jpeg' | 'image/png', data: base64 },
    }
  })
}

export async function analyzeCondition(
  photos: string[],
  vehicleType: string,
  vehicleNumber: string
): Promise<ConditionReport> {
  const positions = ['front', 'back', 'left side', 'right side'].slice(0, photos.length)

  const imageBlocks = buildImageContent(photos)
  const positionLabels = positions.map((p, i) => `Photo ${i + 1}: ${p}`).join(', ')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          ...imageBlocks,
          {
            type: 'text',
            text: `You are a professional fleet vehicle inspector. Analyze these photos of ${vehicleType} #${vehicleNumber}.
Photo positions: ${positionLabels}.

Identify:
1. Overall vehicle condition
2. Any visible damage, scratches, dents, cracks, or missing parts
3. Notable observations per angle

Respond ONLY with valid JSON:
{
  "overall_condition": "good|minor_damage|needs_repair",
  "summary": "2 sentence summary of vehicle condition",
  "condition_items": [
    { "location": "front|back|left|right", "condition": "clean|minor_wear|damage|missing", "description": "specific observation" }
  ],
  "damage_visible": ["list of specific damage items if any — empty array if none"],
  "notes": "any other notable observations"
}`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in Claude analyze response')
  return JSON.parse(jsonMatch[0]) as ConditionReport
}

export async function compareSession(
  checkoutPhotos: string[],
  returnPhotos: string[],
  vehicleType: string,
  vehicleNumber: string,
  driverName: string,
  checkoutTime: string,
  returnTime: string
): Promise<ComparisonResult> {
  const checkoutImages = buildImageContent(checkoutPhotos)
  const returnImages = buildImageContent(returnPhotos)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: `CHECKOUT PHOTOS of ${vehicleType} #${vehicleNumber} (taken at ${checkoutTime}):` },
          ...checkoutImages,
          { type: 'text', text: `RETURN PHOTOS of the same vehicle (taken at ${returnTime}, returned by ${driverName}):` },
          ...returnImages,
          {
            type: 'text',
            text: `Compare these before/after vehicle photos and identify ANY new damage that occurred during this session.

Be specific about location and nature of damage. If the checkout photos show existing damage, do NOT flag it as new.
Only flag damage that appears in return photos but was NOT present in checkout photos.

Respond ONLY with valid JSON:
{
  "damage_detected": true|false,
  "new_damage": [
    {
      "location": "specific location (e.g. left rear fender, front bumper, roof)",
      "description": "specific description of damage",
      "severity": "minor|moderate|major",
      "checkout_condition": "condition at checkout",
      "return_condition": "condition at return"
    }
  ],
  "unchanged": ["list of areas confirmed unchanged"],
  "summary": "2-3 sentence summary of comparison findings",
  "attribution_statement": "Single sentence: e.g. Vehicle #47 was returned by John Smith at 2:15 PM with [damage description] not present at checkout."
}`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in Claude compare response')
  return JSON.parse(jsonMatch[0]) as ComparisonResult
}
