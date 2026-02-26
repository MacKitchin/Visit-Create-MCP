import axios, { AxiosError, AxiosInstance } from "axios";
import { API_BASE_URL, REQUEST_TIMEOUT } from "../constants.js";

let apiClient: AxiosInstance | null = null;

function getApiKey(): string {
  const key = process.env.VISIT_API_KEY;
  if (!key) {
    throw new Error("VISIT_API_KEY environment variable is required. Set it to your Visit Create API key.");
  }
  return key;
}

function getClient(): AxiosInstance {
  if (!apiClient) {
    const apiKey = getApiKey();
    apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      auth: {
        username: apiKey,
        password: "",
      },
    });
  }
  return apiClient;
}

export async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: unknown,
  params?: Record<string, unknown>
): Promise<T> {
  const client = getClient();
  const response = await client({
    method,
    url: endpoint,
    data,
    params,
  });
  return response.data;
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as Record<string, unknown> | undefined;

      switch (status) {
        case 400: {
          const title = data?.title ?? "Bad request";
          return `Error (400): ${title}. Check that all required parameters are correct.`;
        }
        case 401:
          return "Error (401): Unauthorized. Check your VISIT_API_KEY is valid.";
        case 403:
          return "Error (403): Forbidden. Your API key may not have write permission for this operation.";
        case 404:
          return "Error (404): Resource not found. Check the ID is correct.";
        case 422: {
          const errors = (data as Record<string, unknown>)?.errors;
          if (Array.isArray(errors)) {
            const details = errors.map((e: Record<string, string>) => `${e.field}: ${e.description}`).join("; ");
            return `Error (422): Validation failed - ${details}`;
          }
          return "Error (422): Unprocessable entity. Check your request body for invalid fields.";
        }
        case 429:
          return "Error (429): Rate limit exceeded. Visit API allows max 2 parallel requests. Wait and retry.";
        default:
          return `Error (${status}): API request failed. ${data?.title ?? ""}`;
      }
    } else if (axiosError.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again.";
    } else if (axiosError.code === "ENOTFOUND") {
      return "Error: Cannot reach Visit API. Check network connectivity.";
    }
  }
  return `Error: ${error instanceof Error ? error.message : String(error)}`;
}
