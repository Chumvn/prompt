/* ========================================
   CHUM Prompt — App Logic & Prompt Engine
   Vietnamese UI → English structured prompt
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
    const submodeDesc = $('#submodeDesc');

    let currentTab = 'web';
    let webSubmode = 'pages'; // 'pages' or 'gas'
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

    // ── WEB Sub-modes ──
    const submodeBtns = $$('.sub-mode-btn');
    const submodeDescriptions = {
        pages: 'Frontend tĩnh: HTML/CSS/JS → deploy lên GitHub Pages',
        gas: 'Fullstack: Frontend GitHub Pages + Backend Google Apps Script + Google Sheets DB'
    };

    submodeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            submodeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            webSubmode = btn.dataset.submode;
            submodeDesc.textContent = submodeDescriptions[webSubmode];
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

    // ══════════════════════════════════════
    //  AUTO-FILL PRESETS
    // ══════════════════════════════════════

    const AUTOFILL = {
        // ── WEB presets ──
        'web-portfolio': 'Portfolio cá nhân tên "My Portfolio", có hero section, about me, dự án, kỹ năng, form liên hệ, dark/light mode, animation cuộn mượt, responsive mobile',
        'web-dashboard': 'Dashboard quản lý tên "CHUM Dashboard", có tổng quan thống kê, biểu đồ doanh thu, bảng dữ liệu, filter theo ngày/tháng, xuất PDF, dark mode mặc định',
        'web-landing': 'Landing page giới thiệu sản phẩm, có hero banner full-width, tính năng nổi bật, pricing table, testimonials, FAQ accordion, CTA button, responsive',
        'web-rental': 'App quản lý phòng trọ tên "CHUM Stay", có dashboard tổng quan, CRUD phòng/khách, quản lý hợp đồng, thu tiền hàng tháng, cảnh báo hết hạn, xuất PDF, dark mode',
        'web-invoice': 'App tạo hóa đơn tên "CHUM Invoice", nhập thông tin khách/sản phẩm, tự tính tổng tiền + thuế, xuất PDF/PNG, lưu lịch sử hóa đơn, template đẹp, dark mode',
        'web-todo': 'App Todo tên "CHUM Tasks", thêm/sửa/xóa task, phân loại theo tag màu, kéo thả sắp xếp, filter ưu tiên, lưu localStorage, dark/light mode, animation mượt',
        'web-blog': 'Blog cá nhân, trang chủ liệt kê bài viết, trang chi tiết bài, phân loại theo tag, tìm kiếm, dark/light mode, responsive, markdown render',
        'web-calculator': 'Máy tính đa năng: tính cơ bản + tính % giảm giá + quy đổi tiền tệ + BMI, giao diện tab chuyển chế độ, lịch sử phép tính, dark mode, responsive',

        // ── IMAGE presets ──
        'img-portrait': 'Chân dung cô gái Việt Nam, tóc dài, áo dài trắng, đứng trong vườn hoa sen, ánh nắng chiều vàng, phong cách cinematic, mood ấm áp dreamy, bokeh mềm, tỉ lệ 4:5',
        'img-landscape': 'Ruộng bậc thang Mù Cang Chải lúc bình minh, sương mù nhẹ, ánh nắng vàng xuyên qua mây, phong cách realistic, mood hùng vĩ yên bình, tỉ lệ 16:9, ultra wide angle',
        'img-product': 'Chai nước hoa sang trọng trên nền marble trắng, ánh sáng studio mềm, phản chiếu nhẹ, phong cách product photography, minimal, nền sạch, tỉ lệ 1:1',
        'img-anime': 'Nhân vật nữ anime ngồi trên mái nhà nhìn thành phố về đêm, tóc bay trong gió, đèn neon phản chiếu, phong cách anime Makoto Shinkai, mood nostalgic, tỉ lệ 16:9',
        'img-logo': 'Logo chữ "CHUM" phong cách hiện đại tối giản, gradient tím-xanh, nền trong suốt, hình dạng geometric, phù hợp cho app tech, sắc nét, tỉ lệ 1:1',
        'img-food': 'Bát phở bò nóng hổi, nước dùng trong vàng, thịt bò tái, rau thơm, tiêu đen, bàn gỗ vintage, ánh sáng tự nhiên từ cửa sổ, food photography, mood ấm cúng, tỉ lệ 1:1',
        'img-architecture': 'Biệt thự hiện đại giữa rừng nhiệt đới, kính lớn phản chiếu cây xanh, hồ bơi infinity edge, hoàng hôn, phong cách architectural visualization, 3D render, tỉ lệ 16:9',
        'img-fantasy': 'Rồng phương Đông bay trên thành phố cổ Việt Nam, mây đỏ hoàng hôn, ánh sáng vàng dramatic, chi tiết vảy rồng, phong cách digital painting epic, tỉ lệ 16:9',

        // ── CMD presets ──
        'cmd-cleaner': 'Tool dọn rác hệ thống tên "CHUM Cleaner", PowerShell, xóa temp/cache/recycle bin, hiện dung lượng giải phóng, menu chọn loại rác, color output, log file, admin check',
        'cmd-backup': 'Tool backup tự động tên "CHUM Backup", PowerShell, sao lưu folder chỉ định sang ổ khác, nén zip, giữ 5 bản gần nhất, lịch chạy hàng ngày, log chi tiết, progress bar',
        'cmd-network': 'Tool kiểm tra mạng tên "CHUM NetCheck", BAT, ping nhiều host, traceroute, hiện IP/DNS, đo tốc độ kết nối, menu chọn chức năng, color output, xuất report txt',
        'cmd-sysinfo': 'Tool xem thông tin hệ thống tên "CHUM SysInfo", PowerShell, hiện CPU/RAM/Disk/GPU/OS info, nhiệt độ, uptime, danh sách phần mềm, xuất báo cáo HTML, color output',
        'cmd-rename': 'Tool đổi tên file hàng loạt tên "CHUM Rename", PowerShell, chọn folder, đổi tên theo pattern (prefix, suffix, số thứ tự, ngày), preview trước khi đổi, undo, log',
        'cmd-wifi': 'Tool quản lý WiFi tên "CHUM WiFi", BAT, liệt kê WiFi đã lưu, hiện mật khẩu, xóa WiFi cũ, xuất danh sách, quét mạng xung quanh, menu, color output',
        'cmd-registry': 'Tool tối ưu hệ thống tên "CHUM Tweak", PowerShell, chỉnh registry phổ biến (tắt Cortana, tăng tốc menu, tắt telemetry), menu checkbox chọn, backup registry trước khi sửa, admin check',
        'cmd-deploy': 'Tool auto deploy GitHub Pages tên "CHUM Deploy", PowerShell, git add/commit/push tự động, chọn folder dự án, nhập commit message hoặc auto generate, hiện trạng thái, color output'
    };

    // Auto-fill click handler
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.autofill-btn');
        if (!btn) return;

        const key = btn.dataset.fill;
        const text = AUTOFILL[key];
        if (!text) return;

        // Determine which textarea to fill
        const inputMap = { web: '#webInput', image: '#imgInput', cmd: '#cmdInput' };
        const textarea = $(inputMap[currentTab]);
        if (textarea) {
            textarea.value = text;
            textarea.focus();
            // Animate the button
            btn.classList.add('autofill-active');
            setTimeout(() => btn.classList.remove('autofill-active'), 400);
        }
    });

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
    // WEB — GitHub Pages prompt
    // ═══════════════════════════════════
    function generateWebPages(userDesc) {
        const goal = `Build a complete, production-ready static web application based on the following description:\n\n"${userDesc}"\n\nThe app must be fully functional and ready to deploy on GitHub Pages with no build step.`;

        const context = `Target deployment: GitHub Pages (static hosting)
Tech stack: HTML + CSS + vanilla JavaScript only
No build tools, no frameworks, no npm

UI direction:
- Neumorphism design style
- Single column layout, mobile-first responsive
- Dark/Light mode toggle (default: dark)
- Clean modern typography (Inter or similar font)`;

        const constraints = `- Use only vanilla HTML + CSS + JavaScript
- All code must be complete — no placeholders, no "TODO", no pseudocode
- Do NOT include any AI-model-specific instructions
- Ensure accessibility basics (labels, semantic HTML, focus states)
- All data stored client-side (localStorage) unless specified otherwise`;

        const output = `Provide complete file structure with full code:
- /index.html
- /assets/style.css
- /assets/app.js
- /manifest.json (PWA)
- /sw.js (service worker for offline caching)
- /README.md (setup, deploy, customize)`;

        const task = `Create the web app as described above. Extract the app name, features, pages from the description. Deliver all files with full working code ready to deploy.`;

        return buildPrompt({ goal, context, constraints, output, task });
    }

    // ═══════════════════════════════════
    // WEB — GAS + Sheets prompt
    // ═══════════════════════════════════
    function generateWebGAS(userDesc) {
        const goal = `Build a complete fullstack web application based on the following description:\n\n"${userDesc}"\n\nFrontend: GitHub Pages (HTML/CSS/JS)\nBackend: Google Apps Script Web App + Google Sheets as database`;

        const context = `This is a 2-tier architecture:
1. Frontend: Static site on GitHub Pages (HTML, CSS, vanilla JS)
2. Backend: Google Apps Script deployed as Web App (doGet / doPost)
3. Database: Google Sheets — each sheet = a table, row 1 = headers

The frontend communicates with the backend via fetch() calls to the GAS Web App URL.`;

        const constraints = `- Frontend: vanilla HTML + CSS + JavaScript only, no frameworks
- Backend: Google Apps Script (server-side JavaScript)
- Handle CORS properly (ContentService with JSONP or doPost with JSON)
- All code must be complete — no placeholders, no "TODO"
- Include proper error handling on both frontend and backend
- Provide clear deployment instructions for both parts`;

        const output = `Provide complete file structure:

Frontend (GitHub Pages):
- /index.html
- /assets/style.css
- /assets/app.js
- /manifest.json (PWA)
- /sw.js (service worker)
- /README.md

Backend (Google Apps Script):
- Code.gs (main server code with doGet/doPost)
- Sample Google Sheets schema (sheet names, column headers, example data rows)
- Step-by-step setup instructions for GAS deployment`;

        const task = `Create the fullstack webapp as described. Frontend on GitHub Pages with neumorphism dark/light UI. Backend on Google Apps Script with Sheets DB. Include all CRUD operations, proper error handling, and complete deployment instructions.`;

        return buildPrompt({ goal, context, constraints, output, task });
    }

    // ═══════════════════════════════════
    // IMAGE Prompt
    // ═══════════════════════════════════
    function generateImagePrompt(userDesc) {
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
    // CMD/TOOL Prompt
    // ═══════════════════════════════════
    function generateCmdPrompt(userDesc) {
        const goal = `Create a complete Windows command-line tool based on the following description:\n\n"${userDesc}"\n\nThe script must be stable, polished, and ready to use immediately.`;

        const context = `Target platform: Windows 10/11
Determine the best script type (BAT or PowerShell) based on the description. Default to PowerShell if not specified.
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

        const task = `Based on the description above, create the complete script. Extract the tool name, purpose, script type, and features. Deliver a single ready-to-run script file.`;

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
            case 'web':
                generatedPrompt = webSubmode === 'gas'
                    ? generateWebGAS(userInput)
                    : generateWebPages(userInput);
                break;
            case 'image':
                generatedPrompt = generateImagePrompt(userInput);
                break;
            case 'cmd':
                generatedPrompt = generateCmdPrompt(userInput);
                break;
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
