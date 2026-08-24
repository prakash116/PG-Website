/**
 * MSG91's OTP widget, loaded on demand and exposed as promises.
 *
 * With `exposeMethods: true` the widget renders no UI of its own — the
 * register page keeps its own field and copy, and only calls
 * sendOtp / retryOtp / verifyOtp. Ported from the proven standalone
 * integration; the widget id and token auth come from the API rather than
 * build-time env, so a Super Admin can change them without a redeploy.
 *
 * Three hard-won rules live here:
 * - Init state is kept on `window`, not in this module. Dev Fast Refresh
 *   resets module state while the widget survives on `window`, and calling
 *   `initSendOTP` a second time corrupts its captcha ("hCaptcha was already
 *   rendered", then "network-error").
 * - `initSendOTP` returns before it attaches `sendOtp`/`verifyOtp` to
 *   `window`, so init only counts as done once the methods exist.
 * - Every call gets a deadline. When the widget's captcha dies it calls
 *   neither success nor failure, and without a deadline the button would say
 *   "Sending..." forever.
 */

interface Msg91InitState {
  widgetId: string;
  ready: Promise<void>;
}

/* The widget script hangs its API off `window`. */
declare global {
  interface Window {
    initSendOTP?: (config: {
      widgetId: string;
      tokenAuth: string;
      exposeMethods: boolean;
      captchaRenderId?: string;
      success: (data: unknown) => void;
      failure: (error: unknown) => void;
    }) => void;
    sendOtp?: (
      identifier: string,
      onSuccess: (data: unknown) => void,
      onFailure: (error: unknown) => void
    ) => void;
    retryOtp?: (
      channel: string | null,
      onSuccess: (data: unknown) => void,
      onFailure: (error: unknown) => void
    ) => void;
    verifyOtp?: (
      otp: string,
      onSuccess: (data: { message?: string } | undefined) => void,
      onFailure: (error: unknown) => void
    ) => void;
    /** Survives Fast Refresh, unlike module state — see the header comment. */
    __pzeeMsg91?: Msg91InitState;
  }
}

/** Primary + fallback URLs, as in MSG91's official integration snippet. */
const SCRIPT_URLS = [
  "https://verify.msg91.com/otp-provider.js",
  "https://verify.phone91.com/otp-provider.js",
];

/** Where the widget renders its captcha, if one is enabled on the dashboard. */
export const CAPTCHA_RENDER_ID = "msg91-captcha";

/** How long to wait for the widget to attach its methods after init. */
const METHODS_WAIT_MS = 8_000;

/**
 * Deadline for a send or verify. Generous, because a visible captcha
 * challenge legitimately takes a person a while to solve — this exists to end
 * a dead request, not to rush anyone.
 */
const CALL_TIMEOUT_MS = 60_000;

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.initSendOTP) {
      resolve();
      return;
    }

    const tryUrl = (index: number) => {
      if (index >= SCRIPT_URLS.length) {
        reject(
          new Error("Could not load the SMS service. Check your connection.")
        );
        return;
      }

      const script = document.createElement("script");
      script.src = SCRIPT_URLS[index];
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => tryUrl(index + 1);
      document.head.appendChild(script);
    };

    tryUrl(0);
  });
}

/** Polls until the widget has attached its exposed methods to `window`. */
function waitForMethods(): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const poll = () => {
      if (window.sendOtp && window.verifyOtp) {
        resolve();
        return;
      }

      if (Date.now() - startedAt > METHODS_WAIT_MS) {
        reject(
          new Error(
            "The SMS service did not start. Turn off any ad blocker and try again."
          )
        );
        return;
      }

      setTimeout(poll, 100);
    };

    poll();
  });
}

function initWidget(widgetId: string, tokenAuth: string): Promise<void> {
  const existing = window.__pzeeMsg91;

  // Already initialized for this widget — including by a pre-refresh copy of
  // this module. Re-running initSendOTP is what breaks the captcha, so don't.
  if (existing && existing.widgetId === widgetId) {
    return existing.ready;
  }

  const ready = loadScript().then(() => {
    window.initSendOTP?.({
      widgetId,
      tokenAuth,
      exposeMethods: true,
      captchaRenderId: CAPTCHA_RENDER_ID,
      success: () => {},
      failure: () => {},
    });

    return waitForMethods();
  });

  // A failed init must not poison every later attempt — forget it so the next
  // click starts clean.
  ready.catch(() => {
    if (window.__pzeeMsg91?.ready === ready) {
      window.__pzeeMsg91 = undefined;
    }
  });

  window.__pzeeMsg91 = { widgetId, ready };

  return ready;
}

function toError(error: unknown): Error {
  // Keep the raw shape visible for debugging — the widget's errors are terse.
  console.error("[msg91-widget]", error);

  const raw =
    typeof error === "string"
      ? error
      : ((error as { message?: string; msg?: string } | null)?.message ??
        (error as { msg?: string } | null)?.msg ??
        "");

  // The widget's captcha failing to reach hCaptcha surfaces as this literal.
  if (/network[- ]?error/i.test(raw)) {
    return new Error(
      "The captcha could not reach its server. Turn off any ad blocker or VPN, or try a different browser, then try again."
    );
  }

  return new Error(raw || "The SMS service refused the request. Try again.");
}

/**
 * Settles with the callback like the widget promises to — or rejects at the
 * deadline, because a widget whose captcha died calls neither callback.
 */
function withDeadline<T>(
  run: (resolve: (value: T) => void, reject: (error: Error) => void) => void
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          "The SMS service did not respond. Check your connection and try again."
        )
      );
    }, CALL_TIMEOUT_MS);

    run(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/** Sends the code. `identifier` must include the country code: "91XXXXXXXXXX". */
export async function widgetSendOtp(
  widgetId: string,
  tokenAuth: string,
  identifier: string
): Promise<void> {
  await initWidget(widgetId, tokenAuth);

  return withDeadline<void>((resolve, reject) => {
    window.sendOtp?.(
      identifier,
      () => resolve(),
      (error) => reject(toError(error))
    );
  });
}

/** Sends the code again, to the same number as the last send. */
export async function widgetRetryOtp(
  widgetId: string,
  tokenAuth: string
): Promise<void> {
  await initWidget(widgetId, tokenAuth);

  return withDeadline<void>((resolve, reject) => {
    window.retryOtp?.(
      null,
      () => resolve(),
      (error) => reject(toError(error))
    );
  });
}

/**
 * Checks the code with MSG91 and resolves with the access token — which is
 * what the API then confirms server-side before recording anything.
 */
export async function widgetVerifyOtp(
  widgetId: string,
  tokenAuth: string,
  otp: string
): Promise<string> {
  await initWidget(widgetId, tokenAuth);

  return withDeadline<string>((resolve, reject) => {
    window.verifyOtp?.(
      otp,
      (data) => {
        if (data?.message) {
          resolve(data.message);
        } else {
          reject(new Error("The SMS service returned no verification token."));
        }
      },
      (error) => reject(toError(error))
    );
  });
}
