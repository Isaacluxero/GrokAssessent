import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEvalCases() {
  console.log('🌱 Seeding evaluation test cases...')

  try {
    // Check if evaluation cases already exist
    const existingCases = await prisma.evalCase.count()
    if (existingCases > 0) {
      console.log('📊 Evaluation cases already exist, skipping seed...')
      return
    }

    // Create sample evaluation test cases
    const testCases = [
      {
        name: 'Lead Scoring - SaaS VP Sales',
        description: 'Test lead scoring for a SaaS company VP of Sales',
        category: 'scoring' as const,
        input: {
          fullName: 'John Smith',
          title: 'VP of Sales',
          company: {
            name: 'TechCorp Solutions',
            industry: 'SaaS',
            size: 250,
            domain: 'techcorp.com'
          },
          source: 'outbound',
          notes: 'Interested in improving sales efficiency'
        },
        expectedOutput: {
          score: { type: 'number', min: 70, max: 100 },
          factors: {
            industryFit: { type: 'number', min: 80, max: 100 },
            sizeFit: { type: 'number', min: 70, max: 90 },
            titleFit: { type: 'number', min: 90, max: 100 },
            techSignals: { type: 'number', min: 60, max: 100 }
          },
          rationale: { type: 'string', minLength: 20 }
        },
        criteria: [
          {
            name: 'score_range',
            description: 'Score should be between 70-100 for high-fit leads',
            weight: 0.3,
            validator: 'custom' as const
          },
          {
            name: 'factors_structure',
            description: 'All scoring factors should be present',
            weight: 0.2,
            validator: 'contains' as const
          },
          {
            name: 'rationale_quality',
            description: 'Rationale should be clear and specific',
            weight: 0.3,
            validator: 'llm_judge' as const
          },
          {
            name: 'json_format',
            description: 'Output should be valid JSON',
            weight: 0.2,
            validator: 'exact_match' as const
          }
        ],
        metadata: {
          difficulty: 'medium',
          expectedDuration: 5000,
          tags: ['saas', 'vp-sales', 'high-fit']
        }
      },
      {
        name: 'Outreach Generation - Follow-up',
        description: 'Test outreach message generation for follow-up scenario',
        category: 'outreach' as const,
        input: {
          leadId: 'sample-lead-123',
          templateId: 'follow-up-template',
          context: 'Previous conversation about sales automation'
        },
        expectedOutput: {
          subject: { type: 'string', minLength: 5 },
          body: { type: 'string', minLength: 50 },
          safety: {
            piiLeak: { type: 'boolean', value: false },
            hallucinationRisk: { type: 'string', allowedValues: ['low', 'medium', 'high'] }
          }
        },
        criteria: [
          {
            name: 'subject_present',
            description: 'Subject line should be present and appropriate',
            weight: 0.2,
            validator: 'contains' as const
          },
          {
            name: 'body_length',
            description: 'Message body should be substantial',
            weight: 0.3,
            validator: 'custom' as const
          },
          {
            name: 'safety_checks',
            description: 'Safety checks should be performed',
            weight: 0.3,
            validator: 'contains' as const
          },
          {
            name: 'professional_tone',
            description: 'Message should maintain professional tone',
            weight: 0.2,
            validator: 'llm_judge' as const
          }
        ],
        metadata: {
          difficulty: 'easy',
          expectedDuration: 3000,
          tags: ['follow-up', 'professional', 'safety']
        }
      },
      {
        name: 'General AI - Hello World',
        description: 'Basic AI response test',
        category: 'general' as const,
        input: {
          prompt: 'Say hello world in a friendly way'
        },
        expectedOutput: {
          response: { type: 'string', contains: 'hello' }
        },
        criteria: [
          {
            name: 'contains_hello',
            description: 'Response should contain the word hello',
            weight: 0.6,
            validator: 'contains' as const
          },
          {
            name: 'friendly_tone',
            description: 'Response should be friendly',
            weight: 0.4,
            validator: 'llm_judge' as const
          }
        ],
        metadata: {
          difficulty: 'easy',
          expectedDuration: 1000,
          tags: ['basic', 'hello-world', 'tone']
        }
      }
    ]

    // Create test cases
    for (const testCase of testCases) {
      await prisma.evalCase.create({
        data: testCase
      })
    }

    console.log(`✅ Created ${testCases.length} evaluation test cases`)

  } catch (error) {
    console.error('❌ Failed to seed evaluation test cases:', error)
    throw error
  }
}

// Run the seed function
seedEvalCases()
  .then(async () => {
    await prisma.$disconnect()
    console.log('🚀 Evaluation test cases seeded successfully!')
  })
  .catch(async (e) => {
    console.error('💥 Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
