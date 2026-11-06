# Subtitle Processor

A web application that extracts audio from video files and generates subtitles using Amazon Polly. The app runs entirely in the browser using FFmpeg.wasm for video/audio processing.

## Language

**Video Upload**:
A user-provided video file (or URL) that is the input to the subtitle generation pipeline.
_Avoid_: Input video, source video, import

**Audio Track**:
A single audio stream extracted from a video. Videos may contain multiple audio tracks (e.g., different languages, commentary tracks).
_Avoid_: Audio stream, soundtrack

**Polly Synthesis**:
The process of calling Amazon Polly to convert text into synthesized speech, which is then transcribed to generate subtitles with timing information.
_Avoid_: TTS generation, speech generation, Polly call

**Subtitle Segment**:
A single subtitle entry containing text, start time, and end time. Segments are typically sentence-length.
_Avoid_: Cue, subtitle entry, subtitle item

**Subtitle Edit**:
The act of modifying subtitle text, timing, or both. Edits are persisted in the session and reflected in output.
_Avoid_: Correction, tweak, adjustment

**Export**:
The final generation of output files (SRT subtitle file and/or video with burned-in subtitles).
_Avoid_: Render, produce, generate (ambiguous)

**Session**:
The current user's working context, including loaded video, current subtitle segments, edits, and AWS credentials. Persisted in localStorage to survive page refreshes.
_Avoid_: Working set, project, workspace

**Waveform**:
The visual representation of the audio intensity over time, displayed alongside subtitles for precise timing adjustments.
_Avoid_: Audio graph, signal visualization

**Segmentation**:
The automatic division of speech into segments based on silence detection or natural pauses.
_Avoid_: Splitting, cutting, chunking
