if (typeof WebSocket !== 'undefined') {
  try {
    const ws = new WebSocket('ws://localhost:5173');
    
    if (ws && typeof ws.addEventListener === 'function') {
      ws.addEventListener('open', () => {
        console.log('WebSocket opened');
      });
    } else {
      console.warn('WebSocket unsupported or missing');
    }
  } catch (error) {
    console.error('Error creating WebSocket:', error);
  }
} else {
  console.warn('WebSocket not available in this context');
}