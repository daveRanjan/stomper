import { Component } from '@angular/core';
import {SocketService} from "../service/SocketService";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'stomper';
  serverUrl = "";
  message = "";
  messages = "";
  subscriptions: string = "";
  private socketService: SocketService | undefined;

  public AppComponent(){
  }

  connectToServer() {
    console.log("Going to connect to serverUrl: ", this.serverUrl);
    if(!this.serverUrl){
      alert("Invalid server url");
    }

    this.socketService = new SocketService(this.serverUrl, this.callbackWriteToMessages);

  }

  async subscribeToChannels() {
    const waade = [];
    for (const subscription of this.subscriptions.split(",")){
        waade.push(this.socketService?.subscribe(subscription));
    }
    await Promise.all(waade);
  }

  callbackWriteToMessages = (message:any) => {
    this.messages+="\n"+message;
  }
}
