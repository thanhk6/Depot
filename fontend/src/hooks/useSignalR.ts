import { useEffect } from 'react';
import { signalRService } from '../services/signalr.service';

export const useSignalR = (eventName?: string, callback?: (...args: any[]) => void) => {
  useEffect(() => {
    signalRService.startConnection();

    if (eventName && callback) {
      signalRService.on(eventName, callback);
      return () => {
        signalRService.off(eventName, callback);
      };
    }
  }, [eventName, callback]);

  return {
    invoke: (methodName: string, ...args: any[]) => signalRService.invoke(methodName, ...args),
  };
};
