import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerParticipantTools(server: McpServer): void {
  server.registerTool(
    "visit_list_participants",
    {
      title: "List Participants",
      description: "List visitors who have participated/attended the expo. Includes attendance times and activity participation.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        webhookId: z.string().optional().describe("Filter by webhook ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns participants with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum participants to return"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.webhookId) q.webhookId = params.webhookId;
        if (params.fromRevision !== undefined) q.fromRevision = params.fromRevision;
        if (params.limit !== undefined) q.limit = params.limit;
        const data = await makeApiRequest<unknown[]>(`/participants/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_participant",
    {
      title: "Get Participant",
      description: "Get participation details for a specific visitor including arrival/departure times and activities attended.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        visitorId: z.string().describe("Alphanumeric Visitor ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/participants/${params.expoId}/${params.visitorId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
