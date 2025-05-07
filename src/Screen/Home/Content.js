import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Button,
  PanResponder,
  StyleSheet
} from 'react-native';
import styles from './style';
import Cloud from '../../img/Cloud.png';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Modal from 'react-native-modal';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

export default function Content() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [image, setImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isImageEditModalVisible, setIsImageEditModalVisible] = useState(true);
  const [imageUri, setImageUri] = useState(null);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const viewShotRef = useRef();

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

  const UploadImage = (Type) => {
    Type(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        setImageUri(response.assets[0].uri);
        setIsModalVisible(false);
      }
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const x = evt.nativeEvent.locationX ?? gestureState.moveX;
      const y = evt.nativeEvent.locationY ?? gestureState.moveY;
      setCurrentPath((prevPath) =>
        prevPath ? `${prevPath} L ${x},${y}` : `M ${x},${y}`
      );
    },
    onPanResponderRelease: () => {
      setPaths((prevPaths) => [...prevPaths, currentPath]);
      setCurrentPath('');
    },
  });

  const undoDraw = () => {
    setPaths((prevPaths) => prevPaths.slice(0, -1));
  };

  const saveImage = () => {
    viewShotRef.current.capture().then((uri) => {
      CameraRoll.save(uri, 'photo').then(() => {
        alert('Image Saved!');
      });
    });
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

      {/* Image Upload Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        onBackButtonPress={() => setIsModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose an Option</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => UploadImage(launchCamera)}>
            <Text style={styles.modalButtonText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => UploadImage(launchImageLibrary)}>
            <Text style={styles.modalButtonText}>Open Gallery</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Image View Modal */}
      <Modal
        isVisible={isImageModalVisible}
        onBackdropPress={() => setIsImageModalVisible(false)}
        onBackButtonPress={() => setIsImageModalVisible(false)}>
        <View style={{ backgroundColor: '#000', padding: 10, borderRadius: 10 }}>
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: 400, resizeMode: 'contain' }}
          />
        </View>
      </Modal>

      {/* Edit Modal  */}
      {imageUri && (
        <Modal isVisible={isImageEditModalVisible}>
          <View style={{ backgroundColor: 'white', flex: 1 }}>
            <Button title="Undo" onPress={undoDraw} />
            <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
              <View style={{ ...StyleSheet.absoluteFillObject }} {...panResponder.panHandlers}>
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: '100%', position: 'absolute' }}
                  resizeMode='center'
                />
                <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
                  {paths.map((d, index) => (
                    <Path key={index} d={d} stroke="red" strokeWidth={3} fill="none" />
                  ))}
                  {currentPath && <Path d={currentPath} stroke="red" strokeWidth={3} fill="none" />}
                </Svg>
              </View>
            </ViewShot>
            <Button title="Save Image" onPress={saveImage} />
          </View>
        </Modal>)}

    </View>

  );
}