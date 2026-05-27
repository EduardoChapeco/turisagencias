import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface TrackerOptions {
  orgId?: string;
  enabled?: boolean;
}

interface TrackingEvent {
  event_type: string;
  page_url: string;
  page_title: string;
  metadata?: any;
}

export const SHADOW_TOKEN_KEY = 'turis_b2c_shadow_token';

export function useB2CTracker({ orgId, enabled = true }: TrackerOptions) {
  const queueRef = useRef<TrackingEvent[]>([]);
  const processingRef = useRef(false);
  const scrollMilestones = useRef(new Set<number>());

  // Ensure token exists
  const getOrCreateToken = useCallback(async () => {
    if (!orgId) return null;
    let token = localStorage.getItem(SHADOW_TOKEN_KEY);
    
    if (!token) {
      token = uuidv4();
      localStorage.setItem(SHADOW_TOKEN_KEY, token);
      
      // Try to create the profile right away
      try {
        const deviceInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screen: `${window.screen.width}x${window.screen.height}`
        };

        await supabase.from('b2c_shadow_profiles').insert({
          id: token,
          org_id: orgId,
          device_info: deviceInfo
        });
      } catch (e) {
        console.error("Failed to init shadow profile", e);
      }
    } else {
      // Update last seen
      supabase.from('b2c_shadow_profiles').update({
        last_seen_at: new Date().toISOString()
      }).eq('id', token).then();
    }
    
    return token;
  }, [orgId]);

  // Flush queue to database
  const flushQueue = useCallback(async () => {
    if (queueRef.current.length === 0 || processingRef.current || !orgId) return;
    
    const token = localStorage.getItem(SHADOW_TOKEN_KEY);
    if (!token) return;

    processingRef.current = true;
    const eventsToProcess = [...queueRef.current];
    queueRef.current = [];

    try {
      const dbEvents = eventsToProcess.map(ev => ({
        shadow_id: token,
        org_id: orgId,
        event_type: ev.event_type,
        page_url: ev.page_url,
        page_title: ev.page_title,
        metadata: ev.metadata || {}
      }));

      await supabase.from('b2c_tracking_events').insert(dbEvents);
    } catch (e) {
      // Re-queue if failed
      queueRef.current = [...eventsToProcess, ...queueRef.current];
      console.error("Tracking flush failed", e);
    } finally {
      processingRef.current = false;
    }
  }, [orgId]);

  // Public method to track custom events
  const trackEvent = useCallback((eventType: string, metadata: any = {}) => {
    if (!enabled) return;
    queueRef.current.push({
      event_type: eventType,
      page_url: window.location.href,
      page_title: document.title,
      metadata
    });
    // If it's a high priority event, flush immediately
    if (eventType === 'chat_open' || eventType === 'form_submit') {
      flushQueue();
    }
  }, [enabled, flushQueue]);

  // Setup batch interval & unmount flush
  useEffect(() => {
    if (!enabled || !orgId) return;

    getOrCreateToken().then((token) => {
      if (token) {
        // Track initial page view
        trackEvent('page_view');
      }
    });

    const interval = setInterval(flushQueue, 5000);

    const handleBeforeUnload = () => flushQueue();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushQueue();
    };
  }, [enabled, orgId, getOrCreateToken, flushQueue, trackEvent]);

  // Scroll tracking
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height <= 0) return;

      const percentage = (scrollY / height) * 100;
      
      [25, 50, 75, 90, 100].forEach(milestone => {
        if (percentage >= milestone && !scrollMilestones.current.has(milestone)) {
          scrollMilestones.current.add(milestone);
          trackEvent(`scroll_depth_${milestone}`);
        }
      });
    };

    // Debounce scroll listener slightly
    let timeoutId: any;
    const throttledScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 500);
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [enabled, trackEvent]);

  return { trackEvent };
}
