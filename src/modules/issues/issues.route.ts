import { Router } from "express";
import { issuesController } from "./issues.controller";

import { USER_ROLE } from "../../types";
import auth from "../../middleware/auth";

const router = Router();

router.get("/", issuesController.getAllIssues);
router.get("/:id", issuesController.getSingleIssue);

router.post(
  "/",
  auth(USER_ROLE.contributor, USER_ROLE.maintainer),
  issuesController.createIssue,
);

// patch
router.patch(
  "/:id",
  auth(USER_ROLE.contributor, USER_ROLE.maintainer),
  issuesController.updateIssue,
);

// delete
router.delete("/:id", auth(USER_ROLE.maintainer), issuesController.deleteIssue);

export const issuesRouter = router;
