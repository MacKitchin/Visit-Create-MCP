import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerOrderTools(server: McpServer): void {
  server.registerTool(
    "visit_list_orders",
    {
      title: "List Orders",
      description: "List orders/transactions from Visit's shop functionality. Can filter by state: paying, paymentPending, completed, timeout, cancelled.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        visitorId: z.string().optional().describe("Filter by visitor ID"),
        partnerId: z.string().optional().describe("Filter by partner ID"),
        webhookId: z.string().optional().describe("Filter by webhook ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns orders with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum orders to return"),
        orderStates: z.string().optional().describe("Comma-separated: paying,paymentPending,completed,timeout,cancelled"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.visitorId) q.visitorId = params.visitorId;
        if (params.partnerId) q.partnerId = params.partnerId;
        if (params.webhookId) q.webhookId = params.webhookId;
        if (params.fromRevision !== undefined) q.fromRevision = params.fromRevision;
        if (params.limit !== undefined) q.limit = params.limit;
        if (params.orderStates) q.orderStates = params.orderStates;
        const data = await makeApiRequest<unknown[]>(`/orders/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_order",
    {
      title: "Get Order",
      description: "Get detailed information about a specific order including line items and payments.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        orderId: z.string().describe("Alphanumeric Order ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/orders/${params.expoId}/${params.orderId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
