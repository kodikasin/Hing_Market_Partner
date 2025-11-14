import {
  View,
  TouchableWithoutFeedback,
  Button,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import React, { useRef, useState } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useDispatch } from 'react-redux';
import { Order, removeOrder } from '../../store/orderSlice';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { generatePDF } from 'react-native-html-to-pdf';

interface IMenu {
  order: Order;
  navigation: any;
}

const Menu = ({ order, navigation }: IMenu) => {
  const dispatch = useDispatch();
  const viewHeight = useRef(new Animated.Value(0)).current;

  const heightExpand = () => {
    Animated.timing(viewHeight, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const heightStyle = viewHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 148],
  });

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const menuHandler = () => {
    if (isMenuOpen) {
      viewHeight.setValue(0);
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
      requestAnimationFrame(() => {
        heightExpand();
      });
    }
  };

  async function onSharePDF() {
    // close menu immediately when an action is chosen
    setIsMenuOpen(false);
    // Generate HTML for invoice
    const html = `
        <h2>Invoice</h2>
        <p><b>Customer:</b> ${order.customerName}<br/>
        <b>Phone:</b> ${order.phone || ''}<br/>
        <b>Address:</b> ${order.address || ''}</p>
        <table border="1" cellspacing="0" cellpadding="4" style="width:100%;border-collapse:collapse;">
          <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
          ${order.items
            .map(
              it =>
                `<tr><td>${it.name}</td><td>${it.quantity}</td><td>${it.rate}</td><td>${it.total}</td></tr>`,
            )
            .join('')}
        </table>
        <p>Taxes: ₹${order.taxes}<br/>Discount: ₹${
      order.discount
    }<br/><b>Total: ₹${order.totalAmount}</b></p>
        <p>Notes: ${order.notes || ''}</p>
      `;
    try {
      const file = await generatePDF({
        html,
        fileName: `Invoice_${order.customerName}_${order.id}`,
        base64: false,
      });
      const path = file.filePath; // e.g. /data/user/0/.../cache/Invoice_...pdf
      console.log('pdf path:', path);

      // sanity check: file exists
      const exists = await RNFS.exists(path);
      if (!exists) throw new Error('PDF file not found at: ' + path);

      // react-native-share works with file:// URIs on Android and direct path on iOS
      const url = Platform.OS === 'android' ? `file://${path}` : path;

      const shareOptions = {
        url,
        type: 'application/pdf',
        filename: `Invoice_${order.customerName}_${order.id}`, // optional
        subject: `Invoice for ${order.customerName}`, // for email
        message: `Invoice for ${order.customerName}`, // some apps use message
      };

      await Share.open(shareOptions);
    } catch (err) {
      console.warn('PDF share error', err);
      // show user friendly message if needed
    }
  }

  function onEdit() {
    // close menu immediately when an action is chosen
    setIsMenuOpen(false);
    // navigate to AddEditOrder with order id
    navigation.navigate('AddEditOrder', { orderId: order.id });
  }

  function onDelete() {
    setIsMenuOpen(false);
    const confirm = require('react-native').Alert;
    confirm.alert(
      'Delete order',
      'Are you sure you want to delete this order? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(removeOrder(order.id));
            navigation.goBack();
          },
        },
      ],
    );
  }

  return (
    // Make the icon touchable only — keep the menu view outside the touchable
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={menuHandler}>
        <View>
          <MaterialDesignIcons name="dots-vertical" color="black" size={32} />
        </View>
      </TouchableWithoutFeedback>

      {isMenuOpen && (
        <Animated.View style={[styles.menu, { height: heightStyle }]}>
          <View style={styles.spacer} />
          <Button title="Share PDF" onPress={onSharePDF} />
          <View style={styles.spacer} />
          <Button title="Edit" onPress={onEdit} />
          <View style={styles.spacer} />
          <Button title="Delete" color="#c62828" onPress={onDelete} />
        </Animated.View>
      )}
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    top: 30,
    borderColor: 'gray',
    borderWidth: 1,
    width: 120,
    right: 14,
    padding: 5,
    zIndex: 2,
    backgroundColor: 'white',
    borderRadius:5,
    borderTopEndRadius:0
  },
  container: {
    alignItems: 'center',
    zIndex: 2,
  },
  spacer: {
    height: 8,
  },
});
