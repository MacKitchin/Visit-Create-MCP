import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerActivityTools(server: McpServer): void {
  server.registerTool(
    "visit_list_activities",
    {
      title: "List Activities",
      description: "List activities (sessions, workshops, presentations, etc.) for an expo. Types: session, seminar, workshop, presentation, keynote, etc.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        webhookId: z.string().optional().describe("Filter by webhook ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns activities with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum activities to return (1-100)"),
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
        if (params.showDeleted !== undefined) q.showDeleted = params.showDeleted;
        const data = await makeApiRequest<unknown[]>(`/activities/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_activity",
    {
      title: "Get Activity",
      description: "Get detailed information about a specific activity including schedule, capacity, and participants.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        activityId: z.string().describe("Alphanumeric Activity ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/activities/${params.expoId}/${params.activityId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_create_activity",
    {
      title: "Create Activity",
      description: "Create a new activity/session. Requires write permission. Provide name, type, start/end times.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        body: z.record(z.unknown()).describe("Activity data: name, type (session/seminar/workshop/etc), start, end, access (open/signup/restricted)"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/activities/${params.expoId}`, "POST", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_update_activity",
    {
      title: "Update Activity",
      description: "Update an existing activity. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        activityId: z.string().describe("Alphanumeric Activity ID"),
        body: z.record(z.unknown()).describe("Fields to update"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/activities/${params.expoId}/${params.activityId}`, "PUT", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_delete_activity",
    {
      title: "Delete Activity",
      description: "Delete an activity from an expo. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        activityId: z.string().describe("Alphanumeric Activity ID"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/activities/${params.expoId}/${params.activityId}`, "DELETE");
        return { content: [{ type: "text", text: JSON.stringify(data ?? { success: true }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
