import { useDepot } from '../context/DepotContext';

export const useNotification = () => {
  const { showToast, removeToast, toasts } = useDepot();

  return {
    toasts,
    success: (msg: string, title?: string) => showToast(msg, 'success', title),
    error: (msg: string, title?: string) => showToast(msg, 'error', title),
    info: (msg: string, title?: string) => showToast(msg, 'info', title),
    removeToast,
  };
};
