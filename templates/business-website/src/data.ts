// SAMPLE DATA. Every name, number, address and review here is made up for the template.
const B = import.meta.env.BASE_URL;
export const PHONE_DISPLAY = '+91 00000 00000';
export const TEL = '#visit';
export const WA = '#enrol';
export const waLink = (_text: string) => WA; // the real site opens WhatsApp with the message filled in
export const TRIAL_MSG = 'Hello! I would like to book a trial class.';

export const RATING = 4.8;
export const REVIEWS = 120;

export const ADDRESS = '12 Sample Road, Your Area, Bengaluru 560001';
export const LANDMARK = 'Next to the metro station';
export const MAP_EMBED = 'https://www.google.com/maps?q=Bengaluru&output=embed';
export const DIRECTIONS = '#visit';

const img = (name: string) => ({ src: `${B}images/sample/${name}.svg` });
export const IMAGES = {
  studio: img('studio'),
  family: img('inauguration'),
  storefront: img('storefront'),
  teacher: img('teacher'),
  stageShow: img('stage-show'),
  groupAct: img('group-act'),
  kids: img('kids-class'),
  branch: img('branch-opening'),
  solo: img('solo'),
  classroom: img('studio-class'),
  logo: `${B}images/sample/logo.svg`,
};

export const STYLES = [
  { name: 'Western dance', line: 'Hip-hop, freestyle and film-song routines.', who: 'Kids · Teens · Adults' },
  { name: 'Bharatanatyam', line: 'Classical grace, rhythm and expression.', who: 'Kids · Teens · Adults' },
  { name: 'Gymnastics', line: 'Flips, flexibility and strength.', who: 'Kids · Teens' },
  { name: 'Zumba fitness', line: 'Dance workouts that feel like a party.', who: 'Adults' },
  { name: 'Personal training', line: 'One-on-one coaching at your pace.', who: 'All ages' },
  { name: 'Show prep', line: 'Routines and coaching for stage and TV shows.', who: 'Teens · Adults' },
];

export const BATCHES = {
  Kids: { ages: '5 to 12 years', rows: ['Weekday evenings', 'Saturday', 'Sunday'] },
  Teens: { ages: '13 to 19 years', rows: ['Weekday evenings', 'Weekend'] },
  Adults: { ages: '20 and above', rows: ['Early morning', 'Late evening', 'Weekend'] },
} as const;

export const THEMES = [
  { title: 'Stage confidence', text: 'Parents say their children now perform on any stage without fear.' },
  { title: 'Choreography they love', text: 'The lead teacher and team are named again and again for their teaching and routines.' },
  { title: 'Real chances to perform', text: 'Students get to perform at functions and shows, a real platform to show their talent.' },
];
