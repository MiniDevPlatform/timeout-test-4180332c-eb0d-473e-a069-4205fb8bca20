/**
 * MiniDev ONE Template - Analytics System
 * 
 * Track events, page views, user behavior, and custom metrics.
 * Supports: Google Analytics, Plausible, Mixpanel, custom endpoints.
 */

import { FEATURES } from '@/lib/config';

// =============================================================================
// TYPES
// =============================================================================
type AnalyticsProvider = 'none' | 'google' | 'plausible' | 'mixpanel' | 'custom';

interface EventData {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

interface PageViewData {
  title?: string;
  location?: string;
  referrer?: string;
}

interface UserData {
  id?: string;
  email?: string;
  name?: string;
  properties?: Record<string, any>;
}

// =============================================================================
// ANALYTICS BASE
// =============================================================================
abstract class BaseAnalytics {
  protected enabled: boolean;

  constructor() {
    this.enabled = FEATURES.analytics.enabled && FEATURES.analytics.provider !== 'none';
  }

  abstract init(): void;
  abstract trackEvent(eventName: string, data?: EventData): void;
  abstract trackPageView(data?: PageViewData): void;
  abstract identify(userId: string, data?: UserData): void;
  abstract setProperty(key: string, value: any): void;
}

// =============================================================================
// GOOGLE ANALYTICS
// =============================================================================
class GoogleAnalytics extends BaseAnalytics {
  private measurementId: string;
  private clientId: string;

  constructor() {
    super();
    this.measurementId = FEATURES.analytics.id;
    this.clientId = this.generateClientId();
  }

  private generateClientId(): string {
    let clientId = storage.get<string>('ga_client_id');
    if (!clientId) {
      clientId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      storage.set('ga_client_id', clientId);
    }
    return clientId;
  }

  init(): void {
    if (!this.enabled) return;

    // Load GA script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function() { (window as any).dataLayer.push(arguments); };
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', this.measurementId, { client_id: this.clientId });
  }

  trackEvent(eventName: string, data?: EventData): void {
    if (!this.enabled) return;
    
    (window as any).gtag('event', eventName, {
      event_category: data?.category,
      event_label: data?.label,
      value: data?.value,
      ...data,
    });
  }

  trackPageView(data?: PageViewData): void {
    if (!this.enabled) return;
    
    (window as any).gtag('config', this.measurementId, {
      page_title: data?.title || document.title,
      page_location: data?.location || window.location.href,
      page_referrer: data?.referrer || document.referrer,
    });
  }

  identify(userId: string, data?: UserData): void {
    if (!this.enabled) return;
    (window as any).gtag('set', { user_id: userId });
    if (data?.email) {
      (window as any).gtag('set', { user_email: data.email });
    }
  }

  setProperty(key: string, value: any): void {
    if (!this.enabled) return;
    (window as any).gtag('set', { [key]: value });
  }
}

// =============================================================================
// PLAUSIBLE ANALYTICS
// =============================================================================
class PlausibleAnalytics extends BaseAnalytics {
  private domain: string;

  constructor() {
    super();
    this.domain = FEATURES.analytics.id;
  }

  init(): void {
    if (!this.enabled) return;

    // Load Plausible script
    const script = document.createElement('script');
    script.src = 'https://plausible.io/js/script.js';
    script.dataset.domain = this.domain;
    script.async = true;
    document.head.appendChild(script);

    (window as any).plausible = (window as any).plausible || function() {
      ((window as any).plausible.q = (window as any).plausible.q || []).push(arguments);
    };
  }

  trackEvent(eventName: string, data?: EventData): void {
    if (!this.enabled) return;
    (window as any).plausible(eventName, { props: data });
  }

  trackPageView(data?: PageViewData): void {
    if (!this.enabled) return;
    (window as any).plausible('pageview', {
      u: data?.location || window.location.href,
    });
  }

  identify(userId: string, data?: UserData): void {
    // Plausible doesn't support user identification directly
    if (data?.email) {
      this.trackEvent('identify', { email: data.email });
    }
  }

  setProperty(key: string, value: any): void {
    if (!this.enabled) return;
    (window as any).plausible('event', {
      props: { [key]: value },
    });
  }
}

// =============================================================================
// MIXPANEL ANALYTICS
// =============================================================================
class MixpanelAnalytics extends BaseAnalytics {
  private token: string;

  constructor() {
    super();
    this.token = FEATURES.analytics.id;
  }

  init(): void {
    if (!this.enabled) return;

    // Load Mixpanel script
    (function(f,b) { if(b) return; var i = function() { i(arguments); }; i.q = []; i.q.push(arguments); b = !0; })(window, !1);
    
    const script = document.createElement('script');
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    script.async = true;
    document.head.appendChild(script);

    (window as any).mixpanel = (window as any).mixpanel || {
      track: function() { (window as any).mixpanel.q.push(arguments); },
      identify: function() { (window as any).mixpanel.q.push(arguments); },
      people: { set: function() { (window as any).mixpanel.q.push(arguments); } },
      init: function() { (window as any).mixpanel.q.push(arguments); },
    };
    
    (window as any).mixpanel.init(this.token);
  }

  trackEvent(eventName: string, data?: EventData): void {
    if (!this.enabled) return;
    (window as any).mixpanel.track(eventName, data);
  }

  trackPageView(data?: PageViewData): void {
    this.trackEvent('Page View', {
      title: data?.title || document.title,
      url: data?.location || window.location.href,
    });
  }

  identify(userId: string, data?: UserData): void {
    if (!this.enabled) return;
    (window as any).mixpanel.identify(userId);
    if (data) {
      (window as any).mixpanel.people.set(data.properties || {});
    }
  }

  setProperty(key: string, value: any): void {
    if (!this.enabled) return;
    (window as any).mixpanel.register({ [key]: value });
  }
}

// =============================================================================
// CUSTOM ANALYTICS (Self-hosted / API)
// =============================================================================
class CustomAnalytics extends BaseAnalytics {
  private endpoint: string;
  private queue: any[] = [];
  private flushInterval: number = 5000;
  private sessionId: string;
  private userId?: string;

  constructor() {
    super();
    this.endpoint = FEATURES.analytics.id;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    let sessionId = storage.get<string>('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      storage.set('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  init(): void {
    if (!this.enabled) return;

    // Start flush interval
    setInterval(() => this.flush(), this.flushInterval);

    // Track session start
    this.trackEvent('session_start');
  }

  private async send(data: any): Promise<void> {
    if (!this.enabled || !this.endpoint) return;

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      });
    } catch (e) {
      // Queue for retry
      this.queue.push(data);
    }
  }

  private flush(): void {
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.queue.length);
    this.send({ type: 'batch', events: batch });
  }

  trackEvent(eventName: string, data?: EventData): void {
    if (!this.enabled) return;

    const event = {
      type: 'event',
      name: eventName,
      data,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.send(event);
  }

  trackPageView(data?: PageViewData): void {
    this.trackEvent('pageview', {
      title: data?.title || document.title,
      url: data?.location || window.location.href,
      referrer: data?.referrer || document.referrer,
    });
  }

  identify(userId: string, data?: UserData): void {
    this.userId = userId;
    storage.set('analytics_user_id', userId);
    
    this.trackEvent('identify', {
      id: userId,
      email: data?.email,
      name: data?.name,
    });
  }

  setProperty(key: string, value: any): void {
    this.trackEvent('property', { key, value });
  }
}

// =============================================================================
// ANALYTICS MANAGER
// =============================================================================
class Analytics {
  private instance: BaseAnalytics;
  private autoTracking: boolean = false;

  constructor() {
    const provider = FEATURES.analytics.provider as AnalyticsProvider;

    switch (provider) {
      case 'google':
        this.instance = new GoogleAnalytics();
        break;
      case 'plausible':
        this.instance = new PlausibleAnalytics();
        break;
      case 'mixpanel':
        this.instance = new MixpanelAnalytics();
        break;
      case 'custom':
        this.instance = new CustomAnalytics();
        break;
      default:
        this.instance = new (class extends BaseAnalytics {
          init(): void {}
          trackEvent(): void {}
          trackPageView(): void {}
          identify(): void {}
          setProperty(): void {}
        })();
    }
  }

  init(): void {
    this.instance.init();
    this.setupAutoTracking();
  }

  private setupAutoTracking(): void {
    if (this.autoTracking) return;
    this.autoTracking = true;

    // Track page views on navigation
    if (typeof history !== 'undefined') {
      const originalPushState = history.pushState;
      history.pushState = (...args) => {
        originalPushState.apply(history, args);
        this.trackPageView();
      };

      window.addEventListener('popstate', () => this.trackPageView());
    }

    // Track initial page view
    this.trackPageView();
  }

  trackEvent(eventName: string, data?: EventData): void {
    this.instance.trackEvent(eventName, data);
  }

  trackPageView(data?: PageViewData): void {
    this.instance.trackPageView(data);
  }

  identify(userId: string, data?: UserData): void {
    this.instance.identify(userId, data);
  }

  setProperty(key: string, value: any): void {
    this.instance.setProperty(key, value);
  }

  // Convenience methods for common events
  trackGameStart(): void {
    this.trackEvent('game_start', { category: 'game' });
  }

  trackGameOver(score: number, level: number): void {
    this.trackEvent('game_over', { category: 'game', value: score, label: `level_${level}` });
  }

  trackLevelComplete(level: number, time: number): void {
    this.trackEvent('level_complete', { category: 'game', value: level, label: `time_${time}` });
  }

  trackAchievement(id: string, name: string): void {
    this.trackEvent('achievement', { category: 'achievement', label: name });
  }

  trackHighScore(score: number): void {
    this.trackEvent('high_score', { category: 'score', value: score });
  }

  trackAppOpen(): void {
    this.trackEvent('app_open', { category: 'app' });
  }

  trackFeatureUse(feature: string): void {
    this.trackEvent('feature_use', { category: 'feature', label: feature });
  }
}

// Import storage for session management
import { storage } from '../storage';

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================
export const analytics = new Analytics();

export { Analytics };
export default analytics;
