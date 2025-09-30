'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          🎨 AI Tattoo Rework - Test Sayfası
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Tailwind CSS Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-500 text-white p-4 rounded-lg">
              <h3 className="font-bold">Mavi Kutu</h3>
              <p>Tailwind çalışıyorsa bu mavi görünmeli</p>
            </div>
            <div className="bg-green-500 text-white p-4 rounded-lg">
              <h3 className="font-bold">Yeşil Kutu</h3>
              <p>Grid sistemi çalışıyor</p>
            </div>
            <div className="bg-red-500 text-white p-4 rounded-lg">
              <h3 className="font-bold">Kırmızı Kutu</h3>
              <p>Responsive tasarım</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Buton Test
          </h2>
          <div className="space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Mavi Buton
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Yeşil Buton
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Kırmızı Buton
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/dashboard" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            🚀 Dashboard'a Git
          </a>
        </div>
      </div>
    </div>
  );
}
