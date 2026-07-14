import { useRotatingIndex } from '../../hooks/useRotatingIndex';
import { GREETINGS } from './greetings';

/**
 * Returns a greeting that changes every time the Home screen gains focus
 * (first open, and each time you leave and come back), formatted as the chosen
 * greeting phrase, a line break, then the name (greeting + newline + name).
 */
export function useRotatingGreeting(name: string): string {
  const index = useRotatingIndex(GREETINGS);
  return `${GREETINGS[index]}\n${name}`;
}
