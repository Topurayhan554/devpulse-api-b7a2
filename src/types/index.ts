// User roles as const object (same pattern as your project)
export const USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer",
} as const;

export type ROLES = "contributor" | "maintainer";

export type IssueType = "bug" | "feature_request";

export type IssueStatus = "open" | "in_progress" | "resolved";

export type SortOrder = "newest" | "oldest";
