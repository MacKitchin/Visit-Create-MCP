import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerTouchpointTools(server: McpServer): void {
  server.registerTool(
    "visit_list_touchpoints",
    {
      title: "List Touchpoints",
      description: "List NFC touchpoint devices used for badge scanning. Max 1000 per request.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        partnerId: z.string().optional().describe("Filter by partner ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns touchpoints with revision >= specified value"),
        limit: z.number().int().min(1).max(1000).default(100).optional().describe("Maximum touchpoints to return (1-1000)"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.partnerId) q.partnerId = params.partnerId;
        if (params.fromRevision !== undefined) q.fromRevision = params.fromRevision;
        if (params.limit !== undefined) q.limit = params.limit;
        const data = await makeApiRequest<unknown[]>(`/touchpoints/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
