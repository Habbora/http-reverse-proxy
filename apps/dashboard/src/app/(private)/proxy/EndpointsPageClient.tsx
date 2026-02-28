"use client";

import Link from "next/link";
import type React from "react";
import { startTransition, useState } from "react";
import { updateActiveAction } from "./actions";

type Endpoint = {
  id: string;
  isActive: boolean;
  proxyName: string;
  proxyUrl: string;
  targetUrl: string;
}

type Props = {
  initialEndpoints: Endpoint[];
  createRouteAction: (formData: FormData) => Promise<Endpoint>;
  updateRouteAction: (id: string, formData: FormData) => Promise<Endpoint>;
  deleteRouteAction: (id: string) => Promise<Endpoint>;
};

export default function EndpointsPageClient({
  initialEndpoints,
  createRouteAction,
  updateRouteAction,
  deleteRouteAction,
}: Props) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(initialEndpoints);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Endpoint, "id" | "isActive" | "proxyUrl">>({
    targetUrl: "",
    proxyName: "",
  });

  const handleOpenModal = (endpoint?: Endpoint) => {
    if (endpoint) {
      setEditingId(endpoint.id);
      setFormData({
        proxyName: endpoint.proxyName,
        targetUrl: endpoint.targetUrl,
      });
    } else {
      setEditingId(null);
      setFormData({
        proxyName: "",
        targetUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      proxyName: "",
      targetUrl: "",
    });
  };

  const handleDeleteSubmit = (id: string, event: React.FormEvent) => {
    const confirmed = confirm("Tem certeza que deseja remover este endpoint?");
    if (!confirmed) {
      event.preventDefault();
      return;
    }
    setError(null);
    deleteRouteAction(id).catch(() => {
      setError("Erro ao excluir endpoint.");
    });
  };

  const toggleActive = (id: string) => {
    const endpoint = endpoints.find((ep) => ep.id === id);
    const newIsActive = !endpoint?.isActive;
    startTransition(async () => {
      const newEndpoint = await updateActiveAction(id, newIsActive).catch(() => {
        setError("Erro ao atualizar endpoint.");
      });

      console.log(newEndpoint);

      setEndpoints(
        endpoints.map((ep) =>
          ep.id === newEndpoint?.id ? { ...ep, isActive: newEndpoint.isActive } : ep,
        ),
      );
    });
  };

  const handleFormAction = (formDataFromAction: FormData) => {
    startTransition(async () => {
      if (editingId) {
        const updated = await updateRouteAction(editingId, formDataFromAction);
        setEndpoints(
          endpoints.map((ep) =>
            ep.id === updated.id ? updated : ep,
          ),
        );
      } else {
        const created = await createRouteAction(formDataFromAction);
        setEndpoints([...endpoints, created]);
      }

      // aqui é só UI / client
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        proxyName: "",
        targetUrl: "",
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 font-sans">
      <main className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reverse Proxy Manager
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gerencie seus endpoints e subdomínios
            </p>
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {endpoints.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">Nenhum endpoint configurado.</p>
              <p className="text-sm mt-2">
                Clique em &quot;Novo Endpoint&quot; para começar.
              </p>
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
                    <tr
                      key={endpoint.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(endpoint.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            endpoint.isActive
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          title="Status local apenas (não persistido)"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${endpoint.isActive
                              ? "translate-x-6"
                              : "translate-x-1"
                              }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                        {endpoint.proxyName}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400 text-xs">
                        <div className="flex items-center gap-2 group">
                          <Link href={endpoint.proxyUrl} className="text-blue-600 dark:text-blue-400">
                            {endpoint.proxyUrl}
                          </Link>
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
                        <form
                          onSubmit={(event) =>
                            handleDeleteSubmit(endpoint.id, event)
                          }
                          className="inline"
                        >
                          <button
                            type="submit"
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                          >
                            Excluir
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingId ? "Editar Endpoint" : "Novo Endpoint"}
            </h2>
            <form
              action={handleFormAction}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome (Identificador Único)
                </label>
                <input
                  name="proxyName"
                  type="text"
                  placeholder="Ex: API de Usuários"
                  value={formData.proxyName}
                  onChange={(e) =>
                    setFormData({ ...formData, proxyName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL de Destino (Target URL)
                </label>
                <input
                  name="targetUrl"
                  type="url"
                  required
                  placeholder="http://localhost:3000"
                  value={formData.targetUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, targetUrl: e.target.value })
                  }
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

