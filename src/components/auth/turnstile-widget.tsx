"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: any) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

export interface TurnstileWidgetHandle {
  reset: () => void;
}

export interface TurnstileWidgetProps {
  siteKey: string;
  action?: string;
  theme?: "auto" | "light" | "dark";
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget(
    { siteKey, action, theme = "auto", onToken, onExpire, onError, className },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);

    const onTokenRef = useRef(onToken);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onTokenRef.current = onToken;
    }, [onToken]);

    useEffect(() => {
      onExpireRef.current = onExpire;
    }, [onExpire]);

    useEffect(() => {
      onErrorRef.current = onError;
    }, [onError]);

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          if (widgetIdRef.current && window.turnstile) {
            try {
              window.turnstile.reset(widgetIdRef.current);
            } catch {}
          }
        },
      }),
      [],
    );

    useEffect(() => {
      if (!siteKey) return;
      const el = containerRef.current;
      if (!el) return;

      let cancelled = false;
      let tries = 0;

      const renderOnce = () => {
        if (cancelled) return;

        if (!window.turnstile) {
          tries += 1;
          if (tries > 60) return;
          setTimeout(renderOnce, 200);
          return;
        }

        if (widgetIdRef.current) return;

        const opts: Record<string, any> = {
          sitekey: siteKey,
          theme,
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onExpireRef.current?.(),
          "error-callback": () => onErrorRef.current?.(),
          retry: "never",
          "refresh-expired": "manual",
        };

        if (action) {
          opts.action = action;
        }

        widgetIdRef.current = window.turnstile.render(el, opts);
      };

      renderOnce();

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {}
        }
        widgetIdRef.current = null;
      };
    }, [siteKey, action, theme]);

    return (
      <div className={className}>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
        <div ref={containerRef} />
      </div>
    );
  },
);

export default TurnstileWidget;
