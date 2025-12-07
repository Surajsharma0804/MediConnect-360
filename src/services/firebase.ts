// Firebase Cloud Messaging Integration (FREE - 10M messages/month)

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

class FirebaseService {
  private initialized = false;
  private config: FirebaseConfig;
  private messaging: any = null;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
    };
  }

  /**
   * Initialize Firebase
   * FREE - 10M messages/month
   * 
   * NOTE: Firebase SDK not installed by default to reduce bundle size.
   * To enable Firebase notifications:
   * 1. Install: npm install firebase
   * 2. Configure environment variables
   * 3. Uncomment the implementation below
   */
  async init(): Promise<void> {
    if (this.initialized || !this.config.apiKey) {
      console.log('Firebase not initialized: Config not complete or Firebase not installed');
      return;
    }

    console.warn('Firebase integration is disabled. Install firebase package to enable push notifications.');
    return;

    /* Uncomment to enable Firebase:
    try {
      // Dynamically import Firebase to reduce bundle size
      const { initializeApp } = await import('firebase/app');
      const { getMessaging, getToken, onMessage } = await import('firebase/messaging');

      // Initialize Firebase
      const app = initializeApp({
        apiKey: this.config.apiKey,
        authDomain: this.config.authDomain,
        projectId: this.config.projectId,
        storageBucket: this.config.storageBucket,
        messagingSenderId: this.config.messagingSenderId,
        appId: this.config.appId,
      });

      // Initialize Cloud Messaging
      this.messaging = getMessaging(app);

      // Listen for foreground messages
      onMessage(this.messaging, (payload) => {
        console.log('Message received:', payload);
        this.showNotification(payload);
      });

      this.initialized = true;
      console.log('Firebase initialized');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
    */
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestPermission(): Promise<string | null> {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const { getToken } = await import('firebase/messaging');
        const token = await getToken(this.messaging, {
          vapidKey: this.config.vapidKey,
        });
        
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Show notification
   */
  private showNotification(payload: any): void {
    const { notification } = payload;
    
    if (!notification) return;

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Show notification
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/logo.png',
        badge: notification.badge,
        data: payload.data,
      });
    }
  }

  /**
   * Subscribe to topic (for group notifications)
   */
  async subscribeToTopic(token: string, topic: string): Promise<void> {
    try {
      // This would be done on the backend
      // Backend calls Firebase Admin SDK to subscribe token to topic
      console.log(`Subscribing ${token} to topic: ${topic}`);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(token: string, topic: string): Promise<void> {
    try {
      // This would be done on the backend
      console.log(`Unsubscribing ${token} from topic: ${topic}`);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }
}

export const firebase = new FirebaseService();
