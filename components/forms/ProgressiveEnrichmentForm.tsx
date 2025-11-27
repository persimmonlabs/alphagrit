'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

type Stage = 'url' | 'analysis' | 'authorization'

interface FormData {
  website_url: string
  email: string
  phone: string
  whatsapp: string
  instagram: string
  tiktok: string
  challenge: string
}

interface EnrichmentData {
  domain: string
  industry?: string
  tech_stack?: string[]
  employee_count?: string
  social_presence?: Record<string, boolean>
}

export default function ProgressiveEnrichmentForm({ locale }: { locale: string }) {
  const [stage, setStage] = useState<Stage>('url')
  const [formData, setFormData] = useState<FormData>({
    website_url: '',
    email: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    tiktok: '',
    challenge: '',
  })
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.website_url) return

    setIsAnalyzing(true)
    setStage('analysis')

    // Simulate enrichment API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock enrichment data
    const mockEnrichment: EnrichmentData = {
      domain: new URL(formData.website_url).hostname,
      industry: 'Technology',
      tech_stack: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
      employee_count: '10-50',
      social_presence: {
        linkedin: true,
        twitter: true,
        instagram: false,
      },
    }

    setEnrichmentData(mockEnrichment)
    setIsAnalyzing(false)

    // Transition to authorization after data displays
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setStage('authorization')
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          enrichment_data: enrichmentData,
          locale,
        }),
      })

      if (!response.ok) throw new Error('Submission failed')

      // Success - show completion state or redirect
      alert('STRATEGIC INTEL DELIVERY AUTHORIZED')
    } catch (error) {
      console.error('Submission error:', error)
      alert('TRANSMISSION FAILED. RETRY.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(#1A1A1A 1px, transparent 1px),
            linear-gradient(90deg, #1A1A1A 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* STAGE 1: URL ENTRY */}
          {stage === 'url' && (
            <motion.div
              key="url-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-screen items-center justify-center px-6"
            >
              <div className="w-full max-w-4xl">
                {/* Headline */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-heading text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-16 text-center leading-tight"
                >
                  REVEAL YOUR
                  <br />
                  <span className="text-neutral-500">STRATEGIC BLINDSPOTS</span>
                </motion.h1>

                {/* URL Input */}
                <form onSubmit={handleUrlSubmit}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    <div className="flex items-center border-b-2 border-white pb-2">
                      <span className="font-mono text-sm text-neutral-500 mr-4">&gt;</span>
                      <input
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                        placeholder="ENTER DOMAIN URL"
                        required
                        className="flex-1 bg-transparent outline-none font-mono text-xl md:text-2xl placeholder:text-neutral-700"
                        autoFocus
                      />
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="w-3 h-8 bg-white ml-2"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-center"
                  >
                    <button
                      type="submit"
                      className="font-mono text-sm text-neutral-500 hover:text-white transition-colors"
                    >
                      PRESS ENTER TO INITIATE SCAN
                    </button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: ANALYSIS */}
          {stage === 'analysis' && (
            <motion.div
              key="analysis-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-screen items-center justify-center px-6"
            >
              <div className="w-full max-w-4xl font-mono text-sm">
                {/* Analysis Header */}
                <div className="mb-8 border-b border-neutral-800 pb-4">
                  <div className="text-neutral-500">STRATEGIC ANALYSIS ENGINE</div>
                  <div className="text-white text-xl mt-2">{formData.website_url}</div>
                </div>

                {/* Data Cascade */}
                <div className="space-y-2">
                  {[
                    'INITIALIZING DEEP SCAN...',
                    'DOMAIN VERIFICATION: COMPLETE',
                    'EXTRACTING METADATA...',
                    'ANALYZING TECH STACK...',
                    'CROSS-REFERENCING INDUSTRY DATA...',
                    'EVALUATING DIGITAL FOOTPRINT...',
                    'ASSESSING COMPETITIVE LANDSCAPE...',
                    'CALCULATING STRATEGIC GAPS...',
                  ].map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="text-green-400"
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>

                {/* Enrichment Data Display */}
                {enrichmentData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="mt-12 border border-neutral-800 p-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-neutral-500 mb-1">DOMAIN</div>
                        <div className="text-white">{enrichmentData.domain}</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 mb-1">INDUSTRY</div>
                        <div className="text-white">{enrichmentData.industry}</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 mb-1">EMPLOYEE COUNT</div>
                        <div className="text-white">{enrichmentData.employee_count}</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 mb-1">TECH STACK</div>
                        <div className="text-white">{enrichmentData.tech_stack?.join(', ')}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* STAGE 3: AUTHORIZATION */}
          {stage === 'authorization' && (
            <motion.div
              key="authorization-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-screen items-center justify-center px-6 py-12"
            >
              <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="mb-12">
                  <div className="font-mono text-sm text-neutral-500 mb-2">PRELIMINARY DATA ACQUIRED</div>
                  <h2 className="font-heading text-4xl md:text-5xl tracking-tighter">
                    AUTHORIZE FULL
                    <br />
                    REPORT DELIVERY
                  </h2>
                </div>

                {/* Authorization Form */}
                <form onSubmit={handleFinalSubmit} className="space-y-8">
                  {/* Email & Phone */}
                  <div className="space-y-6">
                    <div className="text-neutral-500 font-mono text-xs uppercase tracking-wider">
                      WHERE TO SEND THE INTEL?
                    </div>

                    <div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="EMAIL ADDRESS"
                        required
                        className="w-full bg-transparent border-b border-neutral-800 pb-3 outline-none focus:border-white transition-colors font-mono text-lg"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="WHATSAPP (OPTIONAL)"
                        className="w-full bg-transparent border-b border-neutral-800 pb-3 outline-none focus:border-white transition-colors font-mono text-lg"
                      />
                    </div>
                  </div>

                  {/* Strategic Bottleneck */}
                  <div className="space-y-6">
                    <div className="text-neutral-500 font-mono text-xs uppercase tracking-wider">
                      DEFINE CURRENT STRATEGIC BOTTLENECK
                    </div>

                    <textarea
                      value={formData.challenge}
                      onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                      placeholder="What is preventing you from scaling right now?"
                      rows={4}
                      className="w-full bg-transparent border border-neutral-800 p-4 outline-none focus:border-white transition-colors font-mono text-sm resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="filled"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'TRANSMITTING...' : 'INITIATE STRATEGY'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
