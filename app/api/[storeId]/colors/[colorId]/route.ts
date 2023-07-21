import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// GET route => pentru a obține datele color-ului
export async function GET(
  req: Request,
  { params }: { params: { colorId: string } }
) {
  try {
    if (!params.colorId) {
      // Verificăm dacă este furnizat un ID pentru color
      return new NextResponse("Color ID is required", { status: 401 });
    }

    // Căutăm color-ul utilizând ID-ul
    const color = await prismadb.color.findUnique({
      where: { id: params.colorId },
    });

    // Returnăm răspunsul JSON cu color-ul
    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_GET]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH route => pentru a actualiza datele color-ului
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, colorId: string } }
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

    if (!params.colorId) {
      // Verificăm dacă este furnizat un ID pentru color
      return new NextResponse("Color ID is required", { status: 401 });
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

    // Actualizăm color-ul cu noile date
    const color = await prismadb.color.updateMany({
      where: { id: params.colorId },
      data: {
        name,
        value,
      },
    });

    // Returnăm răspunsul JSON cu color-ul actualizat
    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_PATCH]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE route => pentru a șterge color-ul
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, colorId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      // Verificăm dacă utilizatorul este autentificat
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.colorId) {
      // Verificăm dacă este furnizat un ID pentru color
      return new NextResponse("Color ID is required", { status: 401 });
    }

    // Ștergem color-ul bazat pe ID
    const color = await prismadb.color.deleteMany({
      where: { id: params.colorId },
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

    // Returnăm răspunsul JSON cu color-ul șters
    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_DELETE]", error); // Înregistrăm eroarea în consolă
    return new NextResponse("Internal Error", { status: 500 });
  }
}

