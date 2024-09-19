"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { getCldImageUrl, getCldVideoUrl } from 'next-cloudinary'
import { Download, Clock, FileDown, FileUp } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { filesize } from 'filesize'
import { Video } from '@/types/videosType'
import { useToast } from '@/hooks/use-toast'


dayjs.extend(relativeTime)

interface VideocardProps {
    video: Video,
    onDownload: (url: string, title: string) => void
}


export default function VideoCard({ video, onDownload }: VideocardProps) {

    const { toast } = useToast();

    const [isHovered, setIsHovered] = useState<boolean>(false)
    const [previewError, setPreviewError] = useState<boolean>(false)

    const getThumbnailURL = useCallback((publicId: string) => {

        return getCldImageUrl({
            src: publicId,
            width: 400,
            height: 225,
            quality: "auto",
            crop: 'fill',
            gravity: 'auto',
            format: 'jpg',
            assetType: 'video',
        })
    }, [])

    const getFullVideoURL = useCallback((publicId: string) => {

        return getCldVideoUrl({
            src: publicId,
            width: 1920,
            height: 1080,
        })
    }, [])

    const getPreviewVideoURL = useCallback((publicId: string) => {

        return getCldVideoUrl({
            src: publicId,
            width: 400,
            height: 225,
            rawTransformations: ["e_preview:duration_15.0:max_seg_9 :min_seg_dur_1.0"],
        })
    }, [])

    const fileFormatSize = useCallback((size: number) => {
        return filesize(size)
    }, [])

    const formatDuration = useCallback((seconds: number) => {

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }, [])

    const compressionPercentage = Math.round(
        (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
    );

    useEffect(() => {
        setPreviewError(false)
    }, [isHovered])

    function handlePreviewError() {
        setPreviewError(true)

        toast({
            title: 'Error',
            description: 'Preview not available',
            variant: 'destructive',
        })
    }

    return (
        <div
            className='card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <figure
                className='aspect-video relative'
            >
                {
                    isHovered ? (
                        previewError ? (
                            <div
                                className='bg-gray-200 w-full h-full flex items-center justify-center'
                            >
                                <p
                                    className='text-red-500'
                                >
                                    Preview not available
                                </p>
                            </div>
                        ) : (
                            <div>
                                <video
                                    autoPlay
                                    muted
                                    loop
                                    className='w-full h-full object-cover'
                                    onError={handlePreviewError}
                                    src={getPreviewVideoURL(video.publicId)}
                                />
                            </div>
                        )
                    ) : (
                        <div>
                            <img
                                src={getThumbnailURL(video.publicId)}
                                alt={video.title}
                                className='w-full h-full object-cover'
                            />
                        </div>
                    )
                }

                <div
                    className='absolute bottom-2 right-2 px-2 py-1 bg-base-100 bg-opacity-70 rounded-lg text-sm flex items-center'
                >
                    <Clock
                        size={16}
                        className='mr-1'
                    />
                    {formatDuration(video.duration)}
                </div>
            </figure>

            <div
                className='card-body p-4'
            >
                <h2
                    className='card-title text-lg font-black'
                >
                    {video.title}
                </h2>

                <p
                    className="text-sm text-base-content opacity-70 mb-4"
                >
                    {video.description}
                </p>
                <p
                    className="text-sm text-base-content opacity-70 mb-4"
                >
                    Uploaded {dayjs(video.createdAt).fromNow()}
                </p>

                <div
                    className="grid grid-cols-2 gap-4 text-sm"
                >

                    <div
                        className="flex items-center"
                    >
                        <FileUp
                            size={18}
                            className="mr-2 text-red-500"
                        />

                        <div>
                            <div
                                className="font-semibold"
                            >
                                Original
                            </div>

                            <div>
                                {
                                    fileFormatSize(Number(video.originalSize))
                                }
                            </div>
                        </div>

                    </div>

                    <div
                        className="flex items-center"
                    >
                        <FileDown
                            size={18}
                            className="mr-2 text-green-500"
                        />

                        <div>
                            <div
                                className="font-semibold"
                            >
                                Compressed
                            </div>

                            <div>
                                {
                                    fileFormatSize(Number(video.compressedSize))
                                }
                            </div>

                        </div>

                    </div>

                </div>

                <div
                    className="flex justify-between items-center mt-4"
                >
                    <div
                        className="text-sm font-semibold"
                    >
                        Compression:{" "}
                        <span
                            className={compressionPercentage > 0 ? "text-green-500" : "text-red-500"}
                        >
                            {compressionPercentage}%
                        </span>
                    </div>

                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                            onDownload(getFullVideoURL(video.publicId), video.title)
                        }
                    >
                        <Download size={16} />
                    </button>

                </div>

            </div>

        </div>
    )
}

