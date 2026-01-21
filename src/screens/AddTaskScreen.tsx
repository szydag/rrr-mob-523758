import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AddTaskScreenProps, TaskContext } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_COLOR = '#2563EB';
const BG_COLOR = '#FFFFFF';
const SECONDARY_COLOR = '#F3F4F6';

// --- Shared Components ---

const Header: React.FC<{ title: string; color: string; backButton: boolean; navigation: any }> = ({ title, color, backButton, navigation }) => (
  <SafeAreaView style={[stylesAdd.headerContainer, { backgroundColor: BG_COLOR }]} edges={['top']}>
    <View style={stylesAdd.headerInner}>
      {backButton && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 10 }}>
          <Icon name="arrow-back" size={24} color={color} />
        </TouchableOpacity>
      )}
      <Text style={[stylesAdd.headerTitle, { color }]}>{title}</Text>
    </View>
  </SafeAreaView>
);

const InputField: React.FC<{
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
  value: string;
  onChange: (text: string) => void;
}> = ({
  label,
  placeholder,
  required = false,
  multiline = false,
  value,
  onChange,
}) => (
  <View style={stylesAdd.inputGroup}>
    <Text style={stylesAdd.inputLabel}>
      {label} {required && <Text style={{ color: 'red' }}>*</Text>}
    </Text>
    <TextInput
      style={[stylesAdd.input, multiline && stylesAdd.multilineInput]}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      value={value}
      onChangeText={onChange}
    />
  </View>
);

const ToggleSwitch: React.FC<{
  label: string;
  color: string;
  defaultState: boolean;
  onToggle: (state: boolean) => void;
}> = ({
  label,
  color,
  defaultState,
  onToggle,
}) => {
  const [isEnabled, setIsEnabled] = useState(defaultState);
  const toggleSwitch = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onToggle(newState);
  };

  return (
    <View style={stylesAdd.toggleContainer}>
      <Text style={stylesAdd.toggleLabel}>{label}</Text>
      <Switch
        trackColor={{ false: SECONDARY_COLOR, true: color }}
        thumbColor={isEnabled ? BG_COLOR : '#f4f3f4'}
        ios_backgroundColor={SECONDARY_COLOR}
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  );
};

const Button: React.FC<{
  label: string;
  color: string;
  onPress: () => void;
  fullWidth: boolean;
  disabled: boolean;
}> = ({
  label,
  color,
  onPress,
  fullWidth,
  disabled,
}) => (
  <TouchableOpacity 
    style={[stylesAdd.button, { backgroundColor: color, opacity: disabled ? 0.6 : 1 }, fullWidth && stylesAdd.fullWidthButton]} 
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={stylesAdd.buttonLabel}>{label}</Text>
  </TouchableOpacity>
);

// --- Screen Implementation ---

const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ navigation }) => {
  const context = useContext(TaskContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [highPriority, setHighPriority] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!context) return <ActivityIndicator style={{ flex: 1 }} size="large" color={PRIMARY_COLOR} />;

  const handleSave = async () => {
    if (title.trim() === '') {
      Alert.alert('Hata', 'Başlık alanı boş bırakılamaz.');
      return;
    }

    setLoading(true);
    // action: save_and_navigate_back
    const success = await context.addTask(title, description, highPriority);
    setLoading(false);

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Hata', 'Görev kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  return (
    <View style={stylesAdd.container}>
      {/* Header */}
      <Header 
        title="Yeni Görev" 
        color={PRIMARY_COLOR} 
        backButton={true} 
        navigation={navigation}
      />

      <View style={stylesAdd.content}>
        {/* Input Field: Başlık */}
        <InputField
          label="Başlık"
          required={true}
          placeholder="Görevin adını giriniz"
          value={title}
          onChange={setTitle}
        />

        {/* Input Field: Açıklama */}
        <InputField
          label="Açıklama"
          multiline={true}
          placeholder="Detaylı açıklama (Opsiyonel)"
          value={description}
          onChange={setDescription}
        />

        {/* Toggle Switch: Yüksek Öncelik */}
        <ToggleSwitch
          label="Yüksek Öncelik"
          color={PRIMARY_COLOR}
          defaultState={highPriority}
          onToggle={setHighPriority}
        />

        <View style={stylesAdd.spacer} />

        {/* Button: Görevi Kaydet */}
        <Button
          label={loading ? 'Kaydediliyor...' : 'Görevi Kaydet'}
          color={PRIMARY_COLOR}
          fullWidth={true}
          onPress={handleSave}
          disabled={loading || title.trim() === ''}
        />
      </View>
    </View>
  );
};

const stylesAdd = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  content: {
    flex: 1,
    padding: 16,
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Input styles
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Toggle styles
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: SECONDARY_COLOR,
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#374151',
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
    marginTop: 10,
  },
  spacer: {
    flex: 1,
  }
});

export default AddTaskScreen;