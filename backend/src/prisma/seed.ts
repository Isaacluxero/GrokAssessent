/**
 * Database Seed Script
 * 
 * Populates the database with sample data for development and demo purposes.
 * This script creates sample companies, leads, templates, and scoring profiles.
 * It checks for existing data to prevent duplicate creation errors.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Check if data already exists
  const existingCompanies = await prisma.company.count()
  if (existingCompanies > 0) {
    console.log('📊 Database already contains data, skipping main seed...')
  } else {
    // Create sample companies
    const companies = await Promise.all([
      prisma.company.create({
        data: {
          name: 'TechCorp Solutions',
          domain: 'techcorp.com',
          size: 250,
          industry: 'SaaS'
        }
      }),
      prisma.company.create({
        data: {
          name: 'DataFlow Analytics',
          domain: 'dataflow.io',
          size: 120,
          industry: 'Data Analytics'
        }
      }),
      prisma.company.create({
        data: {
          name: 'CloudScale Systems',
          domain: 'cloudscale.net',
          size: 500,
          industry: 'Cloud Infrastructure'
        }
      }),
      prisma.company.create({
        data: {
          name: 'GrowthFirst Marketing',
          domain: 'growthfirst.com',
          size: 75,
          industry: 'Digital Marketing'
        }
      }),
      prisma.company.create({
        data: {
          name: 'SecureNet Security',
          domain: 'securenet.com',
          size: 180,
          industry: 'Cybersecurity'
        }
      })
    ])

    console.log(`✅ Created ${companies.length} companies`)

    // Create sample leads
    const leads = await Promise.all([
      prisma.lead.create({
        data: {
          companyId: companies[0].id,
          fullName: 'John Smith',
          title: 'VP of Sales',
          email: 'john.smith@techcorp.com',
          linkedinUrl: 'https://linkedin.com/in/johnsmith',
          source: 'outbound',
          score: 85,
          scoreBreakdown: {
            industryFit: 90,
            sizeFit: 85,
            titleFit: 95,
            techSignals: 80
          },
          stage: 'QUALIFIED',
          notes: 'Interested in improving sales efficiency'
        }
      }),
      prisma.lead.create({
        data: {
          companyId: companies[1].id,
          fullName: 'Sarah Johnson',
          title: 'Head of Data Science',
          email: 'sarah.johnson@dataflow.io',
          linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
          source: 'inbound',
          score: 92,
          scoreBreakdown: {
            industryFit: 95,
            sizeFit: 90,
            titleFit: 90,
            techSignals: 95
          },
          stage: 'OUTREACH',
          notes: 'Looking for data pipeline optimization'
        }
      }),
      prisma.lead.create({
        data: {
          companyId: companies[2].id,
          fullName: 'Michael Chen',
          title: 'CTO',
          email: 'michael.chen@cloudscale.net',
          linkedinUrl: 'https://linkedin.com/in/michaelchen',
          source: 'outbound',
          score: 78,
          scoreBreakdown: {
            industryFit: 85,
            sizeFit: 75,
            titleFit: 90,
            techSignals: 70
          },
          stage: 'NEW',
          notes: 'Exploring automation solutions'
        }
      }),
      prisma.lead.create({
        data: {
          companyId: companies[3].id,
          fullName: 'Emily Rodriguez',
          title: 'Marketing Director',
          email: 'emily.rodriguez@growthfirst.com',
          linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
          source: 'inbound',
          score: 65,
          scoreBreakdown: {
            industryFit: 70,
            sizeFit: 80,
            titleFit: 75,
            techSignals: 50
          },
          stage: 'REPLIED',
          notes: 'Scheduled demo for next week'
        }
      }),
      prisma.lead.create({
        data: {
          companyId: companies[4].id,
          fullName: 'David Kim',
          title: 'Security Engineer',
          email: 'david.kim@securenet.com',
          linkedinUrl: 'https://linkedin.com/in/davidkim',
          source: 'outbound',
          score: 88,
          scoreBreakdown: {
            industryFit: 90,
            sizeFit: 85,
            titleFit: 80,
            techSignals: 95
          },
          stage: 'MEETING_SCHEDULED',
          notes: 'Demo scheduled for Friday 2pm'
        }
      })
    ])

    console.log(`✅ Created ${leads.length} leads`)

    // Create sample message templates
    const templates = await Promise.all([
      prisma.messageTemplate.create({
        data: {
          name: 'Cold Outreach - VP Sales',
          body: 'Hi {{firstName}},\n\nI noticed {{companyName}} is growing rapidly in the {{industry}} space. Many companies like yours are struggling with {{painPoint}}.\n\nOur solution has helped similar companies achieve {{valueProp}}.\n\nWould you be interested in a 15-minute chat to explore if this could work for {{companyName}}?\n\nBest regards,\n{{senderName}}'
        }
      }),
      prisma.messageTemplate.create({
        data: {
          name: 'Follow-up - No Response',
          body: 'Hi {{firstName}},\n\nI wanted to follow up on my previous email about {{valueProp}} for {{companyName}}.\n\nI understand you\'re busy, so I\'ll keep this brief. Would a 10-minute call work better for you?\n\nIf not, just let me know and I\'ll remove you from our list.\n\nThanks,\n{{senderName}}'
        }
      }),
      prisma.messageTemplate.create({
        data: {
          name: 'Meeting Confirmation',
          body: 'Hi {{firstName}},\n\nGreat! I\'m looking forward to our {{meetingType}} on {{meetingDate}} at {{meetingTime}}.\n\nWe\'ll discuss how {{companyName}} can achieve {{valueProp}} and address your {{painPoint}} challenges.\n\nI\'ll send a calendar invite shortly. Let me know if you need to reschedule.\n\nBest regards,\n{{senderName}}'
        }
      })
    ])

    console.log(`✅ Created ${templates.length} message templates`)

    // Create sample scoring profiles
    const scoringProfiles = await Promise.all([
      prisma.scoringProfile.create({
        data: {
          name: 'High-Growth SaaS',
          weights: {
            industryFit: 0.3,
            sizeFit: 0.2,
            titleFit: 0.3,
            techSignals: 0.2
          },
          rules: {
            mustHave: ['domain', 'title includes VP/Head/CTO'],
            preferred: ['industry in SaaS/Data/Cloud', 'size 50-2000']
          }
        }
      }),
      prisma.scoringProfile.create({
        data: {
          name: 'Enterprise Focus',
          weights: {
            industryFit: 0.25,
            sizeFit: 0.4,
            titleFit: 0.25,
            techSignals: 0.1
          },
          rules: {
            mustHave: ['size > 500', 'title includes C-level/VP'],
            preferred: ['industry in Tech/Finance/Healthcare']
          }
        }
      })
    ])

    console.log(`✅ Created ${scoringProfiles.length} scoring profiles`)

    // Create sample interactions
    const interactions = await Promise.all([
      prisma.interaction.create({
        data: {
          leadId: leads[1].id,
          type: 'email_sent',
          payload: { templateId: templates[0].id, subject: 'Improving Data Pipeline Efficiency' }
        }
      }),
      prisma.interaction.create({
        data: {
          leadId: leads[3].id,
          type: 'reply',
          payload: { message: 'Interested in learning more. Can we schedule a demo?' }
        }
      }),
      prisma.interaction.create({
        data: {
          leadId: leads[4].id,
          type: 'meeting',
          payload: { scheduledFor: '2024-01-19T14:00:00Z', duration: 30 }
        }
      })
    ])

    console.log(`✅ Created ${interactions.length} interactions`)

    // Create sample messages
    const messages = await Promise.all([
      prisma.message.create({
        data: {
          leadId: leads[1].id,
          direction: 'outbound',
          channel: 'email',
          subject: 'Improving Data Pipeline Efficiency',
          body: 'Hi Sarah,\n\nI noticed DataFlow Analytics is growing rapidly...',
          status: 'sent',
          meta: { templateId: templates[0].id }
        }
      }),
      prisma.message.create({
        data: {
          leadId: leads[3].id,
          direction: 'inbound',
          channel: 'email',
          subject: 'Re: Marketing Automation Demo',
          body: 'Hi there,\n\nInterested in learning more...',
          status: 'received'
        }
      })
    ])

    console.log(`✅ Created ${messages.length} messages`)
  }

  // Always run evaluation seed (it has its own duplicate checking)
  console.log('🌱 Seeding evaluation test cases...')
  try {
    await seedEvalCases()
  } catch (error) {
    console.error('❌ Error seeding evaluation cases:', error)
  }

  console.log('🎉 Database seeding completed successfully!')
}

// Import and run evaluation seed function
async function seedEvalCases() {
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
      },
      {
        name: 'Lead Qualification - Enterprise CTO',
        description: 'Test lead qualification for enterprise CTO',
        category: 'qualification' as const,
        input: {
          fullName: 'Michael Chen',
          title: 'CTO',
          company: {
            name: 'CloudScale Systems',
            industry: 'Cloud Infrastructure',
            size: 500,
            domain: 'cloudscale.net'
          },
          source: 'outbound',
          notes: 'Exploring automation solutions'
        },
        expectedOutput: {
          qualified: { type: 'boolean', value: true },
          confidence: { type: 'number', min: 0.7, max: 1.0 },
          reasoning: { type: 'string', minLength: 30 },
          nextSteps: { type: 'array', minLength: 1 }
        },
        criteria: [
          {
            name: 'qualification_decision',
            description: 'Should correctly identify enterprise CTO as qualified',
            weight: 0.4,
            validator: 'exact_match' as const
          },
          {
            name: 'confidence_score',
            description: 'Confidence should be high for clear enterprise fit',
            weight: 0.3,
            validator: 'custom' as const
          },
          {
            name: 'reasoning_quality',
            description: 'Reasoning should be logical and specific',
            weight: 0.3,
            validator: 'llm_judge' as const
          }
        ],
        metadata: {
          difficulty: 'medium',
          expectedDuration: 4000,
          tags: ['enterprise', 'cto', 'qualification']
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

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
