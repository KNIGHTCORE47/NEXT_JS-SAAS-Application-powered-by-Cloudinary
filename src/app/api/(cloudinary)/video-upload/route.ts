import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client/extension';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse, NextRequest } from 'next/server';

//NOTE - initialize database thorough prisma
const prisma = new PrismaClient();


//NOTE - Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET   // Click 'View API Keys' above to copy your API secret
});

//NOTE - Define cloudinary upload interface
interface cloudinaryUploasResult {
    public_id: string;
    bytes: number;
    duration?: number;
    [key: string]: string | number | undefined;
}


export async function POST(request: NextRequest) {
    const { userId } = auth();

    //NOTE - Check if user is logged in or not
    if (!userId) {
        return NextResponse.json(
            {
                success: false,
                message: 'Unauthorized user',
            }, { status: 401 })
    }

    try {

        //NOTE - safely check if cloudinary credentials are present
        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cloudinary credentials not found',
                }, { status: 500 }
            )
        }

        //NOTE - Get file from request
        const formData = await request.formData();

        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const originalSize = formData.get('originalSize') as string;

        //NOTE - Check if file is present or not
        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'File not found',
                }, { status: 40 })
        }

        //NOTE - Upload any file format to cloudinary using upload method arrayBuffer method
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<cloudinaryUploasResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "next-js-saas-app-powered-by-cloudinary/video-upload",
                        resource_type: "auto",
                        transformations: [
                            {
                                quality: "auto",
                                fetch_format: "mp4",
                            }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as cloudinaryUploasResult);
                    }
                )

                uploadStream.end(buffer);
            }
        )

        const videos = await prisma.video.create({
            data: {
                title,
                description,
                publicId: result.public_id,
                originalSize,
                comoressedSize: String(result.bytes),
                duration: result.duration || 0,
            }
        })

        return NextResponse.json(
            {
                success: true,
                message: 'Video uploaded successfully',
                videos
            }, { status: 200 })

    } catch (error) {
        console.log("Error while uploading video:", error);

        return NextResponse.json(
            {
                message: 'Error while uploading video',
                error
            }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}