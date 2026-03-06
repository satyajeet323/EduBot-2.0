import sounddevice as sd
import numpy as np
import matplotlib.pyplot as plt
from scipy.io.wavfile import write
import librosa
import librosa.display

# Recording settings
duration = 5  # seconds
fs = 16000    # Sample rate

print("🎤 Recording... Speak now!")
recording = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='float32')
sd.wait()
print("✅ Recording finished!")

# Save to WAV file
write("your_voice.wav", fs, recording)

# Load audio
y, sr = librosa.load("your_voice.wav", sr=fs)

# Plot spectrogram
plt.figure(figsize=(12, 6))
S = librosa.stft(y)
S_db = librosa.amplitude_to_db(np.abs(S), ref=np.max)
librosa.display.specshow(S_db, sr=sr, x_axis='time', y_axis='hz', cmap='magma')

plt.colorbar(format="%+2.0f dB")
plt.title("Spectrogram of Your Voice")
plt.show()
