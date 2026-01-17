import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

export default function MediaAttachments({
  photoUris = [],
  voiceMemoUri = null,
  voiceMemoDuration = null,
  onPhotosChange,
  onVoiceMemoChange,
  maxPhotos = 5
}) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Photo Picker
  const pickImage = async () => {
    if (photoUris.length >= maxPhotos) {
      Alert.alert(
        'Maximum erreicht',
        `Du kannst maximal ${maxPhotos} Fotos anhängen.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Berechtigung erforderlich',
        'Bitte erlaube den Zugriff auf deine Fotos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3]
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const newPhotoUris = [...photoUris, result.assets[0].uri];
      onPhotosChange(newPhotoUris);
    }
  };

  const takePhoto = async () => {
    if (photoUris.length >= maxPhotos) {
      Alert.alert(
        'Maximum erreicht',
        `Du kannst maximal ${maxPhotos} Fotos anhängen.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Berechtigung erforderlich',
        'Bitte erlaube den Zugriff auf deine Kamera.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const newPhotoUris = [...photoUris, result.assets[0].uri];
      onPhotosChange(newPhotoUris);
    }
  };

  const removePhoto = (index) => {
    const newPhotoUris = photoUris.filter((_, i) => i !== index);
    onPhotosChange(newPhotoUris);
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Foto hinzufügen',
      'Wähle eine Option',
      [
        { text: 'Aus Galerie wählen', onPress: pickImage },
        { text: 'Foto aufnehmen', onPress: takePhoto },
        { text: 'Abbrechen', style: 'cancel' }
      ]
    );
  };

  // Voice Memo Recording
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Berechtigung erforderlich',
          'Bitte erlaube den Zugriff auf dein Mikrofon.',
          [{ text: 'OK' }]
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Duration Timer
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      recording.interval = interval;

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Fehler', 'Aufnahme konnte nicht gestartet werden.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      clearInterval(recording.interval);
      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      onVoiceMemoChange({
        uri,
        duration: recordingDuration
      });

      setRecording(null);
      setRecordingDuration(0);

    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const deleteVoiceMemo = () => {
    Alert.alert(
      'Voice Memo löschen',
      'Möchtest du die Aufnahme wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => onVoiceMemoChange(null)
        }
      ]
    );
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medien anhängen (optional)</Text>

      {/* Photos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📷 Fotos</Text>
          <Text style={styles.sectionSubtitle}>
            {photoUris.length}/{maxPhotos}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.photosContainer}>
            {photoUris.map((uri, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}

            {photoUris.length < maxPhotos && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={showPhotoOptions}
              >
                <Text style={styles.addPhotoIcon}>+</Text>
                <Text style={styles.addPhotoText}>Foto</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Voice Memo */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎤 Voice Memo</Text>
        </View>

        {!voiceMemoUri && !isRecording && (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={startRecording}
          >
            <View style={styles.recordIconContainer}>
              <View style={styles.recordIcon} />
            </View>
            <Text style={styles.recordButtonText}>Aufnahme starten</Text>
          </TouchableOpacity>
        )}

        {isRecording && (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Aufnahme läuft...</Text>
            </View>
            <Text style={styles.recordingDuration}>
              {formatDuration(recordingDuration)}
            </Text>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopRecording}
            >
              <Text style={styles.stopButtonText}>Stopp</Text>
            </TouchableOpacity>
          </View>
        )}

        {voiceMemoUri && !isRecording && (
          <View style={styles.voiceMemoContainer}>
            <View style={styles.voiceMemoInfo}>
              <Text style={styles.voiceMemoIcon}>🎵</Text>
              <View>
                <Text style={styles.voiceMemoLabel}>Voice Memo</Text>
                <Text style={styles.voiceMemoDuration}>
                  {formatDuration(voiceMemoDuration || 0)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteVoiceMemoButton}
              onPress={deleteVoiceMemo}
            >
              <Text style={styles.deleteVoiceMemoText}>Löschen</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.hint}>
        💡 Fotos und Voice Memos helfen dir später, dich besser an deine Gedanken zu erinnern
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16
  },
  section: {
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9ca3af'
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 12
  },
  photoWrapper: {
    position: 'relative'
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addPhotoIcon: {
    fontSize: 32,
    color: '#9ca3af',
    marginBottom: 4
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6b7280'
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  recordIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#ef4444',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  recordIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151'
  },
  recordingContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  recordingDot: {
    width: 12,
    height: 12,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    marginRight: 8
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b'
  },
  recordingDuration: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#991b1b',
    textAlign: 'center',
    marginBottom: 12
  },
  stopButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  voiceMemoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  voiceMemoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  voiceMemoIcon: {
    fontSize: 32
  },
  voiceMemoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  voiceMemoDuration: {
    fontSize: 12,
    color: '#6b7280'
  },
  deleteVoiceMemoButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  deleteVoiceMemoText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500'
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    marginTop: 8
  }
});
