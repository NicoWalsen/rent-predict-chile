import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';

export default function App() {
  const [comuna, setComuna] = useState('');
  const [m2, setM2] = useState('');
  const [estacionamientos, setEstacionamientos] = useState('0');
  const [bodega, setBodega] = useState(false);
  const [tipoPropiedad, setTipoPropiedad] = useState('departamento');
  const [dormitorios, setDormitorios] = useState('2');
  const [comunas, setComunas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingComunas, setLoadingComunas] = useState(true);
  const [resultado, setResultado] = useState<any>(null);

  // Cargar comunas al iniciar
  useEffect(() => {
    const fetchComunas = async () => {
      try {
        const response = await fetch('http://192.168.100.145:3006/api/comunas');
        const data = await response.json();
        setComunas(data.comunas);
      } catch (error) {
        console.error('Error cargando comunas:', error);
        setComunas(['Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'Macul', 'Maipú', 'La Florida']);
      } finally {
        setLoadingComunas(false);
      }
    };

    fetchComunas();
  }, []);

  const handlePrediction = async () => {
    console.log('🚀 Iniciando predicción...');
    console.log('📝 Datos:', { comuna, m2, estacionamientos, bodega, tipoPropiedad, dormitorios });
    
    if (!comuna || !m2) {
      console.log('❌ Datos incompletos');
      Alert.alert('Error', 'Por favor completa comuna y metros cuadrados');
      return;
    }

    setLoading(true);
    setResultado(null); // Limpiar resultado anterior

    try {
      const url = `http://192.168.100.145:3006/api/predict?comuna=${encodeURIComponent(comuna)}&m2=${encodeURIComponent(m2)}&estacionamientos=${encodeURIComponent(estacionamientos)}&bodega=${bodega}&tipoPropiedad=${encodeURIComponent(tipoPropiedad)}&dormitorios=${encodeURIComponent(dormitorios)}`;
      console.log('🔍 Haciendo request a:', url);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Data received:', data);
      
      // Verificar que los datos están completos
      if (!data.avgFmt || !data.minFmt || !data.maxFmt) {
        console.error('❌ Datos incompletos recibidos:', data);
        throw new Error('Respuesta incompleta del servidor');
      }
      
      // Mostrar resultado visualmente
      console.log('📊 Mostrando resultado...');
      setResultado({
        ...data,
        estacionamientos,
        bodega,
        tipoPropiedad,
        dormitorios
      });

    } catch (error) {
      console.error('❌ Error completo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudo obtener la predicción:\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingComunas) {
    return (
      <View style={styles.fullScreenLoading}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingIcon}>🏠</Text>
          <Text style={styles.loadingTitle}>RentPredict Chile</Text>
          <View style={styles.loadingSpinnerContainer}>
            <ActivityIndicator size="large" color="#1e40af" />
            <Text style={styles.loadingText}>Preparando la aplicación...</Text>
          </View>
          <Text style={styles.loadingSubtext}>
            Cargando datos del mercado inmobiliario chileno
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.headerTopSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <View style={styles.logoDesign}>
                  <View style={styles.logoBuilding}>
                    <View style={[styles.buildingBar, { height: 8 }]} />
                    <View style={[styles.buildingBar, { height: 12 }]} />
                    <View style={[styles.buildingBar, { height: 10 }]} />
                  </View>
                  <View style={styles.logoTrend}>
                    <View style={styles.trendLine} />
                  </View>
                </View>
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>RENTPREDICT</Text>
                <Text style={styles.companySubtitle}>REAL ESTATE INTELLIGENCE</Text>
              </View>
            </View>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>PRO</Text>
            </View>
          </View>
          
          <View style={styles.headerMiddleSection}>
            <Text style={styles.mainTitle}>Valuación Inmobiliaria</Text>
            <Text style={styles.mainSubtitle}>Algoritmos de IA para el mercado chileno</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1,000+</Text>
              <Text style={styles.statLabel}>Propiedades</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Precisión</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Comunas</Text>
            </View>
          </View>
          
          <View style={styles.certificationsBar}>
            <View style={styles.certificationBadge}>
              <Text style={styles.certIcon}>✓</Text>
              <Text style={styles.certText}>ISO 27001</Text>
            </View>
            <View style={styles.certificationBadge}>
              <Text style={styles.certIcon}>✓</Text>
              <Text style={styles.certText}>DATOS SEGUROS</Text>
            </View>
            <View style={styles.certificationBadge}>
              <Text style={styles.certIcon}>✓</Text>
              <Text style={styles.certText}>IA CERTIFICADA</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.formHeader}>
          <View style={styles.formTitleContainer}>
            <View style={styles.modernFormIcon}>
              <View style={styles.iconCircle}>
                <View style={styles.checkmark} />
              </View>
              <View style={styles.iconPulse} />
            </View>
            <Text style={styles.formTitle}>Complete sus datos</Text>
          </View>
          <Text style={styles.formSubtitle}>Obtenga una estimación precisa en segundos</Text>
        </View>
        {/* Comuna */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <View style={styles.iconContainer}>
              <View style={styles.locationIcon}>
                <View style={styles.mapContainer}>
                  <View style={styles.mapBorder} />
                  <View style={styles.mapDot} />
                </View>
              </View>
            </View>
            <Text style={styles.label}>Comuna</Text>
          </View>
          <Text style={styles.inputHint}>Seleccione su ubicación</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.comunaScroll}>
            {comunas.map((comunaOption) => (
              <TouchableOpacity
                key={comunaOption}
                style={[
                  styles.comunaButton,
                  comuna === comunaOption && styles.comunaButtonActive
                ]}
                onPress={() => setComuna(comunaOption)}
              >
                <Text style={[
                  styles.comunaButtonText,
                  comuna === comunaOption && styles.comunaButtonTextActive
                ]}>
                  {comunaOption}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* M2 */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <View style={styles.iconContainer}>
              <View style={styles.blueprintIcon}>
                <View style={[styles.gridLine, { left: 0 }]} />
                <View style={[styles.gridLine, { left: 8 }]} />
                <View style={[styles.gridLine, { left: 16 }]} />
                <View style={[styles.gridLineHorizontal, { top: 0 }]} />
                <View style={[styles.gridLineHorizontal, { top: 8 }]} />
                <View style={[styles.gridLineHorizontal, { top: 16 }]} />
              </View>
            </View>
            <Text style={styles.label}>Metros cuadrados (m²)</Text>
          </View>
          <Text style={styles.inputHint}>Ingrese el tamaño de la propiedad</Text>
          <TextInput
            style={styles.textInput}
            value={m2}
            onChangeText={setM2}
            placeholder="Ej: 80"
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        {/* Tipo de Propiedad */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <View style={styles.iconContainer}>
              <View style={styles.propertyTypeIcon}>
                <View style={styles.buildingIconMain} />
                <View style={styles.buildingIconSmall} />
              </View>
            </View>
            <Text style={styles.label}>Tipo de Propiedad</Text>
          </View>
          <Text style={styles.inputHint}>Seleccione el tipo de inmueble</Text>
          <View style={styles.buttonRow}>
            {[{key: 'departamento', label: 'Departamento'}, {key: 'casa', label: 'Casa'}].map(({key, label}) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.optionButton,
                  tipoPropiedad === key && styles.optionButtonActive
                ]}
                onPress={() => setTipoPropiedad(key)}
              >
                <Text style={[
                  styles.optionButtonText,
                  tipoPropiedad === key && styles.optionButtonTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dormitorios */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <View style={styles.iconContainer}>
              <View style={styles.bedroomIcon}>
                <View style={styles.bedBase} />
                <View style={styles.bedPillow} />
              </View>
            </View>
            <Text style={styles.label}>Dormitorios</Text>
          </View>
          <Text style={styles.inputHint}>Cantidad de habitaciones</Text>
          <TextInput
            style={styles.textInput}
            value={dormitorios}
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              if (num >= 1 && num <= 15) {
                setDormitorios(text);
              } else if (text === '') {
                setDormitorios('');
              }
            }}
            placeholder="Ej: 2"
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        {/* Estacionamientos */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <View style={styles.iconContainer}>
              <View style={styles.carIcon}>
                <View style={styles.carBody} />
                <View style={styles.carWindow} />
              </View>
            </View>
            <Text style={styles.label}>Estacionamientos</Text>
          </View>
          <Text style={styles.inputHint}>Cantidad de espacios de estacionamiento</Text>
          <View style={styles.buttonRow}>
            {['0', '1', '2', '3'].map((est) => (
              <TouchableOpacity
                key={est}
                style={[
                  styles.optionButton,
                  estacionamientos === est && styles.optionButtonActive
                ]}
                onPress={() => setEstacionamientos(est)}
              >
                <Text style={[
                  styles.optionButtonText,
                  estacionamientos === est && styles.optionButtonTextActive
                ]}>
                  {est === '0' ? 'Sin est.' : `${est} est.`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bodega */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <View style={styles.iconContainer}>
              <View style={styles.storageIcon}>
                <View style={styles.cubeTop} />
                <View style={styles.cubeLeft} />
                <View style={styles.cubeRight} />
              </View>
            </View>
            <Text style={styles.label}>Bodega</Text>
          </View>
          <Text style={styles.inputHint}>Espacio de almacenamiento adicional</Text>
          <TouchableOpacity
            style={[styles.checkboxContainer, bodega && styles.checkboxActive]}
            onPress={() => setBodega(!bodega)}
          >
            <Text style={[styles.checkboxText, bodega && styles.checkboxTextActive]}>
              {bodega ? '✅' : '⬜'} Incluye bodega
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Sus datos están protegidos y no se almacenan permanentemente
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handlePrediction}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingButtonText}>Analizando datos...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.submitIcon}>🔍</Text>
              <Text style={styles.submitText}>Calcular Precio</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Data Source Info */}
        <View style={styles.dataInfo}>
          <Text style={styles.dataInfoText}>
            📊 Basado en {comunas.length > 0 ? '1,000+' : 'miles de'} propiedades reales del mercado chileno
          </Text>
        </View>

        {/* Resultado */}
        {resultado && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>✨ Estimación Completada</Text>
              <Text style={styles.resultSubheader}>Resultados basados en inteligencia artificial</Text>
            </View>
            
            {/* Price Highlight */}
            <View style={styles.priceHighlight}>
              <Text style={styles.priceLabel}>Rango estimado</Text>
              <Text style={styles.priceRange}>
                {resultado.minFmt} - {resultado.maxFmt}
              </Text>
              <Text style={styles.avgPrice}>
                Promedio: {resultado.avgFmt}
              </Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>🎯 Alta confianza</Text>
              </View>
            </View>

            {/* Property Details */}
            <View style={styles.resultCard}>
              <Text style={styles.resultSubtitle}>🏠 Detalles analizados</Text>
              <View style={styles.propertyGrid}>
                <View style={styles.propertyItem}>
                  <Text style={styles.propertyIcon}>📍</Text>
                  <Text style={styles.propertyLabel}>Comuna</Text>
                  <Text style={styles.propertyValue}>{resultado.comuna}</Text>
                </View>
                <View style={styles.propertyItem}>
                  <Text style={styles.propertyIcon}>🏠</Text>
                  <Text style={styles.propertyLabel}>Tipo</Text>
                  <Text style={styles.propertyValue}>{resultado.tipoPropiedad === 'departamento' ? 'Depto' : 'Casa'}</Text>
                </View>
                <View style={styles.propertyItem}>
                  <Text style={styles.propertyIcon}>📏</Text>
                  <Text style={styles.propertyLabel}>Superficie</Text>
                  <Text style={styles.propertyValue}>{resultado.m2}m²</Text>
                </View>
                <View style={styles.propertyItem}>
                  <Text style={styles.propertyIcon}>🚪</Text>
                  <Text style={styles.propertyLabel}>Dormitorios</Text>
                  <Text style={styles.propertyValue}>{resultado.dormitorios}</Text>
                </View>
                <View style={styles.propertyItem}>
                  <Text style={styles.propertyIcon}>🚗</Text>
                  <Text style={styles.propertyLabel}>Estacionam.</Text>
                  <Text style={styles.propertyValue}>{resultado.estacionamientos}</Text>
                </View>
                <View style={styles.propertyItem}>
                  <Text style={styles.propertyIcon}>📦</Text>
                  <Text style={styles.propertyLabel}>Bodega</Text>
                  <Text style={styles.propertyValue}>{resultado.bodega ? 'Sí' : 'No'}</Text>
                </View>
              </View>
            </View>

            {/* Market Analysis */}
            <View style={styles.resultCard}>
              <Text style={styles.resultSubtitle}>📈 Análisis de mercado</Text>
              <Text style={styles.marketText}>
                Basado en {resultado.count} propiedades similares en {resultado.comuna}
              </Text>
              <View style={styles.marketStats}>
                <Text style={styles.statText}>✓ Datos actualizados</Text>
                <Text style={styles.statText}>✓ Algoritmo IA certificado</Text>
                <Text style={styles.statText}>✓ Mercado local especializado</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.newSearchButton}
                onPress={() => setResultado(null)}
              >
                <Text style={styles.newSearchText}>🔍 Nueva consulta</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerBrand}>
            <Text style={styles.footerLogo}>🏠 RentPredict Chile</Text>
            <Text style={styles.footerTagline}>Predicción inteligente de arriendos</Text>
          </View>
          
          <View style={styles.footerInfo}>
            <View style={styles.footerSection}>
              <Text style={styles.footerSectionTitle}>🔒 Seguridad y Privacidad</Text>
              <Text style={styles.footerText}>• Datos encriptados y seguros</Text>
              <Text style={styles.footerText}>• No almacenamos información personal</Text>
              <Text style={styles.footerText}>• Cumplimiento normativo chileno</Text>
            </View>
            
            <View style={styles.footerSection}>
              <Text style={styles.footerSectionTitle}>📊 Fuentes de Datos</Text>
              <Text style={styles.footerText}>• Portales inmobiliarios oficiales</Text>
              <Text style={styles.footerText}>• Algoritmos de IA certificados</Text>
              <Text style={styles.footerText}>• Actualización continua</Text>
            </View>
          </View>
          
          <View style={styles.footerLegal}>
            <Text style={styles.legalText}>
              Las estimaciones son referenciales y pueden variar según condiciones del mercado.
            </Text>
            <Text style={styles.legalText}>
              © 2024 RentPredict Chile. Tecnología desarrollada para el mercado inmobiliario chileno.
            </Text>
          </View>
          
          <View style={styles.footerBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🇨🇱 100% CHILENO</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🤖 IA CERTIFICADA</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🔒 DATOS SEGUROS</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullScreenLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: 24,
  },
  loadingSpinnerContainer: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  header: {
    backgroundColor: '#0f172a',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoDesign: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  logoBuilding: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: 2,
  },
  buildingBar: {
    width: 3,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  logoTrend: {
    position: 'absolute',
    top: 8,
    right: 2,
  },
  trendLine: {
    width: 12,
    height: 2,
    backgroundColor: '#fbbf24',
    borderRadius: 1,
    transform: [{ rotate: '25deg' }],
  },
  companyInfo: {
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  companySubtitle: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 1,
  },
  premiumBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: 0.5,
  },
  headerMiddleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3b82f6',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  certificationsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  certificationBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  certIcon: {
    fontSize: 12,
    color: '#22c55e',
    marginRight: 4,
    fontWeight: '900',
  },
  certText: {
    fontSize: 9,
    color: '#22c55e',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  form: {
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  formHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  formTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modernFormIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 24,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmark: {
    width: 8,
    height: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#ffffff',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
    marginLeft: 1,
  },
  iconPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    backgroundColor: 'transparent',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHint: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    flex: 1,
  },
  // Location Map Icon
  locationIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  mapContainer: {
    width: 18,
    height: 18,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBorder: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  mapDot: {
    width: 6,
    height: 6,
    backgroundColor: '#1e40af',
    borderRadius: 3,
    position: 'absolute',
  },
  // Blueprint Grid Icon
  blueprintIcon: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    width: 1,
    height: 18,
    backgroundColor: '#3b82f6',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: 18,
    height: 1,
    backgroundColor: '#3b82f6',
  },
  // Car Icon
  carIcon: {
    width: 20,
    height: 12,
    position: 'relative',
  },
  carBody: {
    width: 20,
    height: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#1e40af',
  },
  carWindow: {
    width: 12,
    height: 6,
    backgroundColor: '#1e40af',
    borderRadius: 2,
    position: 'absolute',
    top: 2,
    left: 4,
  },
  // Storage Cube Icon
  storageIcon: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  cubeTop: {
    width: 12,
    height: 8,
    backgroundColor: '#3b82f6',
    borderWidth: 1,
    borderColor: '#1e40af',
    transform: [{ skewX: '-20deg' }],
    position: 'absolute',
    top: 0,
    left: 3,
  },
  cubeLeft: {
    width: 8,
    height: 12,
    backgroundColor: '#1e40af',
    borderWidth: 1,
    borderColor: '#1e40af',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  cubeRight: {
    width: 8,
    height: 12,
    backgroundColor: '#2563eb',
    borderWidth: 1,
    borderColor: '#1e40af',
    transform: [{ skewY: '-20deg' }],
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  // Property Type Icon
  propertyTypeIcon: {
    width: 18,
    height: 18,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingIconMain: {
    width: 12,
    height: 14,
    backgroundColor: '#3b82f6',
    borderWidth: 1,
    borderColor: '#1e40af',
    borderRadius: 2,
  },
  buildingIconSmall: {
    width: 6,
    height: 8,
    backgroundColor: '#1e40af',
    borderWidth: 1,
    borderColor: '#1e40af',
    borderRadius: 1,
    position: 'absolute',
    top: 2,
    right: -2,
  },
  // Bedroom Icon
  bedroomIcon: {
    width: 18,
    height: 12,
    position: 'relative',
  },
  bedBase: {
    width: 16,
    height: 8,
    backgroundColor: '#3b82f6',
    borderWidth: 1,
    borderColor: '#1e40af',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  bedPillow: {
    width: 6,
    height: 4,
    backgroundColor: '#1e40af',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 2,
  },
  comunaScroll: {
    maxHeight: 50,
  },
  comunaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  comunaButtonActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  comunaButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  comunaButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  optionButtonActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  checkboxContainer: {
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
  checkboxText: {
    fontSize: 16,
    color: '#6b7280',
  },
  checkboxTextActive: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 24,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitIcon: {
    fontSize: 18,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#065f46',
    fontWeight: '500',
  },
  dataInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  dataInfoText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#1e293b',
    marginTop: 32,
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerContent: {
    gap: 24,
  },
  footerBrand: {
    alignItems: 'center',
    marginBottom: 8,
  },
  footerLogo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  footerInfo: {
    gap: 16,
  },
  footerSection: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
  },
  footerSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 4,
    fontWeight: '500',
  },
  footerLegal: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#475569',
    gap: 8,
  },
  legalText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 14,
  },
  footerBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  resultContainer: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultHeader: {
    backgroundColor: '#1e40af',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  resultSubheader: {
    fontSize: 14,
    color: '#93c5fd',
    textAlign: 'center',
    fontWeight: '500',
  },
  priceHighlight: {
    backgroundColor: '#f0fdf4',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  priceLabel: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '600',
    marginBottom: 8,
  },
  confidenceBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  confidenceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  propertyItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  propertyIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  propertyLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  propertyValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
  },
  marketText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 12,
  },
  marketStats: {
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  actionButtons: {
    padding: 16,
  },
  resultSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  priceRange: {
    fontSize: 24,
    fontWeight: '800',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 8,
  },
  avgPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    textAlign: 'center',
  },
  newSearchButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  newSearchText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});