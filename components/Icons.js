import React from 'react';
import Svg, { Path, Rect, Circle, Ellipse, G, Defs, LinearGradient, Stop } from 'react-native-svg';

export const BrainIcon = ({ size = 24, isActive = false }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Path
      d="M 32 12 C 20 12 12 20 12 30 C 12 35 14 39 17 42 L 17 48 C 17 50 18 52 20 52 L 24 52 C 24 54 26 56 28 56 L 36 56 C 38 56 40 54 40 52 L 44 52 C 46 52 47 50 47 48 L 47 42 C 50 39 52 35 52 30 C 52 20 44 12 32 12 Z"
      fill={isActive ? "#3B82F6" : "#CBD5E1"}
      fillOpacity="0.2"
    />
    <Path
      d="M 32 12 C 20 12 12 20 12 30 C 12 35 14 39 17 42 L 17 48 C 17 50 18 52 20 52 L 24 52 C 24 54 26 56 28 56 L 36 56 C 38 56 40 54 40 52 L 44 52 C 46 52 47 50 47 48 L 47 42 C 50 39 52 35 52 30 C 52 20 44 12 32 12 Z"
      fill="none"
      stroke={isActive ? "#3B82F6" : "#94A3B8"}
      strokeWidth="2.5"
    />
    <G stroke={isActive ? "#2563EB" : "#94A3B8"} strokeWidth="2" fill="none">
      <Path d="M 22 26 Q 26 24 30 26"/>
      <Path d="M 34 26 Q 38 24 42 26"/>
      <Path d="M 26 34 Q 32 32 38 34"/>
    </G>
  </Svg>
);

export const BoardIcon = ({ size = 24, isActive = false }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Rect
      x="12" y="12" width="40" height="40" rx="6"
      fill="none"
      stroke={isActive ? "#3B82F6" : "#64748B"}
      strokeWidth="2.5"
    />
    <Rect x="18" y="18" width="12" height="10" rx="2" fill="#94A3B8" opacity={isActive ? "0.8" : "0.6"}/>
    <Rect x="34" y="18" width="12" height="10" rx="2" fill="#94A3B8" opacity={isActive ? "0.8" : "0.6"}/>
    <Rect x="18" y="32" width="12" height="10" rx="2" fill="#94A3B8" opacity={isActive ? "0.8" : "0.6"}/>
    <Rect x="34" y="32" width="12" height="10" rx="2" fill="#94A3B8" opacity={isActive ? "0.8" : "0.6"}/>
  </Svg>
);

export const TrackerIcon = ({ size = 24, isActive = false }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Rect x="14" y="38" width="8" height="14" rx="2" fill={isActive ? "#10B981" : "#94A3B8"} opacity={isActive ? "0.8" : "0.7"}/>
    <Rect x="26" y="28" width="8" height="24" rx="2" fill={isActive ? "#059669" : "#94A3B8"} opacity={isActive ? "0.9" : "0.8"}/>
    <Rect x="38" y="20" width="8" height="32" rx="2" fill={isActive ? "#047857" : "#94A3B8"} opacity={isActive ? "1" : "0.9"}/>
    <Path d="M 48 18 L 56 12 L 56 18 Z" fill={isActive ? "#059669" : "#94A3B8"}/>
    <Path
      d="M 10 50 L 56 14"
      stroke={isActive ? "#059669" : "#94A3B8"}
      strokeWidth="2"
      strokeDasharray="2,2"
      opacity="0.5"
    />
  </Svg>
);

export const InsightsIcon = ({ size = 24, isActive = false }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Ellipse
      cx="32" cy="24" rx="12" ry="16"
      fill={isActive ? "#A855F7" : "#CBD5E1"}
      opacity="0.2"
    />
    <Ellipse
      cx="32" cy="24" rx="12" ry="16"
      fill="none"
      stroke={isActive ? "#9333EA" : "#94A3B8"}
      strokeWidth="2.5"
    />
    <Rect x="28" y="38" width="8" height="6" rx="1" fill={isActive ? "#9333EA" : "#94A3B8"} opacity="0.6"/>
    <Rect x="26" y="44" width="12" height="4" rx="2" fill={isActive ? "#9333EA" : "#94A3B8"} opacity="0.4"/>
    <G fill={isActive ? "#A855F7" : "#CBD5E1"}>
      <Circle cx="25" cy="15" r="2" opacity="0.6"/>
      <Circle cx="39" cy="18" r="2" opacity="0.6"/>
      <Circle cx="32" cy="10" r="2" opacity="0.8"/>
    </G>
  </Svg>
);

export const SettingsIcon = ({ size = 24, isActive = false }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Circle
      cx="32" cy="32" r="10"
      fill="none"
      stroke={isActive ? "#64748B" : "#94A3B8"}
      strokeWidth="2.5"
    />
    <Circle cx="32" cy="32" r="5" fill={isActive ? "#94A3B8" : "#CBD5E1"} opacity="0.4"/>
    <G fill={isActive ? "#64748B" : "#94A3B8"}>
      <Rect x="30" y="14" width="4" height="6" rx="1"/>
      <Rect x="30" y="44" width="4" height="6" rx="1"/>
      <Rect x="14" y="30" width="6" height="4" rx="1"/>
      <Rect x="44" y="30" width="6" height="4" rx="1"/>
    </G>
  </Svg>
);

export const CircleIcon = ({ size = 64, color = "#CBD5E1", strokeWidth = 1.5 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth={strokeWidth}/>
  </Svg>
);

export const CheckCircleIcon = ({ size = 20, color = "#059669" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/>
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const ZapIcon = ({ size = 20, color = "#F59E0B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
  </Svg>
);

export const PlusIcon = ({ size = 24, color = "#FFFFFF", strokeWidth = 2.5 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
);

export const SearchIcon = ({ size = 20, color = "#475569" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="11" cy="11" r="8" fill="none" stroke={color} strokeWidth="2"/>
    <Path d="m21 21-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const TrendingUpIcon = ({ size = 32, color = "#FFFFFF", strokeWidth = 2.5 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="m23 6-9.5 9.5-5-5L1 18" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M17 6h6v6" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const LightbulbIcon = ({ size = 64, color = "#A855F7", strokeWidth = 1.5 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 18h6M10 22h4M9 14h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
);

export const TargetIcon = ({ size = 20, color = "#9333EA" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="12" r="6" fill="none" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="12" r="2" fill="none" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const CalendarIcon = ({ size = 20, color = "#9333EA" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke={color} strokeWidth="2"/>
    <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const VollstaendigIcon = ({ size = 60, active = false }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Rect x="30" y="20" width="60" height="80" rx="6" fill="#3B82F6" opacity="0.15"/>
    <Rect x="30" y="20" width="60" height="80" rx="6" fill="none" stroke="#3B82F6" strokeWidth="3"/>
    <G stroke="#2563EB" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M 45 38 L 50 43 L 62 31"/>
      <Path d="M 45 55 L 50 60 L 62 48"/>
      <Path d="M 45 72 L 50 77 L 62 65"/>
    </G>
    {active && <Circle cx="60" cy="60" r="45" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.2"/>}
  </Svg>
);

export const SchnellIcon = ({ size = 60, active = false }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Defs>
      <LinearGradient id="lightning-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FBBF24"/>
        <Stop offset="100%" stopColor="#F59E0B"/>
      </LinearGradient>
    </Defs>
    <Path
      d="M 65 15 L 45 60 L 60 60 L 55 105 L 85 50 L 65 50 Z"
      fill="url(#lightning-gradient)"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <G stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.4">
      <Path d="M 25 35 L 35 35"/>
      <Path d="M 20 50 L 35 50"/>
      <Path d="M 25 65 L 35 65"/>
    </G>
  </Svg>
);

export default {
  
  BrainIcon,
  BoardIcon,
  TrackerIcon,
  InsightsIcon,
  SettingsIcon,
  
  CircleIcon,
  CheckCircleIcon,
  ZapIcon,
  PlusIcon,
  SearchIcon,
  TrendingUpIcon,
  LightbulbIcon,
  TargetIcon,
  CalendarIcon,
  
  VollstaendigIcon,
  SchnellIcon
};
