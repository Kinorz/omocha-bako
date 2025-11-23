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

  const responseText = await response.text();

  if (!response.ok) {
    let message = `API call failed with status ${response.status}: ${response.statusText}`;

    try {
      const parsed = JSON.parse(responseText);
      const problemDetailsTitle = parsed?.title ?? parsed?.error ?? parsed?.message;
      if (problemDetailsTitle) {
        message = `${message}\n${problemDetailsTitle}`;
      }

      const errors = parsed?.errors;
      if (errors && typeof errors === "object") {
        const flattened = Object.values(errors)
          .flat()
          .join("\n");
        if (flattened) {
          message = `${message}\n${flattened}`;
        }
      }
    } catch {
      // ignore JSON parse issues and fall back to default message
    }

    throw new Error(message);
  }

  if (!responseText) {
    return undefined as TResponse;
  }

  try {
    return JSON.parse(responseText) as TResponse;
  } catch {
    return responseText as unknown as TResponse;
  }
}
