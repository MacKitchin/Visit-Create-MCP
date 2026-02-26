import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerActionTools(server: McpServer): void {
  server.registerTool(
    "visit_list_actions",
    {
      title: "List Actions",
      description: "List all digital interactions/actions (badge scans, prints, etc.) - the raw event data. Action types: scan, print, manual.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        locationId: z.string().optional().describe("Filter by location ID"),
        partnerId: z.string().optional().describe("Filter by partner ID"),
        visitorId: z.string().optional().describe("Filter by visitor ID"),
        contentId: z.string().optional().describe("Filter by content ID"),
        webhookId: z.string().optional().describe("Filter by webhook ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns actions with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum actions to return"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.locationId) q.locationId = params.locationId;
        if (params.partnerId) q.partnerId = params.partnerId;
        if (params.visitorId) q.visitorId = params.visitorId;
        if (params.contentId) q.contentId = params.contentId;
        if (params.webhookId) q.webhookId = params.webhookId;
        if (params.fromRevision !== undefined) q.fromRevision = params.fromRevision;
        if (params.limit !== undefined) q.limit = params.limit;
        const data = await makeApiRequest<unknown[]>(`/actions/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
