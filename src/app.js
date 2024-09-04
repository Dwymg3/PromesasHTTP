import express from "express";
import bodyParser from "body-parser";
import errorHandler from "./middlewares/error-handler.mjs";
import { requestLogger } from "./middlewares/request-logger.mjs";
import tasksRouter from "./routes/tasks.mjs";
import cors from "cors";
import path from "path";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(requestLogger);
app.use(cors());
app.use(errorHandler);

app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
})


app.use("/api", tasksRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
