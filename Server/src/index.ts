import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import os from 'os';
import si from 'systeminformation';

interface SystemInfo {
  status: 'connected' | 'disconnected' | 'connecting';
  type: string;
  cpus: number;
  totalMemory: number;
  currentLoad: number;
  timestamp: number;
}

interface MonitorEvent {
  cpu: {
    usage: number;
    cores: number[];
    currentLoadUser?: number;
    currentLoadSystem?: number;
    currentLoadIdle?: number;
    rawCurrentLoad?: number[];
    rawCurrentLoadUser?: number[];
    rawCurrentLoadSystem?: number[];
    rawCurrentLoadIdle?: number[];
  };
  memory: {
    total: number;
    free: number;
    available?: number;
    used: number;
    usage: number;
    active?: number;
    buffcache?: number;
    swaptotal?: number;
    swapused?: number;
    swapfree?: number;
  };
  temperature: number;
  temperatureCores?: number[];
  temperatureMax?: number;
  temperatureSocket?: number[];
  temperatureChipset?: number[];
  network: any;
  networkInterfaces?: any[];
  networkStats?: any[];
  os?: any;
  fs?: Array<any>;
  diskLayout?: Array<any>;
  processes?: {
    all?: number;
    running?: number;
    blocked?: number;
    sleeping?: number;
    list?: any[];
  };
  users?: any[];
  loadavg?: number[];
  uptime?: number;
  cpuSpeed?: any;
  battery?: any;
  graphics?: any;
  cpuInfo?: any;
  timestamp: number;
}

interface ConnectionData {
  status: string;
  type: string;
  cpus: number;
  totalMemory: number;
  availableMemory?: number;
  currentLoad: number;
  hostname?: string;
  osInfo?: any;
  uptime?: number;
  timestamp: number;
}

const server = createServer();
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = parseInt(process.env.PORT || '9500', 10);
const MONITOR_INTERVAL = 3000;

// System monitoring function
const monitorSystem = async (): Promise<MonitorEvent> => {
  try {
    const cpuData = await si.currentLoad();
    const memData = await si.mem();
    const cpuTemp = await si.cpuTemperature();
    const networkStats = await si.networkStats();
    const fsSize = await si.fsSize();
    const proc = await si.processes();
    const users = await si.users();
    const netIf = await si.networkInterfaces();
    const time = await si.time();
    const cpuSpeed = await si.cpuCurrentSpeed();
    const osData = await si.osInfo();
    const battery = await si.battery();
    const graphics = await si.graphics();
    const diskLayout = await si.diskLayout();
    const cpuInfo = await si.cpu();

    return {
      cpu: {
        usage: cpuData.currentLoad,
        cores: cpuData.cpus.map(cpu => cpu.load)
      },
          memory: {
            // Use the `available` memory for free to reflect what end-users typically
            // think of as "free" memory (OS-level free often excludes cache/buffer).
            total: memData.total,
            available: memData.available ?? memData.free,
            free: memData.available ?? memData.free,
            used: (memData.total - (memData.available ?? memData.free)),
            // usage is percentage of used memory relative to total
            usage: ((memData.total - (memData.available ?? memData.free)) / memData.total) * 100,
          },
      temperature: cpuTemp.main || 0,
      temperatureCores: cpuTemp.cores || [],
      temperatureMax: cpuTemp.max || 0,
      temperatureSocket: cpuTemp.socket || [],
      temperatureChipset: Array.isArray(cpuTemp.chipset) ? cpuTemp.chipset : [],
      network: networkStats[0] || {},
      networkInterfaces: netIf,
      networkStats: networkStats,
      os: osData,
      fs: fsSize,
      diskLayout: diskLayout,
      processes: {
        all: proc.all,
        running: proc.running,
        blocked: proc.blocked,
        sleeping: proc.sleeping,
      },
      users: users,
      loadavg: os.loadavg(),
      uptime: time.uptime,
      cpuSpeed: cpuSpeed,
      battery: battery,
      graphics: graphics,
      cpuInfo: cpuInfo,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error monitoring system:', error);
    throw error;
  }
};

// Get initial system information
const getSystemInfo = async (): Promise<ConnectionData> => {
  try {
    const cpuData = await si.cpu();
    const memData = await si.mem();
    const osData = await si.osInfo();
    const currentLoad = await si.currentLoad();
    const hostname = os.hostname();
    const time = await si.time();

    return {
      status: 'connected',
      type: osData.platform,
      cpus: cpuData.cores,
      totalMemory: memData.total,
      availableMemory: memData.available ?? memData.free,
      hostname: hostname,
      osInfo: osData,
      uptime: time.uptime,
      currentLoad: currentLoad.currentLoad,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    throw error;
  }
};

// Socket connection handling
io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);
  
  try {
    const systemInfo = await getSystemInfo();
    socket.emit('connected', systemInfo);
  } catch (error) {
    console.error('Error getting system info:', error);
    socket.emit('error', { message: 'Failed to get system information' });
  }
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start system monitoring
console.log(`Starting server monitoring with ${MONITOR_INTERVAL}ms interval`);
setInterval(async () => {
  try {
    const monitorEvent = await monitorSystem();
    // Debug: log a summary of the monitor payload so the developer can inspect values
    console.log('os-update', {
      cpuUsage: monitorEvent.cpu.usage,
      cpuCores: monitorEvent.cpu.cores?.length ?? 0,
      memoryTotal: monitorEvent.memory.total,
      memoryFree: monitorEvent.memory.free,
      memoryAvailable: monitorEvent.memory.available,
      memoryUsed: monitorEvent.memory.used,
      memoryUsagePct: monitorEvent.memory.usage
      , uptime: monitorEvent.uptime,
      hostname: monitorEvent.os?.hostname ?? os.hostname(),
      diskCount: monitorEvent.fs?.length ?? 0,
      processes: monitorEvent.processes
    });
    io.emit('os-update', monitorEvent);
  } catch (error) {
    console.error('Error in monitoring cycle:', error);
  }
}, MONITOR_INTERVAL);

// Start server with error handling
server.listen(PORT, () => {
  console.log(`Server monitoring running on port ${PORT}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the process using: lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});