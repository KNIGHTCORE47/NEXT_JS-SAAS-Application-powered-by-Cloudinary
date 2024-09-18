export type ApiResponseError = {
    error: string;
    message: string;
    statusCode: number;
}

export interface ApiResponse {
    success: boolean;
    message: string;
}