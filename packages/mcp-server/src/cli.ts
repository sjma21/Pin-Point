import { serve } from '@hono/node-server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createHttpServer } from './http/server.js';
import { createMcpServer } from './mcp/server.js';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const cmd = args[0] ?? 'server';

const DEFAULT_PORT = 4747;

function getPort(): number {
  // Priority: --port flag > PINPOINT_PORT env var > default 4747
  const idx = args.indexOf('--port');
  if (idx !== -1) {
    const p = parseInt(args[idx + 1] ?? '', 10);
    if (!Number.isNaN(p)) return p;
  }
  const envPort = parseInt(process.env['PINPOINT_PORT'] ?? '', 10);
  if (!Number.isNaN(envPort)) return envPort;
  return DEFAULT_PORT;
}

// ─── server ───────────────────────────────────────────────────────────────────

async function runServer(): Promise<void> {
  const port = getPort();

  const app = createHttpServer();
  serve({ fetch: app.fetch, port }, () => {
    process.stderr.write(`[markpin] HTTP  → http://localhost:${port}\n`);
    process.stderr.write(`[markpin] MCP   → stdio\n`);
    process.stderr.write(`[markpin] Ready — annotate in browser, Claude fixes it.\n`);
  });

  const mcp = createMcpServer();
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
}

// ─── init ─────────────────────────────────────────────────────────────────────

async function runInit(): Promise<void> {
  const port = getPort();
  const cliPath = new URL(import.meta.url).pathname;

  const mcpEntry = {
    command: 'node',
    args: [cliPath, 'server', '--port', String(port)],
    env: {},
  };

  // Check possible Claude Code config locations
  const candidates = [
    join(homedir(), '.claude', 'settings.json'),
    join(process.cwd(), '.mcp.json'),
  ];

  // Prefer project-local .mcp.json
  const configPath = join(process.cwd(), '.mcp.json');

  let config: { mcpServers?: Record<string, unknown> } = {};
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(await readFile(configPath, 'utf8')) as typeof config;
    } catch {
      config = {};
    }
  }

  config.mcpServers = { ...(config.mcpServers ?? {}), markpin: mcpEntry };

  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`✓ Written MCP config to ${configPath}`);
  console.log(`  Markpin will start on port ${port}`);
  console.log('');
  console.log('Next: restart Claude Code to pick up the new MCP server.');
  void candidates; // silence unused warning
}

// ─── doctor ───────────────────────────────────────────────────────────────────

async function runDoctor(): Promise<void> {
  let allGood = true;

  // Check Node.js version
  const nodeVersion = parseInt(process.versions.node.split('.')[0] ?? '0', 10);
  const nodeOk = nodeVersion >= 18;
  console.log(`${nodeOk ? '✓' : '✗'} Node.js ${process.versions.node} (need ≥18)`);
  if (!nodeOk) allGood = false;

  // Check .mcp.json
  const mcpPath = join(process.cwd(), '.mcp.json');
  const hasMcpJson = existsSync(mcpPath);
  let hasPinpointEntry = false;
  if (hasMcpJson) {
    try {
      const cfg = JSON.parse(await readFile(mcpPath, 'utf8')) as { mcpServers?: Record<string, unknown> };
      hasPinpointEntry = 'markpin' in (cfg.mcpServers ?? {});
    } catch { /* ignore */ }
  }
  console.log(`${hasMcpJson && hasPinpointEntry ? '✓' : '✗'} .mcp.json has markpin entry${!hasMcpJson ? ' (run: markpin-mcp init)' : ''}`);
  if (!hasMcpJson || !hasPinpointEntry) allGood = false;

  // Check if server can start briefly
  const port = getPort();
  try {
    execSync(`node -e "require('node:net').createServer().listen(${port}, () => process.exit(0))"`, { timeout: 3000 });
    console.log(`✓ Port ${port} is available`);
  } catch {
    console.log(`✗ Port ${port} is in use (server may already be running, or choose --port)`);
  }

  // Claude Code global settings
  const globalSettings = join(homedir(), '.claude', 'settings.json');
  if (existsSync(globalSettings)) {
    console.log(`✓ Claude Code settings found at ${globalSettings}`);
  } else {
    console.log(`  Claude Code global settings not found at ${globalSettings} (not required)`);
  }

  console.log('');
  console.log(allGood ? '✓ Everything looks good!' : '✗ Some checks failed — see above.');
}

// ─── dispatch ─────────────────────────────────────────────────────────────────

switch (cmd) {
  case 'server':
    runServer().catch((e: Error) => { process.stderr.write(`[pinpoint] Fatal: ${e.message}\n`); process.exit(1); });
    break;

  case 'init':
    runInit().then(() => process.exit(0)).catch((e: Error) => { console.error(e.message); process.exit(1); });
    break;

  case 'doctor':
    runDoctor().then(() => process.exit(0)).catch((e: Error) => { console.error(e.message); process.exit(1); });
    break;

  default:
    console.error(`Unknown command: ${cmd}`);
    console.error('Usage: markpin-mcp [server|init|doctor] [--port PORT]');
    process.exit(1);
}
