import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  //Pentru a face route publice
  publicRoutes: [
    "/api/:path*"
  ]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};