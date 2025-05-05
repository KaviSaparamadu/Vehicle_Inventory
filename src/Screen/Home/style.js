import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  body: {
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
    paddingVertical: 5,
    fontSize: 14,
    color: '#000',
  },
  imageContainer: {
    height: 250,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#9FB3DF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  header: {
    backgroundColor: '#9FB3DF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    borderRadius: 13, 
  },
  cloudImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  editText: {
    marginLeft: 10,
    color: '#757CFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: '#9FB3DF',
    paddingVertical: 12,
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  uploadIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 1,
  },
});
