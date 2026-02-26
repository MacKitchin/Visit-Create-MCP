import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerContentTools(server: McpServer): void {
  server.registerTool(
    "visit_list_contents",
    {
      title: "List Contents",
      description: "List digital content items (profiles, products, info) for an expo. Can filter by partner.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        partnerId: z.string().optional().describe("Filter by partner ID"),
        webhookId: z.string().optional().describe("Filter by webhook ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns contents with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum contents to return"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.partnerId) q.partnerId = params.partnerId;
        if (params.webhookId) q.webhookId = params.webhookId;
        if (params.fromRevision !== undefined) q.fromRevision = params.fromRevision;
        if (params.limit !== undefined) q.limit = params.limit;
        const data = await makeApiRequest<unknown[]>(`/contents/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_content",
    {
      title: "Get Content",
      description: "Get detailed information about a specific content item including descriptions, links, labels.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        contentId: z.string().describe("Alphanumeric Content ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/contents/${params.expoId}/${params.contentId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_create_content",
    {
      title: "Create Content",
      description: "Create a new content item (product or info type). Profile type not supported via API. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        partnerId: z.string().optional().describe("Partner ID (required for product type)"),
        body: z.record(z.unknown()).describe("Content data: name, type (product/info), source (internal/external), summary"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.partnerId) q.partnerId = params.partnerId;
        const data = await makeApiRequest<unknown>(`/contents/${params.expoId}`, "POST", params.body, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_update_content",
    {
      title: "Update Content",
      description: "Update an existing content item. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        contentId: z.string().describe("Alphanumeric Content ID"),
        body: z.record(z.unknown()).describe("Fields to update"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/contents/${params.expoId}/${params.contentId}`, "PUT", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_delete_content",
    {
      title: "Delete Content",
      description: "Delete a content item from an expo. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        contentId: z.string().describe("Alphanumeric Content ID"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/contents/${params.expoId}/${params.contentId}`, "DELETE");
        return { content: [{ type: "text", text: JSON.stringify(data ?? { success: true }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
