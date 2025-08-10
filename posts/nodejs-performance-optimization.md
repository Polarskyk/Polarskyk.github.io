---
title: Node.js 性能优化实战指南
date: 2024-08-01
category: backend
tags: Node.js, 性能优化, 后端开发, JavaScript
author: PolarSky
---

# Node.js 性能优化实战指南

Node.js 以其出色的性能和高并发能力而闻名，但要充分发挥其潜力，需要掌握正确的优化技巧。本文将深入探讨 Node.js 性能优化的各个方面。

## 理解 Node.js 架构

### 事件循环优化

Node.js 的核心是事件循环，理解它是性能优化的基础。

```javascript
// 错误示例：阻塞事件循环
function blockingOperation() {
  const start = Date.now();
  while (Date.now() - start < 1000) {
    // 同步循环 1 秒，阻塞事件循环
  }
  return 'Done';
}

// 正确示例：非阻塞操作
function nonBlockingOperation() {
  return new Promise((resolve) => {
    setImmediate(() => {
      // 使用 setImmediate 将任务推迟到下一个事件循环
      resolve('Done');
    });
  });
}

// 更好的示例：分批处理大量数据
async function processLargeArray(array) {
  const batchSize = 1000;
  const results = [];
  
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    
    // 处理批次
    const batchResults = batch.map(item => processItem(item));
    results.push(...batchResults);
    
    // 让出控制权给事件循环
    if (i + batchSize < array.length) {
      await new Promise(resolve => setImmediate(resolve));
    }
  }
  
  return results;
}

function processItem(item) {
  // 一些计算密集型操作
  return item * 2;
}
```

### Worker Threads 的使用

对于 CPU 密集型任务，使用 Worker Threads。

```javascript
// main.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');

if (isMainThread) {
  // 主线程代码
  class WorkerPool {
    constructor(poolSize = os.cpus().length) {
      this.poolSize = poolSize;
      this.workers = [];
      this.queue = [];
      this.activeJobs = 0;
      
      this.initWorkers();
    }
    
    initWorkers() {
      for (let i = 0; i < this.poolSize; i++) {
        this.createWorker();
      }
    }
    
    createWorker() {
      const worker = new Worker(__filename);
      
      worker.on('message', (result) => {
        this.activeJobs--;
        
        if (result.error) {
          this.queue[0].reject(new Error(result.error));
        } else {
          this.queue[0].resolve(result.data);
        }
        
        this.queue.shift();
        this.processQueue();
      });
      
      worker.on('error', (error) => {
        console.error('Worker error:', error);
        this.activeJobs--;
        this.queue[0]?.reject(error);
        this.queue.shift();
        this.createWorker(); // 重新创建 worker
      });
      
      this.workers.push(worker);
    }
    
    async execute(data) {
      return new Promise((resolve, reject) => {
        this.queue.push({ resolve, reject, data });
        this.processQueue();
      });
    }
    
    processQueue() {
      if (this.queue.length === 0 || this.activeJobs >= this.poolSize) {
        return;
      }
      
      const availableWorker = this.workers.find(w => !w.busy);
      if (availableWorker) {
        const job = this.queue[0];
        availableWorker.busy = true;
        availableWorker.postMessage(job.data);
        this.activeJobs++;
      }
    }
    
    terminate() {
      this.workers.forEach(worker => worker.terminate());
    }
  }
  
  // 使用 Worker Pool
  const pool = new WorkerPool(4);
  
  async function handleCPUIntensiveTask(req, res) {
    try {
      const result = await pool.execute({
        type: 'FIBONACCI',
        number: req.body.number
      });
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
} else {
  // Worker 线程代码
  parentPort.on('message', (data) => {
    try {
      let result;
      
      switch (data.type) {
        case 'FIBONACCI':
          result = fibonacci(data.number);
          break;
        case 'PRIME_CHECK':
          result = isPrime(data.number);
          break;
        default:
          throw new Error('Unknown task type');
      }
      
      parentPort.postMessage({ data: result });
    } catch (error) {
      parentPort.postMessage({ error: error.message });
    }
  });
  
  function fibonacci(n) {
    if (n < 2) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
  
  function isPrime(num) {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  }
}
```

## 内存管理优化

### 内存泄漏检测和预防

```javascript
// 内存泄漏示例和解决方案
class MemoryOptimizedService {
  constructor() {
    this.cache = new Map();
    this.timers = new Set();
    this.eventListeners = new Map();
    
    // 设置缓存清理定时器
    this.setupCacheCleanup();
  }
  
  setupCacheCleanup() {
    const cleanupTimer = setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // 每分钟清理一次
    
    this.timers.add(cleanupTimer);
    
    // 确保进程退出时清理
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }
  
  // 带过期时间的缓存
  setCache(key, value, ttl = 300000) { // 默认 5 分钟
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }
  
  getCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  cleanupExpiredCache() {
    const now = Date.now();
    const expired = [];
    
    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        expired.push(key);
      }
    }
    
    expired.forEach(key => this.cache.delete(key));
    
    console.log(`Cleaned up ${expired.length} expired cache items`);
  }
  
  // 正确管理事件监听器
  addEventListeners(emitter, event, listener) {
    emitter.on(event, listener);
    
    if (!this.eventListeners.has(emitter)) {
      this.eventListeners.set(emitter, new Map());
    }
    this.eventListeners.get(emitter).set(event, listener);
  }
  
  removeEventListeners(emitter, event) {
    const listeners = this.eventListeners.get(emitter);
    if (listeners && listeners.has(event)) {
      emitter.removeListener(event, listeners.get(event));
      listeners.delete(event);
    }
  }
  
  cleanup() {
    // 清理定时器
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
    
    // 清理事件监听器
    for (const [emitter, listeners] of this.eventListeners) {
      for (const [event, listener] of listeners) {
        emitter.removeListener(event, listener);
      }
    }
    this.eventListeners.clear();
    
    // 清理缓存
    this.cache.clear();
    
    console.log('Service cleanup completed');
  }
}

// 内存监控
function setupMemoryMonitoring() {
  const memoryUsage = () => {
    const used = process.memoryUsage();
    const usage = {};
    
    for (let key in used) {
      usage[key] = Math.round(used[key] / 1024 / 1024 * 100) / 100;
    }
    
    console.log('Memory Usage:', usage, 'MB');
    
    // 如果内存使用超过阈值，触发垃圾回收
    if (usage.heapUsed > 500) { // 500MB
      if (global.gc) {
        global.gc();
        console.log('Forced garbage collection');
      }
    }
  };
  
  // 每 30 秒检查一次内存使用
  setInterval(memoryUsage, 30000);
}
```

### Stream 处理优化

```javascript
const fs = require('fs');
const { Transform, pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

// 高效的文件处理
class FileProcessor {
  // 处理大文件，避免内存溢出
  async processLargeFile(inputPath, outputPath) {
    const readStream = fs.createReadStream(inputPath, { 
      highWaterMark: 64 * 1024 // 64KB 块大小
    });
    
    const writeStream = fs.createWriteStream(outputPath);
    
    const transformStream = new Transform({
      transform(chunk, encoding, callback) {
        // 对数据块进行处理
        const processed = this.processChunk(chunk);
        callback(null, processed);
      },
      
      processChunk(chunk) {
        // 实际的数据处理逻辑
        return chunk.toString().toUpperCase();
      }
    });
    
    try {
      await pipelineAsync(readStream, transformStream, writeStream);
      console.log('File processed successfully');
    } catch (error) {
      console.error('Pipeline failed:', error);
      throw error;
    }
  }
  
  // 并行处理多个文件
  async processMultipleFiles(filePaths) {
    const concurrency = 3; // 控制并发数
    const results = [];
    
    for (let i = 0; i < filePaths.length; i += concurrency) {
      const batch = filePaths.slice(i, i + concurrency);
      const batchPromises = batch.map(filePath => 
        this.processLargeFile(filePath, `${filePath}.processed`)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
}

// 流式 JSON 处理
class JSONStreamProcessor {
  constructor() {
    this.parser = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        try {
          // 假设每行是一个 JSON 对象
          const lines = chunk.toString().split('\n');
          
          for (const line of lines) {
            if (line.trim()) {
              const obj = JSON.parse(line);
              this.push(obj);
            }
          }
          callback();
        } catch (error) {
          callback(error);
        }
      }
    });
  }
  
  async processJSONStream(inputPath, processor) {
    const readStream = fs.createReadStream(inputPath);
    const results = [];
    
    const processStream = new Transform({
      objectMode: true,
      transform(obj, encoding, callback) {
        const processed = processor(obj);
        results.push(processed);
        callback();
      }
    });
    
    await pipelineAsync(
      readStream,
      this.parser,
      processStream
    );
    
    return results;
  }
}
```

## 数据库优化

### 连接池管理

```javascript
const mysql = require('mysql2/promise');
const Redis = require('redis');

class DatabaseManager {
  constructor() {
    this.initMysqlPool();
    this.initRedisPool();
  }
  
  initMysqlPool() {
    this.mysqlPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      
      // 连接池配置
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      
      // 重连配置
      reconnect: true,
      
      // 预处理语句缓存
      statementCacheSize: 1000,
      
      // 压缩
      compression: true
    });
    
    // 监控连接池
    this.setupMysqlMonitoring();
  }
  
  initRedisPool() {
    this.redisCluster = new Redis.Cluster([
      { host: 'redis-node-1', port: 6379 },
      { host: 'redis-node-2', port: 6379 },
      { host: 'redis-node-3', port: 6379 }
    ], {
      enableOfflineQueue: false,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
    
    this.setupRedisMonitoring();
  }
  
  setupMysqlMonitoring() {
    setInterval(async () => {
      try {
        const [rows] = await this.mysqlPool.execute('SHOW STATUS LIKE "Threads_connected"');
        console.log('MySQL connected threads:', rows[0].Value);
      } catch (error) {
        console.error('MySQL monitoring error:', error);
      }
    }, 30000);
  }
  
  setupRedisMonitoring() {
    this.redisCluster.on('connect', () => {
      console.log('Redis cluster connected');
    });
    
    this.redisCluster.on('error', (error) => {
      console.error('Redis cluster error:', error);
    });
  }
  
  // 带缓存的数据库查询
  async queryWithCache(query, params = [], cacheKey = null, ttl = 300) {
    if (cacheKey) {
      try {
        const cached = await this.redisCluster.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.warn('Cache read error:', error);
      }
    }
    
    const [rows] = await this.mysqlPool.execute(query, params);
    
    if (cacheKey && rows.length > 0) {
      try {
        await this.redisCluster.setex(cacheKey, ttl, JSON.stringify(rows));
      } catch (error) {
        console.warn('Cache write error:', error);
      }
    }
    
    return rows;
  }
  
  // 批量插入优化
  async batchInsert(tableName, records, batchSize = 1000) {
    if (!records.length) return;
    
    const fields = Object.keys(records[0]);
    const placeholders = fields.map(() => '?').join(',');
    const query = `INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${placeholders})`;
    
    const connection = await this.mysqlPool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const promises = batch.map(record => 
          connection.execute(query, fields.map(field => record[field]))
        );
        
        await Promise.all(promises);
      }
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
```

### 查询优化

```javascript
class QueryOptimizer {
  constructor(dbManager) {
    this.db = dbManager;
    this.queryStats = new Map();
  }
  
  // 查询性能监控
  async executeWithStats(query, params = []) {
    const startTime = process.hrtime.bigint();
    
    try {
      const result = await this.db.mysqlPool.execute(query, params);
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // 转换为毫秒
      
      this.updateQueryStats(query, duration, 'success');
      
      // 慢查询警告
      if (duration > 1000) {
        console.warn(`Slow query detected (${duration}ms):`, query);
      }
      
      return result;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      
      this.updateQueryStats(query, duration, 'error');
      throw error;
    }
  }
  
  updateQueryStats(query, duration, status) {
    const key = this.normalizeQuery(query);
    const stats = this.queryStats.get(key) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      avgTime: 0
    };
    
    stats.count++;
    stats.totalTime += duration;
    
    if (status === 'error') {
      stats.errors++;
    }
    
    stats.avgTime = stats.totalTime / stats.count;
    this.queryStats.set(key, stats);
  }
  
  normalizeQuery(query) {
    // 移除参数，标准化查询以便统计
    return query.replace(/\?/g, 'PARAM').replace(/\s+/g, ' ').trim();
  }
  
  getQueryStats() {
    const stats = [];
    for (const [query, stat] of this.queryStats) {
      stats.push({ query, ...stat });
    }
    return stats.sort((a, b) => b.avgTime - a.avgTime);
  }
  
  // 分页查询优化
  async paginatedQuery(baseQuery, page = 1, limit = 20, countQuery = null) {
    const offset = (page - 1) * limit;
    
    // 使用子查询优化分页（适用于大偏移量）
    let paginatedQuery;
    if (offset > 1000) {
      paginatedQuery = `
        SELECT * FROM (${baseQuery}) AS subquery 
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      paginatedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    }
    
    // 并行执行数据查询和计数查询
    const [dataPromise, countPromise] = await Promise.allSettled([
      this.executeWithStats(paginatedQuery),
      countQuery ? this.executeWithStats(countQuery) : null
    ]);
    
    const data = dataPromise.status === 'fulfilled' ? dataPromise.value[0] : [];
    const total = countPromise?.status === 'fulfilled' ? countPromise.value[0][0].total : 0;
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }
}
```

## HTTP 性能优化

### 请求处理优化

```javascript
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cluster = require('cluster');
const os = require('os');

class HighPerformanceServer {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }
  
  setupMiddleware() {
    // 安全中间件
    this.app.use(helmet());
    
    // Gzip 压缩
    this.app.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    }));
    
    // 限流
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 分钟
      max: 100, // 每个 IP 最多 100 请求
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);
    
    // 请求解析
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // 请求日志和性能监控
    this.app.use(this.performanceMiddleware);
    
    // 缓存控制
    this.app.use(this.cacheMiddleware);
  }
  
  performanceMiddleware(req, res, next) {
    const start = process.hrtime.bigint();
    
    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // 毫秒
      
      console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
      
      // 慢请求警告
      if (duration > 1000) {
        console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
      }
    });
    
    next();
  }
  
  cacheMiddleware(req, res, next) {
    // 静态资源缓存
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 年
    }
    
    // API 缓存
    if (req.url.startsWith('/api/') && req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 分钟
    }
    
    next();
  }
  
  setupRoutes() {
    // 健康检查端点
    this.app.get('/health', (req, res) => {
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      res.json({
        status: 'healthy',
        uptime,
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
        },
        pid: process.pid
      });
    });
    
    // 示例 API 端点
    this.app.get('/api/users', this.getUsers.bind(this));
    this.app.post('/api/users', this.createUser.bind(this));
  }
  
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      
      // 构建缓存键
      const cacheKey = `users:${page}:${limit}:${search}`;
      
      // 尝试从缓存获取
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // 从数据库查询
      const users = await this.db.queryWithCache(
        'SELECT * FROM users WHERE name LIKE ? LIMIT ? OFFSET ?',
        [`%${search}%`, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)],
        cacheKey,
        300 // 5 分钟缓存
      );
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async createUser(req, res) {
    try {
      // 输入验证
      const { name, email, age } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      
      // 创建用户
      const result = await this.db.mysqlPool.execute(
        'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
        [name, email, age]
      );
      
      // 清除相关缓存
      await this.clearUserCache();
      
      res.status(201).json({ 
        id: result[0].insertId,
        message: 'User created successfully' 
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async clearUserCache() {
    const keys = await this.redisClient.keys('users:*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
  }
  
  setupErrorHandling() {
    // 404 处理
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
    
    // 全局错误处理
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      
      if (res.headersSent) {
        return next(error);
      }
      
      res.status(500).json({ 
        error: 'Internal server error',
        requestId: req.id
      });
    });
  }
  
  // 集群模式启动
  static startCluster() {
    const numCPUs = os.cpus().length;
    
    if (cluster.isMaster) {
      console.log(`Master ${process.pid} is running`);
      
      // Fork workers
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
      });
      
      // 优雅关闭
      process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        
        for (const id in cluster.workers) {
          cluster.workers[id].kill();
        }
      });
      
    } else {
      const server = new HighPerformanceServer();
      const port = process.env.PORT || 3000;
      
      server.app.listen(port, () => {
        console.log(`Worker ${process.pid} listening on port ${port}`);
      });
    }
  }
}

// 启动集群
if (require.main === module) {
  HighPerformanceServer.startCluster();
}
```

## 监控和诊断

### 性能监控系统

```javascript
const EventEmitter = require('events');

class PerformanceMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      requests: new Map(),
      memory: [],
      cpu: [],
      errors: []
    };
    
    this.startMonitoring();
  }
  
  startMonitoring() {
    // 内存监控
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.memory.push({
        timestamp: Date.now(),
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external
      });
      
      // 保留最近 100 个数据点
      if (this.metrics.memory.length > 100) {
        this.metrics.memory.shift();
      }
      
      // 内存泄漏检测
      this.detectMemoryLeak();
    }, 5000);
    
    // CPU 监控
    this.monitorCPU();
    
    // 错误监控
    process.on('uncaughtException', (error) => {
      this.recordError('uncaughtException', error);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      this.recordError('unhandledRejection', reason);
    });
  }
  
  monitorCPU() {
    const startUsage = process.cpuUsage();
    const startTime = process.hrtime();
    
    setInterval(() => {
      const endUsage = process.cpuUsage(startUsage);
      const endTime = process.hrtime(startTime);
      
      const totalTime = endTime[0] * 1000000 + endTime[1] / 1000; // 微秒
      const userPercent = (endUsage.user / totalTime) * 100;
      const systemPercent = (endUsage.system / totalTime) * 100;
      
      this.metrics.cpu.push({
        timestamp: Date.now(),
        user: userPercent,
        system: systemPercent,
        total: userPercent + systemPercent
      });
      
      if (this.metrics.cpu.length > 100) {
        this.metrics.cpu.shift();
      }
    }, 5000);
  }
  
  detectMemoryLeak() {
    if (this.metrics.memory.length < 10) return;
    
    // 检查内存是否持续增长
    const recent = this.metrics.memory.slice(-10);
    const trend = this.calculateTrend(recent.map(m => m.heapUsed));
    
    if (trend > 1000000) { // 1MB 增长趋势
      this.emit('memoryLeak', {
        trend,
        currentUsage: recent[recent.length - 1].heapUsed
      });
    }
  }
  
  calculateTrend(values) {
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }
  
  recordError(type, error) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      type,
      message: error.message,
      stack: error.stack
    });
    
    if (this.metrics.errors.length > 1000) {
      this.metrics.errors.shift();
    }
    
    this.emit('error', { type, error });
  }
  
  recordRequest(method, url, duration, statusCode) {
    const key = `${method} ${url}`;
    const stats = this.metrics.requests.get(key) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0,
      errors: 0
    };
    
    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    stats.minTime = Math.min(stats.minTime, duration);
    stats.maxTime = Math.max(stats.maxTime, duration);
    
    if (statusCode >= 400) {
      stats.errors++;
    }
    
    this.metrics.requests.set(key, stats);
  }
  
  getMetrics() {
    return {
      memory: this.getMemoryStats(),
      cpu: this.getCPUStats(),
      requests: this.getRequestStats(),
      errors: this.getErrorStats()
    };
  }
  
  getMemoryStats() {
    if (this.metrics.memory.length === 0) return null;
    
    const latest = this.metrics.memory[this.metrics.memory.length - 1];
    const avg = this.metrics.memory.reduce((sum, m) => sum + m.heapUsed, 0) / this.metrics.memory.length;
    
    return {
      current: latest,
      average: avg,
      trend: this.calculateTrend(this.metrics.memory.map(m => m.heapUsed))
    };
  }
  
  getCPUStats() {
    if (this.metrics.cpu.length === 0) return null;
    
    const latest = this.metrics.cpu[this.metrics.cpu.length - 1];
    const avg = this.metrics.cpu.reduce((sum, c) => sum + c.total, 0) / this.metrics.cpu.length;
    
    return {
      current: latest,
      average: avg
    };
  }
  
  getRequestStats() {
    const stats = [];
    for (const [endpoint, data] of this.metrics.requests) {
      stats.push({ endpoint, ...data });
    }
    return stats.sort((a, b) => b.avgTime - a.avgTime);
  }
  
  getErrorStats() {
    const now = Date.now();
    const recent = this.metrics.errors.filter(e => now - e.timestamp < 3600000); // 最近 1 小时
    
    const byType = {};
    recent.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
    });
    
    return {
      total: recent.length,
      byType,
      recent: recent.slice(-10)
    };
  }
}

// 使用示例
const monitor = new PerformanceMonitor();

monitor.on('memoryLeak', (data) => {
  console.warn('Memory leak detected:', data);
  // 发送警报通知
});

monitor.on('error', (data) => {
  console.error('Application error:', data);
  // 记录到日志系统
});

module.exports = PerformanceMonitor;
```

## 总结

Node.js 性能优化是一个系统工程，需要从多个角度入手：

1. **事件循环优化** - 避免阻塞操作，使用异步模式
2. **内存管理** - 防止内存泄漏，合理使用缓存
3. **数据库优化** - 连接池管理，查询优化
4. **HTTP 性能** - 压缩、缓存、集群部署
5. **监控诊断** - 实时监控，性能分析

掌握这些技巧，可以显著提升 Node.js 应用的性能和稳定性。

---

*你在 Node.js 性能优化方面有什么经验？欢迎分享你的优化技巧！*
