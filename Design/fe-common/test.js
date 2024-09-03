async function concurrentUpload(files, uploadFn, options) {
  const {
    concurrency = 3,
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
  } = options;

  // 按顺序返回
  const results = new Array(files.length);
  // 任务队列
  const queue = files.map((file, index) => ({
    file,
    index,
  }));

  // 一次上传任务
  async function upload({ file, index }) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await Promise.race([
          uploadFn(file),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Upload timeout")), timeout)
          ),
        ]);
        results[index] = { file, result: res, success: true };
        return;
      } catch (e) {
        lastError = e;
        if (attempt < retries) {
          console.warn(
            `Attempt ${attempt + 1} failed for ${
              file.name
            }, retrying in ${retryDelay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }
    results[index] = { file, error: lastError, success: false };
    console.error(
      `Failed to upload ${file.name} after ${retries + 1} attempts:`,
      lastError
    );
  }

  async function processQueue() {
    while (queue.length > 0) {
      const item = queue.pop();
      await upload(item);
    }
  }

  const workers = Array(concurrency).fill().map(processQueue);
  await Promise.all(workers);

  return results;
}

async function main() {
  const files = [
    { name: "file1.txt", content: "Hello" },
    { name: "file2.txt", content: "World" },
    { name: "file3.txt", content: "!" },
  ];

  const mockUpload = async (file) => {
    const randomTime = Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, randomTime));
    if (Math.random() < 0.3) throw new Error("Random upload error");
    return `Uploaded ${file.name} with content: ${file.content}`;
  };

  try {
    const results = await concurrentUpload(files, mockUpload, {
      concurrency: 2,
      retries: 2,
      timeout: 1500,
      retryDelay: 500,
    });

    console.log("Upload results (in original order):");
    results.forEach((result, index) => {
      console.log(
        `File ${index + 1}:`,
        result.success ? result.result : result.error.message
      );
    });
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

main();
