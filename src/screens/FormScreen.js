import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { createTask, updateTask } from '../services/api';

export default function FormScreen({ navigation, route }) {
  const editingTask = route.params?.task || null;
  const isEditing = !!editingTask;

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [completed, setCompleted] = useState(editingTask?.completed || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'O título é obrigatório!');
      return;
    }
    try {
      setLoading(true);
      if (isEditing) {
        await updateTask(editingTask._id, { title, description, completed });
        Alert.alert('Sucesso', 'Tarefa atualizada!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createTask({ title, description });
        Alert.alert('Sucesso', 'Tarefa criada!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a tarefa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>
            {isEditing ? '✏️  Editar Tarefa' : '➕  Nova Tarefa'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditing ? 'Atualize os dados abaixo' : 'Preencha os dados abaixo'}
          </Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Estudar React Native"
            placeholderTextColor="#555"
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detalhes da tarefa (opcional)"
            placeholderTextColor="#555"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        {isEditing && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity
              style={[styles.toggleBtn, completed && styles.toggleBtnActive]}
              onPress={() => setCompleted((prev) => !prev)}
            >
              <Text style={styles.toggleBtnText}>
                {completed ? '✅  Concluída' : '⬜  Pendente'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingBottom: 40 },
  headerSection: { marginBottom: 28, marginTop: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  headerSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  formGroup: { marginBottom: 20 },
  label: {
    fontSize: 13, fontWeight: '600', color: '#e94560',
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
  },
  input: {
    backgroundColor: '#16213e', borderWidth: 1,
    borderColor: '#0f3460', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#ffffff',
  },
  textArea: { minHeight: 100 },
  toggleBtn: {
    backgroundColor: '#16213e', borderWidth: 1,
    borderColor: '#0f3460', borderRadius: 10,
    padding: 14, alignItems: 'center',
  },
  toggleBtnActive: { borderColor: '#e94560', backgroundColor: '#2d0f1e' },
  toggleBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#e94560', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { marginTop: 12, padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 15 },
});