/// <reference lib="webworker" />

import { ReplayParser } from '../../../parser/replay';

addEventListener('message', ({data}) => {
  const fileReader = new FileReader();
  fileReader.onload = (event) => {
    const replayParser = new ReplayParser();
    const replay = replayParser.parse(event.target.result as ArrayBuffer);
    postMessage(replay);
  };
  fileReader.readAsArrayBuffer(data);
});
