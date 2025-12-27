/**
 * Search Bar - Globale Suchleiste für Cards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useCardStore } from '../../store/cardStore';

export default function SearchBar() {
  const { filters, setFilters } = useCardStore();
  const [localQuery, setLocalQuery] = useState(filters.searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ searchQuery: localQuery });
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setFilters({ searchQuery: '' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search cards, tags, or descriptions..."
          placeholderTextColor="#94a3b8"
          value={localQuery}
          onChangeText={setLocalQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {localQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#64748b',
  },
});
