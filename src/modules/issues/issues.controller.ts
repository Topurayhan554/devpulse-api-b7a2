import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../utility/sendResponse";

import type { IssueType, IssueStatus } from "../../types";
import type {
  ICreateIssueBody,
  IIssueQuery,
  IUpdateIssueBody,
} from "./issues.interface";
import { issuesService } from "./issues.service";

const createIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, type } = req.body as ICreateIssueBody;

    if (!title || !description || !type) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "title, description, and type are required.",
      });
      return;
    }
    if (title.length > 150) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "title must not exceed 150 characters.",
      });
      return;
    }
    if (description.length < 20) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "description must be at least 20 characters.",
      });
      return;
    }
    if (!["bug", "feature_request"].includes(type)) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "type must be 'bug' or 'feature_request'.",
      });
      return;
    }

    const reporterId = req.user!.id;
    const issue = await issuesService.createIssueIntoDB(
      { title, description, type },
      reporterId,
    );

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error) {
    const err = error as Error;
    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message,
    });
  }
};

const getAllIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.query.type as IssueType | undefined;
    const status = req.query.status as IssueStatus | undefined;

    const query: IIssueQuery = {
      sort: (req.query.sort as IIssueQuery["sort"]) ?? "newest",
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
    };

    const issues = await issuesService.getAllIssuesFromDB(query);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issues retrieved successfully",
      data: issues,
    });
  } catch (error) {
    const err = error as Error;
    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const issue = await issuesService.getIssueByIdFromDB(id);

    if (!issue) {
      sendResponse(res, {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Issue not found.",
      });
      return;
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue retrieved successfully",
      data: issue,
    });
  } catch (error) {
    const err = error as Error;
    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message,
    });
  }
};

const updateIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const currentUser = req.user!;
    const body = req.body as IUpdateIssueBody;

    const existing = await issuesService.getRawIssueById(id);
    if (!existing) {
      sendResponse(res, {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Issue not found.",
      });
      return;
    }

    if (currentUser.role === "contributor") {
      if (existing.reporter_id !== currentUser.id) {
        sendResponse(res, {
          statusCode: StatusCodes.FORBIDDEN,
          success: false,
          message: "Forbidden! You can only update your own issues.",
        });
        return;
      }
      if (existing.status !== "open") {
        sendResponse(res, {
          statusCode: StatusCodes.CONFLICT,
          success: false,
          message: "Conflict! You can only edit issues that are still open.",
        });
        return;
      }
      if (body.status) {
        sendResponse(res, {
          statusCode: StatusCodes.FORBIDDEN,
          success: false,
          message: "Forbidden! Contributors cannot change the issue status.",
        });
        return;
      }
    }

    if (body.title !== undefined && body.title.length > 150) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "title must not exceed 150 characters.",
      });
      return;
    }
    if (body.description !== undefined && body.description.length < 20) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "description must be at least 20 characters.",
      });
      return;
    }
    if (body.type && !["bug", "feature_request"].includes(body.type)) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "type must be 'bug' or 'feature_request'.",
      });
      return;
    }
    if (
      body.status &&
      !["open", "in_progress", "resolved"].includes(body.status)
    ) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "status must be 'open', 'in_progress', or 'resolved'.",
      });
      return;
    }

    const updated = await issuesService.updateIssueInDB(id, body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue updated successfully",
      data: updated,
    });
  } catch (error) {
    const err = error as Error;
    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message,
    });
  }
};

const deleteIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (req.user!.role !== "maintainer") {
      sendResponse(res, {
        statusCode: StatusCodes.FORBIDDEN,
        success: false,
        message: "Forbidden! Only maintainers can delete issues.",
      });
      return;
    }

    const existing = await issuesService.getRawIssueById(id);
    if (!existing) {
      sendResponse(res, {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Issue not found.",
      });
      return;
    }

    await issuesService.deleteIssueFromDB(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    const err = error as Error;
    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message,
    });
  }
};

export const issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
