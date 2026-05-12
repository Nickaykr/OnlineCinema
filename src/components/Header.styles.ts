import { Platform, StatusBar, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  mainWrapper: {
    zIndex: 1000,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e50914',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    height: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 56 : 56,
    
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 4, 
    
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputInHeader: {
    flex: 1,
    height: 40,
    color: '#ffffff',
    fontSize: 18,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginRight: 10,
  },
  clearIcon: {
    color: '#fff',
    fontSize: 18,
    marginRight: 10,
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
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 60, 
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5, 
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: '#666',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: '600',
  },
  themeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)', 
  },
  themeIcon: {
    fontSize: 20,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Затемнение фона
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 56 : 60, // Чтобы плашка была сразу ПОД хедером
  },
  searchDropdown: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 56 : 60,
    left: 10,
    right: 10,
    borderRadius: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    maxHeight: 300,
    zIndex: 2000,
    backgroundColor: '#1a1a1a', // Или любой солидный цвет без прозрачности
  },
  infoText: {
    padding: 20,
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 30,
    marginBottom: 10,
    opacity: 0.5,
  },
});