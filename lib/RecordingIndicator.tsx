import { useIsRecording } from '@livekit/components-react';
import * as React from 'react';
import styles from './RecordingIndicator.module.css';

export function RecordingIndicator() {
  const isRecording = useIsRecording();
  const [wasRecording, setWasRecording] = React.useState(false);

  React.useEffect(() => {
    if (isRecording !== wasRecording) {
      setWasRecording(isRecording);
      if (isRecording) {
        window.alert('This meeting is being recorded');
      }
    }
  }, [isRecording]);

  return (
    <div
      className={`${styles.recordingOverlay} ${isRecording ? styles.recording : ''}`}
    ></div>
  );
}
