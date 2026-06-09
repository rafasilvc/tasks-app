import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTasks, deleteTask, updateTask } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert('Excluir', 'Tem certeza que deseja excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(id);
            setTasks((prev) => prev.filter((t) => t._id !== id));
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
          }
        },
      },
    ]);
  };

  const handleToggleComplete = async (task) => {
    try {
      const updated = await updateTask(task._id, { ...task, completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated.data : t)));
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardLeft} onPress={() => handleToggleComplete(item)}>
        <View style={[styles.checkbox, item.completed && styles.checkboxDone]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, item.completed && styles.cardTitleDone]}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnEdit]}
          onPress={() => navigation.navigate('Form', { task: item })}
        >
          <Text style={styles.btnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDelete]}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.btnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Tarefas</Text>
        <Text style={styles.headerCount}>
          {tasks.filter((t) => !t.completed).length} pendentes
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#e94560" style={{ marginTop: 40 }} />
      ) : tasks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>Nenhuma tarefa ainda.</Text>
          <Text style={styles.emptySubtext}>Toque em + para adicionar!</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Form', { task: null })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    backgroundColor: '#16213e',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  headerCount: { fontSize: 14, color: '#e94560', marginTop: 4 },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: '#e94560',
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: '#e94560',
    marginRight: 12, alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: '#e94560' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  cardTitleDone: { textDecorationLine: 'line-through', color: '#888' },
  cardDesc: { fontSize: 13, color: '#aaa', marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8, marginLeft: 8 },
  btn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnEdit: { backgroundColor: '#0f3460' },
  btnDelete: { backgroundColor: '#2d0f1e' },
  btnText: { fontSize: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 18, color: '#fff', fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: '#888', marginTop: 8 },
  fab: {
    position: 'absolute', bottom: 28, right: 24,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#e94560', alignItems: 'center', justifyContent: 'center',
    elevation: 8,
  },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold', lineHeight: 36 },
});