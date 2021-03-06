import * as StompJS from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import {BehaviorSubject} from 'rxjs';

export class SocketService {

  public socketConnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private stompClient: StompJS.Client | undefined;
  // private serverUrl = `${environment.wsBaseUrl}`;

  public isSocketConnected = false;
  // public callback : Function = () => {};
  constructor(private serverUrl: string, private callback: Function) {
    // this.callback = callback;
    this.init();
  }


  private init() {

    if (this.stompClient) {
      return;
    }
    console.log('SOCKET SERVICE:: Going to start the socket');
    this.stompClient = new StompJS.Client({
      brokerURL: this.serverUrl,
      debug: (str) => {
        console.log(str);
      },
      webSocketFactory: () => {
        return new SockJS(this.serverUrl);
      },
      logRawCommunication: true,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.stompClient.onConnect = (data: any) => {
      console.log(`Socket Connected Successfully`);
      this.isSocketConnected = true;
      this.socketConnected.next(true);
      // Do something, all subscribes must be done is this callback
      // This is needed because this will be executed after a (re)connect
    };

    this.stompClient.onStompError = (frame: { headers: any, body: any }) => {
      // Will be invoked in case of error encountered at Broker
      // Bad login/passcode typically will cause an error
      // Complaint brokers will set `message` header with a brief message. Body may contain details.
      // Compliant brokers will terminate the connection after any error
      console.log('Broker reported error: ' + frame.headers['message']);
      console.log('Additional details: ' + frame.body);
    };

    this.stompClient.debug = (str: string) => {
      this.callback(str);
    }

    this.stompClient.activate();
  }

  async subscribe(channelName: string) {
    return await this.stompClient?.subscribe(channelName, this.formatMessage);
  }

  formatMessage(data:any){
    this.callback(JSON.stringify(data))
  }

  async send(channelName:string, message:string){
    return await this.stompClient?.publish({destination: channelName, body: message});
  }

  unsubscribe(channelName: string) {
    this.stompClient?.unsubscribe(channelName);
  }
}
