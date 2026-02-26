import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerRegistrationTypeTools(server: McpServer): void {
  server.registerTool(
    "visit_list_registration_types",
    {
      title: "List Registration Types",
      description: "List all visitor and partner registration types configured for the organization and expo.",
      inputSchema: {
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<unknown[]>(`/registrationTypes/${params.expoId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
