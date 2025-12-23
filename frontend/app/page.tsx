import Chat from "../app/components/Chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-center mb-6">
        AI Search Chat
      </h1>

      <Chat />
    </main>
  );
}
