import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT ?? 5000,

  jwt_secret: process.env.JWT_SECRET as string,
};

export default config;
