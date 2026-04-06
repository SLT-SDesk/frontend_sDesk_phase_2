/**
 * Utility to map employee details and incident content to priority.
 * Reusable for UI auto-fill.
 */

const normalizeText = (v) => (v || "").toString().toLowerCase().trim();

export const isGradeCritical = (gradeName) => {
  const normalized = normalizeText(gradeName);
  const result = normalized === "a.1" || normalized === "a1";
  if (result) console.log("[AUTO-PRIORITY] Grade Critical match:", gradeName);
  return result;
};

export const isCriticalDesignation = (designation) => {
  const normalized = normalizeText(designation);
  const criticalRoles = [
    /\bchairman\b/,
    /\bceo\b/,
    /\bchief executive officer\b/,
    /\bchief officer\b/,
    /\bdeputy chief officer\b/,
  ];
  const result = criticalRoles.some((regex) => regex.test(normalized));
  if (result) console.log("[AUTO-PRIORITY] Critical Designation match:", designation);
  return result;
};

export const isHighDesignation = (designation) => {
  const normalized = normalizeText(designation);
  const highRoles = [
    /\bgm\b/,
    /\bgeneral manager\b/,
    /\bdgm\b/,
    /\bdeputy general manager\b/,
  ];
  const result = highRoles.some((regex) => regex.test(normalized));
  if (result) console.log("[AUTO-PRIORITY] High Designation match:", designation);
  return result;
};

export const isCriticalIncidentType = (category, description) => {
  const combinedText = normalizeText(`${category} ${description}`);
  const criticalKeywords = [
    "cashiering",
    "cash point",
    "cashier",
    "network",
    "site down",
    "switch failure",
    "network issue",
    "connectivity",
  ];
  const result = criticalKeywords.some((kw) => combinedText.includes(kw));
  if (result) console.log("[AUTO-PRIORITY] Critical Incident match:", { category, description });
  return result;
};

/**
 * Logic to determine incident priority automatically.
 * Priority Order: Grade A.1 -> Critical Roles -> Content (Network/Cashiering) -> High Roles -> Default
 */
export const getAutoPriority = (user, formData) => {
  const { designation, gradeName } = user || {};
  const { category, description } = formData || {};

  // Rule 1: Grade A.1
  if (isGradeCritical(gradeName)) {
    return "Critical";
  }

  // Rule 2: Critical Roles
  if (isCriticalDesignation(designation)) {
    return "Critical";
  }

  // Rule 3: Specific Content
  if (isCriticalIncidentType(category?.name, description)) {
    return "Critical";
  }

  // Rule 4: High Roles (GM/DGM)
  if (isHighDesignation(designation)) {
    return "High";
  }

  // Rule 5: Default
  return "Medium";
};

// Aliases for compatibility
export const getPriorityFromDesignation = getAutoPriority;
