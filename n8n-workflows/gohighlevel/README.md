# GoHighLevel Setup Guide for Eli's Bakery

Complete step-by-step instructions for integrating GoHighLevel CRM with the bakery website.

## Setup Order

Follow these guides in order:

| Step | File | Time | Description |
|------|------|------|-------------|
| 1 | [01-GETTING-STARTED.md](./01-GETTING-STARTED.md) | 5 min | Account access & overview |
| 2 | [02-CUSTOM-FIELDS.md](./02-CUSTOM-FIELDS.md) | 10 min | Create customer data fields |
| 3 | [03-TAGS-SETUP.md](./03-TAGS-SETUP.md) | 5 min | Create segmentation tags |
| 4 | [04-PIPELINE-SETUP.md](./04-PIPELINE-SETUP.md) | 10 min | Create order tracking pipeline |
| 5 | [05-INBOUND-WEBHOOK.md](./05-INBOUND-WEBHOOK.md) | 15 min | Receive orders from website |
| 6 | [06-OUTBOUND-WEBHOOK.md](./06-OUTBOUND-WEBHOOK.md) | 10 min | Send events to n8n |
| 7 | [07-WORKFLOWS.md](./07-WORKFLOWS.md) | 20 min | Create automation workflows |
| 8 | [08-API-CREDENTIALS.md](./08-API-CREDENTIALS.md) | 5 min | Generate API keys |
| 9 | [09-BACKEND-CONFIG.md](./09-BACKEND-CONFIG.md) | 10 min | Configure bakery backend |
| 10 | [10-TESTING.md](./10-TESTING.md) | 15 min | Test the integration |

**Total Setup Time: ~1.5 hours**

---

## Quick Reference

### GoHighLevel URLs
- Dashboard: https://app.gohighlevel.com
- API Docs: https://marketplace.gohighlevel.com/docs/
- Support: https://help.gohighlevel.com

### What You'll Need
- GoHighLevel account (Starter plan or higher)
- Access to bakery backend code
- n8n instance (cloud or self-hosted)

### End Result
After completing this setup:
- New orders automatically create contacts in GHL
- Customer tags applied based on order type
- Order pipeline tracks each order's status
- Automated emails/SMS sent at each stage
- Full customer history in CRM
