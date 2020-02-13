// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import MediaStreamBroker from "../mediastreambroker/MediaStreamBroker";
import DefaultDeviceController from "../devicecontroller/DefaultDeviceController";
import AudioVideoController from "../audiovideocontroller/AudioVideoController";
import Logger from "../logger/Logger";

export default class ContentShareMediaStreamBroker implements MediaStreamBroker {
  private _mediaStream: MediaStream;

  constructor(private logger: Logger) {}

  get mediaStream(): MediaStream {
    return this._mediaStream;
  }

  set mediaStream(mediaStream: MediaStream) {
    this._mediaStream = mediaStream;
  }

  async acquireAudioInputStream(): Promise<MediaStream> {
    if (this._mediaStream.getAudioTracks().length === 0) {
      return DefaultDeviceController.synthesizeAudioDevice(0) as MediaStream;
    }
    return this._mediaStream;
  }

  async acquireVideoInputStream(): Promise<MediaStream> {
    return this._mediaStream;
  }

  releaseMediaStream(mediaStreamToRelease: MediaStream): void {
    this.logger.warn('release media stream called');
    return;
  }

  async acquireDisplayInputStream(streamConstraints: MediaStreamConstraints): Promise<MediaStream> {
    if (
      streamConstraints &&
      streamConstraints.video &&
      // @ts-ignore
      streamConstraints.video.mandatory &&
      // @ts-ignore
      streamConstraints.video.mandatory.chromeMediaSource &&
      // @ts-ignore
      streamConstraints.video.mandatory.chromeMediaSourceId
    ) {
      return navigator.mediaDevices.getUserMedia(streamConstraints);
    }
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/31821
    return navigator.mediaDevices.getDisplayMedia(streamConstraints);
  }

  bindToAudioVideoController(audioVideoController: AudioVideoController): void {
    throw new Error('unsupported');
  }

  async acquireScreenCaptureDisplayInputStream(sourceId?: string): Promise<MediaStream> {
    return this.acquireDisplayInputStream(
      this.screenCaptureDisplayMediaConstraints(sourceId));
  }

  private screenCaptureDisplayMediaConstraints(sourceId?: string): MediaStreamConstraints {
    return {
      audio: false,
      video: {
        ...(!sourceId && {
          frameRate: {
            max: 3,
          },
        }),
        ...(sourceId && {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            maxFrameRate: 3,
          },
        }),
      },
    };
  }

  toggleMediaStream(enable: boolean) {
    if (this.mediaStream !== null && this.mediaStream.getTracks().length > 0) {
      this.mediaStream.getTracks()[0].enabled = enable;
    }
  }

  cleanup(){
    if (this.mediaStream && this.mediaStream.getTracks().length > 0) {
      this.mediaStream.getTracks()[0].stop();
    }
    this.mediaStream = null;
  }
}