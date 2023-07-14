import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// fetch route => to update the store
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 401 });
    }

    const store = await prismadb.store.updateMany({
      where: { id: params.storeId, userId },
      data: {
        name,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_PATCH]", error); // Logging the error to the console
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// delete route => to delete the store
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 401 });
    }

    // deleteMany instead of delete because the userID is UNIQUE
    const store = await prismadb.store.deleteMany({
      where: { id: params.storeId, userId }
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_DELETE]", error); // Logging the error to the console
    return new NextResponse("Internal Error", { status: 500 });
  }
}
