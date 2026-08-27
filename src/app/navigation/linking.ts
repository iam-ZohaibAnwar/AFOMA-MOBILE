import type { LinkingOptions } from '@react-navigation/native';

import { env } from '../config/env';
import type { RootStackParamList } from './types';

const webPrefix = env.webUrl.replace(/\/$/, '');

export const rootLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['afoma://', ...(webPrefix ? [webPrefix] : [])],
  config: {
    screens: {
      GetPaid: {
        path: 'get-paid',
        parse: {
          token: String,
          commissionId: String,
        },
      },
      Shopping: {
        screens: {
          Payment: {
            path: 'checkout/paypal',
            parse: {
              token: String,
              PayerID: String,
              payerID: String,
              cancel: String,
            },
          },
          SellerShop: {
            path: 'shop/:slug',
            parse: {
              slug: String,
            },
          },
          MainTabs: {
            screens: {
              MarketplaceTab: 'marketplace',
              ShopTab: 'browse',
              CartTab: 'cart',
              AccountTab: 'account',
            },
          },
        },
      },
      Seller: {
        screens: {
          SellerDashboard: 'seller/dashboard',
        },
      },
    },
  },
};
