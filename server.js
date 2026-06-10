require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const Anthropic  = require('@anthropic-ai/sdk');
const fs         = require('fs');
const path       = require('path');
const { spawn }  = require('child_process');

const app     = express();
const PORT    = process.env.PORT || 3001;
const BASE    = __dirname;   // PRDanalisis/
const CHAT_DIR = path.join(BASE, 'Chat');
const NOTES_DIR = path.join(BASE, 'AgentNotes');

[CHAT_DIR, NOTES_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── SECURITY: sanitize path ──────────────────────────────────────────────────
function safePath(rel) {
  const resolved = path.resolve(BASE, rel.replace(/\.\./g, ''));
  if (!resolved.startsWith(BASE)) throw new Error('Path outside workspace');
  return resolved;
}

// ─── TOOLS DEFINITION ─────────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'read_file',
    description: 'Read the full content of any file in the workspace (PRD, BRD, TSV, MD, JSON, etc).',
    input_schema: {
      type: 'object',
      properties: {
        filepath: {
          type: 'string',
          description: 'Path relative to PRDanalisis root. Example: "PRD/feature.md" or "Test/tc.tsv"'
        }
      },
      required: ['filepath']
    }
  },
  {
    name: 'list_files',
    description: 'List all files and sub-folders inside a section of the workspace.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: 'Folder name. Options: BRD, PRD, Test, Rules, Memory, Assessments, AgentNotes, Chat, or "" for root.'
        }
      },
      required: ['section']
    }
  },
  {
    name: 'search_in_file',
    description: 'Search for a keyword inside a file. Returns matching lines with their line numbers.',
    input_schema: {
      type: 'object',
      properties: {
        filepath: { type: 'string', description: 'Path relative to PRDanalisis root' },
        query:    { type: 'string', description: 'Keyword or phrase to search for (case-insensitive)' }
      },
      required: ['filepath', 'query']
    }
  },
  {
    name: 'write_note',
    description: 'Save analysis results, findings, or notes to AgentNotes/ folder as a markdown file.',
    input_schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Filename, e.g. "analysis-auth-flow.md". No path, just filename.' },
        content:  { type: 'string', description: 'Full markdown content to write' }
      },
      required: ['filename', 'content']
    }
  },
  {
    name: 'run_automation',
    description: 'Run existing automation test scripts. Executes playwright tests filtered by test ID or tag.',
    input_schema: {
      type: 'object',
      properties: {
        filter:       { type: 'string',  description: 'Test ID, tag, or grep pattern. Example: "TC-001" or "@smoke"' },
        script_path:  { type: 'string',  description: 'Optional: specific test file path relative to automation root' },
        timeout_sec:  { type: 'number',  description: 'Timeout in seconds. Default: 60' }
      },
      required: ['filter']
    }
  }
];

// ─── TOOL EXECUTION ───────────────────────────────────────────────────────────
async function executeTool(name, input) {
  try {
    // ── read_file ──────────────────────────────────────────────────────────────
    if (name === 'read_file') {
      const fp = safePath(input.filepath);
      if (!fs.existsSync(fp)) return `❌ File not found: ${input.filepath}`;
      const content = fs.readFileSync(fp, 'utf8');
      const lines   = content.split('\n').length;
      const preview = content.length > 60000 ? content.slice(0, 60000) + `\n\n[truncated — file has ${lines} lines, showing first 60000 chars]` : content;
      return preview;
    }

    // ── list_files ────────────────────────────────────────────────────────────
    if (name === 'list_files') {
      const dir = safePath(input.section || '');
      if (!fs.existsSync(dir)) return `❌ Directory not found: ${input.section}`;
      const items = fs.readdirSync(dir, { withFileTypes: true });
      const lines = items
        .filter(i => !i.name.startsWith('.') && i.name !== 'node_modules')
        .map(i => `${i.isDirectory() ? '📁' : '📄'} ${i.name}`)
        .join('\n');
      return lines || '(empty directory)';
    }

    // ── search_in_file ────────────────────────────────────────────────────────
    if (name === 'search_in_file') {
      const fp = safePath(input.filepath);
      if (!fs.existsSync(fp)) return `❌ File not found: ${input.filepath}`;
      const lines   = fs.readFileSync(fp, 'utf8').split('\n');
      const q       = input.query.toLowerCase();
      const matches = [];
      lines.forEach((line, i) => {
        if (line.toLowerCase().includes(q)) {
          matches.push(`L${i + 1}: ${line.trim()}`);
        }
      });
      if (!matches.length) return `No matches for "${input.query}" in ${input.filepath}`;
      return matches.slice(0, 100).join('\n') + (matches.length > 100 ? `\n... and ${matches.length - 100} more` : '');
    }

    // ── write_note ────────────────────────────────────────────────────────────
    if (name === 'write_note') {
      const safe    = input.filename.replace(/[^a-zA-Z0-9._\-]/g, '_');
      const fp      = path.join(NOTES_DIR, safe);
      fs.writeFileSync(fp, input.content, 'utf8');
      return `✅ Saved to AgentNotes/${safe}`;
    }

    // ── run_automation ────────────────────────────────────────────────────────
    if (name === 'run_automation') {
      // ⚙️  Configure AUTOMATION_ROOT in .env to point to your automation project
      const AUTO_ROOT = process.env.AUTOMATION_ROOT;
      if (!AUTO_ROOT) {
        return '⚙️  Automation not configured yet.\nSet AUTOMATION_ROOT in .env to your Playwright project root, then restart server.';
      }
      if (!fs.existsSync(AUTO_ROOT)) {
        return `❌ AUTOMATION_ROOT not found: ${AUTO_ROOT}`;
      }

      const timeout = (input.timeout_sec || 60) * 1000;
      const args    = ['playwright', 'test'];
      if (input.script_path) args.push(input.script_path);
      if (input.filter)      args.push('--grep', input.filter);
      args.push('--reporter=line');

      return await new Promise((resolve) => {
        let output = '';
        const proc = spawn('npx', args, { cwd: AUTO_ROOT, shell: true, timeout });

        proc.stdout.on('data', d => { output += d.toString(); });
        proc.stderr.on('data', d => { output += d.toString(); });
        proc.on('close', code => {
          const result = output.slice(-3000); // last 3000 chars of output
          resolve(`Exit code: ${code}\n\n${result}`);
        });
        proc.on('error', e => resolve(`❌ Spawn error: ${e.message}`));
      });
    }

    return `❌ Unknown tool: ${name}`;
  } catch (e) {
    return `❌ Tool error (${name}): ${e.message}`;
  }
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
function buildSystem(context) {
  let sys = `You are a QA Agent embedded inside the SatuInbox QA Browser tool.
You help QA engineers with: analyzing PRDs, reviewing and writing test cases, identifying coverage gaps, impact analysis, and running automation tests.

Workspace structure (PRDanalisis/):
  BRD/         — Business Requirement Documents (.md)
  PRD/         — Product Requirement Documents (.md)
  Test/        — Test case files (.tsv, .json) + testcase-browser.html
  Rules/       — QA rules and methodology
  Memory/      — Product knowledge base (global-memory.md, feature memories)
  Assessments/ — Previous QA analysis reports
  AgentNotes/  — Your saved notes and analysis outputs

Always use tools to read actual files — never assume content from filenames alone.
When analyzing, cite section names and line numbers for traceability.
Format all responses in clean markdown.
When you write a significant analysis, also save it to AgentNotes/ using write_note.`;

  if (context?.filename) {
    sys += `\n\n---\nCurrently open in browser: **${context.filename}** (type: ${context.type || 'unknown'}, section: ${context.sectionId || '?'})`;
  }
  if (context?.content) {
    sys += `\n\nFile content preview (first 3000 chars):\n\`\`\`\n${context.content.slice(0, 3000)}\n\`\`\``;
  }
  return sys;
}

// ─── CHAT ENDPOINT — SSE Streaming ────────────────────────────────────────────
app.post('/chat', async (req, res) => {
  const { messages = [], context, sessionId } = req.body;

  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (obj) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      send({ type: 'error', message: 'ANTHROPIC_API_KEY tidak di-set. Tambahkan ke file .env lalu restart server.' });
      return res.end();
    }

    // Build message history for API (strip UI-only fields like toolCalls)
    const apiMessages = messages.map(m => ({
      role:    m.role,
      content: typeof m.content === 'string' ? m.content : (m.content || '')
    })).filter(m => m.content);

    const system = buildSystem(context);
    let iteration = 0;

    // Agentic loop — max 8 tool-use rounds
    while (iteration < 8) {
      iteration++;

      const stream = await client.messages.stream({
        model:      'claude-sonnet-4-6',
        max_tokens: 8096,
        system,
        tools:      TOOLS,
        messages:   apiMessages,
      });

      let textBuffer = '';
      const toolUses = [];   // accumulate tool_use blocks
      let stopReason = null;

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'tool_use') {
            toolUses.push({
              id:    event.content_block.id,
              name:  event.content_block.name,
              _json: '',
            });
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            textBuffer += event.delta.text;
            send({ type: 'text', content: event.delta.text });
          } else if (event.delta.type === 'input_json_delta') {
            const last = toolUses[toolUses.length - 1];
            if (last) last._json += event.delta.partial_json;
          }
        } else if (event.type === 'message_delta') {
          stopReason = event.delta.stop_reason;
        }
      }

      const finalMsg = await stream.finalMessage();

      // No tool calls → done
      if (stopReason !== 'tool_use') break;

      // Execute each tool
      apiMessages.push({ role: 'assistant', content: finalMsg.content });

      const toolResults = [];
      for (const block of finalMsg.content) {
        if (block.type !== 'tool_use') continue;

        let parsedInput = {};
        try { parsedInput = typeof block.input === 'object' ? block.input : JSON.parse(block._json || '{}'); } catch {}

        // Tell UI: tool is being called
        send({ type: 'tool_call', id: block.id, tool: block.name, input: parsedInput });

        const result = await executeTool(block.name, parsedInput);
        const preview = String(result).slice(0, 300) + (String(result).length > 300 ? '…' : '');

        // Tell UI: result preview
        send({ type: 'tool_result', id: block.id, tool: block.name, preview });

        toolResults.push({
          type:        'tool_result',
          tool_use_id: block.id,
          content:     String(result),
        });
      }

      apiMessages.push({ role: 'user', content: toolResults });
    }

    // Persist chat history
    if (sessionId) {
      try {
        const histFile = path.join(CHAT_DIR, `${sessionId}.json`);
        const existing = fs.existsSync(histFile) ? JSON.parse(fs.readFileSync(histFile, 'utf8')) : [];
        // append last user message + assistant reply text
        const lastUser = messages[messages.length - 1];
        if (lastUser) existing.push(lastUser);
        existing.push({ role: 'assistant', content: apiMessages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '' });
        fs.writeFileSync(histFile, JSON.stringify(existing, null, 2));
      } catch {}
    }

    send({ type: 'done' });
  } catch (e) {
    send({ type: 'error', message: e.message || 'Unknown error' });
  } finally {
    res.end();
  }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:   'ok',
    model:    'claude-sonnet-4-6',
    apiKey:   !!process.env.ANTHROPIC_API_KEY,
    base:     BASE,
  });
});

// ─── LIST SESSIONS ────────────────────────────────────────────────────────────
app.get('/sessions', (req, res) => {
  try {
    const files = fs.readdirSync(CHAT_DIR).filter(f => f.endsWith('.json'));
    const sessions = files.map(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(CHAT_DIR, f), 'utf8'));
        const lastUser = [...data].reverse().find(m => m.role === 'user');
        return {
          id:           f.replace('.json', ''),
          messageCount: data.length,
          preview:      String(lastUser?.content || '').slice(0, 80),
        };
      } catch { return null; }
    }).filter(Boolean);
    res.json(sessions.reverse()); // newest first
  } catch (e) {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`\n🤖 QA Agent server running → http://localhost:${PORT}`);
  console.log(`   Base: ${BASE}`);
  console.log(`   API key: ${process.env.ANTHROPIC_API_KEY ? '✅ set' : '❌ NOT SET — add to .env'}\n`);
});
