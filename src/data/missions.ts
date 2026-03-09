/**
 * Historical & active spacecraft mission data
 * Trajectories are simplified waypoints in scene coordinates (AU_SCALE = 60)
 */

export interface MissionWaypoint {
  position: [number, number, number]; // scene coords
  date: string; // ISO date string
  label?: string;
}

export interface SpacecraftMission {
  id: string;
  name: string;
  agency: string;
  launchDate: string;
  status: 'active' | 'completed' | 'lost';
  target: string;
  description: string;
  color: string;
  waypoints: MissionWaypoint[];
  highlights: string[];
  imageUrl?: string;
}

const AU = 60; // scene scale

export const missions: SpacecraftMission[] = [
  {
    id: 'voyager1',
    name: 'Voyager 1',
    agency: 'NASA/JPL',
    launchDate: '1977-09-05',
    status: 'active',
    target: 'Interstellar Space',
    description: 'Voyager 1 is the most distant human-made object from Earth. After flybys of Jupiter and Saturn, it entered interstellar space in 2012.',
    color: '#00e5ff',
    waypoints: [
      { position: [AU, 0, 0], date: '1977-09-05', label: 'Launch (Earth)' },
      { position: [AU * 5.2, 2, AU * 0.5], date: '1979-03-05', label: 'Jupiter Flyby' },
      { position: [AU * 9.5, 8, AU * 2], date: '1980-11-12', label: 'Saturn Flyby' },
      { position: [AU * 14, 30, AU * 6], date: '1990-02-14', label: 'Pale Blue Dot' },
      { position: [AU * 20, 60, AU * 12], date: '2012-08-25', label: 'Interstellar Space' },
      { position: [AU * 25, 80, AU * 16], date: '2025-01-01', label: 'Current Position ~163 AU' },
    ],
    highlights: [
      'First spacecraft to enter interstellar space',
      'Carries the Golden Record — sounds & images of Earth',
      'Still transmitting data after 47+ years',
      'Most distant human-made object: ~163 AU from Sun',
    ],
  },
  {
    id: 'voyager2',
    name: 'Voyager 2',
    agency: 'NASA/JPL',
    launchDate: '1977-08-20',
    status: 'active',
    target: 'Interstellar Space',
    description: 'Voyager 2 is the only spacecraft to have visited all four giant planets. It entered interstellar space in 2018.',
    color: '#76ff03',
    waypoints: [
      { position: [AU, 0, 0], date: '1977-08-20', label: 'Launch (Earth)' },
      { position: [AU * 5.2, -1, -AU * 0.8], date: '1979-07-09', label: 'Jupiter Flyby' },
      { position: [AU * 9.5, -3, -AU * 3], date: '1981-08-25', label: 'Saturn Flyby' },
      { position: [AU * 19.2, -10, -AU * 8], date: '1986-01-24', label: 'Uranus Flyby' },
      { position: [AU * 30, -20, -AU * 14], date: '1989-08-25', label: 'Neptune Flyby' },
      { position: [AU * 22, -50, -AU * 20], date: '2018-11-05', label: 'Interstellar Space' },
    ],
    highlights: [
      'Only spacecraft to visit Uranus & Neptune',
      'Grand Tour of all four outer planets',
      'Entered interstellar space in 2018',
      'Discovered 16 moons across 4 planets',
    ],
  },
  {
    id: 'newhorizons',
    name: 'New Horizons',
    agency: 'NASA/APL',
    launchDate: '2006-01-19',
    status: 'active',
    target: 'Kuiper Belt',
    description: 'New Horizons performed the first flyby of Pluto in 2015 and later visited Kuiper Belt object Arrokoth.',
    color: '#ff6d00',
    waypoints: [
      { position: [AU, 0, 0], date: '2006-01-19', label: 'Launch (Earth)' },
      { position: [AU * 5.2, 1, AU * 0.3], date: '2007-02-28', label: 'Jupiter Gravity Assist' },
      { position: [AU * 39.5, 5, AU * 3], date: '2015-07-14', label: 'Pluto Flyby' },
      { position: [AU * 44, 6, AU * 4], date: '2019-01-01', label: 'Arrokoth Flyby' },
      { position: [AU * 50, 7, AU * 5], date: '2025-01-01', label: 'Current: ~60 AU' },
    ],
    highlights: [
      'First spacecraft to visit Pluto',
      'Revealed Pluto\'s heart-shaped glacier (Sputnik Planitia)',
      'Visited Arrokoth — most distant object explored',
      'Fastest launch velocity ever: 58,536 km/h',
    ],
  },
  {
    id: 'cassini',
    name: 'Cassini-Huygens',
    agency: 'NASA/ESA/ASI',
    launchDate: '1997-10-15',
    status: 'completed',
    target: 'Saturn',
    description: 'Cassini orbited Saturn for 13 years, revolutionizing our understanding of the ringed planet, its moons, and ring system.',
    color: '#ffd600',
    waypoints: [
      { position: [AU, 0, 0], date: '1997-10-15', label: 'Launch (Earth)' },
      { position: [AU * 0.72, 0, -AU * 0.5], date: '1998-04-26', label: 'Venus Flyby 1' },
      { position: [AU * 0.72, 0, AU * 0.5], date: '1999-06-24', label: 'Venus Flyby 2' },
      { position: [AU * 5.2, 1, AU * 0.4], date: '2000-12-30', label: 'Jupiter Flyby' },
      { position: [AU * 9.5, 3, AU * 1.5], date: '2004-07-01', label: 'Saturn Orbit Insertion' },
      { position: [AU * 9.5, 3.5, AU * 2], date: '2005-01-14', label: 'Huygens Titan Landing' },
      { position: [AU * 9.5, 2, AU * 1], date: '2017-09-15', label: 'Grand Finale — Plunge' },
    ],
    highlights: [
      '13 years orbiting Saturn (2004–2017)',
      'Huygens probe landed on Titan — first outer solar system landing',
      'Discovered ocean beneath Enceladus\' icy crust',
      'Grand Finale: dove between rings before atmospheric plunge',
    ],
  },
  {
    id: 'curiosity',
    name: 'Curiosity Rover',
    agency: 'NASA/JPL',
    launchDate: '2011-11-26',
    status: 'active',
    target: 'Mars',
    description: 'Curiosity is a car-sized Mars rover exploring Gale Crater. It has confirmed that Mars once had conditions suitable for microbial life.',
    color: '#ff1744',
    waypoints: [
      { position: [AU, 0, 0], date: '2011-11-26', label: 'Launch (Earth)' },
      { position: [AU * 1.15, 0, AU * 0.4], date: '2012-04-01', label: 'Cruise Phase' },
      { position: [AU * 1.52, 0.5, AU * 0.8], date: '2012-08-06', label: 'Mars Landing — Gale Crater' },
    ],
    highlights: [
      'Sky Crane landing — 7 minutes of terror',
      'Confirmed ancient habitable lake environment',
      'Detected organic molecules on Mars',
      'Still operating after 12+ years on Mars surface',
    ],
  },
];
