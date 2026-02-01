/**
 * Files Management Page
 * 
 * Allows users to upload and manage their files/images.
 */

import { createClient } from '@/lib/supabase/server'
import { FileUploadForm } from '@/components/dashboard/file-upload-form'

export const metadata = {
  title: 'My Files | Your App',
  description: 'Upload and manage your files',
}

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // List user's files from storage
  let files: Array<{
    name: string
    size: number
    created_at: string
    url: string
  }> = []

  if (user) {
    const { data: fileList } = await supabase.storage
      .from('user-files')
      .list(`${user.id}/`, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (fileList) {
      files = await Promise.all(
        fileList
          .filter(file => file.name !== '.emptyFolderPlaceholder')
          .map(async (file) => {
            const { data: urlData } = supabase.storage
              .from('user-files')
              .getPublicUrl(`${user.id}/${file.name}`)

            return {
              name: file.name,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              url: urlData.publicUrl,
            }
          })
      )
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Files</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage your images and documents.
        </p>
      </div>

      <FileUploadForm userId={user?.id || ''} existingFiles={files} />
    </div>
  )
}
