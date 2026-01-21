import React, { useContext, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DetailTaskScreenProps, TaskContext } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const PRIMARY_COLOR = '#2563EB';
const DANGER_COLOR = '#EF4444';
const BG_COLOR = '#FFFFFF';
const SECONDARY_COLOR = '#F3F4F6';

// --- Shared Components ---

const DetailHeader: React.FC<{
  title: string;
  color: string;
  backButton: boolean;
  navigation: any;
  rightIcon?: string;
  onRightIconPress: () => void;
}> = ({ title, color, backButton, navigation, rightIcon, onRightIconPress }) => (
  <SafeAreaView style={[stylesDetail.headerContainer, { backgroundColor: BG_COLOR }]} edges={['top']}>
    <View style={stylesDetail.headerInner}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {backButton && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 10 }}>
            <Icon name="arrow-back" size={24} color={color} />
          </TouchableOpacity>
        )}
        <Text style={[stylesDetail.headerTitle, { color }]}>{title}</Text>
      </View>
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress}>
          <Icon name={rightIcon} size={24} color={color} />
        </TouchableOpacity>
      )}
    </View>
  </SafeAreaView>
);

const DetailText: React.FC<{ style: 'h1' | 'body'; value: string; padding: number }> = ({ style, value, padding }) => (
  <View style={{ padding: padding }}>
    <Text style={style === 'h1' ? stylesDetail.h1 : stylesDetail.body}>
      {value}
    </Text>
  </View>
);

const StatusIndicator: React.FC<{ label: string; color: string; checked: boolean }> = ({ label, color, checked }) => (
  <View style={[stylesDetail.statusContainer, { borderColor: checked ? color : '#9CA3AF' }]}>
    <Icon 
        name={checked ? "check-circle" : "timelapse"} 
        size={20} 
        color={checked ? color : '#9CA3AF'} 
        style={{ marginRight: 8 }}
    />
    <Text style={[stylesDetail.statusLabel, { color: checked ? color : '#9CA3AF' }]}>
      {label}
    </Text>
  </View>
);

const DeleteButton: React.FC<{ label: string; color: string; onPress: () => void; fullWidth: boolean }> = ({ label, color, onPress }) => (
    <TouchableOpacity 
      style={[stylesDetail.button, { backgroundColor: color }, stylesDetail.fullWidthButton]} 
      onPress={onPress}
    >
      <Text style={stylesDetail.buttonLabel}>{label}</Text>
    </TouchableOpacity>
);

// --- Screen Implementation ---

const DetailTaskScreen: React.FC<DetailTaskScreenProps> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const context = useContext(TaskContext);
  const [task, setTask] = useState(context?.getTaskById(taskId));
  
  if (!context) return <ActivityIndicator style={{ flex: 1 }} size="large" color={PRIMARY_COLOR} />;

  // Refetch task state every time the screen is focused
  useFocusEffect(
    useCallback(() => {
        const currentTask = context.getTaskById(taskId);
        if (currentTask) {
            setTask(currentTask);
        } else {
            // Task was deleted externally
            navigation.goBack(); 
        }
    }, [context.tasks, taskId, navigation])
  );

  const handleDelete = () => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi kalıcı olarak silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: async () => {
          const success = await context.deleteTask(taskId);
          if (success) {
            navigation.goBack();
          } else {
            Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
          }
        }},
      ]
    );
  };

  const handleEdit = () => {
    // Implementation note: This would navigate to an Edit screen pre-filled with task data.
    Alert.alert('Düzenleme', 'Düzenleme özelliği henüz uygulanmadı.');
  };

  if (!task) {
    return (
        <View style={stylesDetail.container}>
            <DetailHeader 
                title="Görev Bulunamadı" 
                color={PRIMARY_COLOR} 
                backButton={true} 
                navigation={navigation}
                onRightIconPress={() => {}}
            />
            <View style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={stylesDetail.body}>Görev detayları yüklenemedi veya görev silinmiş.</Text>
            </View>
        </View>
    );
  }

  return (
    <View style={stylesDetail.container}>
      {/* Header */}
      <DetailHeader 
        title="Görev Detayı" 
        color={PRIMARY_COLOR} 
        backButton={true} 
        navigation={navigation}
        rightIcon="edit"
        onRightIconPress={handleEdit}
      />

      <View style={{ flex: 1, paddingBottom: 16 }}>
        {/* Title */}
        <DetailText 
          style="h1" 
          value={task.title} 
          padding={16} 
        />

        {/* Description */}
        <DetailText 
          style="body" 
          value={task.description || "Açıklama girilmemiştir."} 
          padding={16} 
        />

        {/* Status Indicators */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
            <StatusIndicator 
                label={task.completed ? "Tamamlandı" : "Beklemede"}
                color={PRIMARY_COLOR}
                checked={task.completed}
            />
        </View>
        {task.highPriority && (
            <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
                <StatusIndicator 
                    label={"Yüksek Öncelik"}
                    color={DANGER_COLOR}
                    checked={true}
                />
            </View>
        )}
      </View>

      {/* Delete Button */}
      <View style={{ padding: 16 }}>
        <DeleteButton 
          label="Görevi Sil" 
          color={DANGER_COLOR} 
          fullWidth={true} 
          onPress={handleDelete}
        />
      </View>
    </View>
  );
};

const stylesDetail = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  // Header styles
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: SECONDARY_COLOR,
  },
  headerInner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Text styles
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: SECONDARY_COLOR,
    paddingBottom: 10,
    marginBottom: 6, 
  },
  body: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  // Status styles
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Button styles
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullWidthButton: {
    // Defined by parent view padding
  }
});

export default DetailTaskScreen;