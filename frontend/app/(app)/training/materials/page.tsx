"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

interface Resource {
  id: number;
  title: string;
  resource_type: string;
  description: string;
  url: string;
}

export default function TrainingMaterialsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["resources", "materials"],
    queryFn: async () => {
      const res = await api.get<Resource[]>("/onboarding/resources");
      return res.data.filter((resource) => resource.resource_type === "MATERIAL");
    },
  });

  const materials = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Training Materials</h1>
        <p className="text-sm text-muted">Guides and reference documents</p>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : materials.length === 0 ? (
        <p className="text-sm text-muted">No materials yet.</p>
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <div key={material.id} className="rounded-lg border p-4">
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {material.title}
              </a>
              <p className="mt-1 text-sm text-muted">{material.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
