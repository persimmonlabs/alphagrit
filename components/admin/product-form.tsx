'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { createProduct, updateProduct } from '@/lib/actions/admin/products'
import { generateSlug, formatFileSize } from '@/lib/utils'
import { Loader2, Upload, X, FileText } from 'lucide-react'
import Image from 'next/image'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price_brl: z.coerce.number().min(0, 'Price must be positive'),
  price_usd: z.coerce.number().min(0, 'Price must be positive'),
  type: z.enum(['ebook', 'physical', 'subscription']),
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']),
  cover_image_url: z.string().optional(),
  file_url: z.string().optional(),
  file_size_bytes: z.number().optional(),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
  initialData?: any // Replace with proper type
  isEditing?: boolean
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      short_description: initialData?.short_description || '',
      price_brl: initialData?.price_brl || 0,
      price_usd: initialData?.price_usd || 0,
      type: initialData?.type || 'ebook',
      category: initialData?.category || '',
      status: initialData?.status || 'draft',
      cover_image_url: initialData?.cover_image_url || '',
      file_url: initialData?.file_url || '',
      file_size_bytes: initialData?.file_size_bytes || 0,
    },
  })

  const { watch, setValue } = form
  const name = watch('name')
  const coverImageUrl = watch('cover_image_url')
  const fileUrl = watch('file_url')
  const fileSize = watch('file_size_bytes')

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && name) {
      const slug = generateSlug(name)
      setValue('slug', slug)
    }
  }, [name, isEditing, setValue])

  const handleUpload = async (
    file: File,
    bucket: string,
    field: 'cover_image_url' | 'file_url'
  ) => {
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      if (field === 'cover_image_url') setIsUploadingCover(true)
      else setIsUploadingFile(true)

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      setValue(field, publicUrl)
      
      if (field === 'file_url') {
        setValue('file_size_bytes', file.size)
      }

      toast.success('Upload successful')
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`)
    } finally {
      if (field === 'cover_image_url') setIsUploadingCover(false)
      else setIsUploadingFile(false)
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      const result = isEditing
        ? await updateProduct(initialData.id, data)
        : await createProduct(data)

      if (result.success) {
        toast.success(isEditing ? 'Product updated' : 'Product created')
        router.push('/admin/products')
      } else {
        toast.error(result.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...form.register('slug')} />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_brl">Price (BRL)</Label>
              <Input 
                id="price_brl" 
                type="number" 
                step="0.01" 
                {...form.register('price_brl')} 
              />
            </div>
            <div>
              <Label htmlFor="price_usd">Price (USD)</Label>
              <Input 
                id="price_usd" 
                type="number" 
                step="0.01" 
                {...form.register('price_usd')} 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" {...form.register('category')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select 
                onValueChange={(value: any) => setValue('type', value)} 
                defaultValue={form.getValues('type')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ebook">E-book</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select 
                onValueChange={(value: any) => setValue('status', value)}
                defaultValue={form.getValues('status')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Cover Image</Label>
            <div className="mt-2 flex flex-col gap-4">
              {coverImageUrl ? (
                <div className="relative h-48 w-full overflow-hidden rounded-md border">
                  <Image
                    src={coverImageUrl}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => setValue('cover_image_url', '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-48 w-full flex-col items-center justify-center rounded-md border border-dashed bg-muted/50">
                  {isUploadingCover ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Drag & drop or click to upload
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={isUploadingCover}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(file, 'site-assets', 'cover_image_url')
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Product File (PDF/EPUB)</Label>
            <div className="mt-2">
              {fileUrl ? (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <p className="font-medium">Product File</p>
                      <p className="text-xs text-muted-foreground">
                        {fileSize ? formatFileSize(fileSize) : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setValue('file_url', '')
                      setValue('file_size_bytes', 0)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative flex h-32 w-full flex-col items-center justify-center rounded-md border border-dashed bg-muted/50">
                  {isUploadingFile ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Upload PDF or EPUB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.epub"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={isUploadingFile}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(file, 'products', 'file_url')
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="short_description">Short Description</Label>
        <Textarea 
          id="short_description" 
          {...form.register('short_description')} 
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="description">Full Description (HTML allowed)</Label>
        <Textarea 
          id="description" 
          {...form.register('description')} 
          className="mt-2 min-h-[200px] font-mono text-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Basic HTML is supported for now. Rich text editor coming soon.
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploadingCover || isUploadingFile}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
