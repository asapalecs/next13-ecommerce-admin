import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// GET route => pentru a obține datele size-ului
export async function GET(
  req: Request,
  { params }: { params: { sizeId: string } }
) {
  try {
    if (!params.sizeId) {
      // Verificăm dacă este furnizat un ID pentru size
      return new NextResponse("Size ID is required", { status: 401 });
    }

    // Căutăm size-ul utilizând ID-ul
    const size = await prismadb.size.findUnique({
      where: { id: params.sizeId },
    });

    // Returnăm răspunsul JSON cu size-ul
    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_GET]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH route => pentru a actualiza datele size-ului
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, sizeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, value } = body;

    if (!userId) {
      // Verificăm dacă utilizatorul este autentificat
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      // Verificăm dacă este furnizată o etichetă (name)
      return new NextResponse("Name is required", { status: 401 });
    }

    if (!value) {
      // Verificăm dacă este furnizat un URL pentru imagine
      return new NextResponse("Value is required", { status: 401 });
    }

    if (!params.sizeId) {
      // Verificăm dacă este furnizat un ID pentru size
      return new NextResponse("Size ID is required", { status: 401 });
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

    // Actualizăm size-ul cu noile date
    const size = await prismadb.size.updateMany({
      where: { id: params.sizeId },
      data: {
        name,
        value,
      },
    });

    // Returnăm răspunsul JSON cu size-ul actualizat
    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_PATCH]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE route => pentru a șterge size-ul
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, sizeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      // Verificăm dacă utilizatorul este autentificat
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.sizeId) {
      // Verificăm dacă este furnizat un ID pentru size
      return new NextResponse("Size ID is required", { status: 401 });
    }

    // Ștergem size-ul bazat pe ID
    const size = await prismadb.size.deleteMany({
      where: { id: params.sizeId },
    });

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

    // Returnăm răspunsul JSON cu size-ul șters
    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_DELETE]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

