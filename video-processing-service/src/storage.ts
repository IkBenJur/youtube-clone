import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "jurb-yt-raw-videos";
const processedVideoBucketName = "jurb-yt-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

export function setupDirectiories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale=-1:360") //convert video to 360p
      .on("end", () => {
        console.log("Processing finished successfully");
        resolve();
      })
      .on("error", (error) => {
        console.log(`An error occured: ${error.message}`);
        reject(error);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

export async function downloadRawVideo(filename: string) {
  await storage
    .bucket(rawVideoBucketName)
    .file(filename)
    .download({ destination: `${localRawVideoPath}/${filename}` });

  console.log(
    `gs://${rawVideoBucketName}/${filename} downloaded to ${localRawVideoPath}/${filename}`
  );
}

export async function uploadProcessedVideo(filename: string) {
  const bucket = storage.bucket(processedVideoBucketName);

  await bucket.upload(`${localProcessedVideoPath}/${filename}`, {
    destination: filename,
  });

  console.log(
    `${localProcessedVideoPath}/${filename} uloaded to gs://${processedVideoBucketName}/${filename}`
  );

  await bucket.file(filename).makePublic();
}

export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`)
}

export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`)
}

function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(`Failed to delete file at: ${filePath}`, err);
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      console.log(`File not found at this: ${filePath}, skipping the delete`);
      resolve();
    }
  });
}

function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true}); // recursive: true enables creating nested directories
        console.log(`Directory created at: ${dirPath}`)
    }
}
