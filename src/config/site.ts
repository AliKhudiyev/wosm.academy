// Site-wide facts and links. A value of `null` means the owner has not provided
// it yet; components render a visible TODO(owner) placeholder instead.
// Every null here is listed in TODO.md.

export const site = {
  name: 'WoSM Academy',
  longName: 'Wisdom of Starving Minds',
  url: 'https://wosm.academy',
  locale: 'en-GB',
  description:
    'WoSM Academy (Wisdom of Starving Minds) offers free, rigorous courses in computer science and mathematics to anyone who wants to learn.',
  mission: 'Free, open, rigorous courses for anyone, anywhere.',

  moodle: {
    home: 'https://moodle.wosm.academy/',
    signup: 'https://moodle.wosm.academy/login/signup.php',
    /** Moodle's own privacy policy / data retention page. */
    privacy: null as string | null,
  },

  email: {
    general: 'hello@wosm.academy',
    teaching: 'teach@wosm.academy',
  },

  discord: 'https://discord.gg/DEXyDWj9Qu',

  github: {
    repo: 'https://github.com/AliKhudiyev/wosm.academy',
    issues: 'https://github.com/AliKhudiyev/wosm.academy/issues',
  },

  licence: {
    code: { name: 'MIT', url: 'https://opensource.org/license/mit' },
    content: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  },
} as const;

export const nav = [
  { href: '/courses/', label: 'Courses' },
  { href: '/programme/', label: 'Programme' },
  { href: '/join/', label: 'Join' },
  { href: '/teach/', label: 'Teach' },
  { href: '/about/', label: 'About' },
  { href: '/journal/', label: 'Journal' },
  { href: '/contact/', label: 'Contact' },
] as const;
