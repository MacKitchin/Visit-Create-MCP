import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerExpoTools(server: McpServer): void {
  // List Expos
  server.registerTool(
    "visit_list_expos",
    {
      title: "List Expos",
      description: "List all expos (events) accessible with the current API key. Returns up to 100 expos. Use fromRevision for pagination.",
      inputSchema: {
        fromRevision: z.number().int().min(0).optional().describe("Returns expos with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum expos to return (1-100)"),
        reference: z.string().optional().describe("Filter by expo reference"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const queryParams: Record<string, unknown> = {};
        if (params.fromRevision !== undefined) queryParams.fromRevision = params.fromRevision;
        if (params.limit !== undefined) queryParams.limit = params.limit;
        if (params.reference !== undefined) queryParams.reference = params.reference;

        const data = await makeApiRequest<unknown[]>("/expos", "GET", undefined, queryParams);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  // Get Expo
  server.registerTool(
    "visit_get_expo",
    {
      title: "Get Expo",
      description: "Get detailed information about a specific expo including dates, location, timezone, descriptions.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/expos/${params.expoId}`);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
