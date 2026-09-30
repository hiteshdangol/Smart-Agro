let toastId = 0;

export function showToast(message, type = 'success', duration = 3500) {
  if (!message) return;
  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: { id: ++toastId, message, type, duration },
    })
  );
}

export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  info: (message, duration) => showToast(message, 'info', duration),
};
