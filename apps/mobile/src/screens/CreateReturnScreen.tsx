import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { returnsApi } from '../api/returns';
import { CreateReturnDto } from '../types';

const RETURN_REASONS = [
  { value: 'DAMAGED', label: 'Produit endommagé' },
  { value: 'EXPIRED', label: 'Produit expiré' },
  { value: 'INCORRECT', label: 'Mauvais produit' },
  { value: 'OTHER', label: 'Autre raison' },
];

interface Props {
  navigation: any;
  partnerId: string; // Would come from auth context in real app
}

export default function CreateReturnScreen({ navigation, partnerId }: Props) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState<'DAMAGED' | 'EXPIRED' | 'INCORRECT' | 'OTHER'>('DAMAGED');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (!hasCameraPermission) {
      Alert.alert('Permission refusée', 'L\'accès à la caméra est nécessaire pour prendre des photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map(asset => asset.uri);
      setPhotos([...photos, ...newPhotos].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!productId.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un ID produit');
      return;
    }

    if (parseInt(quantity) <= 0) {
      Alert.alert('Erreur', 'La quantité doit être supérieure à 0');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins une photo');
      return;
    }

    try {
      setLoading(true);

      // Upload photos (in real app, this would upload to cloud storage)
      const uploadedPhotoUrls = await Promise.all(
        photos.map(uri => returnsApi.uploadPhoto(uri))
      );

      const returnData: CreateReturnDto = {
        partnerId,
        productId: productId.trim(),
        quantity: parseInt(quantity),
        reason,
        description: description.trim() || undefined,
        photos: uploadedPhotoUrls,
      };

      await returnsApi.create(returnData);

      Alert.alert('Succès', 'Retour créé avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating return:', error);
      Alert.alert('Erreur', 'Impossible de créer le retour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créer un Retour</Text>

        {/* Product ID Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ID Produit *</Text>
          <TextInput
            style={styles.input}
            value={productId}
            onChangeText={setProductId}
            placeholder="Entrer l'ID du produit"
            autoCapitalize="none"
          />
        </View>

        {/* Quantity Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantité *</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="1"
            keyboardType="numeric"
          />
        </View>

        {/* Reason Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Raison du retour *</Text>
          <View style={styles.reasonButtons}>
            {RETURN_REASONS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.reasonButton,
                  reason === r.value && styles.reasonButtonActive
                ]}
                onPress={() => setReason(r.value as any)}
              >
                <Text style={[
                  styles.reasonButtonText,
                  reason === r.value && styles.reasonButtonTextActive
                ]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Détails supplémentaires..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Photos Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photos * (max 5)</Text>

          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={takePhoto}
              disabled={photos.length >= 5}
            >
              <Text style={styles.photoButtonText}>📷 Prendre une photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoButton}
              onPress={pickImage}
              disabled={photos.length >= 5}
            >
              <Text style={styles.photoButtonText}>🖼️ Galerie</Text>
            </TouchableOpacity>
          </View>

          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removePhotoText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Créer le retour</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  reasonButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reasonButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  reasonButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  reasonButtonText: {
    fontSize: 14,
    color: '#333',
  },
  reasonButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#333',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
