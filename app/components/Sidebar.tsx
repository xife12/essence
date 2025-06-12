import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-5">
      <div className="text-2xl font-bold mb-8">Essence</div>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/leads" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Leads
            </Link>
          </li>
          <li>
            <Link href="/beratung" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Beratung
            </Link>
          </li>
          <li>
            <Link href="/mitglieder" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Mitglieder
            </Link>
          </li>
          <li>
            <Link href="/kampagnen" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Kampagnen
            </Link>
          </li>
          <li>
            <Link href="/passwoerter" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Passwörter
            </Link>
          </li>
          <li>
            <Link href="/mitarbeiter" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Mitarbeiter
            </Link>
          </li>
          <li>
            <Link href="/vertragsarten" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Vertragsarten
            </Link>
          </li>
          <li>
            <Link href="/stunden" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Stundenerfassung
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
} 