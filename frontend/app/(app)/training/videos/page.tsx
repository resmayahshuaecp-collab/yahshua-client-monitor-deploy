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

export default function TrainingVideosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["resources", "videos"],
    queryFn: async () => {
      const res = await api.get<Resource[]>("/onboarding/resources");
      return res.data.filter((resource) => resource.resource_type === "VIDEO");
    },
  });

  const videos = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Training Videos</h1>
        <p className="text-sm text-muted">YBO features &amp; modules</p>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-sm text-muted">No videos yet.</p>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div key={video.id} className="rounded-lg border p-4">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {video.title}
              </a>
              <p className="mt-1 text-sm text-muted">{video.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
