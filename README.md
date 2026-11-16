# Little Unblocker for X

A small, local Firefox extension that unblocks accounts from your X/Twitter block list using the page's existing **Blocked** buttons.

It processes one account at a time, waits roughly six seconds between accounts, scrolls to load more, and provides a **Stop** button. It stops if X displays a recognized error or a button does not visibly change within nine seconds.

## Install and use

1. Download and extract the ZIP from [Releases](https://github.com/sufeeeringGavinM/little-unblocker/releases/latest), or clone this repository.
2. In Firefox, open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…** and select `manifest.json` from the extracted folder.
4. Open a fresh tab at <https://x.com/settings/blocked/all> and check that you are signed into the account whose block list you want to clear.
5. Click **Unblock everyone** in the panel. Keep the tab open while it runs. Click **Stop** to pause.
6. After it stops, reload the block list to verify the result. If accounts remain, start another pass.

Unblocking changes your account immediately. This extension does not automatically restore your previous block list.

The temporary add-on is removed when Firefox restarts. To remove it sooner, click **Remove** in `about:debugging`. No browser security preferences need to change.

## Verification and limitations

Tested live in Firefox Developer Edition against X's English blocked-accounts page, including multiple scrolling batches and unblocks that persisted after opening a fresh list. Firefox's temporary add-on loader accepted the manifest. The entire-list completion path has not yet been verified.

The counter records visible button transitions, which may be optimistic updates from X. It does not independently verify each server response. A **No more buttons found** message alone does not prove that all accounts were unblocked: reload and verify X's empty-list message. Stop and retry later if X reports an error or rate limit.

The selector expects English `aria-label="Blocked"` buttons inside `main`, with a profile link in the button's parent. X can change its markup. Other languages and browsers have not been tested. Automated dialog confirmation is restricted to dialogs and confirmation buttons containing “unblock”; this branch has not been tested live.

## Privacy

The extension runs only on `https://x.com/settings/blocked*` and `https://twitter.com/settings/blocked*`. It uses a content script to interact with that page. It requests no cookie, storage, background, or broad browsing permissions. It includes no analytics, external dependencies, remote scripts, or direct API requests.

Only extension source and documentation are published here. Local control helpers, screenshots, logs, and account data are excluded.

## License

[MIT](LICENSE). Unofficial; not affiliated with X or Mozilla.
