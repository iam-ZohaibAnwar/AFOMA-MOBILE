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
          MainTabs: {
            screens: {
              MarketplaceTab: 'marketplace',
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
