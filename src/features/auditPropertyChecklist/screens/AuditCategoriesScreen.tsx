import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import initialAuditData from '../../../assets/data.json';
import { AppStackParamList } from '../../../navigation/AppNavigator';

// Define the structure for a single category item for the list
interface AuditCategoryListItem {
  id: string;
  name: string;
}

// Define the expected structure of our imported JSON data
interface FullAuditData {
  auditCategories: Array<{
    id: string;
    name: string;
    sections: Array<any>;
  }>;
}

// Define the navigation prop type for this specific screen
type AuditCategoriesScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'AuditCategories' // Current screen's name in the param list
>;

// Props for the screen component
type AuditCategoriesScreenProps = {
  navigation: AuditCategoriesScreenNavigationProp; // <<< USE THE TYPED PROP
};

const AuditCategoriesScreen = ({ navigation }: AuditCategoriesScreenProps) => {
  const [categories, setCategories] = useState<AuditCategoryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedCategories = (initialAuditData as FullAuditData).auditCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
    }));
    setCategories(loadedCategories);
    setIsLoading(false);
  }, []);

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    // <<< ACTUAL NAVIGATION CALL >>>
    navigation.navigate('AuditChecklistMain', { categoryId, categoryName });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const renderCategoryItem = ({ item }: { item: AuditCategoryListItem }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item.id, item.name)}
    >
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.arrow}>&gt;</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitleText}>Audit Categories</Text>
      </View>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenHeader: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  screenTitleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingVertical: 8,
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#444',
  },
  arrow: {
    fontSize: 18,
    color: '#007AFF',
  },
});

export default AuditCategoriesScreen;