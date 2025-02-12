// import { withClerkMiddleware } from "@clerk/nextjs/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { readSiteDomain } from "./lib/actions/vercel/read-site-domain";

const isProtectedRoute = createRouteMatcher(["/"]);

// // Define the routes that require authentication
// const isProtectedRoute = createRouteMatcher(["/cms(.*)"]);

// Main middleware function
export default clerkMiddleware(async (auth, req) => {
  // Check if the route is protected and enforce authentication if it is
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const url = req.nextUrl;
  const pathname = url.pathname;

  // Get hostname (e.g., 'mike.com', 'test.mike.com')
  const hostname = req.headers.get("host");

  let currentHost; //will be dumebi, or  nothing or app.
  if (process.env.NODE_ENV === "production") {
    // In production, use the custom base domain from environment variables
    const baseDomain = process.env.BASE_DOMAIN;
    currentHost = hostname?.replace(`.${baseDomain}`, "");
  } else {
    // In development, handle localhost case
    currentHost = hostname?.replace(`.localhost:3000`, "");
  }

  // If there's no currentHost, likely accessing the root domain, handle accordingly
  if (!currentHost) {
    // Continue to the next middleware or serve the root content
    return NextResponse.next(); // will go to home page
  }

  // Fetch tenant-specific data based on the subdomain
  const response = await readSiteDomain(currentHost);
  console.log("got current host", response);

  // Handle the case where no subdomain data is found
  if (!response) {
    // Redirect based on NODE_ENV
    if (!process.env.BASE_DOMAIN) return;
    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? process.env.BASE_DOMAIN // Replace with your production URL
        : "http://localhost:3000"; // Redirect to localhost in development

    return NextResponse.next();
  }

  const store_id = response?.id;
  // Get the tenant's subdomain from the response
  const tenantSubdomain = response?.site_subdomain;

  if (tenantSubdomain) {
    return NextResponse.rewrite(new URL(`/${store_id}${pathname}`, req.url));
  }


    // Redirect based on NODE_ENV
    if (!process.env.BASE_DOMAIN) return;
    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? process.env.BASE_DOMAIN // Replace with your production URL
        : "http://localhost:3000"; // Redirect to localhost in development

    // Rewrite the URL to the tenant-specific path
    return NextResponse.rewrite(
      new URL(tenantSubdomain === "/" ? "" : `tsafi.xyz`, req.url)
    );
  
});

// Define which paths the middleware should run for
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
