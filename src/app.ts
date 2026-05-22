import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
const app: Application = express();
// core middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5000",
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "DevPulse api is running",
  });
});

export default app;
