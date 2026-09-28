const paths = {
  sprout: '<path d="M12 21v-9M12 16C5 17 2 12 3 7c6-1 10 3 9 9ZM12 12c0-7 4-10 10-9 0 6-4 10-10 9Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  left: '<path d="m14 6-6 6 6 6"/>',
  right: '<path d="m10 6 6 6-6 6"/>',
  edit: '<path d="m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  leaf: '<path d="M5 19C-1 8 10 2 21 3c1 11-5 21-16 16Zm0 0L16 8"/>',
  book: '<path d="M12 5v16M12 5C8 2 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-2-10 1Z"/>',
  moon: '<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>',
  water: '<path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13ZM9 15c0 2 1 3 3 3"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
};

export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
}

export const colorIcons = { fern: 'leaf', clay: 'sun', lavender: 'moon', sky: 'water', honey: 'spark' };

export function garden(id = 'garden') {
  return `<svg class="garden" viewBox="0 0 320 240" fill="none" aria-hidden="true">
    <defs><pattern id="${id}-grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#526347" opacity=".1"/></pattern></defs>
    <circle cx="167" cy="118" r="94" fill="#ecefdf"/>
    <circle cx="236" cy="51" r="19" fill="#e5c781"/>
    <path d="M55 208c38-16 164-16 208 0" stroke="#b9c3a5" stroke-width="1.5"/>
    <path d="M164 203c5-44-8-86 8-149" stroke="#546e47" stroke-width="3" stroke-linecap="round"/>
    <path d="M165 165c-44 1-60-22-56-51 34-2 58 13 56 51Z" fill="#7d9265"/>
    <path d="M166 135c36 1 57-22 54-48-32 0-57 15-54 48Z" fill="#a4b387"/>
    <path d="M166 103c-30-1-42-19-39-40 26 1 44 14 39 40Z" fill="#496744"/>
    <path d="M171 77c25-1 42-18 37-41-24 1-38 18-37 41Z" fill="#849965"/>
    <path d="m164 166-39-37m43 4 37-32m-39 1-28-27m34 3 25-28" stroke="#f7f8ee" stroke-opacity=".5" stroke-linecap="round"/>
    <path d="M100 202c-1-21-5-35-12-48" stroke="#718658" stroke-width="2"/><path d="M95 180c-21 3-33-8-34-22 18-4 31 6 34 22Z" fill="#b0bb8f"/><path d="M94 177c-3-19 7-31 19-35 6 16-2 28-19 35Z" fill="#8c9e6f"/>
    <path d="M228 203c0-14 5-26 11-33" stroke="#718658" stroke-width="2"/><path d="M230 191c0-18 13-26 27-25-1 16-12 25-27 25Z" fill="#91a277"/>
    <path d="m71 85 3-7 3 7-3 7-3-7Zm181 46 3-7 3 7-3 7-3-7Z" fill="#b8ac78"/>
    <circle cx="86" cy="112" r="2" fill="#b8ac78"/><circle cx="235" cy="107" r="2" fill="#b8ac78"/>
    <rect x="52" y="22" width="219" height="187" fill="url(#${id}-grain)"/>
  </svg>`;
}
