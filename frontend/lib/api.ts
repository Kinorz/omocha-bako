const ensureLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not defined. Create a .env.local file based on .env.example and set the backend URL."
    );
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

export async function fetchFromApi<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const targetUrl = `${getApiBaseUrl()}${ensureLeadingSlash(path)}`;

  const response = await fetch(targetUrl, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed with status ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
