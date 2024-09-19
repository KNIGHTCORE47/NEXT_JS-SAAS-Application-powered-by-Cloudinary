import { Video } from './videosType'

export interface ApiResponse {
    success: boolean;
    message: string;
    status: number;
    video?: Video[]
}