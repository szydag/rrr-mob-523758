import React, { useContext, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { HomeScreenProps, TaskContext, Task } from '../navigation/AppNavigator';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_COLOR = '#2563EB';
const SECONDARY_COLOR = '#F3F4F6';
const BG_COLOR = '#FFFFFF';

// --- Shared Components ---

const Header: React.FC<{ title: string; icon?: string; color: string }> = ({ title, icon, color }) => (
  <SafeAreaView style={{backgroundColor: BG_COLOR}} edges={['top']}>
    <View style={styles.headerContainer}>
      <Text style={[styles.headerTitle, { color }]}>{title}</Text>
      {icon && (
        <TouchableOpacity onPress={() => Alert.alert("Ayarlar", "Ayarlar menüsü henüz uygulanmadı.")}>
          <Icon name={icon} size={28} color={color} />
        </TouchableOpacity>
      )}
    </View>
  </SafeAreaView>
);

const SearchBar: React.FC<{ placeholder: string; onSearch: (term: string) => void }> = ({ placeholder, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Simple immediate search trigger
  const handleChange = (text: string) => {
    setSearchTerm(text);
    onSearch(text);
  };

  return (
    <View style={styles.searchBarContainer}>
      <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={searchTerm}
        onChangeText={handleChange}
      />
    </View>
  );
};

const TaskItem: React.FC<{ task: Task; onPress: () => void; onToggle: () => void }> = ({ task, onPress, onToggle }) => (
  <TouchableOpacity style={styles.taskItemContainer} onPress={onPress}>
    <TouchableOpacity onPress={onToggle} style={{ paddingRight: 10 }}>
      <Icon 
        name={task.completed ? "check-circle" : "radio-button-unchecked"} 
        size={24} 
        color={task.completed ? PRIMARY_COLOR : "#9CA3AF"} 
      />
    </TouchableOpacity>
    <View style={styles.taskItemText}>
      <Text 
        style={[
          styles.taskItemTitle, 
          task.completed && styles.taskItemCompleted,
          task.highPriority && styles.taskItemHighPriority
        ]}
        numberOfLines={1}
      >
        {task.title}
      </Text>
    </View>
  </TouchableOpacity>
);

const FAB: React.FC<{ label: string; color: string; onPress: () => void }> = ({ label, color, onPress }) => (
  <TouchableOpacity style={[styles.fab, { backgroundColor: color }]} onPress={onPress}>
    <Text style={styles.fabLabel}>{label}</Text>
  </TouchableOpacity>
);

// --- Screen Implementation ---

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const context = useContext(TaskContext);
  if (!context) return <ActivityIndicator style={{ flex: 1 }} size="large" color={PRIMARY_COLOR} />;

  const { tasks, fetchTasks, toggleTaskCompletion } = context;
  const [searchTerm, setSearchTerm] = useState('');

  // Refetch data when screen is focused (handles CRUD updates from other screens)
  useFocusEffect(
    useCallback(() => {
      fetchTasks(searchTerm);
    }, [fetchTasks, searchTerm])
  );
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchTasks(term);
  };

  const handleToggle = async (task: Task) => {
    await toggleTaskCompletion(task.id, task.completed);
  };

  const handleNavigateDetail = (task: Task) => {
    navigation.navigate('DetailTask', { taskId: task.id });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header 
        title="Yapılacaklar" 
        icon="settings" 
        color={PRIMARY_COLOR} 
      />

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <SearchBar 
          placeholder="Görev Ara..." 
          onSearch={handleSearch}
        />
      </View>

      {/* List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem 
            task={item} 
            onPress={() => handleNavigateDetail(item)}
            onToggle={() => handleToggle(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz bir görev yok. Yeni görev ekleyin!</Text>
          </View>
        )}
      />

      {/* FAB */}
      <FAB 
        label="+" 
        color={PRIMARY_COLOR} 
        onPress={() => navigation.navigate('AddTask')} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  // Header styles
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: SECONDARY_COLOR,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Search Bar styles
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
  },
  // List styles
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for FAB
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Task Item styles
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  taskItemText: {
    flex: 1,
    marginLeft: 8,
  },
  taskItemTitle: {
    fontSize: 18,
    color: '#1F2937',
  },
  taskItemCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  taskItemHighPriority: {
    fontWeight: 'bold',
    color: '#EF4444', 
  },
  // FAB styles
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabLabel: {
    fontSize: 30,
    color: 'white',
    lineHeight: 30,
  },
});

export default HomeScreen;