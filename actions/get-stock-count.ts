// Importăm modulul prismadb din directorul "@/lib/prismadb"
import prismadb from "@/lib/prismadb";

// Definim o funcție asincronă numită getStockCount cu un parametru storeId de tip string.
export const getStockCount = async (storeId: string) => {
  // Așteptăm rezultatul funcției count din modulul prismadb.product.
  // Aceasta funcție va număra produsele care îndeplinesc condițiile specificate în clauza "where".
  const stockCount = await prismadb.product.count({
    where: {
      // Filtrăm produsele care au storeId egal cu valoarea parametrului primit în funcție.
      storeId,
      // Filtrăm produsele care nu sunt arhivate (isArchived: false).
      isArchived: false,
    },
  });

  // Returnăm numărul de produse din stoc, rezultatul funcției count().
  return stockCount;
};
