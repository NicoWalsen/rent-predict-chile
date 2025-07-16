import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleStartPrediction = () => {
    navigation.navigate('Prediction');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Ionicons name="home" size={80} color="#4f46e5" />
          <Text style={styles.title}>Rent Predictor Chile</Text>
          <Text style={styles.subtitle}>
            Descubre el precio justo de arriendo para tu propiedad en Chile
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>¿Qué puedes hacer?</Text>
          
          <View style={styles.featureCard}>
            <Ionicons name="calculator" size={32} color="#4f46e5" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Predicción Precisa</Text>
              <Text style={styles.featureDescription}>
                Obtén estimaciones basadas en datos reales del mercado chileno
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="location" size={32} color="#10b981" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Por Comuna</Text>
              <Text style={styles.featureDescription}>
                Precios específicos para cada comuna de Santiago
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="car" size={32} color="#f59e0b" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Considera Amenidades</Text>
              <Text style={styles.featureDescription}>
                Incluye estacionamientos y bodegas en el cálculo
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity 
          style={styles.ctaButton} 
          onPress={handleStartPrediction}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Comenzar Predicción</Text>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            📊 Datos actualizados constantemente{'\n'}
            🔒 100% seguro y privado{'\n'}
            🇨🇱 Especializado en el mercado chileno
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 26,
  },
  featuresSection: {
    marginVertical: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 24,
    shadowColor: '#4f46e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#f1f5f9',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default HomeScreen;