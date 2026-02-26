import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerPaymentTools(server: McpServer): void {
  server.registerTool(
    "visit_list_payments",
    {
      title: "List Payments",
      description: "List payment transactions. Can filter by state (pending, paid, denied, refunded, cancelled) and method (card, invoice, manual, free).",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        visitorId: z.string().optional().describe("Filter by visitor ID"),
        partnerId: z.string().optional().describe("Filter by partner ID"),
        webhookId: z.string().optional().describe("Filter by webhook ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns payments with revision >= specified value"),
        limit: z.number().int().min(1).max(100).default(100).optional().describe("Maximum payments to return"),
        paymentStates: z.string().optional().describe("Comma-separated: pending,paid,denied,refunded,cancelled"),
        paymentMethods: z.string().optional().describe("Comma-separated: card,invoice,manual,free"),
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
        if (params.paymentStates) q.paymentStates = params.paymentStates;
        if (params.paymentMethods) q.paymentMethods = params.paymentMethods;
        const data = await makeApiRequest<unknown[]>(`/payments/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_payment",
    {
      title: "Get Payment",
      description: "Get detailed information about a specific payment.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        paymentId: z.string().describe("Alphanumeric Payment ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/payments/${params.expoId}/${params.paymentId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_update_payment",
    {
      title: "Update Payment",
      description: "Update a payment's state. Only paid, denied, and pending states are supported. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        paymentId: z.string().describe("Alphanumeric Payment ID"),
        body: z.record(z.unknown()).describe("Payment update data. Only state can be changed: paid, denied, pending"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/payments/${params.expoId}/${params.paymentId}`, "PUT", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
