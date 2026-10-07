export const initialCategories = [
  {
    id: "CAT004",
    parentName: "IT Help Desk",
    subCategories: [
      { id: "CAT004#1", name: "Email" },
      { id: "CAT004#2", name: "Cashiering" },
      { id: "CAT004#3", name: "Hardware" },
      { id: "CAT004#4", name: "Software" },
      { id: "CAT004#5", name: "Network" },
      { id: "CAT004#6", name: "Password Issues" },
      { id: "CAT004#7", name: "VDI Issues" },
      { id: "CAT004#8", name: "QMS" },
      { id: "CAT004#9", name: "Operating System" },
      { id: "CAT004#10", name: "Security" },
      { id: "CAT004#11", name: "Tier 3 Support" },
    ],
  },
  {
    id: "CAT005",
    parentName: "OLD Categories",
    subCategories: [
      { id: "CAT005#1", name: "CRM.Asset upload/ Merge cases" },
      { id: "CAT005#2", name: "CRM.Customer/ Account Create and Edit failed" },
      { id: "CAT005#3", name: "CRM.Dialup asset upload/ Termination" },
      { id: "CAT005#4", name: "CRM.Order status mismatches" },
      { id: "CAT005#5", name: "CRM.Unable to reg Rev Com packages" },
      { id: "CAT005#6", name: "CRM.PENDING_MINT_MIGRATION_INFLIGHT_ORDER_ERRORS" },
    ],
  },
  {
    id: "CAT006",
    parentName: "OLD Categories",
    subCategories: [
      { id: "CAT006#1", name: "Dialup asset upload/ Termination" },
      { id: "CAT006#2", name: "Account Create and Edit failed" },
      { id: "CAT006#3", name: "Portal Access" },
    ],
  },
  {
    id: "CAT007",
    parentName: "OLD Categories",
    subCategories: [
      { id: "CAT007#1", name: "CRM.Order status mismatches" },
      { id: "CAT007#2", name: "Order Synchronization" },
    ],
  },
  {
    id: "CAT008",
    parentName: "OLD Categories",
    subCategories: [
      { id: "CAT008#1", name: "Billing and Invoicing Inquiries" },
      { id: "CAT008#2", name: "Payment Gateway Errors" },
    ],
  },
  {
    id: "CAT009",
    parentName: "OLD Categories",
    subCategories: [
      { id: "CAT009#1", name: "Contract Extensions" },
      { id: "CAT009#2", name: "Service Agreement Updates" },
    ],
  },
  {
    id: "CAT010",
    parentName: "OLD Categories",
    subCategories: [
      { id: "CAT010#1", name: "Service Migrations" },
      { id: "CAT010#2", name: "Data Import Failures" },
    ],
  },
  {
    id: "CAT011",
    parentName: "OLD Categories",
    subCategories: [
      { id: "CAT011#1", name: "CRM.Unable to reg Rev Com packages" },
      { id: "CAT011#2", name: "Package Configuration" },
    ],
  },
  {
    id: "CAT012",
    parentName: "OLD Categories",
    subCategories: [
      { id: "CAT012#1", name: "CRM.PENDING_MINT_MIGRATION_INFLIGHT_ORDER_ERRORS" },
      { id: "CAT012#2", name: "Migration Rollback Requests" },
    ],
  },
];

export const defaultParentCategoryOptions = [
  "IT Help Desk",
  "OLD Categories",
  "Network Operations",
  "Billing & CRM",
  "Hardware Support",
];

export const defaultSubCategoryNameOptions = [
  "Email",
  "Cashiering",
  "Hardware",
  "Software",
  "Network",
  "Password Issues",
  "VDI Issues",
  "QMS",
  "Operating System",
  "Security",
  "Tier 3 Support",
  "CRM.Asset upload/ Merge cases",
  "CRM.Customer/ Account Create and Edit failed",
  "CRM.Dialup asset upload/ Termination",
  "CRM.Order status mismatches",
  "CRM.Unable to reg Rev Com packages",
  "CRM.PENDING_MINT_MIGRATION_INFLIGHT_ORDER_ERRORS",
];
