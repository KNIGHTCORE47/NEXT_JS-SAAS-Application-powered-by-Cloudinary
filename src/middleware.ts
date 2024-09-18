import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/",
    "/home",
])

const isPublicApiRoute = createRouteMatcher([
    "/api/videos",
])

export default clerkMiddleware((auth, req) => {
    const { userId } = auth();
    const currentUrl = new URL(req.url)
    const isAccessingDashboard = currentUrl.pathname === "/home"

    const isApiRequest = currentUrl.pathname.startsWith("/api")

    //NOTE - This is only for public routes, Here we are checking if user is logged in, want to access the public routes but not want to access dashboard then redirect user to dashboard homepage
    if (userId && isPublicRoute(req) && !isAccessingDashboard) {
        return NextResponse.redirect(new URL("/home", req.url))
    }

    //NOTE - User not logged in 

    if (!userId) {
        //NOTE - User not logged in and want to access public routes(Protected Routes)
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url))
        }

        //NOTE - User not logged in and request for accessing API(Protected API)
        if (isApiRequest && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url))

        }
    }

    return NextResponse.next()

})

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}