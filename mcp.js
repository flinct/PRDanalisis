'use strict';
/**
 * MCP stdio server — PRDanalisis workspace
 *
 * Tools exposed:
 *   list_files      — list files in workspace (with optional dir/ext filter)
 *   read_file       — read file content
 *   write_file      — write/create file (auto-triggers server watcher for .tsv/.md)
 *   patch_file      — string-replace in file (safe small edits)
 *   search_content  — grep-style search across files
 *
 * Register in claude_desktop_config.json:
 *   "satainbox-qa": {
 *     "command": "node",
 *     "args": ["C:\\Users\\MyBook SAGA 12\\Desktop\\PRDanalisis\\mcp.js"]
 *   }
 */

const { Server }               = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs   = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname);

// ─── TOOL DEFINITIONS ────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'list_files',
    description:
      'List files in the PRDanalisis workspace. Returns paths relative to workspace root. ' +
      'Use dir to narrow scope (e.g. "Test", "PRD", "Memory"). Use ext to filter by extension.',
    inputSchema: {
      type: 'object',
      properties: {
        dir: { type: 'string', description: 'Subdirectory to list. Omit for workspace root.' },
        ext: { type: 'string', description: 'Extension filter, e.g. ".tsv" or ".md"' },
      },
    },
  },
  {
    name: 'read_file',
    description: 'Read the full content of a file. Path is relative to workspace root.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to workspace root, e.g. "PRD/Conversationv2/Conversation V2.md"' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description:
      'Write content to a file (creates or overwrites). Path relative to workspace root. ' +
      'If the running server (localhost:3001) is active, its file-watcher will auto-reimport .tsv and .md changes into the DB.',
    inputSchema: {
      type: 'object',
      properties: {
        path:    { type: 'string', description: 'File path relative to workspace root' },
        content: { type: 'string', description: 'Full file content to write' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'patch_file',
    description:
      'Replace one exact string occurrence in a file. Safer than write_file for small edits ' +
      'because you only send the changed portion. Throws if old_text is not found.',
    inputSchema: {
      type: 'object',
      properties: {
        path:     { type: 'string', description: 'File path relative to workspace root' },
        old_text: { type: 'string', description: 'Exact text to find (must match exactly, including whitespace)' },
        new_text: { type: 'string', description: 'Replacement text' },
      },
      required: ['path', 'old_text', 'new_text'],
    },
  },
  {
    name: 'search_content',
    description:
      'Search for text or a regex pattern across files in the workspace. ' +
      'Returns matching lines with file path and line number (max 200 results).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Text or JS regex pattern to search for' },
        dir:   { type: 'string', description: 'Directory to search in. Omit for workspace root.' },
        ext:   { type: 'string', description: 'Extension filter, e.g. ".tsv" or ".md"' },
      },
      required: ['query'],
    },
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const SKIP = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.nyc_output']);

function walkFiles(dir, cb) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (SKIP.has(e.name) || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(full, cb);
    else cb({ name: e.name, full });
  }
}

function safePath(rel) {
  const abs = path.resolve(BASE, rel);
  if (!abs.startsWith(BASE + path.sep) && abs !== BASE) {
    throw new Error(`Path outside workspace: ${rel}`);
  }
  return abs;
}

function ok(text) {
  return { content: [{ type: 'text', text: String(text) }] };
}

function err(msg) {
  return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
}

// ─── SERVER ──────────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'satainbox-qa', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {

      // ── list_files ──────────────────────────────────────────────────────
      case 'list_files': {
        const root = args.dir ? safePath(args.dir) : BASE;
        const results = [];
        walkFiles(root, (f) => {
          if (args.ext && !f.name.toLowerCase().endsWith(args.ext.toLowerCase())) return;
          results.push(path.relative(BASE, f.full).replace(/\\/g, '/'));
        });
        if (!results.length) return ok('(no files found)');
        return ok(results.join('\n'));
      }

      // ── read_file ───────────────────────────────────────────────────────
      case 'read_file': {
        const abs = safePath(args.path);
        if (!fs.existsSync(abs)) return err(`File not found: ${args.path}`);
        const content = fs.readFileSync(abs, 'utf8');
        return ok(content);
      }

      // ── write_file ──────────────────────────────────────────────────────
      case 'write_file': {
        const abs = safePath(args.path);
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, args.content, 'utf8');
        const lines = args.content.split('\n').length;
        return ok(`Written: ${args.path} (${args.content.length} bytes, ${lines} lines)`);
      }

      // ── patch_file ──────────────────────────────────────────────────────
      case 'patch_file': {
        const abs = safePath(args.path);
        if (!fs.existsSync(abs)) return err(`File not found: ${args.path}`);
        const original = fs.readFileSync(abs, 'utf8');
        if (!original.includes(args.old_text)) {
          return err(
            `Text not found in ${args.path}.\n` +
            `Looking for: ${JSON.stringify(args.old_text.slice(0, 120))}`,
          );
        }
        const patched = original.replace(args.old_text, args.new_text);
        fs.writeFileSync(abs, patched, 'utf8');
        return ok(`Patched: ${args.path}`);
      }

      // ── search_content ──────────────────────────────────────────────────
      case 'search_content': {
        const root = args.dir ? safePath(args.dir) : BASE;
        const TEXT_EXT = /\.(tsv|md|txt|json|js|ts|jsx|tsx|yaml|yml|csv)$/i;
        const results = [];

        let regex;
        try { regex = new RegExp(args.query, 'gi'); }
        catch { regex = new RegExp(args.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); }

        walkFiles(root, (f) => {
          if (args.ext && !f.name.toLowerCase().endsWith(args.ext.toLowerCase())) return;
          if (!TEXT_EXT.test(f.name)) return;
          if (results.length >= 200) return;
          try {
            const lines = fs.readFileSync(f.full, 'utf8').split('\n');
            const rel   = path.relative(BASE, f.full).replace(/\\/g, '/');
            lines.forEach((line, i) => {
              if (results.length >= 200) return;
              regex.lastIndex = 0;
              if (regex.test(line)) {
                results.push(`${rel}:${i + 1}: ${line.trim().slice(0, 200)}`);
              }
            });
          } catch { /* skip unreadable */ }
        });

        if (!results.length) return ok('(no matches)');
        const note = results.length >= 200 ? '\n… (truncated at 200 results)' : '';
        return ok(results.join('\n') + note);
      }

      default:
        return err(`Unknown tool: ${name}`);
    }
  } catch (e) {
    return err(e.message);
  }
});

// ─── START ───────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Intentionally no console.log — stdio is owned by the MCP protocol
}

main().catch((e) => {
  process.stderr.write(`MCP server error: ${e.message}\n`);
  process.exit(1);
});
