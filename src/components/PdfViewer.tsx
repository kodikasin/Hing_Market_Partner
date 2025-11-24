import { View, StyleSheet, Dimensions } from 'react-native';
import React, { useRef, useEffect } from 'react';
import Pdf from 'react-native-pdf';
import { useRoute } from '@react-navigation/native';

type RouteParams = {
  uri?: string;
  page?: number;
};

const PdfViewer: React.FC = () => {
  const route = useRoute();
  // route.params may be undefined; coerce carefully
  const params = (route.params || {}) as RouteParams;
  const uri = params.uri || 'http://samples.leanpub.com/thereactnativebook-sample.pdf';
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
});
