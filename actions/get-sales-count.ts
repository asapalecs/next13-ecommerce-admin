// Importă modulul prismadb din "@/lib/prismadb"
import prismadb from "@/lib/prismadb";

// Definește o funcție numită getSalesCount care primește un storeId ca parametru 
// și returnează o promisiune pentru numărul de vânzări.
export const getSalesCount = async (storeId: string) => {
  // Așteaptă ca metoda 'count' să fie apelată asincron pe obiectul 'order' din prismadb și salvează rezultatul în 'salesCount'.
  // Metoda 'count' numără câte înregistrări există în tabelul 'order' care se potrivesc cu condițiile specificate.
  // În acest caz, numără comenzile pentru care 'storeId' se potrivește cu parametrul dat și câmpul 'isPaid' este true (adevărat).
  const salesCount = await prismadb.order.count({
    where: {
      storeId,
      isPaid: true
    },
  });

  // Returnează salesCount, care reprezintă numărul de comenzi care îndeplinesc condițiile specificate.
  return salesCount;
};
