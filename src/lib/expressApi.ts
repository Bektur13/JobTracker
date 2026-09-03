import type { ApplicationStage, JobApplication } from "@/components/kanban/board";

// The Express API (Kanban board's CRUD) — separate origin from the Next.js
// app, same as the extension's CTK_DEFAULT_API_BASE. Auth rides on the Clerk
// session cookie: cookies aren't port-scoped, and Express's CORS config
// already allows credentialed requests from http://localhost:3000.
const EXPRESS_API_BASE = "http://localhost:3001";

interface ApiCompany {
  id: string;
  name: string;
}

interface ApiJobApplication {
  id: string;
  role: string;
  stage: ApplicationStage;
  location: string | null;
  salaryRange: string | null;
  description: string | null;
  updatedAt: string;
  dateApplied: string;
  company: ApiCompany | null;
}

// Field names differ deliberately between the two sides (role/company.name
// on the DB-facing API vs jobTitle/companyName on the board's UI model) —
// mapped once here instead of scattered across every call site.
function mapApplication(api: ApiJobApplication): JobApplication {
  return {
    id: api.id,
    jobTitle: api.role,
    companyName: api.company?.name ?? "Unknown company",
    stage: api.stage,
    location: api.location ?? undefined,
    salaryRange: api.salaryRange ?? undefined,
    description: api.description ?? undefined,
    updatedAt: api.updatedAt.split("T")[0],
    dateApplied: api.dateApplied.split("T")[0],
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchApplications(): Promise<JobApplication[]> {
  const res = await fetch(`${EXPRESS_API_BASE}/applications?pageSize=100`, {
    credentials: "include",
  });
  const body = await handleResponse<{ data: ApiJobApplication[] }>(res);
  return body.data.map(mapApplication);
}

export async function createApplication(input: {
  jobTitle: string;
  companyName: string;
  location?: string;
  salaryRange?: string;
  description?: string;
}): Promise<JobApplication> {
  const res = await fetch(`${EXPRESS_API_BASE}/applications`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: input.jobTitle,
      companyName: input.companyName,
      location: input.location,
      salaryRange: input.salaryRange,
      description: input.description,
    }),
  });
  return mapApplication(await handleResponse<ApiJobApplication>(res));
}

export async function updateApplicationStage(id: string, stage: ApplicationStage): Promise<JobApplication> {
  const res = await fetch(`${EXPRESS_API_BASE}/applications/${id}/stage`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage }),
  });
  return mapApplication(await handleResponse<ApiJobApplication>(res));
}
