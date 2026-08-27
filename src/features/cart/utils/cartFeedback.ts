export interface FlyToCartPayload {
  imageUrl?: string;
  fromX: number;
  fromY: number;
}

type CartBadgeBumpListener = () => void;
type FlyToCartListener = (payload: FlyToCartPayload) => void;

const badgeBumpListeners = new Set<CartBadgeBumpListener>();
const flyToCartListeners = new Set<FlyToCartListener>();

let cartTabCenter: { x: number; y: number } | null = null;

export function registerCartTabCenter(center: { x: number; y: number } | null): void {
  cartTabCenter = center;
}

export function getCartTabCenter(): { x: number; y: number } | null {
  return cartTabCenter;
}

export function subscribeCartBadgeBump(listener: CartBadgeBumpListener): () => void {
  badgeBumpListeners.add(listener);
  return () => {
    badgeBumpListeners.delete(listener);
  };
}

export function notifyCartBadgeBump(): void {
  badgeBumpListeners.forEach((listener) => {
    listener();
  });
}

export function subscribeFlyToCart(listener: FlyToCartListener): () => void {
  flyToCartListeners.add(listener);
  return () => {
    flyToCartListeners.delete(listener);
  };
}

export function notifyFlyToCart(payload: FlyToCartPayload): void {
  flyToCartListeners.forEach((listener) => {
    listener(payload);
  });
}
