import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const video = await prisma.video.findMany(
            {
                orderBy: {
                    createdAt: 'desc'
                }
            }
        );

        console.log("Prisma return video response:", video);
        

        //NOTE - Return An Arry Of Videos
        return NextResponse.json(video)
        
    } catch (error) {
        return NextResponse.json(
            {
                message: 'Error while fetching videos',
                error
         }, {status: 500})
    } finally {
        await prisma.$disconnect()
    }
}