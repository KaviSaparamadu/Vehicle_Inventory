import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  PanResponder,
} from 'react-native';
import styles from './style';
import Cloud from '../../img/Cloud.png';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Modal from 'react-native-modal';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/Ionicons';
import TrashIcon from 'react-native-vector-icons/Feather';

function getSmoothPath(points) {
  if (points.length < 3) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 2; i++) {
    const cpx = (points[i].x + points[i + 1].x) / 2;
    const cpy = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x},${points[i].y} ${cpx},${cpy}`;
  }
  return d;
}

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
  const [currentPoints, setCurrentPoints] = useState([]);
  const [selectedColor, setSelectedColor] = useState('red');
  const [isDrawMode, setIsDrawMode] = useState(true);
  const [isTextMode, setIsTextMode] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messageMarkers, setMessageMarkers] = useState([]);
  const [typingPosition, setTypingPosition] = useState({ x: 100, y: 100 });
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [activeMessagePopup, setActiveMessagePopup] = useState(null);
  const [draggedMessage, setDraggedMessage] = useState(null);
  const [deleteZone, setDeleteZone] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [editEnabled, setEditEnabled] = useState(false);

  const viewShotRef = useRef();
  const trashZoneRef = useRef(null);

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

  const handleSendMessage = () => {
    setMessageMarkers([
      ...messageMarkers,
      {
        id: Date.now().toString(),
        message: messageInput,
        x: typingPosition.x,
        y: typingPosition.y,
      },
    ]);
    setMessageInput('');
    setMessageModalVisible(false);
  };

  const saveImage = () => {
    viewShotRef.current.capture().then((uri) => {
      setImage(uri);
      setImageUri(null);
      setPaths([]);
      setMessageMarkers([]);
    });
  };

  const closeEdit = () => {
    setPaths([]);
    setImageUri(null);
    setIsImageEditModalVisible(false);
    setMessageMarkers([]);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const x = e.nativeEvent.locationX;
      const y = e.nativeEvent.locationY;

      if (isDrawMode && !isTextMode) {
        setCurrentPoints([{ x, y }]);
      }

      if (isTextMode) {
        setTypingPosition({ x, y });
        setMessageModalVisible(true);
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const x = evt.nativeEvent.locationX ?? gestureState.moveX;
      const y = evt.nativeEvent.locationY ?? gestureState.moveY;

      if (isDrawMode && !isTextMode) {
        setCurrentPoints((prev) => [...prev, { x, y }]);
      }

      if (draggedMessage) {
        const newMarkers = messageMarkers.map((m) =>
          m.id === draggedMessage.id ? { ...m, x: gestureState.moveX - 20, y: gestureState.moveY - 40 } : m
        );
        setMessageMarkers(newMarkers);
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (currentPoints.length > 1 && isDrawMode && !isTextMode) {
        const pathD = getSmoothPath(currentPoints);
        setPaths((prevPaths) => [...prevPaths, { color: selectedColor, d: pathD }]);
      }
      setCurrentPoints([]);

      if (draggedMessage) {
        const { moveX, moveY } = gestureState;
        const { x, y, width, height } = deleteZone;
        const inside =
          moveX >= x &&
          moveX <= x + width &&
          moveY >= y &&
          moveY <= y + height;

        if (inside) {
          setMessageMarkers((prev) => prev.filter((m) => m.id !== draggedMessage.id));
        }
        setDraggedMessage(null);
      }
    },
  });

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

      {loading && <ActivityIndicator size="large" color="#757CFF" style={{ marginTop: 20 }} />}

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

      {/* Image picker modal */}
      <Modal isVisible={isModalVisible} onBackdropPress={() => setIsModalVisible(false)}>
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

      {/* Full image viewer modal */}
      <Modal isVisible={isImageModalVisible} onBackdropPress={() => setIsImageModalVisible(false)}>
        <View style={{ backgroundColor: '#000', padding: 10, borderRadius: 10 }}>
          <Image source={{ uri: image }} style={{ width: '100%', height: 400, resizeMode: 'contain' }} />
        </View>
      </Modal>

      {/* Image edit modal */}
      {imageUri && (
        <Modal isVisible={isImageEditModalVisible}>
          <View style={{ backgroundColor: 'white', flex: 1 }}>
            {/* Toolbar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 10, backgroundColor: '#f5f5f5' }}>
              <TouchableOpacity onPress={() => { setIsDrawMode(true); setIsTextMode(false); }} style={iconCircle}>
                <Icon name="pencil" size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setIsDrawMode(false); setIsTextMode(true); }} style={iconCircle}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>T</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPaths(prev => prev.slice(0, -1))} style={iconCircle}>
                <Icon name="arrow-undo" size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={closeEdit} style={iconCircle}>
                <Icon name="close" size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Color palette */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
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

            {/* Trash icon during drag (below color palette) */}
            {draggedMessage && (
              <View
                ref={trashZoneRef}
                onLayout={(e) => {
                  const layout = e.nativeEvent.layout;
                  setDeleteZone({ x: layout.x, y: layout.y + 150, width: layout.width, height: layout.height });
                }}
                style={{
                  alignSelf: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#ff4d4d',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <TrashIcon name="trash-2" size={30} color="#fff" />
              </View>
            )}

            {/* Drawing + Messages */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: '90%', aspectRatio: 3 / 4 }} {...panResponder.panHandlers}>
                <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
                    {paths.map(({ color, d }, index) => (
                      <Path key={index} d={d} stroke={color} strokeWidth={3} fill="none" />
                    ))}
                    {isDrawMode && !isTextMode && currentPoints.length > 1 && (
                      <Path d={getSmoothPath(currentPoints)} stroke={selectedColor} strokeWidth={3} fill="none" />
                    )}
                  </Svg>

                  {messageMarkers.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onLongPress={() => setDraggedMessage(m)}
                      onPressOut={() => setDraggedMessage(null)}
                      onPress={() => { setActiveMessagePopup(m); setEditEnabled(false); }}
                      style={{
                        position: 'absolute',
                        left: m.x,
                        top: m.y,
                        backgroundColor: 'white',
                        borderRadius: 15,
                        borderWidth: 1,
                        borderColor: 'black',
                        padding: 4,
                        zIndex: draggedMessage?.id === m.id ? 999 : 1,
                      }}
                    >
                      <Icon name="chatbubble-ellipses" size={20} color="black" />
                    </TouchableOpacity>
                  ))}
                </ViewShot>
              </View>
            </View>

            {/* Save Button */}
            <View style={{ padding: 10 }}>
              <TouchableOpacity style={{ backgroundColor: '#9FB3DF', alignItems: 'center', padding: 10 }} onPress={saveImage}>
                <Text style={styles.modalButtonText}>Save Image</Text>
              </TouchableOpacity>
            </View>

            {/* Message Modal with Edit Function */}
            {activeMessagePopup && (
              <Modal isVisible={true}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 15 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 20, fontWeight: '600' }}>Message</Text>
                    <TouchableOpacity onPress={() => setActiveMessagePopup(null)}>
                      <Icon name="close" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    value={activeMessagePopup.message}
                    onChangeText={(text) => {
                      setMessageMarkers((prev) =>
                        prev.map((m) => (m.id === activeMessagePopup.id ? { ...m, message: text } : m))
                      );
                      setActiveMessagePopup((prev) => ({ ...prev, message: text }));
                    }}
                    multiline
                    editable={editEnabled}
                    style={{
                      height: 100,
                      borderColor: '#ccc',
                      borderWidth: 1,
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor: '#f9f9f9',
                      textAlignVertical: 'top',
                    }}
                  />
                  {!editEnabled && (
                    <TouchableOpacity onPress={() => setEditEnabled(true)} style={{ marginTop: 10 }}>
                      <Text style={{ color: '#007BFF', fontWeight: 'bold' }}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Modal>
            )}
          </View>
        </Modal>
      )}

      {/* Add message modal */}
      <Modal isVisible={messageModalVisible} onBackdropPress={() => setMessageModalVisible(false)}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text style={{ fontSize: 14, marginBottom: 10 }}>Enter your message:</Text>
          <TextInput
            multiline
            value={messageInput}
            onChangeText={setMessageInput}
            style={{ height: 100, borderColor: '#ccc', borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 }}
          />
          <TouchableOpacity onPress={handleSendMessage} style={{ backgroundColor: '#4CAF50', padding: 10, alignItems: 'center', borderRadius: 5 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const iconCircle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#e0e0e0',
  justifyContent: 'center',
  alignItems: 'center',
};
