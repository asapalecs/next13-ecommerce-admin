import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// GET route => pentru a obține datele billboard-ului
export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      // Verificăm dacă este furnizat un ID pentru billboard
      return new NextResponse("Category ID is required", { status: 401 });
    }

    // Căutăm billboard-ul utilizând ID-ul
    const category = await prismadb.category.findUnique({
      where: { id: params.categoryId },
    });

    // Returnăm răspunsul JSON cu category-ul
    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH route => pentru a actualiza datele category-ului
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, categoryId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, billboardId } = body;

    if (!userId) {
      // Verificăm dacă utilizatorul este autentificat
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      // Verificăm dacă este furnizată o etichetă (name)
      return new NextResponse("Name is required", { status: 401 });
    }

    if (!billboardId) {
      // Verificăm dacă este furnizat un URL
      return new NextResponse("Category ID is required", { status: 401 });
    }

    if (!params.categoryId) {
      // Verificăm dacă este furnizat un ID pentru category
      return new NextResponse("Category ID is required", { status: 401 });
    }

    // Căutăm magazinul bazat pe ID-ul utilizatorului
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      // Verificăm dacă utilizatorul nu are acces la magazin
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Actualizăm category-ul cu noile date
    const category = await prismadb.category.updateMany({
      where: { id: params.categoryId },
      data: {
        name,
        billboardId,
      },
    });

    // Returnăm răspunsul JSON cu category-ul actualizat
    return NextResponse.json(category);
  } catch (error) {
    console.log("[STORE_PATCH]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE route => pentru a șterge category-ul
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, categoryId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      // Verificăm dacă utilizatorul este autentificat
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.categoryId) {
      // Verificăm dacă este furnizat un ID pentru category
      return new NextResponse("Category ID is required", { status: 401 });
    }

    // Căutăm magazinul bazat pe ID-ul utilizatorului
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      // Verificăm dacă utilizatorul nu are acces la magazin
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const category = await prismadb.category.deleteMany({
      where: {
        id:params.categoryId,
      }
    })

    // Returnăm răspunsul JSON cu category-ul șters
    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

