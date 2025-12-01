'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  BookOpen,
  Wand2,
  FileUp,
  ChevronRight,
  Zap,
  ImageOff,
} from 'lucide-react'

// API base URL - configurable via env
const EBOOK_GENERATOR_API = process.env.NEXT_PUBLIC_EBOOK_GENERATOR || 'http://localhost:8000'

type GenerationMode = 'pdf' | 'ai' | null
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface Job {
  job_id: string
  status: JobStatus
  progress: number
  current_step: string
  ebook_id: string | null
  error: string | null
}

export default function GenerateEbookPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<GenerationMode>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  // PDF mode state
  const [pdfEn, setPdfEn] = useState<File | null>(null)
  const [pdfPt, setPdfPt] = useState<File | null>(null)

  // AI mode state
  const [topic, setTopic] = useState('')
  const [numChapters, setNumChapters] = useState(5)

  // Skip images option (faster generation)
  const [skipImages, setSkipImages] = useState(false)

  // Job tracking
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [job, setJob] = useState<Job | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkAdmin()
    return () => {
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [])

  async function checkAdmin() {
    const supabase = createClient()
    if (!supabase) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/admin/login')
      return
    }

    setAccessToken(session.access_token)
    setLoading(false)
  }

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`${EBOOK_GENERATOR_API}/api/v1/jobs/${jobId}`)
      if (!response.ok) throw new Error('Failed to fetch job status')

      const data: Job = await response.json()
      setJob(data)

      if (data.status === 'completed' || data.status === 'failed') {
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }
      }
    } catch (error) {
      console.error('Error polling job:', error)
    }
  }, [pollingInterval])

  async function handlePdfSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pdfEn || !pdfPt || !accessToken) return

    setIsSubmitting(true)
    setJob(null)

    try {
      const formData = new FormData()
      formData.append('pdf_en', pdfEn)
      formData.append('pdf_pt', pdfPt)

      const endpoint = skipImages
        ? `${EBOOK_GENERATOR_API}/api/v1/ebooks/from-pdfs-no-images`
        : `${EBOOK_GENERATOR_API}/api/v1/ebooks/from-pdfs`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start generation')
      }

      const data = await response.json()

      // Start polling
      setJob({
        job_id: data.job_id,
        status: 'pending',
        progress: 0,
        current_step: 'Agent Morpheus is waking up...',
        ebook_id: null,
        error: null,
      })

      const interval = setInterval(() => pollJobStatus(data.job_id), 3000)
      setPollingInterval(interval)

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic || !accessToken) return

    setIsSubmitting(true)
    setJob(null)

    try {
      const formData = new FormData()
      formData.append('topic', topic)
      formData.append('num_chapters', numChapters.toString())

      const endpoint = skipImages
        ? `${EBOOK_GENERATOR_API}/api/v1/ebooks/from-text-no-images`
        : `${EBOOK_GENERATOR_API}/api/v1/ebooks/from-text`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start generation')
      }

      const data = await response.json()

      // Start polling
      setJob({
        job_id: data.job_id,
        status: 'pending',
        progress: 0,
        current_step: 'Agent Morpheus is entering the matrix...',
        ebook_id: null,
        error: null,
      })

      const interval = setInterval(() => pollJobStatus(data.job_id), 3000)
      setPollingInterval(interval)

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDrop(e: React.DragEvent, setFile: (f: File | null) => void, language: string) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setFile(file)
    } else {
      alert(`Please drop a PDF file for ${language}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link href="/admin/ebooks-manage" className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to E-books
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-2 flex items-center gap-2 md:gap-3">
            <Wand2 className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
            Generate with Agent Morpheus
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Let Agent Morpheus craft your e-book from PDFs or pure imagination
          </p>
        </div>

        {/* Mode Selection */}
        {!mode && !job && (
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            {/* Upload PDFs Option */}
            <button
              onClick={() => setMode('pdf')}
              className="group p-5 md:p-8 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500/50 transition-all text-left"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <FileUp className="w-6 h-6 md:w-7 md:h-7 text-blue-500" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">Upload PDFs</h2>
              <p className="text-gray-400 text-sm mb-3 md:mb-4">
                Upload existing PDF files in English and Portuguese. The system will extract content and create chapters automatically.
              </p>
              <div className="flex items-center text-orange-500 text-sm font-medium">
                Get started <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>

            {/* AI Generation Option */}
            <button
              onClick={() => setMode('ai')}
              className="group p-5 md:p-8 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500/50 transition-all text-left"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-purple-500" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">Generate with AI</h2>
              <p className="text-gray-400 text-sm mb-3 md:mb-4">
                Describe your topic and let AI research and write the entire e-book in both English and Portuguese.
              </p>
              <div className="flex items-center text-orange-500 text-sm font-medium">
                Get started <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          </div>
        )}

        {/* PDF Upload Mode */}
        {mode === 'pdf' && !job && (
          <form onSubmit={handlePdfSubmit} className="space-y-4 md:space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-blue-500" />
                  Upload PDF Files
                </h2>
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  ← Choose different method
                </button>
              </div>

              <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                {/* English PDF */}
                <div>
                  <Label className="mb-2 block text-sm">English PDF *</Label>
                  <div
                    onDrop={(e) => handleDrop(e, setPdfEn, 'English')}
                    onDragOver={(e) => e.preventDefault()}
                    className={`border-2 border-dashed rounded-xl p-4 md:p-8 text-center transition-colors ${
                      pdfEn
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    {pdfEn ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                        <p className="font-medium truncate max-w-full">{pdfEn.name}</p>
                        <p className="text-sm text-gray-400">
                          {(pdfEn.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => setPdfEn(null)}
                          className="text-sm text-red-400 hover:text-red-300 mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="w-10 h-10 text-gray-500" />
                        <p className="text-sm text-gray-400">
                          Drag & drop or <span className="text-orange-500">browse</span>
                        </p>
                        <p className="text-xs text-gray-500">PDF up to 50MB</p>
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => setPdfEn(e.target.files?.[0] || null)}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Portuguese PDF */}
                <div>
                  <Label className="mb-2 block text-sm">Portuguese PDF *</Label>
                  <div
                    onDrop={(e) => handleDrop(e, setPdfPt, 'Portuguese')}
                    onDragOver={(e) => e.preventDefault()}
                    className={`border-2 border-dashed rounded-xl p-4 md:p-8 text-center transition-colors ${
                      pdfPt
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    {pdfPt ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                        <p className="font-medium truncate max-w-full">{pdfPt.name}</p>
                        <p className="text-sm text-gray-400">
                          {(pdfPt.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => setPdfPt(null)}
                          className="text-sm text-red-400 hover:text-red-300 mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="w-10 h-10 text-gray-500" />
                        <p className="text-sm text-gray-400">
                          Drag & drop or <span className="text-orange-500">browse</span>
                        </p>
                        <p className="text-xs text-gray-500">PDF up to 50MB</p>
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => setPdfPt(e.target.files?.[0] || null)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Skip Images Toggle */}
              <div className="mt-6 flex items-center justify-between p-4 bg-neutral-800 border border-neutral-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${skipImages ? 'bg-green-500/10' : 'bg-neutral-700'}`}>
                    {skipImages ? <Zap className="w-5 h-5 text-green-500" /> : <ImageOff className="w-5 h-5 text-gray-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">Fast Mode</p>
                    <p className="text-xs text-gray-500">Skip image generation for faster processing</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSkipImages(!skipImages)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${skipImages ? 'bg-green-500' : 'bg-neutral-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${skipImages ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>Tip:</strong> Make sure both PDFs contain the same content in their respective languages. Agent Morpheus will analyze the structure and create matching chapters.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                className="border border-neutral-700"
                onClick={() => setMode(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={!pdfEn || !pdfPt || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Summoning Morpheus...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Unleash Morpheus
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* AI Generation Mode */}
        {mode === 'ai' && !job && (
          <form onSubmit={handleAiSubmit} className="space-y-4 md:space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI-Powered Generation
                </h2>
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  ← Choose different method
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="topic" className="mb-2 block">
                    Topic or Prompt *
                  </Label>
                  <textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe the e-book topic in detail. For example: 'A comprehensive guide to developing mental toughness for athletes, covering psychological techniques, daily habits, and real-world case studies...'"
                    className="w-full h-32 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-sm resize-none focus:border-orange-500 focus:outline-none"
                    required
                    minLength={10}
                    maxLength={1000}
                  />
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {topic.length}/1000 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="chapters" className="mb-2 block">
                    Number of Chapters: <span className="text-orange-500 font-semibold">{numChapters}</span>
                  </Label>
                  <input
                    type="range"
                    id="chapters"
                    min="1"
                    max="20"
                    value={numChapters}
                    onChange={(e) => setNumChapters(parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 chapter</span>
                    <span>20 chapters</span>
                  </div>
                </div>

                {/* Skip Images Toggle */}
                <div className="flex items-center justify-between p-4 bg-neutral-800 border border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${skipImages ? 'bg-green-500/10' : 'bg-neutral-700'}`}>
                      {skipImages ? <Zap className="w-5 h-5 text-green-500" /> : <ImageOff className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Fast Mode</p>
                      <p className="text-xs text-gray-500">Skip image generation for faster processing</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSkipImages(!skipImages)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${skipImages ? 'bg-green-500' : 'bg-neutral-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${skipImages ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-sm text-purple-300">
                    Agent Morpheus will research your topic, then write comprehensive chapters in both English and Portuguese. {skipImages ? 'Fast mode: ~3-8 minutes.' : 'With images: ~5-15 minutes.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                className="border border-neutral-700"
                onClick={() => setMode(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={topic.length < 10 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Summoning Morpheus...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Unleash Morpheus
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Job Progress */}
        {job && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 md:p-8">
            <div className="text-center">
              {/* Status Icon */}
              <div className="mb-4 md:mb-6">
                {job.status === 'pending' && (
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 animate-spin" />
                  </div>
                )}
                {job.status === 'processing' && (
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-blue-500 animate-spin" />
                  </div>
                )}
                {job.status === 'completed' && (
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
                  </div>
                )}
                {job.status === 'failed' && (
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
                  </div>
                )}
              </div>

              {/* Status Title */}
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                {job.status === 'pending' && 'Morpheus is preparing...'}
                {job.status === 'processing' && 'Morpheus is writing...'}
                {job.status === 'completed' && 'Morpheus has delivered.'}
                {job.status === 'failed' && 'Morpheus encountered an anomaly'}
              </h2>

              {/* Current Step */}
              <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">
                {job.current_step}
              </p>

              {/* Progress Bar */}
              {(job.status === 'pending' || job.status === 'processing') && (
                <div className="max-w-md mx-auto mb-4 md:mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-orange-500 font-medium">{job.progress}%</span>
                  </div>
                  <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {job.status === 'failed' && job.error && (
                <div className="max-w-md mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{job.error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-6 md:mt-8">
                {job.status === 'completed' && job.ebook_id && (
                  <>
                    <Link href={`/admin/ebooks-manage/${job.ebook_id}`}>
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Edit E-book
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="border border-neutral-700"
                      onClick={() => {
                        setJob(null)
                        setMode(null)
                        setPdfEn(null)
                        setPdfPt(null)
                        setTopic('')
                        setNumChapters(5)
                        setSkipImages(false)
                      }}
                    >
                      Summon Morpheus Again
                    </Button>
                  </>
                )}
                {job.status === 'failed' && (
                  <Button
                    variant="ghost"
                    className="border border-neutral-700"
                    onClick={() => {
                      setJob(null)
                    }}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
