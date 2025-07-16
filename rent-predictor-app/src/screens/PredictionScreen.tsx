import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, PredictionRequest, PredictionResponse } from '../types';
import { apiClient } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

type PredictionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Prediction'>;

interface Props {
  navigation: PredictionScreenNavigationProp;
}

export const PredictionScreen: React.FC<Props> = ({ navigation }) => {
  // State
  const [comuna, setComuna] = useState('');
  const [m2, setM2] = useState('');
  const [estacionamientos, setEstacionamientos] = useState(0);
  const [bodega, setBodega] = useState(false);
  
  // API State
  const [comunas, setComunas] = useState<string[]>([]);
  const [loadingComunas, setLoadingComunas] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comunas on component mount
  useEffect(() => {
    loadComunas();
  }, []);

  const loadComunas = async () => {
    try {
      setLoadingComunas(true);
      setError(null);
      const comunasList = await apiClient.getComunas();
      setComunas(comunasList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando comunas');
    } finally {
      setLoadingComunas(false);
    }
  };

  const validateForm = (): boolean => {
    if (!comuna) {
      Alert.alert('Error', 'Por favor selecciona una comuna');
      return false;
    }
    
    const m2Number = parseInt(m2);
    if (!m2 || m2Number < 1 || m2Number > 1000) {
      Alert.alert('Error', 'Por favor ingresa metros cuadrados válidos (1-1000)');
      return false;
    }

    return true;
  };

  const handlePrediction = async () => {
    if (!validateForm()) return;

    try {
      setLoadingPrediction(true);
      setError(null);

      const request: PredictionRequest = {
        comuna,
        m2: parseInt(m2),
        estacionamientos,
        bodega,
      };

      const prediction = await apiClient.getPrediction(request);
      
      // Show results in alert for now (can be replaced with navigation to results screen)
      Alert.alert(
        'Predicción de Arriendo',
        `Comuna: ${prediction.comuna}\\n` +
        `Metros cuadrados: ${prediction.m2}m²\\n` +
        `Rango estimado: ${prediction.minFmt} - ${prediction.maxFmt}\\n` +
        `Precio promedio: ${prediction.avgFmt}\\n` +
        `Basado en ${prediction.count} propiedades similares`,
        [{ text: 'OK' }]
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo predicción';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoadingPrediction(false);
    }
  };

  if (loadingComunas) {
    return <LoadingSpinner message="Cargando comunas..." />;
  }

  if (error && comunas.length === 0) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadComunas}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="calculator" size={48} color="#4f46e5" />
            <Text style={styles.title}>Calcula tu Arriendo</Text>
            <Text style={styles.subtitle}>
              Completa los datos para obtener una estimación precisa
            </Text>
          </View>

          <View style={styles.form}>
            {/* Comuna Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Comuna</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={comuna}
                  onValueChange={setComuna}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona una comuna" value="" />
                  {comunas.map((comunaName) => (
                    <Picker.Item 
                      key={comunaName} 
                      label={comunaName} 
                      value={comunaName} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* M2 Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Metros cuadrados (m²)</Text>
              <TextInput
                style={styles.textInput}
                value={m2}
                onChangeText={setM2}
                placeholder="Ej: 80"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            {/* Estacionamientos Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estacionamientos</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={estacionamientos}
                  onValueChange={setEstacionamientos}
                  style={styles.picker}
                >
                  <Picker.Item label="Sin estacionamiento" value={0} />
                  <Picker.Item label="1 estacionamiento" value={1} />
                  <Picker.Item label="2 estacionamientos" value={2} />
                  <Picker.Item label="3+ estacionamientos" value={3} />
                </Picker>
              </View>
            </View>

            {/* Bodega Toggle */}
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={[styles.checkboxContainer, bodega && styles.checkboxActive]}
                onPress={() => setBodega(!bodega)}
              >
                <Ionicons 
                  name={bodega ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={bodega ? "#4f46e5" : "#6b7280"} 
                />
                <Text style={[styles.checkboxLabel, bodega && styles.checkboxLabelActive]}>
                  Incluye bodega
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loadingPrediction && styles.submitButtonDisabled]}
              onPress={handlePrediction}
              disabled={loadingPrediction}
            >
              {loadingPrediction ? (
                <LoadingSpinner size="small" message="" />
              ) : (
                <>
                  <Text style={styles.submitText}>Calcular Precio</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  form: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  picker: {
    height: 50,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  checkboxActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#f8fafc',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 12,
  },
  checkboxLabelActive: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    shadowColor: '#4f46e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PredictionScreen;