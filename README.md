# Visit Create MCP Server

An MCP (Model Context Protocol) server for the [Visit Create API v2](https://api.visitcloud.com/create/v2). This server enables LLMs to manage expos (events), visitors, partners, activities, content, and more through the Visit Create platform.

## Features

- **Full API Coverage**: 50+ tools covering all Visit Create API v2 endpoints
- **CRUD Operations**: Create, read, update, and delete for visitors, partners, activities, contents, labels, licenses, and webhooks
- **Read Operations**: List and get for expos, connections, actions, participants, orders, payments, touchpoints, and registration types
- **Bulk Pagination**: `visit_list_all` tool for automatically paginating through entire datasets
- **File Upload**: Upload profile photos, ID cards, and ID photos for visitors (per current OpenAPI spec)
- **Email**: Send confirmation emails to visitors
- **Actionable Errors**: Descriptive error messages with HTTP status codes and guidance

## Prerequisites

- Node.js 18+
- A Visit Create API key with appropriate permissions

## Installation

```bash
git clone https://github.com/Mackitchin/Visit-Create-MCP.git
cd Visit-Create-MCP
npm install
npm run build
```

## Configuration

Set your Visit Create API key as an environment variable:

```bash
export VISIT_API_KEY="your-api-key-here"
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "visit-create": {
      "command": "node",
      "args": ["/path/to/Visit-Create-MCP/dist/index.js"],
      "env": {
        "VISIT_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Available Tools

| Resource | Tools |
|---|---|
| Expos | `visit_list_expos`, `visit_get_expo` |
| Visitors | `visit_list_visitors`, `visit_get_visitor`, `visit_create_visitor`, `visit_update_visitor`, `visit_delete_visitor` |
| Partners | `visit_list_partners`, `visit_get_partner`, `visit_create_partner`, `visit_update_partner`, `visit_delete_partner` |
| Activities | `visit_list_activities`, `visit_get_activity`, `visit_create_activity`, `visit_update_activity`, `visit_delete_activity` |
| Contents | `visit_list_contents`, `visit_get_content`, `visit_create_content`, `visit_update_content`, `visit_delete_content` |
| Connections | `visit_list_connections`, `visit_get_connection` |
| Actions | `visit_list_actions` |
| Participants | `visit_list_participants`, `visit_get_participant` |
| Orders | `visit_list_orders`, `visit_get_order` |
| Payments | `visit_list_payments`, `visit_get_payment`, `visit_update_payment` |
| Labels | `visit_list_labels`, `visit_get_label`, `visit_create_label`, `visit_update_label`, `visit_delete_label` |
| Licenses | `visit_list_licenses`, `visit_get_license`, `visit_create_license`, `visit_update_license`, `visit_delete_license` |
| Webhooks | `visit_list_webhooks`, `visit_get_webhook`, `visit_create_webhook`, `visit_update_webhook`, `visit_delete_webhook` |
| Registration Types | `visit_list_registration_types` |
| Email | `visit_send_email` |
| Touchpoints | `visit_list_touchpoints` |
| Upload | `visit_upload_file` |
| Bulk | `visit_list_all` |

## Development

```bash
# Run in development mode
npm run dev

# Build
npm run build

# Start the server
npm start
```

## API Rate Limits

The Visit API allows a maximum of 2 parallel requests. The server handles rate limit errors (HTTP 429) with actionable error messages.

## License

MIT
