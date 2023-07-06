import { auth } from "@clerk/nextjs"; // Importing the auth function from the "@clerk/nextjs" package for authentication
import { NextResponse } from "next/server"; // Importing the NextResponse class from the "next/server" package for handling HTTP responses

import prismadb from "@/lib/prismadb"; // Importing the "prismadb" module from the "@/lib/prismadb" file

export async function POST(req: Request) {
  try {
    const { userId } = auth(); // Authenticating the request and extracting the userId from the authenticated user
    const body = await req.json(); // Parsing the request body as JSON

    const { name } = body; // Extracting the "name" field from the request body

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 }); // Returning an unauthorized response if userId is missing
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 }); // Returning a bad request response if the name is missing
    }

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      },
    });

    return NextResponse.json(store); // Returning a JSON response with the created store data
  } catch (error) {
    console.log("[STORES_POST]", error); // Logging the error to the console
    return new NextResponse("Internal Error", { status: 500 }); // Returning an internal server error response
  }
}
