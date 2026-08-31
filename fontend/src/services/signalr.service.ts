import * as signalR from '@microsoft/signalr';

class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;

  public startConnection(hubUrl = '/hubs/depot') {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Hub Connected successfully'))
      .catch((err) => console.warn('SignalR Hub Connection Notice:', err));
  }

  public on(eventName: string, callback: (...args: any[]) => void) {
    if (this.hubConnection) {
      this.hubConnection.on(eventName, callback);
    }
  }

  public off(eventName: string, callback: (...args: any[]) => void) {
    if (this.hubConnection) {
      this.hubConnection.off(eventName, callback);
    }
  }

  public invoke(methodName: string, ...args: any[]) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke(methodName, ...args);
    }
    return Promise.resolve();
  }
}

export const signalRService = new SignalRService();
