import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

export function registerUploadTools(server: McpServer): void {
  server.registerTool(
    "visit_upload_file",
    {
      title: "Upload File",
      description:
        "Upload a file (image) for a visitor. Supports profile photos, ID card scans, and ID photos. " +
        "The file must be provided as a base64-encoded string of the raw image bytes (JPEG, PNG, etc.). " +
        "Source type: 'visitor' (current OpenAPI spec only supports visitor uploads). " +
        "Upload types: 'ProfilePhoto' (profile picture), 'IdCard' (identity card scan), 'IdPhoto' (identity photo). " +
        "Requires write permission on the API key.",
      inputSchema: {
        source: z.enum(["visitor"]).describe("Source type for the upload. Current API spec supports visitor uploads."),
        metaId: z.string().describe("The visitor ID to attach the upload to."),
        type: z.enum(["ProfilePhoto", "IdCard", "IdPhoto"]).describe("Type of upload: ProfilePhoto (profile picture), IdCard (identity card scan), IdPhoto (identity photo)."),
        fileBase64: z.string().describe("The file content as a base64-encoded string. The API accepts binary image data (JPEG, PNG, etc.). Provide the raw file bytes encoded in base64."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params) => {
      try {
        // Convert base64 to Buffer for binary upload
        const fileBuffer = Buffer.from(params.fileBase64, "base64");

        const q: Record<string, unknown> = { type: params.type };

        // Use axios directly for binary upload with different content type
        const { default: axios } = await import("axios");
        const apiKey = process.env.VISIT_API_KEY;
        if (!apiKey) {
          return { content: [{ type: "text", text: "Error: VISIT_API_KEY environment variable is required." }], isError: true };
        }

        const response = await axios({
          method: "POST",
          url: `https://api.visitcloud.com/create/v2/upload/${params.source}/${params.metaId}`,
          data: fileBuffer,
          params: q,
          headers: {
            "Content-Type": "application/octet-stream",
          },
          auth: {
            username: apiKey,
            password: "",
          },
          timeout: 60000,
        });

        return { content: [{ type: "text", text: JSON.stringify(response.data ?? { success: true }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
