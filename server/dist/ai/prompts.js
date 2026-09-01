export class PromptTemplates {
    static buildAnalysisPrompt(context) {
        const meta = context.domainMeta;
        const readmeSection = meta?.readmeContent
            ? `=== PRIMARY PROJECT DOCUMENTATION (README.md) ===\n${meta.readmeContent.slice(0, 15000)}`
            : 'No README found.';
        const manifestSection = meta?.manifestInfo
            ? `=== MANIFEST METADATA ===\nProject Type: ${meta.manifestInfo.projectType}\nName: ${meta.manifestInfo.name || context.repoName}\nDescription: ${meta.manifestInfo.description || 'N/A'}\nKeywords: ${meta.manifestInfo.keywords.join(', ') || 'N/A'}`
            : '';
        const keyFilesSnippet = context.keyFiles.slice(0, 20).map(f => {
            return `--- File: ${f.path} (${f.lines} lines, ${f.language}) ---\n${f.sampleContent ? f.sampleContent.slice(0, 2000) : ''}`;
        }).join('\n\n');
        return `You are CodeLens AI, an expert software architect and technical documentation engine.
Analyze the following codebase and generate a comprehensive, deeply domain-accurate JSON report.

CRITICAL REQUIREMENT:
You MUST base the "summary" and "onboardingGuide.mission" on what this project ACTUALLY does (e.g. if it is an AI computer vision video chat filter, an e-commerce platform, or a developer CLI, state EXACTLY its real-world purpose, problem solved, and key features). NEVER output generic statements like "provides a modern solution".

Repository: ${context.repoName}
Languages Detected: ${context.languages.map(l => `${l.name} (${l.percentage}%)`).join(', ')}
Frameworks Detected: ${context.frameworks.map(f => f.name).join(', ')}
Entry Points: ${context.entryPoints.map(e => `${e.path} (${e.type})`).join(', ')}

${manifestSection}

${readmeSection}

${context.fileOutline}

Key Code Samples:
${keyFilesSnippet}

You MUST return ONLY a valid JSON object with the following exact shape:
{
  "summary": "Specific, domain-accurate 2-3 sentence executive technical summary of what this project does and how it is built.",
  "architecture": {
    "pattern": "e.g. Chrome Manifest V3 / Microservices / Clean Architecture / Event-Driven / Modular Monolith",
    "overview": "Detailed explanation of the architectural approach and structure",
    "dataFlow": "Step-by-step description of how requests, streams, or data flow through the components",
    "layers": [
      { "name": "Layer Name", "purpose": "Layer purpose", "files": ["path1", "path2"] }
    ],
    "diagramNodes": [
      { "id": "node_id", "label": "Node Label", "type": "frontend|api|service|database|external|config|worker", "description": "Purpose", "files": ["path1"], "tech": "Technology" }
    ],
    "diagramEdges": [
      { "from": "node_id1", "to": "node_id2", "label": "Relation description", "flowType": "call|data|event" }
    ]
  },
  "issues": [
    {
      "id": "issue-1",
      "title": "Concise issue title",
      "category": "bug|security|performance|smell|complexity",
      "severity": "high|medium|low",
      "filePath": "relative/path/to/file",
      "lineStart": 10,
      "lineEnd": 25,
      "snippet": "code snippet with issue",
      "explanation": "Why this is an issue and its impact",
      "suggestedFix": "How to fix it",
      "diff": "--- a/path\\n+++ b/path\\n@@ -10,3 +10,3 @@\\n-old\\n+new"
    }
  ],
  "onboardingGuide": {
    "mission": "Exact, specific domain explanation of what this project does, its real purpose, and the problem it solves.",
    "quickStart": {
      "prerequisites": ["Node.js 18+", "Docker", "etc"],
      "envVars": [
        { "key": "ENV_VAR", "example": "value", "required": true, "description": "What it is used for" }
      ],
      "commands": [
        { "label": "Step Name", "command": "shell command", "description": "Explanation" }
      ]
    },
    "techStackRationale": [
      { "tech": "TechName", "role": "Role in project", "reason": "Why this was chosen" }
    ],
    "architectureWalkthrough": "Narrative walkthrough explaining how pieces connect",
    "starterFiles": [
      { "path": "path/to/file", "rank": 1, "reasonToRead": "Why a newcomer must read this first", "keyConcepts": ["Concept1", "Concept2"] }
    ],
    "executionFlow": [
      { "step": 1, "title": "Step title", "trigger": "Trigger event", "trace": ["file1", "file2"], "description": "Description" }
    ],
    "learningPath": [
      { "day": "Day 1: Setup", "milestone": "Goal", "tasks": ["Task 1", "Task 2"], "filesToExplore": ["file1"] }
    ],
    "quiz": [
      { "id": "q1", "question": "Question text?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 0, "explanation": "Why A is correct" }
    ]
  }
}
`;
    }
    static buildChatPrompt(context, history, question) {
        const historyText = history.slice(-8).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
        const meta = context.domainMeta;
        const readmeSnippet = meta?.readmeContent ? `Project README Summary:\n${meta.readmeContent.slice(0, 4000)}` : '';
        const keyFilesSnippet = context.keyFiles.slice(0, 12).map(f => {
            return `--- File: ${f.path} ---\n${f.sampleContent ? f.sampleContent.slice(0, 1500) : ''}`;
        }).join('\n\n');
        return `You are CodeLens AI, an expert developer companion specifically answering questions about this codebase.

Repository Context:
Name: ${context.repoName}
Languages: ${context.languages.map(l => l.name).join(', ')}
Frameworks: ${context.frameworks.map(f => f.name).join(', ')}

${readmeSnippet}

${context.fileOutline}

Relevant Code Files:
${keyFilesSnippet}

Chat History:
${historyText}

User Question: ${question}

Instructions:
1. Provide a direct, technically precise answer tailored to THIS codebase.
2. Mention specific file paths and line numbers wherever possible.
3. If referencing a file, format it like \`[filename.ts:L15-L25]\` or \`services/auth/index.ts\`.
4. Provide clean code snippets if explaining fixes or feature additions.
5. If the user asks where something is or how something works, trace the exact files responsible.
`;
    }
    static buildTestGenerationPrompt(context, targetFile, fileContent, targetFunction, framework = 'Vitest') {
        return `You are CodeLens AI Test Generator.
Generate a comprehensive, production-ready unit test suite for the following code using ${framework}.

Target File: ${targetFile}
${targetFunction ? `Target Function/Component: ${targetFunction}` : 'Target: All main exported functions/classes/components in this file'}

Code Content:
\`\`\`
${fileContent}
\`\`\`

Return a valid JSON object with the following exact shape:
{
  "targetFile": "${targetFile}",
  "targetFunction": "${targetFunction || 'all'}",
  "framework": "${framework}",
  "rationale": "Explanation of the testing strategy, mocks needed, and edge-cases covered",
  "edgeCases": [
    "Edge case 1 (e.g. null inputs / boundary values)",
    "Edge case 2 (e.g. network failure / error throw)",
    "Edge case 3 (e.g. unauthorized state)"
  ],
  "expectedOutputs": [
    "Expected behavior for standard happy path",
    "Expected error handling / status code on failure"
  ],
  "code": "// Complete, runnable test file content in ${framework} with imports, mocks, and describe/it/test blocks"
}
`;
    }
}
