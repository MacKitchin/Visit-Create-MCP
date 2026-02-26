import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerWebhookTools(server: McpServer): void {
  server.registerTool(
    "visit_list_webhooks",
    {
      title: "List Webhooks",
      description: "List webhooks configured for the API key. Webhooks notify your endpoints when data changes.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown[]>(`/webhooks/${params.expoId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_webhook",
    {
      title: "Get Webhook",
      description: "Get detailed information about a specific webhook including usage history.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        webhookId: z.string().describe("Alphanumeric Webhook ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/webhooks/${params.expoId}/${params.webhookId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_create_webhook",
    {
      title: "Create Webhook",
      description: "Create a new webhook. Types: visitor, partner, participant, action, connection, content, payment, activity.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        body: z.record(z.unknown()).describe("Webhook data: type, url, enabled"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/webhooks/${params.expoId}`, "POST", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_update_webhook",
    {
      title: "Update Webhook",
      description: "Enable/disable a webhook or reset state to 'wait' after errors.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        webhookId: z.string().describe("Alphanumeric Webhook ID"),
        body: z.record(z.unknown()).describe("Fields to update: enabled (boolean), state ('wait')"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/webhooks/${params.expoId}/${params.webhookId}`, "PUT", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_delete_webhook",
    {
      title: "Delete Webhook",
      description: "Permanently delete a webhook.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        webhookId: z.string().describe("Alphanumeric Webhook ID"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/webhooks/${params.expoId}/${params.webhookId}`, "DELETE");
        return { content: [{ type: "text", text: JSON.stringify(data ?? { success: true }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
