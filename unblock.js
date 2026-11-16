(() => {
  if (document.getElementById('little-unblocker')) return;
  const host = document.createElement('div');
  host.id = 'little-unblocker';
  const ui = host.attachShadow({mode: 'closed'});
  ui.innerHTML = `<style>
    :host{position:fixed;bottom:24px;right:24px;z-index:2147483647;font:14px system-ui;color:#f1f5f9}
    section{width:280px;background:#17212e;border:1px solid #536578;border-radius:16px;padding:18px;box-shadow:0 6px 30px #0008}
    h2{font-size:18px;margin:0 0 10px}p{line-height:1.5}button{padding:10px 14px;border:0;border-radius:20px;font-weight:bold;cursor:pointer;margin-right:8px}
    #start{background:#8ed4ff}#stop{background:#ddd}button:disabled{opacity:.45;cursor:default}
  </style><section><h2>Little Unblocker</h2><p>Unblocks every account in this signed-in account's block list. Keep this tab open.</p><p id="status" role="status" aria-live="polite">Ready.</p><button id="start">Unblock everyone</button><button id="stop" disabled>Stop</button></section>`;
  document.documentElement.append(host);
  const status = ui.querySelector('#status'), start = ui.querySelector('#start'), stop = ui.querySelector('#stop');
  let running = false, count = 0;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  const blockedButtons = () => Array.from(document.querySelectorAll('main button[aria-label="Blocked"]')).filter(visible);
  const onList = () => /^\/settings\/blocked(?:\/all)?\/?$/.test(location.pathname);
  stop.onclick = () => { running = false; status.textContent = `Stopping… ${count} confirmed unblocks.`; };
  start.onclick = async () => {
    if(running) return;
    if(!onList()) { status.textContent = 'Open x.com/settings/blocked/all first.'; return; }
    running = true; start.disabled = true; stop.disabled = false;
    let idle = 0;
    let serverError = false;
    const errors = new MutationObserver(() => {
      if(Array.from(document.querySelectorAll('[role="alert"], [data-testid="toast"]')).some(el => /something went wrong|rate limit|try again later|unable to|could not|cannot unblock/i.test(el.innerText))) serverError = true;
    });
    errors.observe(document.body,{subtree:true,childList:true,characterData:true});
    try {
      while(running) {
        if(serverError) throw new Error('X reported an error. Stopped; reload to verify before retrying.');
        if(!onList()) throw new Error('Page changed. Stopped.');
        if(document.querySelector('[role="dialog"]')) throw new Error('A dialog needs attention. Stopped.');
        const button = blockedButtons()[0];
        if(!button) {
          const main = document.querySelector('main');
          const empty = main && /you aren.t blocking anyone|you haven.t blocked anyone/i.test(main.innerText);
          if(empty) { status.textContent = `Done — X reports an empty block list. ${count} unblocked this session.`; break; }
          window.scrollTo(0,document.documentElement.scrollHeight);
          status.textContent = `${count} confirmed unblocks. Looking for more accounts…`;
          await sleep(2200);
          if(++idle >= 8) { status.textContent = `Stopped after ${count} confirmed unblocks. No more buttons found. Reload to verify the list is empty.`; break; }
          continue;
        }
        idle = 0;
        const row = button.parentElement;
        const profile = row.querySelector('a[href]')?.getAttribute('href');
        if(!profile) throw new Error('Could not identify the account row. Stopped.');
        button.click();
        let confirmed = false;
        for(let i=0;i<30;i++) {
          await sleep(300);
          if(serverError) throw new Error('X reported an error. Stopped; reload to verify before retrying.');
          if(!onList()) throw new Error('Page changed. Stopped.');
          const confirm = document.querySelector('[data-testid="confirmationSheetConfirm"]');
          if(confirm && visible(confirm)) {
            const dialog = confirm.closest('[role="dialog"]');
            if(dialog && /unblock/i.test(dialog.innerText) && /unblock/i.test(confirm.innerText) && running) confirm.click();
            else throw new Error('Unexpected confirmation. Stopped.');
          }
          if(!button.isConnected || button.getAttribute('aria-label') !== 'Blocked') { confirmed = true; break; }
          if(!running) break;
        }
        if(!confirmed) throw new Error('Unblock was not confirmed. Check for an X error or rate limit before resuming.');
        count++;
        status.textContent = `${count} confirmed unblocks. Working…`;
        await sleep(5500 + Math.random()*1000);
      }
      if(!running) status.textContent = `Stopped. ${count} confirmed unblocks.`;
    } catch(error) { status.textContent = `${error.message} (${count} confirmed unblocks.)`; }
    finally { errors.disconnect(); running=false; start.disabled=false; stop.disabled=true; }
  };
})();
