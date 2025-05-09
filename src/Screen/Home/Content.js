import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  PanResponder,
  StyleSheet
} from 'react-native';
import styles from './style';
import Cloud from '../../img/Cloud.png';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Modal from 'react-native-modal';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const [selectedColor, setSelectedColor] = useState('red');
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
    setIsImageEditModalVisible(true);
    Type({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      setImageUri(response.assets[0].uri);
      setIsModalVisible(false);
    });
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
      setPaths((prevPaths) => [...prevPaths, { color: selectedColor, d: currentPath }]);
      setCurrentPath('');
    },
  });

  const undoDraw = () => {
    setPaths((prevPaths) => prevPaths.slice(0, -1));
  };

  const saveImage = () => {
    viewShotRef.current.capture().then((uri) => {
      console.log('save image', uri);
      setImage(uri);
      setImageUri(null);
    });
  };

  const closeEdit = () => {
    setPaths([]);
    setImageUri(null);
    setIsImageEditModalVisible(false);
  };

  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];

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
        onBackButtonPress={() => setIsModalVisible(false)}
      >
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
        onBackButtonPress={() => setIsImageModalVisible(false)}
      >
        <View style={{ backgroundColor: '#000', padding: 10, borderRadius: 10 }}>
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: 400, resizeMode: 'contain' }}
          />
        </View>
      </Modal>

      {/* Edit Modal */}
      {imageUri && (
        <Modal isVisible={isImageEditModalVisible}>
          <View style={{ backgroundColor: 'white', flex: 1 }}>
            <View style={{ zIndex: 1, flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#e0e0e0',
                  borderRadius: 20,
                  padding: 8,
                  marginRight: 10,
                }}
              >
                <Icon name="pencil" size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={undoDraw}
                style={{
                  borderColor: '#e0e0e0',
                  borderWidth: 2,
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',     
                }}
              >
                <Icon name="arrow-undo" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity onPress={closeEdit} style={styles.iconButton}>
                <Icon name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Color Picker */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={{
                    backgroundColor: color,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    marginHorizontal: 5,
                    borderWidth: selectedColor === color ? 2 : 0,
                    borderColor: '#333',
                  }}
                />
              ))}
            </View>

            {/* Drawing area */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{ width: '90%', aspectRatio: 3 / 4 }}
                {...panResponder.panHandlers}
              >
                <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                  <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
                    {paths.map(({ color, d }, index) => (
                      <Path key={index} d={d} stroke={color} strokeWidth={3} fill="none" />
                    ))}
                    {currentPath && (
                      <Path d={currentPath} stroke={selectedColor} strokeWidth={3} fill="none" />
                    )}
                  </Svg>
                </ViewShot>
              </View>
            </View>

            <View style={{ padding: 10 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#9FB3DF', alignItems: 'center', padding: 10 }}
                onPress={saveImage}
              >
                <Text style={styles.modalButtonText}>Save Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
