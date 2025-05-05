import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import styles from './style';
import Cloud from '../../img/Cloud.png';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Modal from 'react-native-modal'; 

export default function Content() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [image, setImage] = useState(null); 
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [isImageModalVisible, setIsImageModalVisible] = useState(false); 

  const handleSubmit = () => {
    if (!vehicleNumber.trim()) return;
    setLoading(true);
    setIsEditable(false);
    setTimeout(() => {
    setLoading(false);
    setShowUploadSection(true);
    }, 1500);
  };

  const handleEdit = () => {
    setIsEditable(true);
    setShowUploadSection(false);
  };

  const openImagePicker = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        setImage(response.assets[0].uri); 
        setIsModalVisible(false); 
      }
    );
  };

  const openCamera = () => {
    launchCamera(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        setImage(response.assets[0].uri);
        setIsModalVisible(false); 
      }
    );
  };

  return (
    <View style={styles.body}>
      <Text style={styles.label}>Enter Vehicle Number </Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1, backgroundColor: isEditable ? '#fff' : '#f0f0f0' }]}
          placeholder="Enter Vehicle Number"
          placeholderTextColor="#aaa"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          editable={isEditable}
        />
        {!isEditable && (
          <TouchableOpacity onPress={handleEdit}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditable && !loading && (
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#757CFF" style={{ marginTop: 20 }} />
      )}

      {showUploadSection && !loading && (
        <>
          <View style={styles.imageContainer}>
            {image ? (
              <View style={{ width: '100%', height: '100%' }}>
                <TouchableOpacity
                  onPress={() => setImage(null)}
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    zIndex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: 12,
                    paddingHorizontal: 6,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 20 }}>X</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsImageModalVisible(true)} style={{ flex: 1 }}>
                  <Image source={{ uri: image }} style={styles.uploadIcon} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                <Image source={Cloud} style={styles.cloudImage} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.button} onPress={() => true}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)} 
        onBackButtonPress={() => setIsModalVisible(false)} 
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose an Option</Text>
          <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
            <Text style={styles.modalButtonText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={openImagePicker}>
            <Text style={styles.modalButtonText}>Open Gallery</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={isImageModalVisible}
        onBackdropPress={() => setIsImageModalVisible(false)}
        onBackButtonPress={() => setIsImageModalVisible(false)}
      >
        <View style={{ backgroundColor: '#000', padding: 10, borderRadius: 10 }}>
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: 400, resizeMode: 'contain' }}
          />
        </View>
      </Modal>
    </View>
  );
} 