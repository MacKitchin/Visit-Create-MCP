import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerConnectionTools(server: McpServer): void {
  server.registerTool(
    "visit_list_connections",
    {
      title: "List Connections",
      description: "List connections between visitors and partners/content. Generated when visitors interact via Visit Connect/Discover or TouchPoints.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        type: z.enum(["visitor", "partner"]).optional().describe("Connection owner type (auto-detected if partnerId or visitorId provided)"),
        partnerId: z.string().optional().describe("Filter by partner ID"),
        visitorId: z.string().optional().describe("Filter by visitor ID"),
        webhookId: z.string().optional().describe("Filter by webhook ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns connections with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum connections to return"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.type) q.type = params.type;
        if (params.partnerId) q.partnerId = params.partnerId;
        if (params.visitorId) q.visitorId = params.visitorId;
        if (params.webhookId) q.webhookId = params.webhookId;
        if (params.fromRevision !== undefined) q.fromRevision = params.fromRevision;
        if (params.limit !== undefined) q.limit = params.limit;
        const data = await makeApiRequest<unknown[]>(`/connections/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_connection",
    {
      title: "Get Connection",
      description: "Get detailed information about a specific connection including visitor, partner, timing, notes, rating.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        connectionId: z.string().describe("Alphanumeric Connection ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/connections/${params.expoId}/${params.connectionId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
