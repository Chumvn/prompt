/* ========================================
   CHUM Prompt — App Logic & Prompt Engine
   Single input per tab → structured English prompt
   ======================================== */

(function () {
    'use strict';

    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);

    const themeToggle = $('#themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const tabBtns = $$('.tab-btn');
    const panels = $$('.tab-panel');
    const btnGenerate = $('#btnGenerate');
    const btnCopy = $('#btnCopy');
    const btnReset = $('#btnReset');
    const previewSection = $('#previewSection');
    const previewOutput = $('#previewOutput');
    const charCount = $('#charCount');
    const toast = $('#toast');

    let currentTab = 'web';
    let generatedPrompt = '';

    // ── Theme ──
    function initTheme() {
        const saved = localStorage.getItem('chum-prompt-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        themeIcon.textContent = saved === 'dark' ? '🌙' : '☀️';
    }

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('chum-prompt-theme', next);
        themeIcon.textContent = next === 'dark' ? '🌙' : '☀️';
    });

    // ── Tabs ──
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            panels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            currentTab = btn.dataset.tab;
            $(`#panel-${currentTab}`).classList.add('active');
        });
    });

    // ── Toast ──
    function showToast(msg) {
        toast.textContent = msg || 'Đã sao chép!';
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2000);
    }

    // ── Shared template ──
    const MAGIC_LINE = 'Before producing the final answer, ensure the solution aligns with the stated goal, context, and constraints.';

    function buildPrompt(sections) {
        let parts = [];
        if (sections.goal) parts.push(`## GOAL\n${sections.goal}`);
        if (sections.context) parts.push(`## CONTEXT\n${sections.context}`);
        if (sections.constraints) parts.push(`## CONSTRAINTS\n${sections.constraints}`);
        if (sections.output) parts.push(`## OUTPUT\n${sections.output}`);
        if (sections.task) parts.push(`## TASK\n${sections.task}`);
        parts.push(`---\n${MAGIC_LINE}`);
        return parts.join('\n\n');
    }

    // ═══════════════════════════════════
    // WEB Prompt — from single description
    // ═══════════════════════════════════
    function generateWebPrompt(userDesc) {
        const goal = `Build a complete, production-ready web application based on the following user description:\n\n"${userDesc}"\n\nThe app should be fully functional and ready to deploy on GitHub Pages.`;

        const context = `Target deployment:
- Frontend: GitHub Pages (HTML, CSS, vanilla JavaScript)
- No build step required; all files must be directly deployable
- If the user mentions Google Apps Script / GAS / Sheets backend, include a complete GAS Web App (doGet/doPost) with Google Sheets as the database

UI direction:
- Neumorphism design style
- Single column layout, mobile-first responsive
- Dark/Light mode toggle (default: dark)
- Clean typography using a modern font (Inter or similar)`;

        const constraints = `- Use only vanilla HTML + CSS + JavaScript (no frameworks, no build tools)
- All code must be complete — no placeholders, no "TODO", no pseudocode
- Do NOT include any AI-model-specific instructions or tool lists
- Ensure accessibility basics (labels, semantic HTML, focus states)
- If GAS backend is needed: handle CORS, provide setup instructions for linking Google Sheet`;

        const output = `Provide the complete file structure with full code:
- /index.html
- /assets/style.css
- /assets/app.js
- /manifest.json (PWA)
- /sw.js (service worker for offline caching)
- /README.md (setup, deploy, customize instructions)
- If GAS backend: /gas/Code.gs + sample Google Sheets schema`;

        const task = `Based on the user's description above, create the complete web application. Extract the app name, features, pages, and any backend requirements from the description. Deliver all files with full working code.`;

        return buildPrompt({ goal, context, constraints, output, task });
    }

    // ═══════════════════════════════════
    // IMAGE Prompt — from single description
    // ═══════════════════════════════════
    function generateImagePrompt(userDesc) {
        // For image prompts, we produce a clean structured prompt (not GOAL/CONTEXT format)
        const lines = [];

        lines.push(`Create an image based on the following description:`);
        lines.push('');
        lines.push(`Subject: ${userDesc}`);
        lines.push('');
        lines.push(`Rendering guidelines:`);
        lines.push(`- Style: Identify and apply the most appropriate artistic style from the description (cinematic, realistic, anime, 3D, watercolor, etc.). If not specified, use cinematic.`);
        lines.push(`- Mood/Atmosphere: Extract the mood from the description. If not specified, use a natural warm atmosphere.`);
        lines.push(`- Lighting: Apply lighting that matches the mood (golden hour, dramatic chiaroscuro, soft diffused, etc.)`);
        lines.push(`- Camera/Lens: Use an appropriate virtual camera setup (shallow depth of field, wide angle, macro, etc.)`);
        lines.push(`- Composition: Follow the rule of thirds, clear focal point, pleasing visual hierarchy`);
        lines.push(`- Quality: masterpiece, best quality, highly detailed, 8K resolution, ultra-sharp, professional`);
        lines.push('');
        lines.push(`Negative prompt: blurry, low quality, deformed, watermark, text, logo, bad anatomy, cropped, worst quality, jpeg artifacts, duplicate, disfigured, out of frame, extra limbs`);
        lines.push('');
        lines.push(`---`);
        lines.push(MAGIC_LINE);

        return lines.join('\n');
    }

    // ═══════════════════════════════════
    // CMD Prompt — from single description
    // ═══════════════════════════════════
    function generateCmdPrompt(userDesc) {
        const goal = `Create a complete Windows command-line tool based on the following user description:\n\n"${userDesc}"\n\nThe script must be stable, polished, and ready to use immediately.`;

        const context = `Target platform: Windows 10/11
Execution environment: Determine the best script type (BAT or PowerShell) based on the description. Default to PowerShell if not specified.
The tool should feel professional — not a throwaway script.`;

        const constraints = `- The script must be stable and NEVER exit unexpectedly
- Must handle edge cases and errors gracefully
- Must work on a standard Windows installation without additional dependencies
- Use UTF-8 encoding
- Include clear comments explaining each section
- Use color-coded output when possible
- For BAT: use @echo off, setlocal enabledelayedexpansion, GOTO-based menu
- For PowerShell: use param blocks, Write-Host with -ForegroundColor, proper error handling`;

        const output = `Provide the complete script file with:
- Full working code (not pseudocode or snippets)
- Inline comments
- Usage instructions at the top as comments
- A clear title/header displayed when launched
- Menu-based UX if the tool has multiple functions
- Pause before exiting so the user can read output`;

        const task = `Based on the user's description above, create the complete script. Extract the tool name, purpose, script type, and features from the description. Deliver a single ready-to-run script file.`;

        return buildPrompt({ goal, context, constraints, output, task });
    }

    // ── Generate ──
    btnGenerate.addEventListener('click', () => {
        const inputMap = { web: '#webInput', image: '#imgInput', cmd: '#cmdInput' };
        const userInput = $(inputMap[currentTab]).value.trim();

        if (!userInput) {
            showToast('⚠️ Vui lòng nhập mô tả!');
            return;
        }

        switch (currentTab) {
            case 'web': generatedPrompt = generateWebPrompt(userInput); break;
            case 'image': generatedPrompt = generateImagePrompt(userInput); break;
            case 'cmd': generatedPrompt = generateCmdPrompt(userInput); break;
        }

        previewOutput.textContent = generatedPrompt;
        charCount.textContent = `${generatedPrompt.length} ký tự`;
        previewSection.classList.remove('hidden');
        btnCopy.disabled = false;

        setTimeout(() => {
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    });

    // ── Copy ──
    btnCopy.addEventListener('click', async () => {
        if (!generatedPrompt) return;
        try {
            await navigator.clipboard.writeText(generatedPrompt);
            showToast('✅ Đã sao chép prompt!');
        } catch {
            const ta = document.createElement('textarea');
            ta.value = generatedPrompt;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('✅ Đã sao chép prompt!');
        }
    });

    // ── Reset ──
    btnReset.addEventListener('click', () => {
        const inputMap = { web: '#webInput', image: '#imgInput', cmd: '#cmdInput' };
        $(inputMap[currentTab]).value = '';
        generatedPrompt = '';
        previewSection.classList.add('hidden');
        btnCopy.disabled = true;
    });

    // ── Init ──
    initTheme();

})();
