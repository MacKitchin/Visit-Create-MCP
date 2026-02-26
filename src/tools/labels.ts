import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerLabelTools(server: McpServer): void {
  server.registerTool(
    "visit_list_labels",
    {
      title: "List Labels",
      description: "List labels used to categorize content at the event.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns labels with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum labels to return"),
        showDeleted: z.boolean().default(true).optional().describe("Whether to include deleted items"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.fromRevision !== undefined) q.fromRevision = params.fromRevision;
        if (params.limit !== undefined) q.limit = params.limit;
        if (params.showDeleted !== undefined) q.showDeleted = params.showDeleted;
        const data = await makeApiRequest<unknown[]>(`/labels/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_label",
    {
      title: "Get Label",
      description: "Get detailed information about a specific label.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        labelId: z.string().describe("Alphanumeric Label ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/labels/${params.expoId}/${params.labelId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_create_label",
    {
      title: "Create Label",
      description: "Create a new label. Requires write permission. Provide name, hex color, and content types.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        body: z.record(z.unknown()).describe("Label data: name, color (hex e.g. #002c4b), types (array: profile, product)"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/labels/${params.expoId}`, "POST", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_update_label",
    {
      title: "Update Label",
      description: "Update an existing label. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        labelId: z.string().describe("Alphanumeric Label ID"),
        body: z.record(z.unknown()).describe("Fields to update"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/labels/${params.expoId}/${params.labelId}`, "PUT", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_delete_label",
    {
      title: "Delete Label",
      description: "Delete a label. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        labelId: z.string().describe("Alphanumeric Label ID"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/labels/${params.expoId}/${params.labelId}`, "DELETE");
        return { content: [{ type: "text", text: JSON.stringify(data ?? { success: true }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
