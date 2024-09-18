"use client"

import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { ApiResponse } from '@/types/apiResponse'

export default function VideoUploadPage() {

  const [file, setFile] = useState<File | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const router = useRouter()

  const { toast } = useToast();

  //NOTE - Fix the max upload video file size

  const MAX_FILE_SIZE = 70 * 1024 * 1024

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a video file',
        variant: 'destructive',
      })
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Error',
        description: 'File size exceeds the maximum limit',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true);


    const formData = new FormData();

    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalSize", file.size.toString());

    try {
      const response = await axios.post("/api/video-upload", formData);

      console.log("Total response for video upload:", response);

      if (!response.data) {
        console.log("Error while uploading video", response?.data.message);

        toast({
          title: 'Error',
          description:
            response?.data.message ||
            'Something went wrong while uploading video',
          variant: 'destructive',
        })
      }

      router.push('/');

      toast({
        title: 'Success',
        description: response?.data.message || 'Video uploaded successfully',
        variant: 'default',
      });

    } catch (error) {
      console.error("Error while uploading video", error);
      const axiosError = error as AxiosError<ApiResponse>;

      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ||
          'Something went wrong while uploading video',
        variant: 'destructive',
      })

    } finally {
      setIsUploading(false);
    }

  }





  return (
    <div
      className="container mx-auto p-4"
    >
      <h1
        className="text-2xl font-bold mb-4"
      >
        Upload Video
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Video File</span>
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file-input file-input-bordered w-full"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  )
}


