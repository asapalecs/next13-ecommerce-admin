// Importăm librăriile necesare
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Importăm modulele personalizate pentru Stripe și baza de date
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

// Definim funcția asincronă POST, care reprezintă endpoint-ul pentru webhooks de la Stripe
export async function POST(req: Request) {
  // Obținem corpul request-ului ca text
  const body = await req.text();

  // Obținem semnătura webhook-ului din header-ul "Stripe-Signature"
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    // Validăm și deconstruim evenimentul primit de la Stripe utilizând semnătura și secretul specific webhook-ului
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    // Dacă evenimentul nu poate fi validat, returnăm o eroare cu status 400
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Extragem informații relevante din evenimentul primit de la Stripe
  const session = event.data.object as Stripe.Checkout.Session;
  const address = session?.customer_details?.address;

  // Construim o adresă formatată din componente relevante (linia 1, linia 2, orașul, statul, codul poștal și țara)
  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ];
  const addressString = addressComponents.filter((c) => c !== null).join(", ");

  // Verificăm tipul evenimentului pentru a trata doar evenimentul "checkout.session.completed"
  if (event.type === "checkout.session.completed") {
    // Actualizăm în baza de date comanda asociată sesiunii de checkout pentru a marca comanda ca plătită și a adăuga adresa și numărul de telefon al clientului
    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: session?.customer_details?.phone || "",
      },
      include: {
        orderItems: true,
      },
    });

    // Extragem ID-urile produselor din comandă
    const productIds = order.orderItems.map((orderItem) => orderItem.productId);

    // Actualizăm în baza de date toate produsele din comandă pentru a le marca ca arhivate (nu mai sunt disponibile pentru vânzare)
    await prismadb.product.updateMany({
      where: {
        id: {
          in: [...productIds],
        },
      },
      data: {
        isArchived: true,
      },
    });
  }

  // Returnăm o răspuns cu status 200 (OK) către Stripe
  return new NextResponse(null, { status: 200 });
}
