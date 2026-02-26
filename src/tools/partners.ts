import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerPartnerTools(server: McpServer): void {
  server.registerTool(
    "visit_list_partners",
    {
      title: "List Partners",
      description: "List exhibiting partners/companies for an expo. Supports filtering by registration type, contact. Max 100 per request.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        webhookId: z.string().optional().describe("Filter by webhook ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns partners with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum partners to return (1-100)"),
        showDeleted: z.boolean().default(true).optional().describe("Whether to include deleted items"),
        contactReference: z.string().optional().describe("Filter by contact reference"),
        contactId: z.string().optional().describe("Filter by contact ID"),
        registrationType: z.string().optional().describe("Comma-separated registration type IDs"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.webhookId) q.webhookId = params.webhookId;
        if (params.fromRevision !== undefined) q.fromRevision = params.fromRevision;
        if (params.limit !== undefined) q.limit = params.limit;
        if (params.showDeleted !== undefined) q.showDeleted = params.showDeleted;
        if (params.contactReference) q.contactReference = params.contactReference;
        if (params.contactId) q.contactId = params.contactId;
        if (params.registrationType) q.registrationType = params.registrationType;
        const data = await makeApiRequest<unknown[]>(`/partners/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_partner",
    {
      title: "Get Partner",
      description: "Get detailed information about a specific partner including contact, booth, content, and licenses.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        partnerId: z.string().describe("Alphanumeric Partner ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/partners/${params.expoId}/${params.partnerId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_create_partner",
    {
      title: "Create Partner",
      description: "Create a new exhibiting partner. Requires write permission. Must provide name and registration type.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        body: z.record(z.unknown()).describe("Partner data including name, contact, registrationType"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/partners/${params.expoId}`, "POST", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_update_partner",
    {
      title: "Update Partner",
      description: "Update an existing partner's information. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        partnerId: z.string().describe("Alphanumeric Partner ID"),
        body: z.record(z.unknown()).describe("Fields to update"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/partners/${params.expoId}/${params.partnerId}`, "PUT", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_delete_partner",
    {
      title: "Delete Partner",
      description: "Delete a partner from an expo. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        partnerId: z.string().describe("Alphanumeric Partner ID"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/partners/${params.expoId}/${params.partnerId}`, "DELETE");
        return { content: [{ type: "text", text: JSON.stringify(data ?? { success: true }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
