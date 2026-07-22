// ─── panel-ui.js ────────────────────────────────────────────────────────────
// 여러 기능이 공유하는 UI 부품 빌더. HTML 파일 없이 코드로 직접 DOM을 조립함.
// 테스트 버전이라 패널 드래그 이동 등은 생략하고 화면 중앙에 고정 — 필요해지면 나중에 추가.

export function injectThemeCSS() {
    if (document.getElementById('ct-theme-vars')) return;
    const s = document.createElement('style');
    s.id = 'ct-theme-vars';
    s.textContent = `
        :root {
            --ct-panel-bg: color-mix(in srgb, var(--SmartThemeBlurTintColor, #ffffff) 88%, transparent);
            --ct-panel-bg-solid: var(--SmartThemeChatTintColor, #ffffff);
            --ct-panel-bg-muted: color-mix(in srgb, var(--SmartThemeChatTintColor, #ffffff) 92%, var(--SmartThemeBodyColor, #242426) 8%);
            --ct-panel-bg-muted-strong: color-mix(in srgb, var(--SmartThemeChatTintColor, #ffffff) 86%, var(--SmartThemeBodyColor, #242426) 14%);
            --ct-border: var(--SmartThemeBorderColor, #d7d7db);
            --ct-border-soft: color-mix(in srgb, var(--ct-border) 42%, transparent);
            --ct-text: var(--SmartThemeBodyColor, #242426);
            --ct-text-dim: var(--SmartThemeEmColor, #8c8c92);

            --ct-primary: var(--SmartThemeQuoteColor, #b1e0b3);
            --ct-primary-hover: var(--SmartThemeUnderlineColor, var(--SmartThemeQuoteColor, #89c98d));
            --ct-primary-tint: color-mix(in srgb, var(--ct-primary) 16%, var(--ct-panel-bg-solid) 84%);
            --ct-primary-tint-strong: color-mix(in srgb, var(--ct-primary) 25%, var(--ct-panel-bg-solid) 75%);
            --ct-primary-border: color-mix(in srgb, var(--ct-primary) 46%, var(--ct-border) 54%);
            --ct-control-bg: color-mix(in srgb, var(--ct-panel-bg-solid) 82%, transparent);
            --ct-control-hover: color-mix(in srgb, var(--ct-primary) 12%, var(--ct-panel-bg-solid) 88%);
            --ct-control-active: color-mix(in srgb, var(--ct-primary) 22%, var(--ct-panel-bg-solid) 78%);
            --ct-separator: color-mix(in srgb, var(--ct-border) 28%, transparent);

            --ct-danger: #d9364f;
            --ct-danger-hover: #bd2f45;
            --ct-danger-tint: #fff0f3;

            --ct-radius-panel: 16px;
            --ct-radius-ctl: 11px;
            --ct-radius-item: 12px;
            --ct-shadow-panel: 0 18px 46px rgba(20,20,24,.14), 0 1px 1px rgba(20,20,24,.08);

            --ct-list-item-pad-y: 9px;
            --ct-list-item-pad-x: 10px;
            --ct-list-num-w: 24px;
            --ct-list-gap: 8px;
        }
        .ct-panel {
            position: fixed;
            width: min(364px, 92vw); max-height: 82vh;
            display: flex; flex-direction: column;
            background: var(--ct-panel-bg); color: var(--ct-text);
            border: 1px solid var(--ct-border); border-radius: var(--ct-radius-panel);
            box-shadow: var(--ct-shadow-panel);
            z-index: 9999999; font-size: 13px; font-family: inherit;
            opacity: 0; overflow: hidden;
            box-sizing: border-box;
            backdrop-filter: saturate(170%) blur(22px);
            -webkit-backdrop-filter: saturate(170%) blur(22px);
        }
        .ct-panel * { box-sizing: border-box; }
        .ct-panel.ct-panel-wide { width: min(388px, 92vw); }
        .ct-panel-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 10px 12px 14px; border-bottom: 1px solid var(--ct-separator); font-weight: 600;
            background: color-mix(in srgb, var(--ct-panel-bg-solid) 54%, transparent);
            cursor: grab; touch-action: none;
            min-width: 0;
        }
        .ct-panel-title {
            display: flex; align-items: center; gap: 6px;
            min-width: 0; font-size: 13.5px; font-weight: 650;
        }
        .ct-panel-title-text {
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ct-panel-header-right { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
        .ct-panel-body { padding: 14px; overflow-y: auto; flex: 1; }
        .ct-panel-body > * + * { margin-top: 12px; }
        .ct-close-btn {
            width: 30px; height: 30px; border: none; background: transparent; border-radius: 999px;
            color: var(--ct-text-dim); display: inline-flex; align-items: center; justify-content: center;
            font-size: 13px; cursor: pointer; transition: background .12s, color .12s;
            padding: 0; margin: 0;
        }
        .ct-close-btn:hover { background: var(--ct-control-hover); color: var(--ct-text); }
        .ct-btn {
            min-height: 36px; padding: 0 14px; border-radius: var(--ct-radius-ctl);
            border: 1px solid var(--ct-border-soft); background: var(--ct-control-bg);
            color: var(--ct-text); cursor: pointer; font-size: 12.5px; font-weight: 650;
            display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            white-space: nowrap; transition: background .14s, border-color .14s, color .14s, transform .12s;
            margin: 0; font-family: inherit;
        }
        .ct-btn:hover { background: var(--ct-control-hover); border-color: var(--ct-primary-border); }
        .ct-btn:active { transform: scale(.98); }
        .ct-btn:disabled { opacity: .5; cursor: default; }
        .ct-btn-primary {
            background: var(--ct-primary-tint);
            border-color: var(--ct-primary-border);
            color: var(--ct-text);
        }
        .ct-btn-primary:hover {
            background: var(--ct-primary-tint-strong);
            border-color: var(--ct-primary-border);
            color: var(--ct-text);
        }
        .ct-btn-white { background: var(--ct-control-bg); color: var(--ct-text); border-color: var(--ct-border); }
        .ct-btn-white:hover { background: var(--ct-control-hover); }
        .ct-btn-soft {
            background: var(--ct-panel-bg-muted);
            border-color: var(--ct-border-soft);
            color: var(--ct-primary);
        }
        .ct-btn-soft:hover {
            background: var(--ct-primary-tint-strong);
            border-color: var(--ct-border);
            color: var(--ct-primary-hover);
        }
        .ct-btn-link {
            min-height: auto; padding: 2px 4px; border: none; background: transparent;
            color: var(--ct-primary); font-size: 12px;
        }
        .ct-btn-link:hover { background: transparent; color: var(--ct-primary-hover); text-decoration: underline; }
        .ct-btn-danger {
            background: color-mix(in srgb, var(--ct-panel-bg-solid) 92%, #ffffff 8%);
            color: var(--ct-danger);
            border-color: var(--ct-danger);
        }
        .ct-btn-danger:hover {
            background: var(--ct-danger-tint);
            color: var(--ct-danger-hover);
            border-color: var(--ct-danger-hover);
        }
        .ct-input {
            width: 100%; min-height: 38px; padding: 9px 12px; border-radius: var(--ct-radius-ctl);
            border: 1px solid var(--ct-border-soft); font-size: 13px; font-family: inherit;
            background: var(--ct-panel-bg-muted); color: var(--ct-text);
            margin: 0;
        }
        .ct-input:focus { outline: none; border-color: var(--ct-primary-border); background: var(--ct-panel-bg-solid); }
        .ct-input::placeholder { color: color-mix(in srgb, var(--ct-text-dim) 72%, transparent); }
        .ct-result-item {
            padding: var(--ct-list-item-pad-y) var(--ct-list-item-pad-x);
            border-radius: var(--ct-radius-item); cursor: pointer; margin: 0;
            border: 1px solid transparent; font-size: 12.3px; line-height: 1.4;
            background: var(--ct-control-bg);
        }
        .ct-result-item:hover { background: var(--ct-control-hover); border-color: transparent; }
        .ct-check-row {
            display: flex; align-items: center; gap: 8px; cursor: pointer;
            font-size: 12.5px; color: var(--ct-text); margin: 0;
        }
        .ct-check-row input { display: none; }
        .ct-list-check {
            display: none !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            position: absolute;
            opacity: 0;
            pointer-events: none;
        }
        .ct-check-box {
            width: 17px; height: 17px; border-radius: 6px; border: 1.5px solid var(--ct-primary-border);
            flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
            color: #ffffff; font-size: 10px;
        }
        .ct-check-row input:checked + .ct-check-box,
        .ct-list-check:checked + .ct-check-box {
            background: var(--ct-primary); border-color: var(--ct-primary);
            color: var(--ct-panel-bg-solid);
        }
        .ct-dim { color: var(--ct-text-dim); font-weight: 400; }
        .ct-pos { color: var(--ct-text-dim); font-weight: 400; margin-right: 4px; font-size: 11.5px; white-space: nowrap; }
        .ct-action-row {
            display: flex; justify-content: space-between; align-items: center; gap: 10px;
        }
        .ct-row-between { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .ct-row-gap { display: flex; align-items: center; gap: 8px; }
        .ct-opt-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px;
        }
        .ct-range-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .ct-range-input {
            width: 74px; padding: 8px 10px; border: 1px solid var(--ct-border);
            border-radius: var(--ct-radius-ctl); font-size: 12.5px; background: var(--ct-panel-bg-muted);
            color: var(--ct-text); font-family: inherit; margin: 0;
        }
        .ct-seg {
            display: inline-flex; border: 1px solid var(--ct-border-soft);
            border-radius: var(--ct-radius-ctl); overflow: hidden;
            background: var(--ct-panel-bg-muted);
        }
        .ct-seg .ct-btn { border: none; border-radius: 0; background: transparent; min-height: 34px; }
        .ct-seg .ct-btn:hover { background: var(--ct-control-hover); }
        .ct-seg .ct-btn:first-child { border-right: 1px solid var(--ct-separator); }
        .ct-icon-btn {
            width: 30px; height: 30px; border: none; background: transparent; border-radius: 999px;
            color: var(--ct-text-dim); display: inline-flex; align-items: center; justify-content: center;
            font-size: 13px; cursor: pointer; transition: background .12s, color .12s;
            padding: 0; margin: 0; font-family: inherit;
        }
        .ct-icon-btn:hover { background: var(--ct-control-hover); color: var(--ct-text); }
        .ct-icon-btn.ct-danger:hover { background: var(--ct-danger-tint); color: var(--ct-danger); }
        .ct-icon-btn.ct-bordered { width: 36px; height: 36px; border: 1px solid var(--ct-border-soft); background: var(--ct-control-bg); }
        .ct-icon-btn-sm {
            width: 24px; height: 24px; flex-shrink: 0; border: none; background: transparent;
            border-radius: 999px; color: var(--ct-text-dim); display: inline-flex;
            align-items: center; justify-content: center; font-size: 10.5px; cursor: pointer;
            transition: background .12s, color .12s; padding: 0; margin: 0; font-family: inherit;
        }
        .ct-icon-btn-sm:hover { background: var(--ct-control-hover); color: var(--ct-text); }
        .ct-icon-btn-sm.ct-danger:hover { background: var(--ct-danger-tint); color: var(--ct-danger); }
        .ct-icon-btn-sm.ct-on { background: var(--ct-primary-tint); color: var(--ct-primary); }
        .ct-icon-btn-sm.ct-on:hover { background: var(--ct-primary-tint-strong); color: var(--ct-primary-hover); }
        .ct-badge {
            flex-shrink: 0; font-size: 10px; font-weight: 600; color: var(--ct-text-dim);
            background: var(--ct-panel-bg-muted); border: 1px solid var(--ct-border-soft);
            border-radius: 999px; padding: 2px 7px;
        }
        .ct-list-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0 2px; }
        .ct-list-toolbar .ct-count { font-size: 12px; color: var(--ct-text-dim); }
        .ct-list-toolbar + .ct-list-scroll { margin-top: 6px; }
        .ct-list-scroll {
            max-height: 250px; overflow-y: auto; display: flex; flex-direction: column;
            gap: 5px; margin: 0; padding: 0;
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
        }

        .ct-panel-body {
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
        }

        .ct-list-scroll.ct-scrolling,
        .ct-panel-body.ct-scrolling {
            scrollbar-color: rgba(120, 120, 120, .45) transparent;
        }

        .ct-list-scroll::-webkit-scrollbar,
        .ct-panel-body::-webkit-scrollbar {
            width: 8px;
        }

        .ct-list-scroll::-webkit-scrollbar-thumb,
        .ct-panel-body::-webkit-scrollbar-thumb {
            background: transparent;
            border-radius: 999px;
        }

        .ct-list-scroll.ct-scrolling::-webkit-scrollbar-thumb,
        .ct-panel-body.ct-scrolling::-webkit-scrollbar-thumb {
            background: rgba(120, 120, 120, .45);
        }

        .ct-item {
            display: flex; align-items: center; gap: var(--ct-list-gap);
            padding: var(--ct-list-item-pad-y) var(--ct-list-item-pad-x);
            border-radius: var(--ct-radius-item); border: 1px solid transparent; font-size: 12.3px;
            cursor: pointer; transition: background .14s, border-color .14s, transform .12s;
            min-height: 38px;
        }
        .ct-item:hover { background: var(--ct-control-hover); }
        .ct-item:active { transform: scale(.992); }
        .ct-item.ct-system { opacity: .55; }
        .ct-item.ct-current { background: var(--ct-control-active); border-color: var(--ct-primary-border); }
        .ct-item-num {
            flex-shrink: 0; width: var(--ct-list-num-w); font-size: 11px;
            color: var(--ct-text-dim); font-variant-numeric: tabular-nums;
        }
        .ct-item-text {
            flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ct-item-text b { font-weight: 600; color: var(--ct-text); margin-right: 4px; }
        .ct-panel-footer {
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
            margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--ct-separator);
        }
        .ct-swipe-row {
            border: 1px solid var(--ct-border-soft); border-radius: var(--ct-radius-item);
            padding: var(--ct-list-item-pad-y) var(--ct-list-item-pad-x); font-size: 12.3px;
            cursor: pointer; background: var(--ct-control-bg);
            transition: background .14s, border-color .14s, transform .12s;
        }
        .ct-swipe-row:hover { background: var(--ct-control-hover); }
        .ct-swipe-row:active { transform: scale(.992); }
        .ct-swipe-row.ct-current { border-color: var(--ct-primary-border); background: var(--ct-control-active); }
        .ct-swipe-row.ct-selected:not(.ct-current) { border-color: var(--ct-primary-border); }
        .ct-swipe-head { display: flex; align-items: center; gap: var(--ct-list-gap); }
        .ct-swipe-content {
            white-space: pre-wrap; margin-top: 7px;
            padding: 8px 2px 1px;
            border-top: 1px solid var(--ct-separator);
            font-size: 12px; line-height: 1.55; color: var(--ct-text);
        }
        .ct-menu-list { display: flex; flex-direction: column; gap: 4px; }
        .ct-menu-item {
            display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
            padding: 10px; border-radius: var(--ct-radius-item); border: 1px solid transparent;
            background: transparent; cursor: pointer; font-family: inherit; color: inherit;
            transition: background .14s, border-color .14s, transform .12s;
        }
        .ct-menu-item:hover { background: var(--ct-control-hover); border-color: var(--ct-border-soft); }
        .ct-menu-item:active { transform: scale(.992); }
        .ct-menu-icon {
            width: 34px; height: 34px; border-radius: 10px; background: var(--ct-primary-tint);
            color: var(--ct-primary-hover); display: inline-flex; align-items: center; justify-content: center;
            font-size: 13px; flex-shrink: 0;
        }
        .ct-menu-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
        .ct-menu-title { font-size: 13.5px; font-weight: 600; }
        .ct-menu-desc {
            font-size: 11.5px; color: var(--ct-text-dim);
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ct-menu-chev { color: var(--ct-text-dim); font-size: 11px; flex-shrink: 0; }
        .ct-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 4px 0; }
        .ct-toggle-label b { display: block; font-size: 13px; font-weight: 600; }
        .ct-toggle-label span { font-size: 11.5px; color: var(--ct-text-dim); }
        .ct-toggle {
            width: 44px; height: 26px; border-radius: 999px;
            background: color-mix(in srgb, var(--ct-text-dim) 28%, var(--ct-panel-bg-muted) 72%);
            position: relative;
            flex-shrink: 0; cursor: pointer; transition: background .15s; border: none; padding: 0;
        }
        .ct-toggle.ct-on { background: var(--ct-primary); }
        .ct-toggle-dot {
            position: absolute; top: 2px; left: 2px; width: 22px; height: 22px; border-radius: 50%;
            background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: left .15s;
        }
        .ct-toggle.ct-on .ct-toggle-dot { left: 20px; }
        .ct-empty-note { font-size: 12.5px; color: var(--ct-text-dim); text-align: center; padding: 18px 0; }

        @media (max-width: 430px) {
            .ct-panel, .ct-panel.ct-panel-wide { width: min(368px, 94vw); max-height: 84vh; }
            .ct-panel-footer { align-items: stretch; flex-direction: column; }
            .ct-panel-footer > .ct-row-gap { width: 100%; }
            .ct-panel-footer .ct-btn { flex: 1; }
        }

        /* /find 하이라이트 표시 */
        #chat .mes_text mark[data-ct] {
            background: color-mix(in srgb, var(--ct-primary) 62%, transparent) !important;
            color: inherit !important; padding: 1px 2px; border-radius: 4px;
        }
        #chat .mes_text mark[data-ct].ct-cur {
            background: var(--ct-primary-hover) !important; color: var(--ct-panel-bg-solid) !important; font-weight: bold;
        }

        /* 드래그 선택 후 뜨는 빠른수정/검색 아이콘 묶음 */
        .ct-pill-group {
            position: fixed; z-index: 999999; transform: translate(-50%, 0%);
            display: flex; align-items: center; gap: 2px;
            background: var(--ct-panel-bg); border: 1px solid var(--ct-border-soft); border-radius: 999px;
            padding: 5px; box-shadow: var(--ct-shadow-panel);
            white-space: nowrap; user-select: none;
            backdrop-filter: saturate(170%) blur(18px);
            -webkit-backdrop-filter: saturate(170%) blur(18px);
        }
        .ct-pill-item {
            width: 36px; height: 36px; border: none; background: transparent; border-radius: 999px;
            color: var(--ct-text-dim); display: inline-flex; align-items: center; justify-content: center;
            font-size: 14px; cursor: pointer; padding: 0; transition: background .12s, color .12s;
        }
        .ct-pill-item:hover { background: var(--ct-control-hover); color: var(--ct-text); }
        .ct-btn:focus-visible,
        .ct-close-btn:focus-visible,
        .ct-icon-btn:focus-visible,
        .ct-icon-btn-sm:focus-visible,
        .ct-menu-item:focus-visible,
        .ct-pill-item:focus-visible,
        .ct-toggle:focus-visible {
            outline: 2px solid var(--ct-primary-border);
            outline-offset: 2px;
        }
    `;
document.head.appendChild(s);
    watchDrawers();
}

// 확장/연결/로어북/유저설정 등 상단 서랍(drawer)이 열리면 우리 패널이 그 위에
// 겹쳐 보이지 않도록 잠깐 숨겨주고, 서랍을 닫으면 다시 보여줌.
function watchDrawers() {
    const sync = () => {
        const drawerOpen = !!document.querySelector('.drawer-content.openDrawer');
        document.querySelectorAll('.ct-panel').forEach((p) => {
            p.style.visibility = drawerOpen ? 'hidden' : '';
        });
    };
    new MutationObserver(sync).observe(document.body, {
        attributes: true, attributeFilter: ['class'], subtree: true,
    });
}

// 패널 헤더를 손가락/마우스로 누른 채 움직이면 패널이 따라 움직이게 함
export function makeDraggable(panel, handle) {
    let drag = null;
    handle.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return; // 닫기 버튼 등 안쪽 버튼은 드래그 시작 안 함
        const r = panel.getBoundingClientRect();
        drag = { sx: e.clientX, sy: e.clientY, ol: r.left, ot: r.top };
        handle.style.cursor = 'grabbing';
        handle.setPointerCapture(e.pointerId);
        e.preventDefault();
    });
    handle.addEventListener('pointermove', (e) => {
        if (!drag) return;
        panel.style.left = `${drag.ol + e.clientX - drag.sx}px`;
        panel.style.top = `${drag.ot + e.clientY - drag.sy}px`;
    });
    handle.addEventListener('pointerup', () => { drag = null; handle.style.cursor = 'grab'; });
    handle.addEventListener('pointercancel', () => { drag = null; handle.style.cursor = 'grab'; });
}

export function createPanel(id, title, onClose) {
    document.getElementById(id)?.remove();
    const panel = document.createElement('div');
    panel.id = id;
    panel.className = 'ct-panel';
    panel.innerHTML = `
        <div class="ct-panel-header">
            <span class="ct-panel-title"><span class="ct-panel-title-text">${title}</span></span>
            <div class="ct-panel-header-right">
                <span id="ct-pos" class="ct-pos"></span>
                <button class="ct-close-btn" type="button" title="닫기"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
        <div class="ct-panel-body"></div>
    `;
    panel.querySelector('.ct-close-btn').addEventListener('click', () => {
        onClose?.();
        panel.remove();
    });
    document.body.appendChild(panel);
    attachAutoHideScrollbar(panel.querySelector('.ct-panel-body'));

    requestAnimationFrame(() => {
        const pw = panel.offsetWidth, ph = panel.offsetHeight;
        panel.style.left = `${Math.round((window.innerWidth - pw) / 2)}px`;
        panel.style.top = `${Math.round((window.innerHeight - ph) / 2)}px`;
        panel.style.opacity = '1';
    });
    makeDraggable(panel, panel.querySelector('.ct-panel-header'));

    return panel;
}

export function centerPanel(panel) {
    if (!panel) return;

    requestAnimationFrame(() => {
        const pw = panel.offsetWidth;
        const ph = panel.offsetHeight;
        panel.style.left = `${Math.round((window.innerWidth - pw) / 2)}px`;
        panel.style.top = `${Math.round((window.innerHeight - ph) / 2)}px`;
    });
}

export function attachAutoHideScrollbar(scrollEl) {
    if (!scrollEl || scrollEl.dataset.ctScrollbarAttached === '1') return;
    scrollEl.dataset.ctScrollbarAttached = '1';

    let timer = null;
    scrollEl.addEventListener('scroll', () => {
        scrollEl.classList.add('ct-scrolling');
        clearTimeout(timer);
        timer = setTimeout(() => {
            scrollEl.classList.remove('ct-scrolling');
        }, 800);
    }, { passive: true });
}

export const getPanelBody = (panel) => panel.querySelector('.ct-panel-body');
export const closePanel = (id) => document.getElementById(id)?.remove();

export function setPanelTitle(panel, titleHtml) {
    const titleEl = panel.querySelector('.ct-panel-title');
    if (!titleEl) return;
    titleEl.innerHTML = `<span class="ct-panel-title-text">${titleHtml}</span>`;
}

export function setPanelTitleWithBack(panel, titleHtml, backTitle, onBack) {
    const titleEl = panel.querySelector('.ct-panel-title');
    if (!titleEl) return;
    titleEl.textContent = '';
    titleEl.appendChild(iconBtn('fa-arrow-left', backTitle, onBack));

    const titleText = document.createElement('span');
    titleText.className = 'ct-panel-title-text';
    titleText.innerHTML = titleHtml;
    titleEl.appendChild(titleText);
}

export function iconBtn(iconClass, title, onClick, options = {}) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = options.small ? 'ct-icon-btn-sm' : 'ct-icon-btn';
    if (options.danger) b.classList.add('ct-danger');
    if (options.on) b.classList.add('ct-on');
    if (options.bordered) b.classList.add('ct-bordered');
    b.title = title;
    b.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    b.addEventListener('click', onClick);
    return b;
}

export function btn(label, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.className = 'ct-btn';
    b.addEventListener('click', onClick);
    return b;
}

export function inputBox(placeholder) {
    const i = document.createElement('input');
    i.type = 'text';
    i.placeholder = placeholder;
    i.className = 'ct-input';
    i.autocomplete = 'off';
    i.autocorrect = 'off';
    i.autocapitalize = 'off';
    i.spellcheck = false;
    return i;
}

// 라벨 + 체크박스 한 줄. getVal/setVal로 즉시 반영하고, 바깥에서 저장 함수를 넘겨받아 호출.
export function checkRow(label, getVal, onChange) {
    const row = document.createElement('label');
    row.className = 'ct-check-row';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = getVal();
    chk.addEventListener('change', () => onChange(chk.checked));
    row.appendChild(chk);
    const box = document.createElement('span');
    box.className = 'ct-check-box';
    box.innerHTML = '<i class="fa-solid fa-check"></i>';
    row.appendChild(box);
    row.appendChild(document.createTextNode(label));
    return row;
}

export function toggleRow(title, description, getVal, onChange) {
    const row = document.createElement('div');
    row.className = 'ct-toggle-row';

    const label = document.createElement('div');
    label.className = 'ct-toggle-label';
    label.innerHTML = `<b>${title}</b><span>${description}</span>`;
    row.appendChild(label);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = `ct-toggle${getVal() ? ' ct-on' : ''}`;
    toggle.innerHTML = '<span class="ct-toggle-dot"></span>';
    toggle.addEventListener('click', () => {
        const next = !toggle.classList.contains('ct-on');
        toggle.classList.toggle('ct-on', next);
        onChange(next);
    });
    row.appendChild(toggle);
    return row;
}
