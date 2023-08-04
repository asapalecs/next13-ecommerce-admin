// Importăm librăriile necesare
import Stripe from "stripe";
import { NextResponse } from "next/server";

// Importăm funcția de configurare a conexiunii cu Stripe și funcția de configurare a conexiunii cu baza de date
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

// Definim anteturile CORS pentru a permite accesul de la orice origine
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Definim funcția care va răspunde la cererile de tip OPTIONS
export async function OPTIONS() {
  // Returnăm un răspuns de tip JSON gol, împreună cu anteturile CORS definite anterior
  return NextResponse.json({}, { headers: corsHeaders });
}

// Definim funcția care va răspunde la cererile de tip POST
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  // Obținem id-urile produselor din corpul cererii de tip JSON
  const { productIds } = await req.json();

  // Verificăm dacă există id-uri de produse în corpul cererii și dacă nu, returnăm un răspuns cu eroare
  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product ids are required", { status: 400 });
  }

  // Obținem informațiile despre produse din baza de date, folosind id-urile primite în cerere
  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  // Inițializăm un array care va conține toate elementele (produsele) din sesiunea de checkout a Stripe
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // Iterăm prin fiecare produs și adăugăm câte un element în array-ul de produse din sesiunea de checkout a Stripe
  products.forEach((product) => {
    line_items.push({
      quantity: 1, // cantitatea produsului (se poate modifica pentru a permite mai multe bucăți)
      price_data: {
        currency: "RON", // moneda în care este exprimat prețul
        product_data: {
          name: product.name, // numele produsului
        },
        unit_amount: product.price.toNumber() * 100, // prețul produsului în bani (prețul este convertit în bani în loc de lei)
      },
    });
  });

  // Creăm o comandă nouă în baza de date, cu produsele asociate ei
  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId, // identificatorul magazinului în care se face comanda
      isPaid: false, // setăm că comanda încă nu este plătită
      orderItems: {
        create: productIds.map((productId: string) => ({
          product: {
            connect: {
              id: productId,
            },
          },
        })),
      },
    },
  });

  // Creăm o sesiune de checkout în Stripe cu produsele din array-ul de produse creat anterior
  const session = await stripe.checkout.sessions.create({
    line_items, // produsele din sesiunea de checkout
    mode: "payment", // modul de plată al sesiunii (în acest caz, plata)
    billing_address_collection: "required", // cerem utilizatorului să completeze adresa de facturare
    phone_number_collection: {
      enabled: true, // activăm colectarea numărului de telefon al utilizatorului
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`, // URL-ul către care utilizatorul va fi redirecționat după finalizarea plății cu succes
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`, // URL-ul către care utilizatorul va fi redirecționat dacă anulează plata
    metadata: {
      orderId: order.id, // adăugăm o metadată pentru identificatorul comenzii în sesiunea de checkout a Stripe
    },
  });

  // Returnăm un răspuns de tip JSON cu URL-ul sesiunii de checkout din Stripe, împreună cu anteturile CORS definite anterior
  return NextResponse.json(
    { url: session.url },
    {
      headers: corsHeaders,
    }
  );
}
