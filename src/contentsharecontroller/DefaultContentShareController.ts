// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AudioVideoController from '../audiovideocontroller/AudioVideoController';
import MeetingSessionCredentials from '../meetingsession/MeetingSessionCredentials';
import ContentShareConstants from './ContentShareConstants';
import ContentShareController from './ContentShareController';
import ContentShareMediaStreamBroker from "./ContentShareMediaStreamBroker";
import MeetingSessionConfiguration from "../meetingsession/MeetingSessionConfiguration";

export default class DefaultContentShareController
  implements ContentShareController {

  static createContentShareMeetingSessionConfigure(configuration: MeetingSessionConfiguration):
    MeetingSessionConfiguration {
    let contentShareConfiguration = new MeetingSessionConfiguration();
    contentShareConfiguration.meetingId = configuration.meetingId;
    contentShareConfiguration.urls = configuration.urls;
    contentShareConfiguration.credentials = new MeetingSessionCredentials();
    contentShareConfiguration.credentials.attendeeId =
      configuration.credentials.attendeeId + ContentShareConstants.Modality;
    contentShareConfiguration.credentials.joinToken =
      configuration.credentials.joinToken + ContentShareConstants.Modality;
    return contentShareConfiguration;
  }

  constructor(private mediaStreamBroker: ContentShareMediaStreamBroker,
              private audioVideo: AudioVideoController) {}

  async startContentShare(stream: MediaStream): Promise<void> {
    this.mediaStreamBroker.mediaStream = stream;
    this.audioVideo.start();
    if (this.mediaStreamBroker.mediaStream.getVideoTracks().length > 0) {
      this.audioVideo.videoTileController.startLocalVideoTile();
    }
  }

  async startContentShareFromScreenCapture(sourceId?: string): Promise<void> {
    let mediaStream = await this.mediaStreamBroker.acquireScreenCaptureDisplayInputStream(sourceId);
    this.startContentShare(mediaStream);
  }

  pauseContentShare(): void {
    this.mediaStreamBroker.toggleMediaStream(false);
  }

  unpauseContentShare(): void {
    this.mediaStreamBroker.toggleMediaStream(true);
  }

  stopContentShare(): void {
    this.audioVideo.stop();
    this.mediaStreamBroker.cleanup();
  }
}
