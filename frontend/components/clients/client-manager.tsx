"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export type ClientSegment = "GLOBE" | "SME";

interface Client {
  id: number;
  name: string;
  segment: ClientSegment;
  contract_start: string;
  contract_end: string;
  status: string;
}

interface ClientForm {
  name: string;
  segment: ClientSegment;
  contract_start: string;
  contract_end: string;
}

const EMPTY_FORM: ClientForm = {
  name: "",
  segment: "GLOBE",
  contract_start: "",
  contract_end: "",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  EXPIRING_SOON: "Expiring Soon",
  EXPIRED: "Expired",
};

export function ClientManager({ segment }: { segment: ClientSegment }) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["clients", segment.toLowerCase()],
    queryFn: async () => {
      const res = await api.get<Client[]>("/clients/");
      return res.data.filter((client) => client.segment === segment);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ClientForm) => {
      if (editingClient) {
        return api.put(`/clients/${editingClient.id}`, values);
      }
      return api.post("/clients/", values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      closeForm();
    },
    onError: () => setError("Unable to save this client. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/clients/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
    onError: () => setError("Unable to delete this client. Please try again."),
  });

  const clients = data ?? [];
  const count = (status: string) => clients.filter((client) => client.status === status).length;

  function openCreateForm() {
    setEditingClient(null);
    setForm({ ...EMPTY_FORM, segment });
    setError(null);
    setIsFormOpen(true);
  }

  function openEditForm(client: Client) {
    setEditingClient(client);
    setForm({
      name: client.name,
      segment: client.segment,
      contract_start: client.contract_start,
      contract_end: client.contract_end,
    });
    setError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingClient(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    saveMutation.mutate(form);
  }

  function deleteClient(client: Client) {
    if (window.confirm(`Delete ${client.name}?`)) {
      setError(null);
      deleteMutation.mutate(client.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{segment === "GLOBE" ? "Globe" : "SME"} Clients</h1>
          <p className="text-sm text-muted">
            {clients.length} total · {count("ACTIVE")} active · {count("EXPIRING_SOON")} expiring soon · {count("EXPIRED")} expired
          </p>
        </div>
        <Button type="button" onClick={openCreateForm}>
          <Plus aria-hidden="true" className="mr-1 inline-block size-4" />
          Add Client
        </Button>
      </div>

      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Contract start</th>
                <th className="p-3 font-medium">Contract end</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="p-3">{client.name}</td>
                  <td className="p-3">{client.contract_start}</td>
                  <td className="p-3">{client.contract_end}</td>
                  <td className="p-3">{STATUS_LABEL[client.status] ?? client.status}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" aria-label={`Edit ${client.name}`} onClick={() => openEditForm(client)}>
                        <Pencil aria-hidden="true" className="size-4" />
                      </Button>
                      <Button type="button" variant="ghost" aria-label={`Delete ${client.name}`} onClick={() => deleteClient(client)}>
                        <Trash2 aria-hidden="true" className="size-4 text-red-700" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-ink/30 p-4" role="presentation">
          <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6 shadow-lg" role="dialog" aria-modal="true" aria-labelledby="client-form-title">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="client-form-title" className="text-base font-semibold">{editingClient ? "Edit Client" : "Add Client"}</h2>
              <Button type="button" variant="ghost" aria-label="Close" onClick={closeForm}>
                <X aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <form className="space-y-4" onSubmit={submitForm}>
              <label className="block text-sm font-medium">Name
                <Input required className="mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label className="block text-sm font-medium">Segment
                <select required className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm" value={form.segment} onChange={(event) => setForm({ ...form, segment: event.target.value as ClientSegment })}>
                  <option value="GLOBE">Globe</option>
                  <option value="SME">SME</option>
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">Contract start
                  <Input required className="mt-1" type="date" value={form.contract_start} onChange={(event) => setForm({ ...form, contract_start: event.target.value })} />
                </label>
                <label className="block text-sm font-medium">Contract end
                  <Input required className="mt-1" type="date" value={form.contract_end} onChange={(event) => setForm({ ...form, contract_end: event.target.value })} />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save Client"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}