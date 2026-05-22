import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { issuesRouter } from "./modules/issues/issues.route";
import { authRouter } from "./modules/auth/auth.route";

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5000",
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "DevPulse api is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);

app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message ?? "Something went wrong",
  });
});

export default app;
