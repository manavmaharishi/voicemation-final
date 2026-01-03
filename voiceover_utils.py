# voiceover_utils.py

import os
import subprocess
from gtts import gTTS
import tempfile
from mutagen.mp3 import MP3


def generate_voiceover(text):
    """
    Convert input text to speech using gTTS and save as MP3.
    Returns path to the saved file.
    """
    tts = gTTS(text)
    temp_audio_path = os.path.join(tempfile.gettempdir(), "voiceover.mp3")
    tts.save(temp_audio_path)
    print(f"🔊 Voiceover saved to: {temp_audio_path}")
    return temp_audio_path


def generate_srt_file(text, audio_duration):
    """
    Generate SRT subtitle file from text with timing based on audio duration.
    Returns path to the SRT file.
    """
    try:
        # Split text into sentences for better subtitle chunking
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        
        if not sentences:
            return None
        
        # Calculate timing per sentence
        time_per_sentence = audio_duration / len(sentences)
        
        # Create SRT file
        srt_path = os.path.join(tempfile.gettempdir(), "subtitles.srt")
        
        with open(srt_path, 'w', encoding='utf-8') as f:
            current_time = 0.0
            for i, sentence in enumerate(sentences, 1):
                if not sentence.strip():
                    continue
                    
                start_time = current_time
                end_time = current_time + time_per_sentence
                
                # Format timestamps as SRT format (HH:MM:SS,mmm)
                start_str = format_srt_time(start_time)
                end_str = format_srt_time(end_time)
                
                # Write SRT entry
                f.write(f"{i}\n")
                f.write(f"{start_str} --> {end_str}\n")
                f.write(f"{sentence.strip()}\n\n")
                
                current_time = end_time
        
        print(f"📝 Subtitles saved to: {srt_path}")
        return srt_path
        
    except Exception as e:
        print(f"⚠️ Subtitle generation failed: {e}")
        return None


def format_srt_time(seconds):
    """Convert seconds to SRT time format (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def add_voiceover_to_video(video_path, audio_path, add_subtitles=False, subtitle_text=None):
    """
    Use ffmpeg to merge video and audio into a new output file.
    Ensures video matches the length of the narration:
      - If audio is longer → video loops until narration ends
      - If video is longer → video trims to narration length
    
    Args:
        video_path: Path to the video file
        audio_path: Path to the audio file
        add_subtitles: Whether to add subtitles (default: False)
        subtitle_text: Text for subtitles (required if add_subtitles=True)
    
    Returns path to the final merged video.
    """
    if not os.path.exists(video_path):
        print(f"❌ Video not found at: {video_path}")
        return None

    output_path = video_path.replace(".mp4", "_vo.mp4")
    
    # Get audio duration for subtitle timing
    srt_path = None
    if add_subtitles and subtitle_text:
        try:
            audio = MP3(audio_path)
            audio_duration = audio.info.length
            srt_path = generate_srt_file(subtitle_text, audio_duration)
        except Exception as e:
            print(f"⚠️ Could not generate subtitles: {e}")
            srt_path = None

    # Base ffmpeg command
    command = [
        "ffmpeg",
        "-y",  # Overwrite without asking
        "-stream_loop", "-1",  # Loop video if shorter than audio
        "-i", video_path,
        "-i", audio_path,
    ]
    
    # Add subtitle filter if available
    if srt_path and os.path.exists(srt_path):
        # Escape path for ffmpeg subtitle filter
        srt_path_escaped = srt_path.replace('\\', '/').replace(':', '\\:')
        command.extend([
            "-vf", f"subtitles={srt_path_escaped}:force_style='FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BackColour=&H80000000&,Bold=1,Alignment=2,MarginV=20'",
        ])
    
    command.extend([
        "-c:v", "libx264",      # Re-encode video for compatibility
        "-tune", "animation",   # Optimize for animation
        "-c:a", "aac",          # Encode audio in AAC
        "-shortest",            # Trim longer stream to match shorter
        output_path
    ])

    try:
        subtitle_status = " with subtitles" if srt_path else ""
        print(f"🎞️ Merging video and voiceover{subtitle_status} using ffmpeg...")
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"✅ Final video with voiceover saved at: {output_path}")
        
        # Clean up subtitle file
        if srt_path and os.path.exists(srt_path):
            try:
                os.remove(srt_path)
            except:
                pass
                
        return output_path
    except subprocess.CalledProcessError as e:
        print(f"❌ ffmpeg failed: {e}")
        print(f"Error output: {e.stderr}")
        return None
