import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import guCommon from './locales/gu/common.json';
import hiCommon from './locales/hi/common.json';
import enCommon from './locales/en/common.json';
import guHome from './locales/gu/home.json';
import hiHome from './locales/hi/home.json';
import enHome from './locales/en/home.json';
import guLogin from './locales/gu/login.json';
import hiLogin from './locales/hi/login.json';
import enLogin from './locales/en/login.json';
import guDashboard from './locales/gu/dashboard.json';
import hiDashboard from './locales/hi/dashboard.json';
import enDashboard from './locales/en/dashboard.json';
import guShops from './locales/gu/shops.json';
import hiShops from './locales/hi/shops.json';
import enShops from './locales/en/shops.json';
import guGrahakKhata from './locales/gu/grahakKhata.json';
import hiGrahakKhata from './locales/hi/grahakKhata.json';
import enGrahakKhata from './locales/en/grahakKhata.json';
import guRunningKhata from './locales/gu/runningKhata.json';
import hiRunningKhata from './locales/hi/runningKhata.json';
import enRunningKhata from './locales/en/runningKhata.json';
import guPreorder from './locales/gu/preorder.json';
import hiPreorder from './locales/hi/preorder.json';
import enPreorder from './locales/en/preorder.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      gu: { common: guCommon, home: guHome, login: guLogin, dashboard: guDashboard, shops: guShops, grahakKhata: guGrahakKhata, runningKhata: guRunningKhata, preorder: guPreorder },
      hi: { common: hiCommon, home: hiHome, login: hiLogin, dashboard: hiDashboard, shops: hiShops, grahakKhata: hiGrahakKhata, runningKhata: hiRunningKhata, preorder: hiPreorder },
      en: { common: enCommon, home: enHome, login: enLogin, dashboard: enDashboard, shops: enShops, grahakKhata: enGrahakKhata, runningKhata: enRunningKhata, preorder: enPreorder },
    },
    lng: 'gu',
    fallbackLng: 'gu',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;