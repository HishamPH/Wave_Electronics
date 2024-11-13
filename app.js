const { config } = require("dotenv");
const connectDB = require("./config/db");
const createServer = require("./server");
config();

const startServer = async () => {
  try {
    await connectDB();
    const app = await createServer();
    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`server running on port http://localhost:${port}/`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();
