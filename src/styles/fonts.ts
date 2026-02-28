import localFont from 'next/font/local';

export const Font = localFont({
  src: [
    {
      path: '../../public/fonts/Title_Light.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Title_Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Title_Bold.woff',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-title',
});
