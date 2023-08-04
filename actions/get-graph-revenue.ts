// Importăm prismadb de la calea "@/lib/prismadb". Presupun că acesta este un modul sau o librărie folosită pentru a accesa o bază de date.
import prismadb from "@/lib/prismadb";

// Definim o interfață pentru datele graficului
interface GraphData {
  name: string; // Numele lunii (ex. "Ianuarie", "Februarie", etc.)
  total: number; // Venitul total pentru luna respectivă
}

// Definim funcția "getGraphRevenue" care primește un identificator de magazin "storeId" și returnează o promisiune ce conține datele de venit pentru fiecare lună sub forma unui array de obiecte "GraphData".
export const getGraphRevenue = async (storeId: string): Promise<GraphData[]> => {
  // Obținem toate comenzile plătite (isPaid === true) pentru magazinul specificat utilizând prismadb.
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  // Inițializăm un obiect pentru a grupa veniturile pe lună.
  const monthlyRevenue: { [key: number]: number } = {};

  // Grupăm comenzile după lună și calculăm venitul total pentru fiecare comandă.
  for (const order of paidOrders) {
    const month = order.createdAt.getMonth(); // Obținem numărul lunii (0 pentru Ianuarie, 1 pentru Februarie, etc.)
    let revenueForOrder = 0;

    for (const item of order.orderItems) {
      revenueForOrder += item.product.price.toNumber(); // Adunăm prețul fiecărui produs la venitul total al comenzii.
    }

    // Adăugăm venitul pentru această comandă în luna corespunzătoare.
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
  }

  // Inițializăm array-ul "graphData" pentru a formata datele în formatul așteptat de grafic.
  const graphData: GraphData[] = [
    { name: "Jan", total: 0 },
    { name: "Feb", total: 0 },
    { name: "Mar", total: 0 },
    { name: "Apr", total: 0 },
    { name: "May", total: 0 },
    { name: "Jun", total: 0 },
    { name: "Jul", total: 0 },
    { name: "Aug", total: 0 },
    { name: "Sep", total: 0 },
    { name: "Oct", total: 0 },
    { name: "Nov", total: 0 },
    { name: "Dec", total: 0 },
  ];

  // Populăm datele graficului cu veniturile corespunzătoare pentru fiecare lună.
  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
  }

  // Returnăm array-ul cu datele formatate pentru grafic.
  return graphData;
};
