/**
 * Utility helper functions for Tailwind CSS
 */

/**
 * Merge multiple tailwind class strings
 * Filters out falsy values (false, null, undefined, empty strings)
 * 
 * @example
 * const className = mergeClasses('px-4 py-2', isActive && 'border-sky-500', customClass);
 */
export const mergeClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Conditionally add a class based on a boolean
 * 
 * @example
 * const className = classIf(isActive, 'border-sky-500', 'border-gray-200');
 */
export const classIf = (condition: boolean, trueClass: string, falseClass?: string): string => {
  return condition ? trueClass : (falseClass || '');
};

/**
 * Create a responsive class string
 * 
 * @example
 * const className = responsive('text-sm', 'md:text-base', 'lg:text-lg');
 */
export const responsive = (...classes: string[]): string => {
  return classes.join(' ');
};

/**
 * Combine transition classes with delay
 * 
 * @example
 * const className = withTransition('duration-200', 'ease-in-out');
 */
export const withTransition = (...transitionClasses: string[]): string => {
  return `transition ${transitionClasses.join(' ')}`;
};
