import { Platform, StatusBar, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e50914',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    height: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 56 : 56,
    elevation: 4,
    shadowColor: '#000',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    color: '#ffffff',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
});