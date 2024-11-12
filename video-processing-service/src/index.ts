import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
  const inputFilePath = req.body.inputFilePath;
  const outputFilePath = req.body.outputFilePath;

  if (!inputFilePath) {
    res.status(400).send("Bad request: Missing input file path.");
  }

  if (!outputFilePath) {
    res.status(400).send("Bad request: Missing output file path.");
  }

  ffmpeg(inputFilePath)
    .outputOptions("-vf", "scale=-1:360") //convert video to 360p
    .on("end", () => {
      console.log("Processing finished successfully");
      res.status(200).send("Processing finished successfully");
    })
    .on("error", (error) => {
      console.log(`An error occured: ${error.message}`);
      res.status(500).send(`Internal server error: ${error.message}`);
    })
    .save(outputFilePath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
