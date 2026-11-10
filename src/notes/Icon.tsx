export type IconName = 'pen' | 'calendar' | 'spark' | 'recap' | 'settings' | 'sun' | 'moon' | 'eye' | 'lock' | 'arrow' | 'grid' | 'list' | 'river' | 'map' | 'close' | 'download' | 'mic' | 'chat' | 'check' | 'trash' | 'search'
const paths: Record<IconName, string> = {
  pen: 'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z',
  calendar: 'M3 8h18M7 3v5M17 3v5M5 5h14a2 2 0 012 2v13H3V7a2 2 0 012-2z',
  spark: 'M12 3l2 6 6 3-6 2-2 7-2-7-7-2 7-3z',
  recap: 'M3 5h18M3 12h18M3 19h12', settings: 'M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2M15 12a3 3 0 11-6 0 3 3 0 016 0',
  sun: 'M16 12a4 4 0 11-8 0 4 4 0 018 0M12 2v2M12 20v2M2 12h2M20 12h2M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  moon: 'M21 13A9 9 0 1111 3a7 7 0 0010 10z', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z M15 12a3 3 0 11-6 0 3 3 0 016 0',
  lock: 'M6 10h12v11H6zM8 10V6a4 4 0 018 0v4', arrow: 'M5 12h14M13 6l6 6-6 6',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1', river: 'M3 17l6-6 4 4 8-8M14 7h7v7',
  map: 'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16', close: 'M6 6l12 12M6 18L18 6',
  download: 'M12 3v12M7 10l5 5 5-5M4 17v4h16v-4', mic: 'M9 5a3 3 0 016 0v7a3 3 0 01-6 0zM5 11v1a7 7 0 0014 0v-1M12 19v3M9 22h6',
  chat: 'M21 15a3 3 0 01-3 3H8l-5 4V5a3 3 0 013-3h12a3 3 0 013 3z',
  check: 'M4 12l5 5L20 6', trash: 'M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  search: 'M18 10a7 7 0 11-14 0 7 7 0 0114 0M16 16l5 5',
}
export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
