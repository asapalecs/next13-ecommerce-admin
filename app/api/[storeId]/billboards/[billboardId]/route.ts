import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// GET route => pentru a obține datele billboard-ului
export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    if (!params.billboardId) {
      // Verificăm dacă este furnizat un ID pentru billboard
      return new NextResponse("Billboard ID is required", { status: 401 });
    }

    // Căutăm billboard-ul utilizând ID-ul
    const billboard = await prismadb.billboard.findUnique({
      where: { id: params.billboardId },
    });

    // Returnăm răspunsul JSON cu billboard-ul
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_GET]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH route => pentru a actualiza datele billboard-ului
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, billboardId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { label, imageUrl } = body;

    if (!userId) {
      // Verificăm dacă utilizatorul este autentificat
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!label) {
      // Verificăm dacă este furnizată o etichetă (label)
      return new NextResponse("Label is required", { status: 401 });
    }

    if (!imageUrl) {
      // Verificăm dacă este furnizat un URL pentru imagine
      return new NextResponse("Image URL is required", { status: 401 });
    }

    if (!params.billboardId) {
      // Verificăm dacă este furnizat un ID pentru billboard
      return new NextResponse("Billboard ID is required", { status: 401 });
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

    // Actualizăm billboard-ul cu noile date
    const billboard = await prismadb.billboard.updateMany({
      where: { id: params.billboardId },
      data: {
        label,
        imageUrl,
      },
    });

    // Returnăm răspunsul JSON cu billboard-ul actualizat
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[STORE_PATCH]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE route => pentru a șterge billboard-ul
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, billboardId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      // Verificăm dacă utilizatorul este autentificat
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.billboardId) {
      // Verificăm dacă este furnizat un ID pentru billboard
      return new NextResponse("Billboard ID is required", { status: 401 });
    }

    // Ștergem billboard-ul bazat pe ID
    const billboard = await prismadb.billboard.deleteMany({
      where: { id: params.billboardId },
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

    // Returnăm răspunsul JSON cu billboard-ul șters
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

