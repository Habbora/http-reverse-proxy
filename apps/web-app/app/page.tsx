"use client";

import { useState, useEffect } from "react";

interface Endpoint {
  id: string;
  subdomain: string; // Maps to 'id' in backend
  targetUrl: string; // Maps to 'url' in backend
  description: string; // Maps to 'name' in backend
  active: boolean; // Not persisted in backend currently
}

const SYSTEM_DOMAIN = "proxy.localhost:4000";

export default function Home() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Endpoint, "id" | "subdomain" | "active">>({
    targetUrl: "",
    description: "",
  });

  // Fetch endpoints on mount
  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/proxy");
      if (!response.ok) throw new Error("Failed to fetch endpoints");

      const data = await response.json() as { id: string; url: string; name: string }[];
      // Map backend data to frontend structure
      const mappedEndpoints: Endpoint[] = data.map((item) => ({
        id: item.id,
        subdomain: item.id, // Routing uses ID
        targetUrl: item.url,
        description: item.name, // Name is used as description/label
        active: true, // Backend doesn't support active status yet
      }));

      setEndpoints(mappedEndpoints);
      setError(null);
    } catch (err) {
      console.error("Error fetching endpoints:", err);
      setError("Erro ao carregar endpoints do servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (endpoint?: Endpoint) => {
    if (endpoint) {
      setEditingId(endpoint.id);
      setFormData({
        targetUrl: endpoint.targetUrl,
        description: endpoint.description,
      });
    } else {
      setEditingId(null);
      setFormData({
        targetUrl: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const trimmedUrl = formData.targetUrl.trim();
      if (!trimmedUrl) {
        alert("A URL de destino é obrigatória.");
        return;
      }

      // If description is empty, use a generated one or error?
      // Backend requires name. Let's make it required in UI or generate one.
      const name = formData.description.trim() || `Endpoint-${Date.now()}`;

      if (editingId) {
        // Update existing
        const endpointToUpdate = endpoints.find((ep) => ep.id === editingId);
        if (!endpointToUpdate) return;

        const response = await fetch(`/api/proxy/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            url: trimmedUrl,
          }),
        });

        if (!response.ok) throw new Error("Failed to update endpoint");

        setEndpoints(
          endpoints.map((ep) =>
            ep.id === editingId
              ? { ...ep, targetUrl: trimmedUrl, description: name }
              : ep,
          ),
        );
      } else {
        // Add new
        const response = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            url: trimmedUrl,
          }),
        });

        if (!response.ok) throw new Error("Failed to create endpoint");

        const newRoute = await response.json(); // Backend returns the created route

        const newEndpoint: Endpoint = {
          id: newRoute.id,
          subdomain: newRoute.id,
          targetUrl: newRoute.url,
          description: newRoute.name,
          active: true,
        };
        setEndpoints([...endpoints, newEndpoint]);
      }
      handleCloseModal();
      setError(null);
    } catch (err) {
      console.error("Error saving endpoint:", err);
      setError("Erro ao salvar endpoint. Verifique se o nome é único e a URL é válida.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este endpoint?")) {
      try {
        const response = await fetch(`/api/proxy/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete endpoint");

        setEndpoints(endpoints.filter(ep => ep.id !== id));
        setError(null);
      } catch (err) {
        console.error("Error deleting endpoint:", err);
        setError("Erro ao excluir endpoint.");
      }
    }
  };

  const toggleActive = async (id: string, active: number) => {
    fetch(`/api/proxy/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isActive: active,
      }),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 font-sans">
      <main className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reverse Proxy Manager</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie seus endpoints e subdomínios</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <span>+ Novo Endpoint</span>
          </button>
        </header>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Endpoints List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">Carregando endpoints...</p>
            </div>
          ) : endpoints.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">Nenhum endpoint configurado.</p>
              <p className="text-sm mt-2">Clique em &quot;Novo Endpoint&quot; para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Domínio de Entrada (ID)</th>
                    <th className="px-6 py-4">URL de Destino</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {endpoints.map((endpoint) => (
                    <tr key={endpoint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(endpoint.id, endpoint.active ? 0 : 1)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${endpoint.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          title="Status local apenas (não persistido)"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${endpoint.active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                        {endpoint.description}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400 text-xs">
                        <div className="flex items-center gap-2 group">
                          <span className="text-blue-600 dark:text-blue-400">http://{endpoint.subdomain}.{SYSTEM_DOMAIN}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(`http://${endpoint.subdomain}.${SYSTEM_DOMAIN}`)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-opacity"
                            title="Copiar URL"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-2.278-3.692-4.125-8.25-4.125v6.75m-4.5 9.375h.008v.008h-.008v-.008z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">
                        {endpoint.targetUrl}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleOpenModal(endpoint)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(endpoint.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingId ? "Editar Endpoint" : "Novo Endpoint"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome (Identificador Único)
                </label>
                <input
                  type="text"
                  placeholder="Ex: API de Usuários"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL de Destino (Target URL)
                </label>
                <input
                  type="url"
                  required
                  placeholder="http://localhost:3000"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 mt-4">
                O ID do endpoint (subdomínio) será gerado automaticamente pelo sistema.
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  {editingId ? "Salvar Alterações" : "Criar Endpoint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
