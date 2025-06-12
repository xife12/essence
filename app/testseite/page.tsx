export default function TestSeite() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          🎨 Tailwind CSS Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Card 1
            </h2>
            <p className="text-gray-600 mb-4">
              Diese Karte sollte ein weißer Hintergrund mit Schatten haben.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Test Button
            </button>
          </div>
          
          <div className="bg-green-100 p-6 rounded-lg border border-green-300">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Card 2
            </h2>
            <p className="text-green-700 mb-4">
              Diese Karte sollte grün gefärbt sein.
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
              Grüner Button
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-lg text-white">
            <h2 className="text-xl font-semibold mb-4">
              Card 3
            </h2>
            <p className="mb-4 opacity-90">
              Diese Karte sollte einen Gradient-Hintergrund haben.
            </p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
              Weißer Button
            </button>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-yellow-100 border border-yellow-300 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ Tailwind Test
          </h3>
          <p className="text-yellow-700">
            Wenn Sie diese Seite mit korrekten Farben und Styling sehen, funktioniert Tailwind CSS.
            Wenn alles nur Text ohne Styling ist, gibt es ein Problem mit der CSS-Konfiguration.
          </p>
        </div>
        
        <div className="mt-8 flex flex-wrap gap-4">
          <div className="w-16 h-16 bg-red-500 rounded-full"></div>
          <div className="w-16 h-16 bg-blue-500 rounded-lg"></div>
          <div className="w-16 h-16 bg-green-500 rounded"></div>
          <div className="w-16 h-16 bg-yellow-500"></div>
        </div>
      </div>
    </div>
  )
} 