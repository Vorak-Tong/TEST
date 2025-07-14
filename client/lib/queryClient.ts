import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export async function apiRequest(method: string, url: string, data?: any): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response;
}
