import React, { useState, useEffect, createContext, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import DetailTaskScreen from '../screens/DetailTaskScreen';
import axios from 'axios';
import { Alert } from 'react-native';

// --- Configuration ---
// Change this IP to your machine's local IP or backend service URL if not using a default emulator setup.
const API_URL = 'http://10.0.2.2:3000/api/tasks'; 

// --- Types ---
export type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  highPriority: boolean;
};

export type RootStackParamList = {
  Home: undefined;
  AddTask: undefined;
  DetailTask: { taskId: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AddTaskScreenProps = NativeStackScreenProps<RootStackParamList, 'AddTask'>;
export type DetailTaskScreenProps = NativeStackScreenProps<RootStackParamList, 'DetailTask'>;

// --- Context ---
type TaskContextType = {
  tasks: Task[];
  fetchTasks: (searchQuery?: string) => Promise<void>;
  addTask: (title: string, description: string, highPriority: boolean) => Promise<boolean>;
  toggleTaskCompletion: (taskId: string, currentStatus: boolean) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  getTaskById: (taskId: string) => Task | undefined;
};

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

// --- Component ---
const Stack = createNativeStackNavigator<RootStackParamList>();

const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async (searchQuery = '') => {
    try {
      const response = await axios.get(API_URL, {
        params: searchQuery ? { search: searchQuery } : {}
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      Alert.alert("Bağlantı Hatası", "Görevler yüklenemedi. Sunucunun çalıştığından emin olun.");
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title: string, description: string, highPriority: boolean): Promise<boolean> => {
    try {
      await axios.post(API_URL, { title, description, highPriority });
      await fetchTasks();
      return true;
    } catch (error) {
      console.error("Failed to add task", error);
      return false;
    }
  };
  
  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean): Promise<boolean> => {
    try {
      await axios.put(`${API_URL}/${taskId}`, { completed: !currentStatus });
      await fetchTasks();
      return true;
    } catch (error) {
      console.error("Failed to update task status", error);
      return false;
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/${taskId}`);
      await fetchTasks();
      return true;
    } catch (error) {
      console.error("Failed to delete task", error);
      return false;
    }
  };

  const getTaskById = (taskId: string) => {
    return tasks.find(t => t.id === taskId);
  }

  return (
    <TaskContext.Provider value={{ tasks, fetchTasks, addTask, toggleTaskCompletion, deleteTask, getTaskById }}>
      {children}
    </TaskContext.Provider>
  );
};


const AppNavigator: React.FC = () => {
  return (
    <TaskProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddTask" component={AddTaskScreen} />
          <Stack.Screen name="DetailTask" component={DetailTaskScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </TaskProvider>
  );
};

export default AppNavigator;