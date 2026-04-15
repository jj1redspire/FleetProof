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
  vehicleNumber: string,
  towMetadata?: Record<string, unknown> | null
): Promise<ConditionReport> {
  const positions = ['front', 'back', 'left side', 'right side'].slice(0, photos.length)

  const imageBlocks = buildImageContent(photos)
  const positionLabels = positions.map((p, i) => `Photo ${i + 1}: ${p}`).join(', ')

  const isTowing = !!towMetadata
  const towContext = isTowing ? `
TOWING CONTEXT:
- Tow reason: ${towMetadata?.tow_reason ?? 'unknown'}
- License plate: ${towMetadata?.vehicle_plate || 'not captured'}
- VIN: ${towMetadata?.vehicle_vin || 'not captured'}
- Keys status: ${towMetadata?.keys_status ?? 'unknown'}
- Hook-up point: ${towMetadata?.hook_up_point || 'not specified'}
- Witness: ${towMetadata?.witness_name ? `Yes — ${towMetadata.witness_name}` : 'None'}

As a tow pre-hook documentation record, be especially thorough about pre-existing damage — this documentation PROTECTS the tow operator from false damage claims.` : ''

  const prompt = `You are a professional ${isTowing ? 'tow operator' : 'fleet vehicle'} inspector documenting vehicle condition.
Vehicle: ${vehicleType} ${vehicleNumber ? `#${vehicleNumber}` : ''}
Photo positions: ${positionLabels}.
${towContext}
Identify:
1. Overall vehicle condition
2. Any visible damage, scratches, dents, cracks, broken glass, missing parts, fluid leaks
3. Notable observations per angle (be thorough — pre-existing damage must be documented)

Respond ONLY with valid JSON:
{
  "overall_condition": "good|minor_damage|needs_repair",
  "summary": "2 sentence summary of vehicle condition",
  "condition_items": [
    { "location": "front|back|left|right", "condition": "clean|minor_wear|damage|missing", "description": "specific observation" }
  ],
  "damage_visible": ["list of specific pre-existing damage items — empty array if none"],
  "notes": "any other notable observations including safety concerns"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          ...imageBlocks,
          { type: 'text', text: prompt },
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
  returnTime: string,
  towMetadata?: Record<string, unknown> | null
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

${towMetadata ? `TOWING CONTEXT:
This is a tow operation. The "checkout" photos were taken BEFORE hook-up (pre-tow documentation).
The "return" photos were taken at drop-off/release (post-tow documentation).
Tow reason: ${towMetadata.tow_reason ?? 'unknown'} | Driver: ${driverName}
Any new damage found MAY be attributable to the tow operation OR may have been pre-existing and missed.
Be conservative — only flag damage that is clearly NEW and not documented in the pre-tow photos.` : ''}

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
      "checkout_condition": "condition at checkout/pre-tow",
      "return_condition": "condition at return/post-tow"
    }
  ],
  "unchanged": ["list of areas confirmed unchanged"],
  "summary": "2-3 sentence summary of comparison findings",
  "attribution_statement": "Single sentence: e.g. ${towMetadata ? `Vehicle (plate: ${towMetadata.vehicle_plate || 'unknown'}) towed by ${driverName} at ${checkoutTime} was released at ${returnTime} with [damage description/no new damage].` : `Vehicle #${vehicleNumber} was returned by ${driverName} at ${returnTime} with [damage description] not present at checkout.`}"
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
