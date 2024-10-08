const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length; // 获取 CPU 的核心数

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 衍生工作进程。
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // console.log("cluster", cluster);

  cluster.on("exit", (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
} else {
  // 工作进程可以共享任何 TCP 连接。
  // 在本例中，它是一个 HTTP 服务器
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end("你好世界\n");
    })
    .listen(8000);

  console.log(`工作进程 ${process.pid} 已启动`);
}
