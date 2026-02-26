import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerSendEmailTools(server: McpServer): void {
  server.registerTool(
    "visit_send_email",
    {
      title: "Send Email",
      description: "Send a confirmation email to a visitor. Use force=true to resend even if already sent.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        visitorId: z.string().describe("Visitor ID to send email to"),
        type: z.enum(["confirmation"]).describe("Email type (only 'confirmation' is supported by the API)"),
        force: z.boolean().default(false).optional().describe("Send even if already sent before"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          visitorId: params.visitorId,
          type: params.type,
        };
        if (params.force !== undefined) body.force = params.force;
        const data = await makeApiRequest<unknown>(
          `/sendemail/${params.expoId}`,
          "POST",
          body
        );
        return { content: [{ type: "text", text: JSON.stringify(data ?? { success: true }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
