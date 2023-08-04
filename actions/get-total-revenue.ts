// Importăm modulul `prismadb` din directorul "@/lib/prismadb"
import prismadb from "@/lib/prismadb";

// Definim funcția `getTotalRevenue` care primește un `storeId` (id-ul magazinului) și întoarce o valoare de tip Promise
export const getTotalRevenue = async (storeId: string) => {
  // Folosim `await` pentru a aștepta rezultatul funcției `prismadb.order.findMany`
  // care returnează un array cu toate comenzile (order) care corespund criteriilor noastre
  const paidOrders = await prismadb.order.findMany({
    // Filtrăm comenzile pentru magazinul cu id-ul dat
    where: {
      storeId,
      isPaid: true, // Selectăm doar comenzile care sunt plătite (isPaid === true)
    },
    // Încărcăm relația `orderItems` pentru fiecare comandă găsită
    include: {
      orderItems: {
        include: {
          product: true, // Încărcăm și produsul aferent fiecărui item din comandă
        },
      },
    },
  });

  // Inițializăm o variabilă `totalRevenue` cu 0, unde vom acumula veniturile totale
  const totalRevenue = paidOrders.reduce((total, order) => {
    // Pentru fiecare comandă, folosim `reduce` pentru a calcula suma prețurilor tuturor produselor din comandă
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      // Adăugăm la suma curentă (`orderSum`) prețul produsului aflat în item
      // Folosim `item.product.price.toNumber()` pentru a converti prețul dintr-o valoare specifică bibliotecii `prismadb` într-un număr
      return orderSum + item.product.price.toNumber();
    }, 0);

    // Adăugăm suma calculată pentru comanda curentă la `total` (totalRevenue)
    return total + orderTotal;
  }, 0);

  // Returnăm valoarea `totalRevenue`, care reprezintă veniturile totale ale magazinului pentru comenzile plătite
  return totalRevenue;
};
