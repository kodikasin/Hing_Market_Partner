import {
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import React, { useRef, useState } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Order, removeOrder } from '../../store/orderSlice';
import { generatePDF } from 'react-native-html-to-pdf';
import { generateDeliveryChallanHtml, IData } from './htmlToPdf';
import { companyDetail, selectCompany } from '../../store/companySlice';
import {
  itemsTotalAmount,
  // itemsTotalQuantity,
  numberToWords,
  shareFile,
} from '../../utils/orderFun';

interface IMenu {
  order: Order;
  navigation: any;
}

const Menu = ({ order, navigation }: IMenu) => {
  console.log('order', JSON.stringify(order));
  const dispatch = useDispatch();
  const companyData: companyDetail = useSelector(selectCompany);
  console.log('companyData', JSON.stringify(companyData));
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
    outputRange: [0, 180],
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

  const createPdfFile = async () => {
    let data: IData = {
      companyName: companyData.companyName,
      companyAddress: companyData.address,
      companyPhone: companyData.mobileNo,
      companyState: '',
      companyGSTIN: companyData.gstNo,
      customerName: order.customerName,
      customerAddressLine: order.address,
      challanNo: '',
      challanDate: order.createdAt,
      placeOfSupply: order.address,
      items: order.items,
      totalQuantity: '',
      taxTotal: '',
      totalAmount: itemsTotalAmount(order.items),
      taxSummary: [],
      taxableTotal: '',
      subTotal: '',
      amountInWords: numberToWords(order.items),
      terms: '',
      companyShort: '',
      signatureImage: '',
    };

    const html = generateDeliveryChallanHtml(data);

    const file = await generatePDF({
      html,
      fileName: `Invoice_${(order.customerName || 'customer').replace(
        /\s+/g,
        '_',
      )}_${order.id}`,
      base64: false,
      width: 595,
      height: 842,
    });

    return file;
  };

  async function onSharePDF() {
    setIsMenuOpen(false);

    try {
      const file = await createPdfFile();

      const path = file.filePath; // e.g. /data/user/0/.../cache/Invoice_...pdf
      console.log('pdf path:', path);

      // sanity check: file exists
      await shareFile({
        path,
        customerName: order.customerName,
        orderId: order.id,
      });
    } catch (err) {
      console.warn('PDF share error', err);
      // show user friendly message if needed
    }
  }

  const viewPdfHandler = async () => {
    setIsMenuOpen(false);
    const file = await createPdfFile();
    console.log('file', file);

    navigation.navigate('PdfViewer', {
      uri: file.filePath,
      page: 1,
      customerName: order.customerName,
      orderId: order.id,
    });
  };

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
          <View style={styles.menuInner}>
            <TouchableOpacity style={styles.menuItem} onPress={onSharePDF}>
              <MaterialDesignIcons name="share" size={18} color="#5b4037" />
              <Text style={styles.menuText}> Share PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={viewPdfHandler}>
              <MaterialDesignIcons name="eye" size={18} color="#5b4037" />
              <Text style={styles.menuText}> View Pdf</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
              <MaterialDesignIcons name="pencil" size={18} color="#5b4037" />
              <Text style={styles.menuText}> Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem]} onPress={onDelete}>
              <MaterialDesignIcons name="trash-can" size={18} color="#c62828" />
              <Text style={styles.menuTextDelete}> Delete</Text>
            </TouchableOpacity>
          </View>
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
    borderRadius: 5,
    borderTopEndRadius: 0,
  },
  container: {
    alignItems: 'center',
    zIndex: 2,
  },
  spacer: {
    height: 8,
  },
  menuInner: { paddingVertical: 6 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  menuText: { color: '#5b4037', fontWeight: '600' },
  menuTextDelete: { color: '#c62828', fontWeight: '600' },
});
