import { pool } from "../../db";
import type {
  IIssue,
  IIssueWithReporter,
  ICreateIssueBody,
  IUpdateIssueBody,
  IIssueQuery,
} from "./issues.interface";
import type { UserRole } from "../../types";

interface IReporterRow {
  id: number;
  name: string;
  role: UserRole;
}

const getUserById = async (id: number): Promise<IReporterRow | null> => {
  const result = await pool.query<IReporterRow>(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
};

const getUsersByIds = async (ids: number[]): Promise<IReporterRow[]> => {
  if (ids.length === 0) return [];
  const result = await pool.query<IReporterRow>(
    `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
    [ids],
  );
  return result.rows;
};

const createIssueIntoDB = async (
  body: ICreateIssueBody,
  reporterId: number,
): Promise<IIssue> => {
  const { title, description, type } = body;

  const result = await pool.query<IIssue>(
    `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [title, description, type, reporterId],
  );

  return result.rows[0];
};

const getAllIssuesFromDB = async (
  query: IIssueQuery,
): Promise<IIssueWithReporter[]> => {
  const { sort = "newest", type, status } = query;

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (type) {
    conditions.push(`type = $${paramIndex++}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const orderClause =
    sort === "oldest" ? "ORDER BY created_at ASC" : "ORDER BY created_at DESC";

  const issueResult = await pool.query<IIssue>(
    `SELECT * FROM issues ${whereClause} ${orderClause}`,
    values,
  );

  const issues = issueResult.rows;
  if (issues.length === 0) return [];

  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const reporters = await getUsersByIds(reporterIds);
  const reporterMap = new Map(reporters.map((r) => [r.id, r]));

  return issues.map(({ reporter_id, ...issue }) => ({
    ...issue,
    reporter: {
      id: reporterMap.get(reporter_id)?.id ?? reporter_id,
      name: reporterMap.get(reporter_id)?.name ?? "Unknown",
      role: reporterMap.get(reporter_id)?.role ?? "contributor",
    },
  }));
};

const getIssueByIdFromDB = async (
  id: number,
): Promise<IIssueWithReporter | null> => {
  const result = await pool.query<IIssue>(
    `SELECT * FROM issues WHERE id = $1`,
    [id],
  );

  if (result.rows.length === 0) return null;

  const { reporter_id, ...issue } = result.rows[0];
  const reporter = await getUserById(reporter_id);

  return {
    ...issue,
    reporter: {
      id: reporter?.id ?? reporter_id,
      name: reporter?.name ?? "Unknown",
      role: reporter?.role ?? "contributor",
    },
  };
};

const getRawIssueById = async (id: number): Promise<IIssue | null> => {
  const result = await pool.query<IIssue>(
    `SELECT * FROM issues WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
};

const updateIssueInDB = async (
  id: number,
  body: IUpdateIssueBody,
): Promise<IIssue> => {
  const { title, description, type, status } = body;

  const result = await pool.query<IIssue>(
    `
    UPDATE issues
    SET
      title       = COALESCE($1, title),
      description = COALESCE($2, description),
      type        = COALESCE($3, type),
      status      = COALESCE($4, status),
      updated_at  = NOW()
    WHERE id = $5
    RETURNING *
    `,
    [title ?? null, description ?? null, type ?? null, status ?? null, id],
  );

  return result.rows[0];
};

const deleteIssueFromDB = async (id: number): Promise<void> => {
  await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
};

export const issuesService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getIssueByIdFromDB,
  getRawIssueById,
  updateIssueInDB,
  deleteIssueFromDB,
};
