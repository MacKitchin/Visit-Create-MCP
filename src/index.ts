#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerExpoTools } from "./tools/expos.js";
import { registerVisitorTools } from "./tools/visitors.js";
import { registerPartnerTools } from "./tools/partners.js";
import { registerActivityTools } from "./tools/activities.js";
import { registerContentTools } from "./tools/contents.js";
import { registerConnectionTools } from "./tools/connections.js";
import { registerActionTools } from "./tools/actions.js";
import { registerParticipantTools } from "./tools/participants.js";
import { registerOrderTools } from "./tools/orders.js";
import { registerPaymentTools } from "./tools/payments.js";
import { registerLabelTools } from "./tools/labels.js";
import { registerLicenseTools } from "./tools/licenses.js";
import { registerWebhookTools } from "./tools/webhooks.js";
import { registerRegistrationTypeTools } from "./tools/registration-types.js";
import { registerSendEmailTools } from "./tools/send-email.js";
import { registerTouchpointTools } from "./tools/touchpoints.js";
import { registerUploadTools } from "./tools/upload.js";
import { registerListAllTools } from "./tools/list-all.js";

async function main(): Promise<void> {
  const server = new McpServer({
    name: "visit-create",
    version: "1.0.0",
    description:
      "MCP server for the Visit Create API v2. Manage expos (events), visitors, " +
      "partners (exhibitors), activities (sessions), content, connections, actions, " +
      "participants, orders, payments, labels, licenses, webhooks, touchpoints, and more.",
  });

  // Register all tool groups
  registerExpoTools(server);
  registerVisitorTools(server);
  registerPartnerTools(server);
  registerActivityTools(server);
  registerContentTools(server);
  registerConnectionTools(server);
  registerActionTools(server);
  registerParticipantTools(server);
  registerOrderTools(server);
  registerPaymentTools(server);
  registerLabelTools(server);
  registerLicenseTools(server);
  registerWebhookTools(server);
  registerRegistrationTypeTools(server);
  registerSendEmailTools(server);
  registerTouchpointTools(server);
  registerUploadTools(server);
  registerListAllTools(server);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
