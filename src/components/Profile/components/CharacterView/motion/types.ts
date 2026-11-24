export type AnimName = 'idle' | 'squat' | 'deadlift' | 'ohp';

export type AnimContext = {
  root: SVGGElement;
  barbellBack: SVGGElement;
  barbellFront: SVGGElement;
  wingL: SVGGElement | null;
  wingR: SVGGElement | null;
  legs: SVGGElement | null;
  toes: SVGGElement | null;
  flame: SVGGElement | null;
  feathers: SVGGElement | null;
  sweat: SVGGElement | null;
  t: number;
};
