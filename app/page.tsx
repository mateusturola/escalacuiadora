import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            EscalaCuidadora
          </h1>
          <p className="text-gray-600">
            Sistema de Gerenciamento de Escalas
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition duration-200 shadow-md"
          >
            Acesso Admin
          </Link>

          <Link
            href="/cuidadora"
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition duration-200 shadow-md"
          >
            Acesso Cuidadora
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Escolha seu tipo de acesso para continuar</p>
        </div>
      </div>
    </div>
  );
}
