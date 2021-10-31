import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as moment from "moment";
import { audioStream } from "../modals/audio-stream.interface";

@Injectable({
  providedIn: 'root'
})
export class AudioServiceService {
  private stop = new Subject();
  private audioObj = new Audio();
  audioEvents = [
    "ended",
    "error",
    "play",
    "playing",
    "pause",
    "timeupdate",
    "canplay",
    "loadedmetadata",
    "loadstart"
  ];
  private state: audioStream = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canplay: false,
    error: false,
  };
  private stateChange: BehaviorSubject<audioStream> = new BehaviorSubject(this.state);

  constructor() {}

  private streamObservable(url: string) {
    return new Observable(observer => {
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      const handler = (event: Event) => {
        this.updateStateChanges(event);
        observer.next(event);
      };

      this.addEvents(this.audioObj, this.audioEvents, handler);

      return() => {
        this.audioObj.pause();
        this.audioObj.currentTime = 0;

        this.removeEvents(this.audioObj, this.audioEvents, handler);

        this.resetState();
      }
      
    });
  }

  private addEvents(obj:any , events:any , handler:any ) {
    events.forEach((event) => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj:any, events:any, handler:any) {
    events.forEach((event) => {
      obj.removeEventListener(event, handler);
    });
  }

  playStream(url: string) {
    return this.streamObservable(url).pipe(takeUntil(this.stop));
  }

  play_audio() {
    this.audioObj.play();
  }

  pause_audio() {
    this.audioObj.pause();
  }

  stop_audio() {
    this.stop.next();
  }

  seekTo_audio(seconds: number) {
    this.audioObj.currentTime = seconds;
  }

  formatTime(time: number, format: string = "hh:mm:ss") {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }

  private resetState() {
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false
    };
  }

  private updateStateChanges(event: Event): void {
    switch(event.type) {
      case "canplay" :
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;
      case "playing":
        this.state.playing = true;
        break;
      case "pause":
        this.state.playing = false;
        break;
      case "timeupdate":
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
        break;
      case "error": 
        this.resetState();
        this.state.error = true;
        break;
    }
    this.stateChange.next(this.state);  
  }

  getState(): Observable<audioStream> {
    return this.stateChange.asObservable();
  }

}