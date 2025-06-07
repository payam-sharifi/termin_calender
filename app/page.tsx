'use client'
import { useGetUsers } from "@/hooks/hooksOfServices/useGetUsers";
import DnDCalender from "./components/DnDCalender";
export default function Home() {
  const { data, isLoading, error } = useGetUsers();

  console.log(data, "data");
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">ٍCalendar</h1>
      <DnDCalender />
    </main>
  );
}
