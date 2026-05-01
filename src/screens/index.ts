// src/screens/index.ts
// Side-effect barrel — pulls every screen module so their components register
// on `window` via mythos-indra's JSX-on-window bridge. Import order is the
// onboarding-first user flow, followed by the NavBar dock order, then the
// player-card detail surface.
//
// Owned by mythos-boruto (Frontend Prime). Do not add logic here.

import './screen-onboarding.jsx';
import './screen-dashboard.jsx';
import './screen-checkin.jsx';
import './screen-chat.jsx';
import './screen-meditation.jsx';
import './screen-journal.jsx';
import './screen-insights.jsx';
import './screen-playercard.jsx';

export {};
