import Link from 'next/link';

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">BetStay Project</h1>
      <div className="flex gap-4">
        <Link href="/login" className="bg-blue-600 px-6 py-2 rounded">Ir al Login</Link>
      </div>
    </div>
  );
}