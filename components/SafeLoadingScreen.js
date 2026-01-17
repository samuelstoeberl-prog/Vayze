import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const SafeLoadingScreen = ({
  message = 'Loading...',
  timeout = 10000, 
  onTimeout,
  onManualEscape,
  showEscapeAfter = 5000, 
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [showEscape, setShowEscape] = useState(false);

  useEffect(() => {
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - startTime;
      setElapsed(elapsedTime);

      if (elapsedTime >= showEscapeAfter) {
        setShowEscape(true);
      }

      if (elapsedTime >= timeout) {
        clearInterval(interval);
        
        onTimeout?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timeout, showEscapeAfter, onTimeout]);

  const progress = Math.min((elapsed / timeout) * 100, 100);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {}
      <ActivityIndicator size="large" color="#3b82f6" />

      {}
      <Text style={styles.message}>{message}</Text>

      {}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {}
      <Text style={styles.timer}>
        {(elapsed / 1000).toFixed(1)}s / {(timeout / 1000).toFixed(0)}s
      </Text>

      {}
      {showEscape && (
        <TouchableOpacity
          style={styles.escapeButton}
          onPress={() => {
                        onManualEscape?.();
          }}
        >
          <Text style={styles.escapeButtonText}>⚠️ Taking too long?</Text>
          <Text style={styles.escapeButtonSubtext}>Tap to skip</Text>
        </TouchableOpacity>
      )}

      {}
      {(
        <TouchableOpacity
          style={styles.devButton}
          onPress={() => {
                        onManualEscape?.();
          }}
        >
          <Text style={styles.devButtonText}>🚨 DEV: FORCE EXIT</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '80%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  timer: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
  },
  escapeButton: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
    alignItems: 'center',
  },
  escapeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  escapeButtonSubtext: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 4,
  },
  devButton: {
    position: 'absolute',
    bottom: 40,
    padding: 16,
    backgroundColor: '#ef4444',
    borderRadius: 12,
  },
  devButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SafeLoadingScreen;
