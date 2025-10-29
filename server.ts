// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOSTNAME || '127.0.0.1';

// Get the project directory - works in different environments
const projectDir = process.cwd();

console.log(`Starting server from directory: ${projectDir}`);
console.log(`Environment: ${dev ? 'development' : 'production'}`);
console.log(`Port: ${currentPort}`);
console.log(`Hostname: ${hostname}`);

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app with explicit configuration
    const nextApp = next({ 
      dev,
      dir: projectDir,
      hostname: hostname,
      port: currentPort,
      // In production, use the current directory where .next is located
      conf: {
        distDir: '.next',
        output: 'standalone',
        experimental: {
          serverComponentsExternalPackages: []
        }
      }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
      console.log(`> Project directory: ${projectDir}`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
