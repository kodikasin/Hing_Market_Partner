import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import React, { useRef, useEffect } from 'react';
import Pdf from 'react-native-pdf';
import { useRoute } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { shareFile } from '../utils/orderFun';

type RouteParams = {
  uri?: string;
  page?: number;
  customerName?: string;
  orderId?: string;
};

const PdfViewer: React.FC = () => {
  const route = useRoute();
  // route.params may be undefined; coerce carefully
  const params = (route.params || {}) as RouteParams;
  const uri =
    params.uri || 'http://samples.leanpub.com/thereactnativebook-sample.pdf';
  const initialPage = params.page && params.page > 0 ? params.page : 1;

  const pdfRef = useRef<any>(null);

  const source = { uri, cache: true };

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (pdfRef.current && typeof pdfRef.current.setPage === 'function') {
          pdfRef.current.setPage(initialPage);
        }
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(t);
  }, [initialPage]);

  return (
    <View style={styles.container}>
      <View style={styles.headerView}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() =>
            shareFile({
              path: params.uri || uri,
              customerName: params.customerName || '',
              orderId: params.orderId || '',
            })
          }
        >
          <MaterialDesignIcons name="share-variant" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Pdf
        ref={pdfRef}
        source={source}
        page={initialPage}
        onLoadComplete={(numberOfPages: number, _filePath: string) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page: number, _numberOfPages: number) => {
          console.log(`Current page: ${page}`);
        }}
        onError={error => {
          console.log(error);
        }}
        onPressLink={linkUri => {
          console.log(`Link pressed: ${linkUri}`);
        }}
        style={styles.pdf}
      />
    </View>
  );
};

export default PdfViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  headerView: {
    width: '100%',
    alignItems: 'flex-end',
    marginRight: 8,
  },
  shareButton: {
    backgroundColor: '#5b4037',
    padding: 10,
    borderRadius: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginRight: 8,
  },
});
