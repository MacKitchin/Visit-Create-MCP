import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

const SUPPORTED_RESOURCES = [
  "visitors", "partners", "activities", "contents", "connections",
  "actions", "participants", "orders", "payments", "labels",
  "licenses", "touchpoints",
] as const;

export function registerListAllTools(server: McpServer): void {
  server.registerTool(
    "visit_list_all",
    {
      title: "List All (Paginated)",
      description:
        "Automatically paginate through ALL items for a given resource, collecting results across multiple API pages into a single response. " +
        "Use this instead of manual pagination when you need a complete dataset (e.g., all visitors for an expo, all partners, all connections). " +
        "Supported resources: " + SUPPORTED_RESOURCES.join(", ") + ". " +
        "Use the 'filters' parameter to pass resource-specific query filters (e.g., registrationStates for visitors, partnerId for contents). " +
        "Rate limit note: The Visit API allows max 2 parallel requests, so this tool makes sequential page requests. Large datasets may take several seconds.",
      inputSchema: {
        resource: z.enum(SUPPORTED_RESOURCES).describe(
          "Resource type to paginate through. Choose from: " +
          "visitors (registrants), partners (exhibitors), activities (sessions/workshops), " +
          "contents (digital content items), connections (visitor-partner interactions), " +
          "actions (raw badge scans/prints), participants (attendance records), " +
          "orders (shop transactions), payments (payment records), labels (content categories), " +
          "licenses (system licenses), touchpoints (NFC devices)"
        ),
        expoId: z.string().describe("Alphanumeric Expo (event) ID"),
        maxItems: z.number().int().min(1).max(10000).default(1000).optional().describe(
          "Maximum total items to retrieve across all pages (safety cap). Default: 1000. Max: 10000. " +
          "Use smaller values for quick exploration, larger values for full data export."
        ),
        filters: z.record(z.unknown()).optional().describe(
          "Optional resource-specific query filters passed as key-value pairs. Common filters by resource: " +
          "visitors: registrationStates, registrationTypes, contactReference, contactId, showDeleted; " +
          "partners: registrationType, contactReference, contactId, showDeleted; " +
          "activities: showDeleted; contents: partnerId; " +
          "connections: type (visitor|partner), partnerId, visitorId; " +
          "actions: locationId, partnerId, visitorId, contentId; " +
          "orders: orderStates, visitorId, partnerId; " +
          "payments: paymentStates, paymentMethods, visitorId, partnerId; " +
          "labels: showDeleted; licenses: partnerId; touchpoints: partnerId"
        ),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params) => {
      try {
        const maxItems = params.maxItems ?? 1000;
        const pageSize = 100;
        const allItems: unknown[] = [];
        let fromRevision = 0;
        let pagesRequested = 0;
        let reachedEnd = false;

        while (allItems.length < maxItems) {
          const q: Record<string, unknown> = {
            ...(params.filters ?? {}),
            fromRevision,
            limit: Math.min(pageSize, maxItems - allItems.length),
          };

          const page = await makeApiRequest<unknown[]>(
            `/${params.resource}/${params.expoId}`,
            "GET",
            undefined,
            q
          );
          pagesRequested++;

          if (!Array.isArray(page) || page.length === 0) {
            reachedEnd = true;
            break;
          }

          allItems.push(...page);

          // Find the max revision from this page for cursor-based pagination
          let maxRevision = 0;
          for (const item of page) {
            const rev = (item as Record<string, unknown>)?.revision;
            if (typeof rev === "number" && rev > maxRevision) {
              maxRevision = rev;
            }
          }

          if (maxRevision <= fromRevision) {
            reachedEnd = true;
            break;
          }

          fromRevision = maxRevision;

          if (page.length < pageSize) {
            reachedEnd = true;
            break;
          }
        }

        const result = {
          metadata: {
            resource: params.resource,
            totalRetrieved: allItems.length,
            pagesRequested,
            reachedEnd,
            maxItemsCap: maxItems,
          },
          items: allItems,
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
