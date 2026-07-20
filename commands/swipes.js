// ─── commands/swipes.js ─────────────────────────────────────────────────────
// /st swipes — 스와이프가 있는 메시지를 고르고, 개별 스와이프를 선택/삭제/정리

import { getChat } from '../state.js';
import {
    createPanel, getPanelBody, btn, iconBtn, setPanelTitleWithBack, attachAutoHideScrollbar, centerPanel,
} from '../panel-ui.js';
import { previewText } from '../utils.js';
import { scrollToMessage } from './scroll.js';

function getSwipeItems() {
    return getChat()
        .map((msg, idx) => ({ msg, idx }))
        .filter(({ msg }) => Array.isArray(msg?.swipes) && msg.swipes.length > 1);
}

function getCurrentSwipeIndex(msg) {
    const idx = Number.isInteger(msg?.swipe_id) ? msg.swipe_id : 0;
    if (!Array.isArray(msg?.swipes) || !msg.swipes.length) return 0;
    return Math.min(Math.max(idx, 0), msg.swipes.length - 1);
}

function renderMessage(msgIdx) {
    const ctx = SillyTavern.getContext();
    const msg = getChat()[msgIdx];
    const el = document.querySelector(`#chat [mesid="${msgIdx}"] .mes_text`);
    if (msg && el && ctx.messageFormatting) {
        el.innerHTML = ctx.messageFormatting(msg.mes, msg.name, msg.is_system, msg.is_user, msgIdx);
    }
    ctx.saveChatDebounced?.();
}

function setCurrentSwipe(msgIdx, swipeIdx) {
    const msg = getChat()[msgIdx];
    if (!msg || !Array.isArray(msg.swipes) || swipeIdx < 0 || swipeIdx >= msg.swipes.length) return false;
    msg.swipe_id = swipeIdx;
    msg.mes = msg.swipes[swipeIdx];
    renderMessage(msgIdx);
    return true;
}

function deleteSwipe(msgIdx, swipeIdx) {
    const msg = getChat()[msgIdx];
    if (!msg || !Array.isArray(msg.swipes) || msg.swipes.length <= 1) {
        toastr.info('마지막 스와이프는 삭제할 수 없습니다.');
        return false;
    }

    const current = getCurrentSwipeIndex(msg);
    msg.swipes.splice(swipeIdx, 1);

    let nextCurrent = current;
    if (swipeIdx < current) nextCurrent = current - 1;
    else if (swipeIdx === current) nextCurrent = Math.min(current, msg.swipes.length - 1);

    return setCurrentSwipe(msgIdx, nextCurrent);
}

function keepOnlySwipe(msgIdx, swipeIdx) {
    const msg = getChat()[msgIdx];
    if (!msg || !Array.isArray(msg.swipes) || swipeIdx < 0 || swipeIdx >= msg.swipes.length) return false;

    const selected = msg.swipes[swipeIdx];
    msg.swipes = [selected];
    msg.swipe_id = 0;
    msg.mes = selected;
    renderMessage(msgIdx);
    return true;
}

function createSwipeRow({ msgIdx, swipeIdx, text, isCurrent, isSelected, isOpen, onSelect, onToggle, onDelete }) {
    const row = document.createElement('div');
    row.className = `ct-swipe-row${isCurrent ? ' ct-current' : ''}${!isCurrent && isSelected ? ' ct-selected' : ''}`;

    const header = document.createElement('div');
    header.className = 'ct-swipe-head';

    const num = document.createElement('span');
    num.className = 'ct-item-num';
    num.textContent = `#${swipeIdx + 1}`;
    header.appendChild(num);

    if (!isOpen) {
        const preview = document.createElement('span');
        preview.className = 'ct-item-text';
        preview.textContent = previewText(text, 90);
        header.appendChild(preview);
    } else {
        const spacer = document.createElement('span');
        spacer.style.flex = '1';
        header.appendChild(spacer);
    }

    const toggleBtn = iconBtn(isOpen ? 'fa-caret-up' : 'fa-caret-down', '내용 펼치기/접기', (e) => {
        e.stopPropagation();
        onToggle();
    }, { small: true });
    header.appendChild(toggleBtn);

    const deleteBtn = iconBtn('fa-trash-can', '스와이프 삭제', (e) => {
        e.stopPropagation();
        const confirmed = confirm(`${swipeIdx + 1}번 스와이프를 삭제할까요?`);
        if (!confirmed) return;
        onDelete();
    }, { small: true, danger: true });
    header.appendChild(deleteBtn);

    row.appendChild(header);

    if (isOpen) {
        const content = document.createElement('div');
        content.className = 'ct-swipe-content';
        content.textContent = text;
        row.appendChild(content);
    }

    row.addEventListener('click', () => onSelect());
    return row;
}

function renderSwipeList(panel) {
    centerPanel(panel);
    const items = getSwipeItems();
    const body = getPanelBody(panel);
    body.innerHTML = '';
    setPanelTitleWithBack(panel, `스와이프 메시지 <span class="ct-dim">(${items.length})</span>`, '메시지 도구로 돌아가기', async () => {
        panel.remove();
        const { openUnifiedMessagesPanel } = await import('./unified-panel.js');
        openUnifiedMessagesPanel();
    });

    if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'ct-empty-note';
        empty.textContent = '스와이프가 있는 메시지가 없습니다.';
        body.appendChild(empty);
        return;
    }

    const ctx = SillyTavern.getContext();
    const list = document.createElement('div');
    list.className = 'ct-list-scroll';
    attachAutoHideScrollbar(list);
    list.style.maxHeight = 'none';
    body.appendChild(list);
    items.forEach(({ msg, idx }) => {
        const item = document.createElement('div');
        item.className = 'ct-item';
        item.addEventListener('click', () => scrollToMessage(idx));

        const num = document.createElement('span');
        num.className = 'ct-item-num';
        num.textContent = `#${idx}`;
        item.appendChild(num);

        const txt = document.createElement('span');
        txt.className = 'ct-item-text';
        const sender = msg.name || (msg.is_user ? ctx.name1 : ctx.name2);
        const senderEl = document.createElement('b');
        senderEl.textContent = sender;
        txt.appendChild(senderEl);
        txt.appendChild(document.createTextNode(previewText(msg.mes)));
        item.appendChild(txt);

        const badge = document.createElement('span');
        badge.className = 'ct-badge';
        badge.textContent = `${msg.swipes.length}개`;
        item.appendChild(badge);

        const detailBtn = iconBtn('fa-angle-right', '스와이프 보기', (e) => {
            e.stopPropagation();
            renderSwipeDetail(panel, idx);
        }, { small: true });
        item.appendChild(detailBtn);

        list.appendChild(item);
    });
}

function renderSwipeDetail(panel, msgIdx) {
    const msg = getChat()[msgIdx];
    if (!msg || !Array.isArray(msg.swipes) || msg.swipes.length < 2) {
        renderSwipeList(panel);
        return;
    }

    const body = getPanelBody(panel);
    body.innerHTML = '';
    setPanelTitleWithBack(panel, `#${msgIdx} <span class="ct-dim">${msg.swipes.length}개</span>`, '목록으로 돌아가기', () => renderSwipeList(panel));

    renderSwipeDetailWithSelection(panel, msgIdx, getCurrentSwipeIndex(msg), null);
}

function renderSwipeDetailWithSelection(panel, msgIdx, selectedSwipeIdx, openSwipeIdx = null) {
    centerPanel(panel);
    const msg = getChat()[msgIdx];
    if (!msg || !Array.isArray(msg.swipes) || msg.swipes.length < 2) {
        renderSwipeList(panel);
        return;
    }

    const body = getPanelBody(panel);
    body.innerHTML = '';
    setPanelTitleWithBack(panel, `#${msgIdx} <span class="ct-dim">${msg.swipes.length}개</span>`, '목록으로 돌아가기', () => renderSwipeList(panel));

    const current = getCurrentSwipeIndex(msg);
    let selected = Math.min(Math.max(selectedSwipeIdx, 0), msg.swipes.length - 1);

    const list = document.createElement('div');
    list.className = 'ct-list-scroll';
    attachAutoHideScrollbar(list);
    list.style.maxHeight = 'none';
    body.appendChild(list);

    msg.swipes.forEach((swipe, swipeIdx) => {
        list.appendChild(createSwipeRow({
            msgIdx,
            swipeIdx,
            text: swipe,
            isCurrent: swipeIdx === current,
            isSelected: swipeIdx === selected,
            isOpen: swipeIdx === openSwipeIdx,
            onSelect: () => renderSwipeDetailWithSelection(panel, msgIdx, swipeIdx, openSwipeIdx),
            onToggle: () => renderSwipeDetailWithSelection(panel, msgIdx, selected, openSwipeIdx === swipeIdx ? null : swipeIdx),
            onDelete: () => {
                if (deleteSwipe(msgIdx, swipeIdx)) {
                    toastr.success('삭제했습니다.', '', { timeOut: 1500 });
                    renderSwipeDetailWithSelection(panel, msgIdx, Math.min(selected, getChat()[msgIdx]?.swipes?.length - 1 ?? 0), null);
                }
            },
        }));
    });

    const actionRow = document.createElement('div');
    actionRow.className = 'ct-panel-footer';

    const undoBtn = iconBtn('fa-arrow-rotate-left', '현재 스와이프로 선택 되돌리기', () => {
        renderSwipeDetailWithSelection(panel, msgIdx, current, openSwipeIdx);
    }, { bordered: true });
    actionRow.appendChild(undoBtn);

    const rightGroup = document.createElement('div');
    rightGroup.className = 'ct-row-gap';
    const selectBtn = btn('이 버전 선택', () => {
        if (setCurrentSwipe(msgIdx, selected)) {
            toastr.success('선택했습니다.', '', { timeOut: 1500 });
            renderSwipeDetailWithSelection(panel, msgIdx, selected, openSwipeIdx);
        }
    });
    selectBtn.classList.add('ct-btn-primary');
    if (selected === current) selectBtn.disabled = true;
    rightGroup.appendChild(selectBtn);

    const keepCurrentBtn = btn('현재 스와이프만 남기기', () => {
        const confirmed = confirm('현재 채택된 스와이프를 제외한 다른 스와이프를 모두 삭제할까요?');
        if (!confirmed) return;
        if (keepOnlySwipe(msgIdx, current)) {
            toastr.success('정리했습니다.', '', { timeOut: 1500 });
            renderSwipeList(panel);
        }
    });
    keepCurrentBtn.classList.add('ct-btn-danger');
    rightGroup.appendChild(keepCurrentBtn);
    actionRow.appendChild(rightGroup);
    body.appendChild(actionRow);
}

export function openSwipesPanel() {
    const panel = createPanel('ct-swipes-panel', '스와이프 메시지');
    panel.classList.add('ct-panel-wide');
    renderSwipeList(panel);
}
