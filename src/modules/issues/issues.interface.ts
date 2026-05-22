import type { IssueType, IssueStatus, UserRole } from "../../types";

export interface IIssue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateIssueBody {
  title: string;
  description: string;
  type: IssueType;
}

export interface IUpdateIssueBody {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

export interface IReporter {
  id: number;
  name: string;
  role: UserRole;
}

export interface IIssueWithReporter extends Omit<IIssue, "reporter_id"> {
  reporter: IReporter;
}

export interface IIssueQuery {
  sort?: "newest" | "oldest";
  type?: IssueType;
  status?: IssueStatus;
}
