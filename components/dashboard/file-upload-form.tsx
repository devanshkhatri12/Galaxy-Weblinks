/**
 * File Upload Form Component
 * 
 * Handles file uploads with validation for:
 * - Image types (jpg, jpeg, png, gif, webp)
 * - Maximum file size (5MB)
 */

'use client'

import React from "react"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  FileImage,
  Trash2,
  Download,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Allowed file types and max size
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

interface FileInfo {
  name: string
  size: number
  created_at: string
  url: string
}

interface FileUploadFormProps {
  userId: string
  existingFiles: FileInfo[]
}

export function FileUploadForm({ userId, existingFiles }: FileUploadFormProps) {
  const [files, setFiles] = useState<FileInfo[]>(existingFiles)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Validate file
  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only image files (JPG, PNG, GIF, WebP) are allowed'
    }
    if (file.size > MAX_SIZE) {
      return 'File size must be less than 5MB'
    }
    return null
  }

  // Handle file upload
  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return

    setError(null)
    setSuccess(null)
    setIsUploading(true)

    try {
      const supabase = createClient()
      const uploadedFiles: FileInfo[] = []

      for (const file of Array.from(fileList)) {
        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          setIsUploading(false)
          return
        }

        // Generate unique filename
        const timestamp = Date.now()
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${timestamp}_${sanitizedName}`
        const filePath = `${userId}/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('user-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          setError(`Failed to upload ${file.name}: ${uploadError.message}`)
          setIsUploading(false)
          return
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('user-files')
          .getPublicUrl(filePath)

        uploadedFiles.push({
          name: fileName,
          size: file.size,
          created_at: new Date().toISOString(),
          url: urlData.publicUrl,
        })
      }

      // Update local state
      setFiles([...uploadedFiles, ...files])
      setSuccess(`Successfully uploaded ${uploadedFiles.length} file(s)`)
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred during upload')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file delete
  async function handleDelete() {
    if (!fileToDelete) return

    setIsDeleting(true)
    setError(null)

    try {
      const supabase = createClient()
      const filePath = `${userId}/${fileToDelete}`

      const { error: deleteError } = await supabase.storage
        .from('user-files')
        .remove([filePath])

      if (deleteError) {
        setError(`Failed to delete file: ${deleteError.message}`)
        return
      }

      // Update local state
      setFiles(files.filter(f => f.name !== fileToDelete))
      setSuccess('File deleted successfully')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
      setFileToDelete(null)
    }
  }

  // Format file size
  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // Handle drag events
  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleUpload(e.dataTransfer.files)
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop files here or click to browse. 
            Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700 bg-green-50 mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              multiple
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {dragActive ? 'Drop files here' : 'Drag and drop your files here'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click below to browse
                </p>
              </div>
              <Button 
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Files
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
          <CardDescription>
            {files.length === 0 
              ? 'No files uploaded yet' 
              : `${files.length} file(s) uploaded`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files uploaded yet</p>
              <p className="text-sm">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="group relative border rounded-lg overflow-hidden"
                >
                  {/* File Preview */}
                  <div className="aspect-square bg-muted">
                    <img
                      src={file.url || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* File Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      asChild
                    >
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => setFileToDelete(file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
