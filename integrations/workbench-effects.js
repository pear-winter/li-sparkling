/** Thin client for the installed plugin's stable UI API. No effects or settings are copied. */
export function createWorkbenchEffects({ window: W, node, button }) {
  const repo = 'https://github.com/pear-winter/li-sparkling';
  let panel = null, slot = null, status = null, connected = null, mounted = null;
  let timer = 0, queued = 0, lastMessage = '';
  const plugin = () => {
    const api = W.__liSparkling;
    return api?.owner === 'li-sparkling' && api.apiVersion === 1 &&
      typeof api.mount === 'function' && typeof api.unmount === 'function' &&
      api.isAvailable?.() !== false ? api : null;
  };
  function release() {
    // Unmount only this workbench's view; never stop effects or touch another window.
    try { connected?.unmount(slot); } catch {}
    connected = mounted = null;
  }
  function message(text) {
    if (lastMessage === text && slot.childNodes.length) return;
    lastMessage = text;
    const box = node('div', 'cw-empty');
    box.append(node('p', '', text));
    const link = node('a', '', '打开 li-sparkling 仓库');
    link.href = repo; link.target = '_blank'; link.rel = 'noopener noreferrer';
    box.append(link, node('p', 'cw-note', '在酒馆扩展中安装或更新，并启用插件；刷新后这里自动连接。'), button('重新连接', sync));
    slot.replaceChildren(box);
  }
  function sync() {
    if (!panel?.isConnected) return;
    const api = plugin();
    if (!api) {
      release();
      status.textContent = '点击与拖尾特效';
      const older = W.__liliPixelV2?.owner === 'li-sparkling';
      message(older ? '请将 li-sparkling 更新到 v2.2.0 或更新版本。' : '缺少已启用的 li-sparkling 插件，暂时不能使用特效管理器。');
      return;
    }
    if (connected === api && mounted?.isConnected && slot.contains(mounted)) return;
    release(); slot.replaceChildren(); lastMessage = '';
    status.textContent = '点击与拖尾特效 · 插件 v' + (api.version || '?');
    try {
      connected = api; mounted = api.mount(slot);
      if (!mounted || !slot.contains(mounted)) throw Error('插件没有返回管理器页面');
    } catch (error) {
      release(); message('暂时没有连接成功：' + (error?.message || String(error)));
    }
  }
  function schedule() {
    if (!queued && panel) queued = W.setTimeout(() => { queued = 0; sync(); }, 40);
  }
  function open(container) {
    close();
    panel = node('section'); panel.id = 'pear-effects-plugin-panel';
    panel.setAttribute('aria-label', '插件特效管理器');
    panel.style.cssText = 'width:100%;min-width:0;min-height:0;overflow:auto;flex:1 1 auto;';
    status = node('div', 'cw-note'); status.setAttribute('role', 'status');
    slot = node('div'); slot.className = 'pear-effects-plugin-slot';
    panel.append(status, slot); container.append(panel);
    W.addEventListener('li-sparkling:change', schedule);
    timer = W.setInterval(sync, 1500); sync();
  }
  function close() {
    W.clearInterval(timer); W.clearTimeout(queued); timer = queued = 0;
    W.removeEventListener('li-sparkling:change', schedule);
    release(); panel?.remove(); panel = slot = status = null; lastMessage = '';
  }
  return { keep: false, open, close, dispose: close, canLeave: async () => true, element: () => panel };
}
