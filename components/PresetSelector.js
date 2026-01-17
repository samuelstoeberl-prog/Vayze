import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal
} from 'react-native';
import { WEIGHT_PRESETS, getPresetRecommendationReason } from '../utils/decisionWeights';

export default function PresetSelector({ currentPreset, onSelectPreset, recommendedPreset }) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectPreset = (presetKey) => {
    onSelectPreset(presetKey);
    setModalVisible(false);
  };

  const currentPresetData = WEIGHT_PRESETS[currentPreset] || WEIGHT_PRESETS.balanced;

  return (
    <View>
      {}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.triggerIcon}>{currentPresetData.icon}</Text>
        <View style={styles.triggerContent}>
          <Text style={styles.triggerLabel}>Gewichtung</Text>
          <Text style={styles.triggerValue}>{currentPresetData.name}</Text>
        </View>
        <Text style={styles.triggerArrow}>›</Text>
      </TouchableOpacity>

      {}
      {recommendedPreset && recommendedPreset !== currentPreset && (
        <View style={styles.recommendationHint}>
          <Text style={styles.recommendationText}>
            💡 Empfohlen: <Text style={styles.recommendationBold}>
              {WEIGHT_PRESETS[recommendedPreset]?.name}
            </Text>
          </Text>
          <Text style={styles.recommendationReason}>
            {getPresetRecommendationReason(recommendedPreset)}
          </Text>
        </View>
      )}

      {}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gewichtung wählen</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {}
            <Text style={styles.modalInfo}>
              Jede Gewichtung fokussiert unterschiedliche Aspekte deiner Entscheidung.
            </Text>

            {}
            <ScrollView style={styles.presetList}>
              {Object.entries(WEIGHT_PRESETS).map(([key, preset]) => {
                const isSelected = key === currentPreset;
                const isRecommended = key === recommendedPreset;

                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.presetCard,
                      isSelected && styles.presetCardSelected
                    ]}
                    onPress={() => handleSelectPreset(key)}
                  >
                    <View style={styles.presetHeader}>
                      <Text style={styles.presetIcon}>{preset.icon}</Text>
                      <View style={styles.presetTitleContainer}>
                        <Text style={styles.presetName}>{preset.name}</Text>
                        {isRecommended && (
                          <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedBadgeText}>Empfohlen</Text>
                          </View>
                        )}
                      </View>
                      {isSelected && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.presetDescription}>{preset.description}</Text>

                    {}
                    <View style={styles.weightsPreview}>
                      {this._renderTopWeights(preset.weights)}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );

  function _renderTopWeights(weights) {
    const weightLabels = {
      intuition: 'Bauchgefühl',
      risk: 'Chancen/Risiken',
      consequences: 'Konsequenzen',
      values: 'Ziele & Werte',
      external: 'Außenmeinung',
      headHeart: 'Kopf vs Herz'
    };

    const sorted = Object.entries(weights)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return (
      <View style={styles.topWeights}>
        {sorted.map(([key, value]) => (
          <View key={key} style={styles.weightTag}>
            <Text style={styles.weightTagText}>
              {weightLabels[key]}: {value.toFixed(1)}x
            </Text>
          </View>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  triggerIcon: {
    fontSize: 28,
    marginRight: 12
  },
  triggerContent: {
    flex: 1
  },
  triggerLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2
  },
  triggerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  },
  triggerArrow: {
    fontSize: 24,
    color: '#64748b'
  },
  recommendationHint: {
    backgroundColor: '#1e293b',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  recommendationText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4
  },
  recommendationBold: {
    fontWeight: '700',
    color: '#3b82f6'
  },
  recommendationReason: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 40
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  modalClose: {
    fontSize: 28,
    color: '#64748b',
    fontWeight: '300'
  },
  modalInfo: {
    fontSize: 14,
    color: '#94a3b8',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8
  },
  presetList: {
    padding: 20
  },
  presetCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  presetCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a5f'
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  presetIcon: {
    fontSize: 32,
    marginRight: 12
  },
  presetTitleContainer: {
    flex: 1
  },
  presetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  recommendedBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase'
  },
  checkmark: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: 'bold'
  },
  presetDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12
  },
  weightsPreview: {
    marginTop: 8
  },
  topWeights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  weightTag: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  weightTagText: {
    fontSize: 12,
    color: '#64748b'
  }
});
