import app from "./app";
import config from "./config";
import { initDB } from "./db";

const main = async (): Promise<void> => {
  try {
    await initDB();
    app.listen(config.port, () => {
      console.log(`DevPulse server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server: ", error);
  }
};
main();
