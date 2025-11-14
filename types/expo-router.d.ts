import 'expo-router';

declare module 'expo-router' {
  export interface ExpoRouterRoutes {
    '/': undefined;
    '/register': undefined;
    '/main': undefined;
  }
}

// Для Link компонента
declare module 'expo-router/build/link/Link' {
  import { Href } from 'expo-router';
  
  export interface LinkProps<T extends keyof import('expo-router').ExpoRouterRoutes> {
    href: T | Href<T>;
    replace?: boolean;
    push?: boolean;
    asChild?: boolean;
  }
}