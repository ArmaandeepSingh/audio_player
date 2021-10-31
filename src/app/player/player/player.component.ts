import { Component, OnInit } from '@angular/core';
import { audioStream } from 'src/app/modals/audio-stream.interface';
import { CloudServiceService } from 'src/app/services/cloud-service.service';
import { AudioServiceService } from 'src/app/services/audio-service.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  files: any[] = [];
  state: audioStream = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canplay: false,
    error: false,
  };
  currentFile: any = {};

  constructor(private AS: AudioServiceService, private CS: CloudServiceService) { 

    CS.getFiles().subscribe(files => {
      this.files = files;
    })
  
    this.AS.getState().subscribe(state => {
      this.state = state;
    })
  
  }

  ngOnInit(): void { }

  playStream(url: string) {
    this.AS.playStream(url).subscribe();
  } 

  openFile(file: any, index: number) {
    this.currentFile = {index, file};
    this.AS.stop_audio();
    this.playStream(file.url);
  }

  pause() {
    this.AS.pause_audio();
  }
  
  play() {
    this.AS.play_audio();
  }
  
  stop() {
    this.AS.pause_audio();
  }

  next() {
    const index = this.currentFile.index + 1;
    const file = this.files[index];
    this.openFile(file, index);
    console.log("next");
  }

  previous() {
    const index = this.currentFile.length - 1;
    const file = this.files[index];
    this.openFile(file, index);
    console.log("previous");
  }

  isFirstPlaying() {
    return this.currentFile.index === 0;
  }

  isLastPlaying() {
    return this.currentFile.index === this.files.length - 1;
  }

  onSliderChangeEvent(change: any) {
    this.AS.seekTo_audio(change.value);
  }

}