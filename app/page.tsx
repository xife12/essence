import { redirect } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  redirect('/dashboard');
  
  // Dieser Code wird nie ausgeführt, da die Weiterleitung bereits erfolgt ist
  return null;
}
