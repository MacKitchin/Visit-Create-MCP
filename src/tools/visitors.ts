import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerVisitorTools(server: McpServer): void {
  server.registerTool(
    "visit_list_visitors",
    {
      title: "List Visitors",
      description: "List visitors registered for an expo. Supports filtering by registration state, type, contact reference. Max 100 per request.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        webhookId: z.string().optional().describe("Filter by webhook ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns visitors with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum visitors to return (1-100)"),
        contactReference: z.string().optional().describe("Filter by contact reference"),
        contactId: z.string().optional().describe("Filter by contact ID"),
        registrationStates: z.string().optional().describe("Comma-separated registration states: registered,incomplete,denied,cancelled"),
        registrationTypes: z.string().optional().describe("Comma-separated registration type IDs"),
        showDeleted: z.boolean().default(true).optional().describe("Whether to include deleted items"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.webhookId) q.webhookId = params.webhookId;
        if (params.fromRevision !== undefined) q.fromRevision = params.fromRevision;
        if (params.limit !== undefined) q.limit = params.limit;
        if (params.contactReference) q.contactReference = params.contactReference;
        if (params.contactId) q.contactId = params.contactId;
        if (params.registrationStates) q.registrationStates = params.registrationStates;
        if (params.registrationTypes) q.registrationTypes = params.registrationTypes;
        if (params.showDeleted !== undefined) q.showDeleted = params.showDeleted;
        const data = await makeApiRequest<unknown[]>(`/visitors/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_visitor",
    {
      title: "Get Visitor",
      description: "Get detailed information about a specific visitor including contact info, registration state, badges.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        visitorId: z.string().describe("Alphanumeric Visitor ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/visitors/${params.expoId}/${params.visitorId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_create_visitor",
    {
      title: "Create Visitor",
      description: "Create a new visitor registration. Requires write permission. Provide contact info and registration details.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        body: z.record(z.unknown()).describe("Visitor data including contact object with firstName, lastName, email, etc."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/visitors/${params.expoId}`, "POST", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_update_visitor",
    {
      title: "Update Visitor",
      description: "Update an existing visitor's information. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        visitorId: z.string().describe("Alphanumeric Visitor ID"),
        body: z.record(z.unknown()).describe("Fields to update"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/visitors/${params.expoId}/${params.visitorId}`, "PUT", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_delete_visitor",
    {
      title: "Delete Visitor",
      description: "Delete a visitor registration. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        visitorId: z.string().describe("Alphanumeric Visitor ID"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/visitors/${params.expoId}/${params.visitorId}`, "DELETE");
        return { content: [{ type: "text", text: JSON.stringify(data ?? { success: true }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
