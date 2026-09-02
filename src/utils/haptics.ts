export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' = 'light'): void {
  try {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(15);
          break;
        case 'medium':
          navigator.vibrate(30);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([20, 40, 20]);
          break;
      }
    }
  } catch (err) {
    console.debug('Haptics notice:', err);
  }
}
