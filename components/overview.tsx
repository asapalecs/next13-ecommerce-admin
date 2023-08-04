"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"; // Importăm componente din biblioteca "recharts".

// Definim tipul pentru proprietățile componenteului "Overview".
interface OverviewProps {
  data: any[]; // Așteptăm o proprieate "data" de tip array cu orice tip de date (any).
}

// Definim componentul "Overview" ca o funcție React care primește proprietățile definite mai sus.
export const Overview: React.FC<OverviewProps> = ({ data }) => {
  return (

    // Utilizăm un container "ResponsiveContainer" pentru a face diagrama responsive (se adaptează la dimensiunea ecranului).
    <ResponsiveContainer width="100%" height={350}>

      {/* Utilizăm "BarChart" pentru a construi diagrama de bare și îi pasăm datele "data". */}
      <BarChart data={data}>

        {/* Definim axa orizontală "XAxis" și configurăm aspectul acesteia. */}
        <XAxis
          dataKey="name"    // Setăm cheia din obiectul "data" care va fi folosită pe axa orizontală.
          stroke="#888888"  // Setăm culoarea liniei axei orizontale.
          fontSize={12}     // Setăm dimensiunea fontului etichetelor de pe axa orizontală.
          tickLine={false}  // Ascundem liniile de marcaj de pe axa orizontală.
          axisLine={false}  // Ascundem linia axei orizontale.
        />
        {/* Definim axa verticală "YAxis" și configurăm aspectul acesteia. */}
        <YAxis
          stroke="#888888"  // Setăm culoarea liniei axei verticale.
          fontSize={12}     // Setăm dimensiunea fontului etichetelor de pe axa verticală.
          tickLine={false}  // Ascundem liniile de marcaj de pe axa verticală.
          axisLine={false}  // Ascundem linia axei verticale.
          tickFormatter={(value) => `${value}LEI`} // Formatare custom a etichetelor valorilor de pe axa verticală, adăugând simbolul "$" în fața valorii.
        />
        {/* Definim bara de date "Bar" și specificăm cheia din obiectul "data" care va fi utilizată pentru valorile barelor. */}
        <Bar dataKey="total" fill="#3498db" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
