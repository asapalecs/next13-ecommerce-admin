import { auth } from "@clerk/nextjs"; // Importing the auth function from the "@clerk/nextjs" package for authentication
import { NextResponse } from "next/server"; // Importing the NextResponse class from the "next/server" package for handling HTTP responses

import prismadb from "@/lib/prismadb"; // Importing the "prismadb" module from the "@/lib/prismadb" file

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth(); // Authenticating the request and extracting the userId from the authenticated user
    const body = await req.json(); // Parsing the request body as JSON

    const { name, value } = body; // Extracting the "name" field from the request body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 }); // Returning an unauthorized response if userId is missing
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 }); // Returning a bad request response if the name is missing
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 }); // Returning a bad request response if the name is missing
    }

    if (!params.storeId) {
      return new NextResponse("Size ID is required", { status: 400 }); // Returning a bad request response if the name is missing
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(size); // Returning a JSON response with the created size data
  } catch (error) {
    console.log("[SIZES_POST]", error); // Logging the error to the console
    return new NextResponse("Internal Error", { status: 500 }); // Returning an internal server error response
  }
}


export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
  ) {
    try {

      if (!params.storeId) {
        return new NextResponse("Size ID is required", { status: 400 }); // Returning a bad request response if the name is missing
      }
  
      const sizes = await prismadb.size.findMany({
        where:{
            storeId: params.storeId,
        }
      });
  
      return NextResponse.json(sizes); // Returning a JSON response with the created size data
    } catch (error) {
      console.log("[SIZES_GET]", error); // Logging the error to the console
      return new NextResponse("Internal Error", { status: 500 }); // Returning an internal server error response
    }
  }
  