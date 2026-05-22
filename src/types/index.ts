export const USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export type IssueType = "bug" | "feature_request";

export type IssueStatus = "open" | "in_progress" | "resolved";

export type SortOrder = "newest" | "oldest";
