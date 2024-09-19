"use client"

import React, { useState, useEffect, useCallback } from 'react'
import axios, { AxiosError } from 'axios'
import VideoCard from '@/components/custom/Videocard'
import { useToast } from '@/hooks/use-toast'
import { Video as VideoType } from '@/types/videosType'
import { ApiResponse } from '@/types/apiResponse'
import { Loader2 } from 'lucide-react'

export default function HomePage() {

  const [videos, setVideos] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { toast } = useToast();

  const fetchAllVideos = useCallback(async () => {

    try {
      const response = await axios.get<ApiResponse>("/api/videos");

      const { video } = response.data

      console.log("Here we get all the videos: ", response.data);

      if (Array.isArray(video)) {

        setVideos(video);

        toast({
          title: "Success",
          description: "Videos fetched successfully",
          variant: "default",
        })

      } else {
        throw new Error("Unexpected response format");
      }

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description: "Failed to fetch videos",
        variant: "destructive",
      })

    } finally {
      setIsLoading(false);
    }
  }, [])


  useEffect(() => {
    fetchAllVideos();
  }, [fetchAllVideos])


  const handleFileDownload = useCallback(async (url: string, title: string) => {

    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', `${title}.mp4`);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();

    //NOTE - here we remove the url from the browser cache after the download operation
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Video downloaded successfully",
      variant: "default",
    })

  }, [toast])






  if (isLoading) {
    return <div className='text-center flex items-center space-x-2'>
      <span>
        <Loader2 className='w-6 h-6 animate-spin' />
      </span>
      <p>Loading...</p>
    </div>
  }

  return (
    <div
      className='container mx-auto p-4'
    >

      <h1
        className='txt-2xl font-bold mb-4'
      >
        Videos
      </h1>

      {
        videos.length === 0
          ? (
            <div
              className='text-center text-lg text-gray-500'
            >
              No videos available
            </div>
          )
          : (
            <div
              className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6'
            >
              {
                videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onDownload={handleFileDownload}
                  />
                ))
              }
            </div>
          )
      }
    </div>
  )
}
