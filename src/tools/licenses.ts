import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerLicenseTools(server: McpServer): void {
  server.registerTool(
    "visit_list_licenses",
    {
      title: "List Licenses",
      description: "List licenses for event systems. Types: touchpoint, scan, badge, app. Max 1000 per request.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        partnerId: z.string().optional().describe("Filter by partner ID"),
        fromRevision: z.number().int().min(0).optional().describe("Returns licenses with revision >= specified value"),
        limit: z.number().int().min(1).max(1000).default(100).optional().describe("Maximum licenses to return (1-1000)"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.partnerId) q.partnerId = params.partnerId;
        if (params.fromRevision !== undefined) q.fromRevision = params.fromRevision;
        if (params.limit !== undefined) q.limit = params.limit;
        const data = await makeApiRequest<unknown[]>(`/licenses/${params.expoId}`, "GET", undefined, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_get_license",
    {
      title: "Get License",
      description: "Get detailed information about a specific license.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        licenseId: z.string().describe("Alphanumeric License ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/licenses/${params.expoId}/${params.licenseId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_create_license",
    {
      title: "Create License",
      description: "Create a new license. Requires write permission. Provide type and max activations.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        partnerId: z.string().optional().describe("Partner ID (provide in body or query)"),
        body: z.record(z.unknown()).describe("License data: type (touchpoint/scan/badge/app), activationMax"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const q: Record<string, unknown> = {};
        if (params.partnerId) q.partnerId = params.partnerId;
        const data = await makeApiRequest<unknown>(`/licenses/${params.expoId}`, "POST", params.body, q);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_update_license",
    {
      title: "Update License",
      description: "Update an existing license. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        licenseId: z.string().describe("Alphanumeric License ID"),
        body: z.record(z.unknown()).describe("Fields to update (e.g. activationMax)"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/licenses/${params.expoId}/${params.licenseId}`, "PUT", params.body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "visit_delete_license",
    {
      title: "Delete License",
      description: "Delete a license. Requires write permission.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        licenseId: z.string().describe("Alphanumeric License ID"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown>(`/licenses/${params.expoId}/${params.licenseId}`, "DELETE");
        return { content: [{ type: "text", text: JSON.stringify(data ?? { success: true }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
