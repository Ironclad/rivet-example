export function calculateExpression(expr: string): number | undefined {
  // Check if expression is safe to evaluate
  const isSafeExpression = /^[\d+\-*/\s().]+$/.test(expr);

  if (isSafeExpression) {
    try {
      // Evaluate and return the result
      return eval(expr);
    } catch (error) {
      console.error('Error evaluating expression:', error);
      return undefined;
    }
  } else {
    console.error('Unsafe expression detected');
    return undefined;
  }
}
